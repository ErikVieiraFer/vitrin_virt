# Reconciliação — trabalho paralelo (main) × refatoração v2

> Decisão de 07/07/2026: antes de qualquer deploy, reconciliar as duas linhas de trabalho.
> Este documento é o veredito, área por área, e o plano de merge.

## Contexto

Existem duas linhas divergentes a partir do commit `af8dafa`:

- **`main`** (+ `claude/kind-volta-nonqhf`): evolução da **arquitetura antiga** — vitrine
  Flutter Web com editor visual de seções e preview ao vivo (postMessage), painel-cliente web
  completo, landing redesenhada, master com analytics. Publicado na Vercel (vitrinevirt.com),
  Firebase `vitrine-virtual-7a61f`. Docs: `HANDOFF.md`, `SCHEMA.md`, `NOTIFICATIONS.md`, `TESTING.md`.
- **`claude/dazzling-hopper-qlywsw`**: **refatoração v2** (este plano) — app de gestão mobile
  Flutter, vitrine pública Next.js, Cloud Functions TS, rules restritivas. Fases 0–4 concluídas.

As rules/functions das duas linhas são **incompatíveis** (v2 bloqueia escrita direta de
agendamentos que os painéis antigos fazem). Não dá pra deployar as duas no mesmo projeto.

## Veredito por área

| Área (em `main`) | Veredito | Como entra na v2 |
|---|---|---|
| **landing-page** (redesign hero premium, depoimentos, footer) | ✅ **Aproveita 100%** | v2 nunca tocou na landing — merge direto, sem conflito. Preços/CTA trial atualizam na Fase 5 |
| **painel-admin-master** (analytics Admin SDK, fluxos tenant, activity logs) | ✅ **Aproveita ~100%** | v2 mantém o master (Fase 6). Merge direto; adaptar depois aos campos do schema v2 (`assinatura`, etc.) |
| **Editor visual de seções** — modelo `sections[]` com 10 tipos (hero, cover, text, gallery, services, testimonials, social, hours, address) + estilos de card | ✅ **Aproveita o MODELO** | O conceito vira o coração da Personalização v2: `tenants.sections[]` entra no MODELO_DE_DADOS; a **vitrine-publica (Next)** renderiza as seções; o **app-gestao** ganha o editor mobile. As implementações antigas (React 571 linhas no painel web + render Flutter Web) são substituídas |
| Preview ao vivo (postMessage editor→vitrine) | 🔜 **Pós-lançamento** | Adaptável à v2 (vitrine Next em iframe/webview escutando postMessage), mas não bloqueia o MVP |
| **Notificações** (sino in-app painel-cliente + `notifyNewBooking` JS) | ❌ **Substituída** | v2 já tem push melhor integrado (`aoMudarAgendamento`, TS, por tenant). O sino era do painel web que deixa de ser operacional |
| **SCHEMA.md + migração** (`scripts/migrate-schema.mjs`) | ❌ **Substituído** | v2 tem `docs/MODELO_DE_DADOS.md`. Sem clientes ativos, não há dados legados a migrar. O campo `sections` é absorvido no modelo v2 |
| **firestore.rules / firebase.json / functions/** antigos | ❌ **v2 vence** | Conflito direto de merge — resolver sempre pelo lado v2 |
| **vitrine_virtual** (Flutter Web) e **painel-admin-cliente** operacional | ❌ **Substituídos** | Conforme plano v2: vitrine → vitrine-publica; painel-cliente encolhe pra conta/cobrança (Fase 5). Remoção na Fase 6 |

## Plano de execução

- **R1 — Merge `main` → branch v2.** Estratégia: aceitar `main` em `landing-page/`,
  `painel-admin-master/` e docs de contexto (HANDOFF/TESTING viram histórico); aceitar v2 em
  `firebase.json`, `firestore.rules`, `functions/`; manter ambos em pastas disjuntas.
  `main` fica intocado até a v2 ser validada.
- **R2 — Portar `sections[]` pro modelo v2** e renderizar na vitrine-publica (extensão da Fase 3).
- **R3 — Editor de personalização no app-gestao** (a tela "Personalização — em breve"),
  reaproveitando tipos/estrutura do `types/section.ts` antigo em Dart.
- **R4 — Adaptar painel master** aos campos v2 — já dentro da Fase 6.
- **Final:** quando a v2 estiver validada (fases 5–6), `v2 → main` substitui a linha antiga,
  e o deploy (functions/rules/Vercel) migra pra v2 de uma vez.

## Progresso da reconciliação

| Etapa | Status |
|---|---|
| R1 merge | **concluida** (commit ad41b15) |
| R2 sections na vitrine | pendente |
| R3 editor no app | pendente |
| R4 master adaptado | pendente (Fase 6) |
