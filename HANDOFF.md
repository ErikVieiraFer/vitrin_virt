# HANDOFF — Vitrine Virtual (contexto completo para retomar em novo chat)

> **Como usar:** em um novo chat do Claude Code, diga "leia o HANDOFF.md e continue".
> Este documento resume a ideia, a arquitetura, tudo que já foi feito (e se está
> verificado), e o que falta. Documentos complementares: `SCHEMA.md`, `NOTIFICATIONS.md`,
> `TESTING.md`.

---

## 1. A ideia / o produto

**Vitrine Virtual** é um SaaS multi-tenant de **agendamentos online** para pequenos
negócios brasileiros (barbearias, salões, estúdios de tattoo, clínicas, manicures,
personal trainers, etc.). O dono do negócio assina a plataforma e ganha um **link/subdomínio
personalizado** onde os clientes dele agendam sozinhos, 24h, sem ele precisar responder
WhatsApp o dia todo. Lembretes automáticos reduzem faltas (no-show).

## 2. Os 4 projetos e seus domínios (hospedados na Vercel)

| Projeto (pasta) | Domínio | O que é |
|---|---|---|
| `landing-page` | **www.vitrinevirt.com** | Landing page de marketing (Next.js) |
| `painel-admin-cliente` | **painel.vitrinevirt.com** | Painel do **dono do negócio** (Next.js) |
| `painel-admin-master` | **admin.vitrinevirt.com** | Painel do **Erik** (dono da plataforma) (Next.js) |
| `vitrine_virtual` | **demo.vitrinevirt.com/#/home** | App **Flutter** (a vitrine de cada cliente). Em produção cada cliente terá `{slug}.vitrinevirt.com` |

- **Firebase project:** `vitrine-virtual-7a61f` (Auth + Firestore + Storage + FCM).
- **Stack:** Next.js 15 (App Router) + Tailwind + shadcn/ui nos painéis/landing; Flutter (Clean Architecture + Cubit/BLoC) na vitrine; Firebase no backend; Vercel + Cloudflare DNS.
- **Configs locais (gitignored, ficam só na máquina):** `vitrine_virtual/.env`, `painel-admin-master/.env.local`, `vitrine_virtual/android/local.properties`. **FALTA criar** `painel-admin-cliente/.env.local` (necessário pro painel do cliente conectar no Firebase).

## 3. Git

- **Branch de trabalho:** `claude/kind-volta-nonqhf` (todo o trabalho está aqui e no `origin`).
- **`main`** = o que está publicado hoje em produção. Ainda **não** foi feito o merge.
- Para ver tudo antes de publicar: abrir um **Pull Request** dessa branch → a Vercel gera previews automáticos.

---

## 4. O que já foi feito (com status de verificação)

> ✅ = verificado (tsc/next build/flutter analyze passaram) · ⏳ = implementado mas falta verificar

### 4.1. Contrato de schema único — ✅ (fundação)
Os 3 apps que tocam o Firestore divergiam nos nomes de campo (camelCase vs snake_case),
quebrando features multi-app. Padronizamos tudo em **camelCase canônico**.
- `SCHEMA.md` — a fonte única da verdade dos campos do Firestore.
- `scripts/migrate-schema.mjs` — migração idempotente (dry-run por padrão) que converte
  dados legados para o schema canônico.
- Mappers tolerantes (leem camel **ou** snake) nos dois painéis.
- Flutter: writer do booking em camelCase, constantes de query alinhadas, e **denormalização**
  de `serviceName/servicePrice/serviceDuration` no agendamento (pros painéis exibirem serviço/valor).
- Corrigidos bugs do painel-master expostos pela divergência (orderBy, coleção de serviços, etc.).

### 4.2. Gestão de agendamentos (painel-cliente) — ✅
- Tela de Agendamentos com ações: **Confirmar / Concluir / Cancelar** + **nota interna**.
- `updateBookingStatus`, `updateBookingNotes` (gravam canônico).
- `firestore.rules` (versionado na raiz) com permissão de **update** em bookings (só o dono).

### 4.3. Notificações (painel-cliente) — ✅ (código) / ⏳ (deploy do push)
- **Fase 1 — sino in-app (custo zero):** listener em tempo real, sino no header com contador
  e dropdown. (`use-booking-notifications.ts`, `notification-bell.tsx`)
- **Fase 2 — FCM push em background:** `messaging.ts`, service worker
  `public/firebase-messaging-sw.js`, e a Cloud Function `notifyNewBooking` em `functions/`.
  Passo a passo de ativação em `NOTIFICATIONS.md`. (Push em si é grátis; a Function fica no
  nível gratuito do Blaze.) **Falta o Erik:** gerar VAPID key, setar env, ativar Blaze e deployar.

### 4.4. Editor visual da vitrine (`/dashboard/editor` no painel-cliente)
O dono monta seções (banner/hero, texto livre, galeria, lista de serviços) e a vitrine Flutter
renderiza. Modelo de dados: `tenant.sections[]` (ver SCHEMA.md).
- **Chunk 1 — editor no painel — ✅:** CRUD + reordenar seções, upload de imagens, salvar,
  iframe de preview. Item "Vitrine" na sidebar. (`types/section.ts`, `app/dashboard/editor/page.tsx`)
