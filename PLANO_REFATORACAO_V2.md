# Plano de Refatoração — Vitrine Virtual v2

> **Fonte de verdade do projeto.** Toda nova sessão de desenvolvimento (Claude Code ou humana) deve ler
> este documento antes de começar. Ao concluir uma fase, atualizar a seção "Progresso" no final.

---

## 1. Visão do Produto (decidido)

Plataforma SaaS de agendamento **agnóstica de nicho** (barbearias, salões, clínicas, nutricionistas,
personal trainers, etc.), com tudo concentrado em um só lugar:

| Ponta | Quem usa | Onde vive |
|---|---|---|
| **Vitrine pública** | Cliente final (do nosso cliente) | Web (Next.js), sem app, sem login. Agenda com nome + WhatsApp |
| **App de gestão** | Nosso cliente (dono do negócio) | **Flutter** publicado na App Store + Play Store |
| **Painel web do cliente** | Nosso cliente | Web enxuta: cadastro, contratação, troca de plano, cobrança, recibos. **Nenhum pagamento dentro do app** (evita taxa Apple/Google) |
| **Painel master** | Nós (Erik) | Web: tenants, status de assinaturas, bloquear/desbloquear, permissões, tudo |
| **Landing page** | Prospecção | Web, funil → trial → assinatura |

### Decisões de negócio fechadas

- **Acesso por tenant:** 1 login (dono) + N *profissionais agendáveis* (cadastro, não login), limitados por plano. Multiusuário com permissões = v2 (estrutura já nasce pronta).
- **Planos (mensal):** R$ 59,90 (1 prof.) / 89,90 (2–5) / 144,50 (6–15) / 199,90 (15+). Semestral −15%, anual −30%. **Trial 7 dias sem cartão + 50% off no 1º mês.**
- **Cobrança:** Assinaturas Mercado Pago (preapproval). Cartão tokenizado pelo SDK do MP — **nunca armazenamos dado de cartão**. Guardamos só ID da assinatura + status; webhooks ativam/bloqueiam tenant.
- **Máquina de estados do tenant:** `trial → ativo → inadimplente (grace) → bloqueado → cancelado`.
- **Pagamento cliente final → nosso cliente:** fora do sistema (presencial). Upsell futuro (pagamento online com nossa %).
- **Subdomínio grátis** (`slug.dominio.com.br`) via wildcard DNS. **Domínio próprio = add-on pós-lançamento** (setup + mensalidade).
- **Notificações:** push (FCM) pro dono quando entra/cancela agendamento; cliente final recebe confirmação via link **wa.me** (click-to-chat, sem custo). API oficial WhatsApp = futuro.
- **Agendamento cliente final:** sem login; pode **cancelar e reagendar**, com antecedência mínima **configurável pelo dono** (ex.: até 2h antes). Cancelamento reabre o horário automaticamente.
- **Financeiro v1:** agendamento concluído → receita (valor ajustável); receita avulsa; faturamento por período/profissional/serviço; **comissão % por profissional** nos relatórios. *v1.1:* despesas, fechamento de caixa, formas de pagamento.
- **Personalização máxima da vitrine:** logo, capa, cores, descrição, fotos, horários, endereço, redes sociais, etc.
- **Marca:** mantém "Vitrine Virtual".

---

## 2. Arquitetura Técnica

### Stack

- **App de gestão:** Flutter (conhecimento do Erik) + Riverpod, Clean Architecture reaproveitando os padrões já criados em `vitrine_virtual/lib/core` e `shared`.
- **Vitrine pública:** Next.js 15 + Firebase (novo projeto `vitrine-publica/`, substitui o Flutter Web).
- **Painéis web + landing:** Next.js (já existem; painel-cliente será *reduzido* a conta/cobrança).
- **Backend:** Firebase — Auth, Firestore, Storage, **Cloud Functions** (obrigatório para: webhooks Mercado Pago, criação de assinatura, validação de agendamento/anti-conflito, enforcement de limites de plano, push FCM).
- **Pagamentos:** Mercado Pago Assinaturas (sandbox durante o dev; produção exige CNPJ).

### Estrutura de pastas alvo do repositório

```
vitrin_virt/
├── app-gestao/            # Flutter — app do nosso cliente (novo, substitui painel-admin-cliente como operação)
├── vitrine-publica/       # Next.js — agendamento do cliente final (novo, substitui vitrine_virtual)
├── painel-cliente-web/    # Next.js — conta/assinatura (refatoração do painel-admin-cliente, escopo reduzido)
├── painel-admin-master/   # Next.js — mantém, evolui (assinaturas, bloqueio, permissões)
├── landing-page/          # Next.js — mantém, evolui (preços novos, funil trial)
├── functions/             # Cloud Functions (novo)
├── firestore.rules        # Regras de segurança centralizadas
└── docs/                  # Modelo de dados, contratos, este plano
```

