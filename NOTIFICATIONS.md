# Notificações de novos agendamentos

Duas camadas, ambas no painel do barbeiro (`painel-admin-cliente`):

| Fase | O que faz | Custo | Precisa config |
|------|-----------|-------|----------------|
| **1 — Sino in-app** | Listener em tempo real; sino com contador + dropdown; notificação do navegador com o painel **aberto** | Zero | Nada |
| **2 — FCM push** | Push no aparelho mesmo com o painel **fechado** (Android/desktop; iOS via PWA) | FCM grátis; Function no nível gratuito do Blaze | VAPID key + deploy |

A Fase 1 já funciona sem nenhuma configuração. A Fase 2 só "liga" depois dos passos abaixo —
até lá, o botão "Ativar notificações" cai graciosamente no aviso in-app.

## Ativar a Fase 2 (FCM push)

### 1. Gerar a chave VAPID
Firebase Console → ⚙️ Configurações do projeto → **Cloud Messaging** → **Web Push certificates**
→ *Generate key pair*. Copie a chave.

### 2. Configurar o painel
No `painel-admin-cliente` (e na Vercel), defina:
```
NEXT_PUBLIC_FIREBASE_VAPID_KEY=<a chave gerada>
```
(as demais `NEXT_PUBLIC_FIREBASE_*` já existem). O service worker
`public/firebase-messaging-sw.js` recebe a config pública por query-params no registro.

### 3. Ativar o Blaze e deployar a Function
A Function exige o plano **Blaze** (cartão no perfil). No volume de uma barbearia, a fatura
fica em ~R$ 0 (2M execuções/mês grátis). Recomendo configurar um **alerta de orçamento**.

```bash
# na raiz do repositório
cd functions && npm install && cd ..
firebase deploy --only functions:notifyNewBooking
```

### 4. Deployar as regras do Firestore
A leitura/atualização de bookings e o registro de tokens (`tenants/{id}/devices`) dependem
das regras em `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

### 5. Rodar a migração (se ainda não rodou)
As regras e a Function usam `tenantId` canônico (ver `SCHEMA.md`). Bookings legados em
`tenant_id` só passam a notificar/aparecer após:
```bash
node scripts/migrate-schema.mjs --apply
```

## Como o barbeiro ativa
No painel, clica no sino → **"Ativar notificações neste aparelho"** → aceita a permissão.
Isso registra o token FCM em `tenants/{tenantId}/devices/{token}`.

## Ressalva iOS
Push web no iOS (16.4+) só funciona se o site for **adicionado à tela inicial** (PWA).
Android e desktop funcionam direto. Em todos, o sino in-app (Fase 1) é o fallback garantido.

## Limites conhecidos / próximos passos
- Foreground (painel aberto) sempre notifica; background depende da Fase 2 configurada.
- Tokens inválidos são limpos automaticamente pela Function ao enviar.
- Possível evolução: PWA installável para melhorar o push no iOS.