- **Chunk 2 — Flutter renderiza as seções — ✅:** `vitrine_section.dart`, `Tenant.sections`,
  parsing no `TenantModel`, `vitrine_sections_view.dart`, `home_screen.dart`. (flutter analyze passou)
- **Chunk 3 — PREVIEW AO VIVO — ⏳ IMPLEMENTADO, FALTA VERIFICAR:** a vitrine em `?preview=1`
  escuta `postMessage` do editor e re-renderiza o rascunho (tema + seções) sem salvar.
  Arquivos: `lib/core/preview/preview_channel.dart` (+ `_stub.dart` / `_web.dart`, conditional
  import pra não quebrar mobile), `AppConfig.isPreview()`, `TenantCubit.applyPreview()`,
  `main.dart` (AppView virou StatefulWidget e liga o listener), `home_screen.dart` (lê o tenant
  do cubit). O editor já envia a mensagem como `JSON.stringify(...)`.
  **>>> PRÓXIMA AÇÃO: rodar `flutter analyze` em `vitrine_virtual` pra confirmar que compila. <<<**

### 4.5. Painel master — fluxos finalizados — ✅
Antes vários fluxos eram stub. Agora funcionam, com **rotas de API seguras** (verificam o
ID token do admin via `verifyAdminToken`, não confiam em e-mail no body):
- **Criar cliente:** cria o usuário Auth do dono + o tenant canônico (com `ownerUid`).
- **Editar cliente:** salva nome/WhatsApp/status (lendo via Admin SDK).
- **Atividades:** lista real (saiu o mock).
- **Analytics:** totais + gráficos mensais via Admin SDK.
- Rotas em `painel-admin-master/src/app/api/admin/*`, helper `lib/api.ts`.

### 4.6. Landing page — redesign moderno — ✅
- Hero **escuro premium** com glow + **mockup do app em CSS** (sem precisar de imagem).
- Headline por nicho ("Agenda cheia, sem responder WhatsApp o dia todo"), faixa de nichos.
- Seções novas: **Métricas**, **Antes/Depois**, **Integrações**.
- **12 depoimentos** em **carrossel automático** (3 por vez, gira sozinho, setas + indicadores).
- Plano **Enterprise "a partir de R$150"** (personalizável).
- Copy reescrita pro público BR, footer com links reais, fonte de display (Poppins).
- Correções: domínio canônico/OG para **vitrinevirt.com**.
- `next build` passou. (Estático ~239 kB.)

---

## 5. O que falta fazer

### 5.1. Curto prazo — fechar o que está em andamento
1. **Verificar o Chunk 3:** `cd vitrine_virtual && flutter analyze`. Se houver erro, corrigir.
   Depois testar de verdade: rodar o editor no painel-cliente e a vitrine em `?preview=1`,
   confirmar que editar uma seção atualiza o iframe ao vivo.
2. **Confirmar que tudo compila** (após a longa sessão): `tsc --noEmit` nos dois painéis e
   `next build` na landing.

### 5.2. Pendências operacionais (Erik executa — precisam de credenciais/decisão)
- **Deploy das regras:** `firebase deploy --only firestore:rules`.
- **Rodar a migração:** `node scripts/migrate-schema.mjs --dry-run` → conferir → `--apply`.
  (Sem isso, dados antigos em snake_case não aparecem/funcionam com o schema canônico.)
- **Notificações Fase 2:** gerar VAPID key (Console → Cloud Messaging), setar
  `NEXT_PUBLIC_FIREBASE_VAPID_KEY` na Vercel, ativar Blaze, `firebase deploy --only functions`.
- **`og-image.png` (1200×630):** Erik vai anexar; jogar em `landing-page/public/`.
- **Criar `painel-admin-cliente/.env.local`** (config do Firebase) pra rodar/buildar o painel cliente.
- **Abrir o PR** da branch pra gerar preview na Vercel e revisar antes de publicar no `main`.

### 5.3. Próximas features do roadmap (não iniciadas)
- **Múltiplos profissionais por tenant** (coleção `professionals`, agenda por profissional) —
  resolve barbearias/salões com equipe. Toca schema + painel + vitrine.
- Depoimentos reais na landing (hoje são exemplos; avatares já são CSS, sem foto).
- Abas Serviços/Bookings/Stats no detalhe do tenant (painel-master) ainda são "em desenvolvimento".
- Pagamentos (sinal no agendamento) — citado como "em breve".

---

## 6. Observação sobre o "erro" desta sessão
O `Cannot read properties of undefined (reading 'type')` + um "log" com IDs de mensagem e
chamadas de API **era um erro interno da extensão do Claude Code no VSCode** (provavelmente
pela conversa ter ficado enorme e/ou pelos diagnostics chegarem malformados), **não** um bug
no código do projeto. O código Dart/TS está íntegro em disco. Solução: Reload Window / chat novo.

---

## 7. Resumo de uma linha pra colar no novo chat
> "Leia o HANDOFF.md. Estamos na branch `claude/kind-volta-nonqhf`. Próxima ação: rodar
> `flutter analyze` em `vitrine_virtual` pra verificar o Chunk 3 (preview ao vivo) do editor."
</content>
