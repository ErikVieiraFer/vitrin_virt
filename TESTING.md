# Guia de testes e configuração — o que foi entregue nesta sessão

Branch: `claude/kind-volta-nonqhf`. Tudo que é TypeScript foi validado com
`tsc --noEmit` (limpo). O Flutter **não** foi compilado aqui (ambiente sem Dart) —
rode `flutter analyze` antes de deployar a vitrine.

## 0. Configuração necessária (uma vez)

| Passo | Onde | Comando / ação |
|------|------|----------------|
| Deploy das regras | raiz | `firebase deploy --only firestore:rules` |
| Migração do schema | raiz | `node scripts/migrate-schema.mjs --dry-run` → conferir → `--apply` |
| Env do painel-cliente | Vercel | já existentes + (opcional push) `NEXT_PUBLIC_FIREBASE_VAPID_KEY` |
| Push em background (opc.) | raiz | Blaze + `firebase deploy --only functions:notifyNewBooking` (ver `NOTIFICATIONS.md`) |
| Deploy da vitrine | vitrine_virtual | `flutter analyze` → `flutter build web` → deploy |

> Importante: as regras e os painéis usam o schema **canônico camelCase** (ver `SCHEMA.md`).
> Dados antigos (snake_case) só aparecem/funcionam depois da migração.

## 1. Contrato de schema
- `SCHEMA.md` define os nomes canônicos; mappers toleram legado nos dois painéis.
- **Testar:** rodar a migração em dry-run e conferir o relatório de quantos docs mudariam.

## 2. Gestão de agendamentos (painel-cliente → Agendamentos)
- Confirmar (pendente→confirmado), Concluir (confirmado→concluído), Cancelar; nota interna.
- **Testar:** criar um agendamento pela vitrine; no painel, confirmar/cancelar/concluir e
  salvar uma nota (ícone fica roxo ao reabrir). Requer regras deployadas (update em bookings).

## 3. Notificações (painel-cliente)
- **Fase 1 (sino in-app):** funciona sem config. Sino no topo com contador; abre dropdown.
- **Fase 2 (push background):** requer VAPID + Function (ver `NOTIFICATIONS.md`).
- **Testar:** com o painel aberto, criar um agendamento na vitrine → sino incrementa; com
  permissão concedida, aparece notificação do navegador.

## 4. Editor visual da vitrine (painel-cliente → Vitrine)
- **Chunk 1 (✅ testável):** adicionar/reordenar/remover seções (banner, texto, galeria,
  serviços), upload de imagens, salvar. Preview mostra a vitrine publicada.
- **Chunk 2 (⚠ requer `flutter analyze` + deploy):** a vitrine Flutter renderiza as seções.
- **Chunk 3 (pendente):** preview ao vivo das edições (postMessage) — não implementado ainda.
- **Testar Chunk 1:** montar seções, Salvar, recarregar → seções persistem.
- **Testar Chunk 2:** após deploy da vitrine, abrir `{subdominio}.vitrinevirt.com` → seções
  aparecem; tenant sem seções mantém o grid de serviços padrão.

## 5. Painel master (admin.vitrinevirt.com)
- **Criar cliente:** `Novo Cliente` cria o usuário Auth do dono + tenant (com `ownerUid`).
  - **Testar:** criar; depois logar no painel-cliente com o e-mail/senha informados.
- **Editar cliente:** detalhe do tenant salva nome/WhatsApp/status (via Admin SDK).
- **Atividades:** lista real (substituiu o mock); vazia até haver ações.
- **Analytics:** totais + gráficos mensais via Admin SDK.
- Todas as rotas `/api/admin/*` exigem ID token de admin (seguras).

## Limitações conhecidas / próximos passos
- **Flutter não verificado aqui** — rodar `flutter analyze` (Chunk 2 e writer de booking).
- **Preview ao vivo (Chunk 3)** pendente: precisa do listener `postMessage` no Flutter Web.
- **Push iOS** só com "adicionar à tela inicial" (PWA); Android/desktop direto.
- **`verify-admin`** (gate de login) ainda confia no e-mail do body — só protege UI; as rotas
  de dados já verificam token. Hardening opcional depois.
- Abas Serviços/Bookings/Stats no detalhe do tenant (master) seguem como "em desenvolvimento".
