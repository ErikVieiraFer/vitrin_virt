# Contrato de Schema — Vitrine Virtual (fonte única da verdade)

> Este documento é **autoritativo**. Qualquer app (Flutter, painel-cliente, painel-master,
> Cloud Functions) que leia ou grave no Firestore **deve** seguir os nomes de campo definidos
> aqui. Mudou o schema? Mude este arquivo **primeiro**, depois o código.

## Por que este documento existe

Hoje os três apps que tocam o Firestore **não concordam sobre os nomes dos campos**, e isso
quebra silenciosamente features multi-app. Estado real encontrado no código (antes deste contrato):

| Coleção | Quem grava | Como grava hoje | Quem lê | Como lê hoje | Resultado |
|---------|-----------|-----------------|---------|--------------|-----------|
| `bookings` | Flutter (`booking_model.dart` `toJson`) | **snake_case**: `tenant_id, service_id, customer_name, customer_phone, booking_date, booking_time, status, created_at` | painel-cliente | query `where('tenantId')` + `orderBy('date')`, lê `customer.name`, `serviceName`, `price` | ❌ tela vazia / campos em branco |
| `bookings` | — | — | painel-master | query `where('tenant_id')` ✓ + `orderBy('date')` ✗, lê `client_name`, `service_name`, `tenant_name` | ❌ ordena por campo inexistente, nomes em branco |
| `services` | painel-cliente | **camelCase** top-level `services`: `tenantId, name, description, duration, price, imageUrl, active, createdAt, updatedAt` | Flutter | fallback snake/camel ✓ | ✅ ok |
| `services` | — | — | painel-master | conta subcoleção `tenants/{id}/services` | ❌ coleção errada → sempre 0 |
| `tenants` | painel-cliente | `themeSettings:{primaryColor,...}`, `ownerUid`, `createdAt` (camel) | Flutter / master | Flutter lê `theme_settings`; master lê `theme` + `orderBy('created_at')` | ⚠️ tema não bate; ordenação falha |
| `tenants` | painel-master | `theme:{primary_color, secondary_color, font}`, `created_at` (snake), **sem `ownerUid`** | painel-cliente | exige `ownerUid` para login | ❌ tenant criado no master não loga no painel |
| `availability` | painel-cliente | doc único `{tenantId, weekAvailability:{monday:{enabled,timeSlot,slotDuration}...}}` | Flutter | `AvailabilityModel` espera linhas planas `{day_of_week, start_time, end_time}` | ❌ formatos incompatíveis |

## Convenção canônica

- **`camelCase`** para todos os nomes de campo. (Escolhido por: bater com a "Firestore schema atual"
  do produto, com o painel-cliente e com as entidades de domínio do Flutter. A única coleção que
  hoje grava fora do padrão é `bookings`, escrita só pelo Flutter.)
- **Timestamps** (`createdAt`, `updatedAt`, `bookingDate`) são `Timestamp` do Firestore na persistência.
- **IDs de relação** terminam em `Id` (`tenantId`, `serviceId`).
- **Leitores são tolerantes** (aceitam camelCase **ou** snake_case legado) até a migração rodar.
  **Escritores só emitem camelCase canônico.**

---

## Coleções

### `tenants/{tenantId}`