`vitrine_virtual/` (Flutter antigo) fica intocado como referência até a Fase 6, depois é removido.

### Modelo de dados Firestore (resumo — detalhar na Fase 0)

```
tenants/{tenantId}
  ├─ perfil, slug, personalização (cores, logo, capa, descrição, endereço, redes)
  ├─ config agenda (horários, antecedência mín. cancelamento, duração slots)
  ├─ assinatura: { plano, ciclo, status, mpPreapprovalId, trialEndsAt, limiteProfissionais }
  ├─ profissionais/{id}    # nome, foto, serviços que executa, horários, comissão %
  ├─ servicos/{id}         # nome, duração, preço, foto, ativo
  ├─ agendamentos/{id}     # cliente {nome, whatsapp}, profissional, serviço, status
  │                        # (agendado|concluido|cancelado_cliente|cancelado_dono|no_show), token de gestão
  └─ financeiro/{id}       # receitas (de agendamento ou avulsas), valor, data, profissional
users/{uid}                # donos → tenantId, role (owner|master)
```

**Cancelar/reagendar sem login:** o agendamento gera um token opaco; o link enviado/exibido ao cliente
final (`/a/{token}`) permite gerenciar só aquele agendamento. Validação de antecedência na Cloud Function.

### Segurança (checklist permanente)

- Firestore Rules por tenant: dono só lê/escreve o próprio tenant; vitrine pública lê apenas campos públicos; escrita de agendamento **só via Cloud Function** (valida conflito, antecedência, limites).
- Nenhum dado de cartão em nosso poder (tokenização MP). Webhook MP validado por assinatura secreta.
- Enforcement de plano no servidor (Functions/Rules), nunca só no cliente.
- App Check ativado para Firestore/Functions.

---

## 3. Fases de Execução

> Cada fase termina com: código compilando, testes/verificação manual, commit + push, atualização do Progresso.

**Fase 0 — Fundação (docs + backend base)**
Modelo de dados definitivo em `docs/`, projeto Firebase configurado, `firestore.rules` iniciais, esqueleto de `functions/` com emulador, seed de dados de demonstração.

**Fase 1 — App de gestão: núcleo**
Projeto Flutter novo (`app-gestao/`) reaproveitando core/theme do código existente. Auth (login do dono), onboarding do tenant, cadastro de serviços e profissionais (com limite por plano), configuração de agenda/horários.

**Fase 2 — App de gestão: agenda + push**
Calendário/agenda (dia/semana), criação manual de agendamento pelo dono, bloqueios (almoço/folga), FCM push em novo agendamento/cancelamento.

**Fase 3 — Vitrine pública (Next.js)**
Página do tenant por slug (subdomínio wildcard), personalização aplicada, fluxo de agendamento (serviço → profissional → horário → nome + WhatsApp), confirmação com botão wa.me, cancelar/reagendar via token com regra de antecedência.

**Fase 4 — Financeiro no app**
Receita automática ao concluir agendamento, receita avulsa, relatórios (período/profissional/serviço), comissão %.

**Fase 5 — Assinaturas Mercado Pago**
`painel-cliente-web/` reduzido: cadastro/trial → checkout MP (sandbox) → webhooks → máquina de estados do tenant → bloqueio de app/vitrine quando inadimplente. Landing page atualizada (preços novos, CTA trial).

**Fase 6 — Painel master + limpeza**
Painel master: lista de tenants, status assinatura, bloquear/desbloquear, métricas. Remoção do `vitrine_virtual/` antigo e do escopo morto do painel-cliente.

**Fase 7 — Publicação**
Personalização final do app (nome, ícones, splash), builds iOS/Android, contas de loja, revisão de App Check/Rules, testes fim-a-fim em produção MP (requer CNPJ), lançamento.

---

## 4. Progresso

| Fase | Status | Observações |
|---|---|---|
| 0 | pendente | |
| 1 | pendente | |
| 2 | pendente | |
| 3 | pendente | |
| 4 | pendente | |
| 5 | pendente | Produção MP depende de CNPJ (sandbox não bloqueia) |
| 6 | pendente | |
| 7 | pendente | Conta Apple ok; comprar conta Play Store |
