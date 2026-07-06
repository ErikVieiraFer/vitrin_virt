# Modelo de Dados — Vitrine Virtual v2 (Firestore)

> Fonte de verdade do schema. Toda mudança de estrutura deve ser refletida aqui,
> em `firestore.rules` e nas Cloud Functions de validação.

## Convenções

- Todos os timestamps são `Timestamp` do Firestore (UTC).
- Valores monetários em **centavos** (`int`) — nunca float.
- Campos `criadoEm` / `atualizadoEm` em todos os documentos.
- Slugs: `[a-z0-9-]{3,40}`, únicos globalmente (coleção `slugs`).

---

## `users/{uid}`

Contas de acesso (Firebase Auth). No v1 só existem donos e o master.

| Campo | Tipo | Notas |
|---|---|---|
| `role` | `'owner' \| 'master'` | |
| `tenantId` | `string \| null` | null para master |
| `nome`, `email` | string | |
| `fcmTokens` | `string[]` | tokens de push dos dispositivos |

## `slugs/{slug}`

Reserva global de slug → `{ tenantId }`. Garante unicidade em transação.

## `tenants/{tenantId}`

Documento principal do negócio.

```
perfil: {
  nome, descricao, slug,
  categoria: 'barbearia'|'salao'|'clinica'|'nutricao'|'personal'|'outro',
  telefoneWhatsapp,             // E.164, destino do wa.me
  endereco: { cep, logradouro, numero, complemento, bairro, cidade, uf, lat?, lng? },
  redes: { instagram?, facebook?, tiktok?, site? }
}
personalizacao: {
  logoUrl?, capaUrl?, fotos: string[],
  corPrimaria, corSecundaria, corFundo,   // hex
  tema: 'claro'|'escuro'|'auto'
}
configAgenda: {
  fusoHorario: 'America/Sao_Paulo',
  duracaoSlotMin: 30,
  antecedenciaMinCancelamentoMin: 120,    // configurável pelo dono
  antecedenciaMinAgendamentoMin: 30,
  janelaMaxAgendamentoDias: 90,
  horarios: {                             // por dia da semana (0=dom … 6=sab)
    '1': { aberto: true, faixas: [{inicio:'08:00', fim:'12:00'},{inicio:'13:00', fim:'18:00'}] },
    ...
  }
}
assinatura: {
  plano: 'basico'|'pro'|'business'|'premium',
  ciclo: 'mensal'|'semestral'|'anual',
  status: 'trial'|'ativa'|'inadimplente'|'bloqueada'|'cancelada',
  limiteProfissionais: 1|5|15|999,
  trialEndsAt: Timestamp,
  mpPreapprovalId?: string,
  descontoPrimeiroMesAplicado: bool,
  bloqueadoManualmente: bool              // controle do painel master
}
ativo: bool                               // derivado: status permite operar
```

### Planos (referência de preço em centavos — mensal cheio)

| plano | profissionais | mensal | semestral (−15%) | anual (−30%) |
|---|---|---|---|---|
| `basico` | 1 | 5990 | 5092/mês | 4193/mês |
| `pro` | 2–5 | 8990 | 7642/mês | 6293/mês |
| `business` | 6–15 | 14450 | 12283/mês | 10115/mês |
| `premium` | 15+ | 19990 | 16992/mês | 13993/mês |

Trial: 7 dias sem cartão. 1º mês após trial: 50% off (via desconto na preapproval).

## `tenants/{tenantId}/profissionais/{profId}`

| Campo | Tipo | Notas |
|---|---|---|
| `nome`, `fotoUrl?` | | |
| `servicoIds` | `string[]` | serviços que executa |
| `comissaoPercent` | number | 0–100, usado nos relatórios |
| `horarios` | igual a `configAgenda.horarios` | sobrescreve o do tenant se definido |
| `ativo` | bool | limite de ativos = `assinatura.limiteProfissionais` (enforced em Function) |

## `tenants/{tenantId}/servicos/{servicoId}`

`nome, descricao?, duracaoMin, precoCentavos, fotoUrl?, ativo`

## `tenants/{tenantId}/bloqueios/{bloqueioId}`

Bloqueios de agenda (almoço recorrente já vive em `horarios`; aqui são pontuais):
`profId | null (todos), inicio: Timestamp, fim: Timestamp, motivo?`

## `tenants/{tenantId}/agendamentos/{agendamentoId}`

| Campo | Tipo | Notas |
|---|---|---|
| `cliente` | `{ nome, whatsapp }` | sem login |
| `profId`, `servicoId` | string | |
| `inicio`, `fim` | Timestamp | fim = inicio + duração do serviço |
| `status` | `'agendado'\|'concluido'\|'cancelado_cliente'\|'cancelado_dono'\|'no_show'` | |
| `precoCentavos` | int | copiado do serviço no momento do agendamento |
| `tokenGestao` | string | opaco (32 bytes hex); permite cancelar/reagendar sem login via `/a/{token}` |
| `origem` | `'vitrine'\|'manual'` | |
| `canceladoEm?`, `motivoCancelamento?` | | |

**Escrita SOMENTE via Cloud Functions** (`criarAgendamento`, `cancelarAgendamento`,
`reagendarAgendamento`, dono via app usa callable com auth). Regras: sem conflito de horário
do profissional, dentro do horário de funcionamento, respeitando antecedências.

Índice auxiliar para lookup por token: coleção raiz `tokensAgendamento/{token}` → `{ tenantId, agendamentoId }`.

## `tenants/{tenantId}/financeiro/{lancamentoId}`

| Campo | Tipo | Notas |
|---|---|---|
| `tipo` | `'receita_agendamento'\|'receita_avulsa'` | (despesas = v1.1) |
| `agendamentoId?` | string | quando origem é agendamento concluído |
| `profId?`, `servicoId?` | | |
| `valorCentavos` | int | ajustável pelo dono ao concluir |
| `comissaoPercentSnapshot?` | number | congelado no momento do lançamento |
| `data` | Timestamp | |
| `descricao?` | string | |

## `webhooksMp/{eventId}`

Log bruto de webhooks do Mercado Pago (idempotência + auditoria):
`payload, tipo, processadoEm, resultado`.

---

## Acesso por superfície

| Superfície | Auth | Acesso |
|---|---|---|
| App de gestão (Flutter) | dono (Auth) | leitura/escrita do próprio tenant; agendamentos e financeiro via callables |
| Vitrine pública (Next.js) | anônimo | leitura de campos públicos do tenant + serviços/profissionais ativos + slots; escrita só via Functions |
| Painel cliente web | dono (Auth) | assinatura/cobrança (callables MP) |
| Painel master | master (custom claim) | tudo |