```jsonc
{
  "name": "string",                 // nome do negócio
  "subdomain": "string",            // único; chave pública (raise.vitrinevirt.com)
  "ownerUid": "string",             // Firebase Auth UID do dono — OBRIGATÓRIO p/ login no painel
  "email": "string | null",         // e-mail de contato/login do dono
  "whatsapp": "string | null",      // E.164 ex: +5527998547188
  "active": true,
  "themeSettings": {
    "primaryColor": "#RRGGBB",
    "secondaryColor": "#RRGGBB",
    "fontFamily": "string",         // ex: "Inter"
    "logoUrl": "string | null"
  },
  "sections": [],                   // reservado p/ editor visual (Tarefa 2) — array vazio por ora
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

Notas:
- `theme` (antigo, master) → **`themeSettings`**. `font` → **`fontFamily`**. `primary_color` → **`primaryColor`**.
- `logo_url` no topo (legado) → **`themeSettings.logoUrl`**.
- Tenant criado no painel-master **deve** receber `ownerUid` (criar o usuário Auth do dono no mesmo fluxo).

### `services/{serviceId}` (coleção **top-level**, não subcoleção)

```jsonc
{
  "tenantId": "string",
  "name": "string",
  "description": "string",
  "duration": 30,                   // minutos
  "price": 50.0,                    // BRL, decimal
  "imageUrl": "string | null",
  "active": true,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

Notas:
- É **top-level** `services` filtrada por `tenantId`. O painel-master deve contar aqui
  (não em `tenants/{id}/services`).
- `image_url`/`duration_minutes` (legado) → **`imageUrl`/`duration`**.

### `bookings/{bookingId}`

```jsonc
{
  "tenantId": "string",
  "serviceId": "string",
  "serviceName": "string",          // DENORMALIZADO (painéis exibem sem novo fetch)
  "servicePrice": 50.0,             // DENORMALIZADO
  "serviceDuration": 30,            // DENORMALIZADO (minutos)
  "customerName": "string",
  "customerPhone": "string",        // E.164
  "bookingDate": "Timestamp",       // dia do agendamento
  "bookingTime": "08:30",           // HH:mm
  "status": "pending",              // pending | confirmed | cancelled | completed
  "notes": "string | null",         // nota interna do dono
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

Notas (mudança principal do contrato):
- Hoje o Flutter grava `tenant_id, customer_name, booking_date, booking_time, created_at` (snake) e
  **não** denormaliza `serviceName/servicePrice` → por isso os painéis mostram serviço/valor em branco.
- Canônico: **camelCase** + **denormalizar** `serviceName`, `servicePrice`, `serviceDuration` no momento
  da criação (o Flutter já tem o `Service` em mãos no fluxo de booking).
- `status` ganha `completed` (já existe no enum do Flutter e do master).

### `availability/{availabilityId}` (um doc por tenant)

```jsonc
{
  "tenantId": "string",
  "weekAvailability": {
    "monday":    { "enabled": true, "timeSlot": { "start": "09:00", "end": "18:00" }, "slotDuration": 30 },
    "tuesday":   { "enabled": false, "timeSlot": { "start": "09:00", "end": "18:00" }, "slotDuration": 30 },
    "wednesday": { "...": "..." },
    "thursday":  { "...": "..." },
    "friday":    { "...": "..." },
    "saturday":  { "...": "..." },
    "sunday":    { "...": "..." }
  },
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

Notas:
- O `AvailabilityModel` do Flutter (linhas planas `day_of_week/start_time/end_time`) é **incompatível**
  com este formato. O Flutter deve passar a ler `weekAvailability` (mapear o dia da semana → chave).
  *(Convergência da disponibilidade = Milestone 3; ver abaixo.)*

### `activity_logs/{logId}` (somente painel-master)

```jsonc
{
  "type": "tenant_created | tenant_updated | booking_created | ...",
  "tenantId": "string | null",
  "tenantName": "string | null",
  "description": "string",
  "metadata": {},
  "createdAt": "Timestamp"
}
```

### `admins/{email}` (somente painel-master)

```jsonc
{ "email": "string", "name": "string", "createdAt": "Timestamp" }
```

---

## Estratégia de convergência (ordem segura)

1. **Milestone 1 (este commit):**
   - Este `SCHEMA.md`.
   - Mappers tolerantes (`mappers.ts`) nos dois painéis: leem snake **ou** camel → objeto canônico.
   - Escritores dos painéis passam a emitir **só** camelCase canônico.
   - Correções de bug expostas: query de bookings do cliente, `orderBy` do master, contagem de
     serviços do master (coleção certa), `themeSettings`/`ownerUid` na criação de tenant do master.
   - Flutter: `BookingModel.toJson` passa a emitir camelCase canônico (leitura mantém fallback).
   - `scripts/migrate-schema.mjs`: migração **dry-run por padrão** dos dados existentes.

2. **Milestone 2:** Denormalizar `serviceName/servicePrice/serviceDuration` no fluxo de criação de
   booking do Flutter (entity + usecase + model). Rodar a migração com backfill desses campos.

3. **Milestone 3:** Convergir `availability` (Flutter passa a ler `weekAvailability`).

4. **Limpeza:** depois que a migração rodou em produção e métricas confirmam 0 docs legados,
   remover os fallbacks snake_case dos leitores.

## Como rodar a migração

```bash
# Pré-requisito: credenciais Admin (mesmas env do painel-master)
cd scripts
# 1) Simular (não escreve nada) — confere o relatório
node migrate-schema.mjs --dry-run
# 2) Aplicar de verdade
node migrate-schema.mjs --apply
```

A migração é **idempotente**: rodar de novo em dados já canônicos não faz nada.

## Regra de ouro

> Um campo, um nome, um lugar. Se precisar de um campo novo, adicione-o **aqui** com o nome
> em `camelCase`, atualize os `mappers.ts` dos dois painéis e o `*_model.dart` do Flutter no
> mesmo PR.
</content>
</invoke>
