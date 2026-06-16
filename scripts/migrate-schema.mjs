#!/usr/bin/env node
/**
 * Migração de schema para o contrato canônico (ver /SCHEMA.md).
 *
 * Converte documentos legados (snake_case / formatos divergentes) para o schema canônico
 * em camelCase, em TODAS as coleções. É IDEMPOTENTE: rodar de novo em dados já canônicos
 * não faz nada.
 *
 * Uso:
 *   node migrate-schema.mjs            # dry-run (padrão): só mostra o que mudaria
 *   node migrate-schema.mjs --dry-run  # idem
 *   node migrate-schema.mjs --apply    # aplica de verdade
 *
 * Credenciais (mesmas do painel-admin-master). Use UMA das opções:
 *   1) export GOOGLE_APPLICATION_CREDENTIALS=/caminho/serviceAccount.json
 *   2) export FIREBASE_ADMIN_PROJECT_ID=...  FIREBASE_ADMIN_CLIENT_EMAIL=...  FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN..."
 *
 * Requer `firebase-admin` instalado. Ex.: rode a partir de painel-admin-master,
 * ou `cd scripts && npm init -y && npm i firebase-admin`.
 */
import admin from 'firebase-admin';

const APPLY = process.argv.includes('--apply');
const DRY_RUN = !APPLY;

// ---- init ----
function initAdmin() {
  if (admin.apps.length) return;
  const {
    GOOGLE_APPLICATION_CREDENTIALS,
    FIREBASE_ADMIN_PROJECT_ID,
    FIREBASE_ADMIN_CLIENT_EMAIL,
    FIREBASE_ADMIN_PRIVATE_KEY,
  } = process.env;

  if (FIREBASE_ADMIN_PROJECT_ID && FIREBASE_ADMIN_CLIENT_EMAIL && FIREBASE_ADMIN_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else if (GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else {
    console.error(
      'ERRO: credenciais ausentes. Defina GOOGLE_APPLICATION_CREDENTIALS ou ' +
        'FIREBASE_ADMIN_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY.'
    );
    process.exit(1);
  }
}

const FieldValue = admin.firestore.FieldValue;

/** Renomeia chaves legadas → canônicas. Retorna { updates, deletes } ou null se nada muda. */
function planRename(data, renames, { addUpdatedAt = false } = {}) {
  const updates = {};
  const deletes = {};
  for (const [legacy, canonical] of renames) {
    if (data[legacy] !== undefined && data[canonical] === undefined) {
      updates[canonical] = data[legacy];
      deletes[legacy] = FieldValue.delete();
    } else if (data[legacy] !== undefined && data[canonical] !== undefined) {
      // já existe o canônico; só limpa o legado
      deletes[legacy] = FieldValue.delete();
    }
  }
  if (addUpdatedAt && data.updatedAt === undefined && data.updated_at === undefined) {
    updates.updatedAt = data.createdAt ?? data.created_at ?? FieldValue.serverTimestamp();
  }
  const changed = Object.keys(updates).length + Object.keys(deletes).length;
  return changed ? { ...updates, ...deletes } : null;
}

/** Tenant: theme{primary_color,...} -> themeSettings{primaryColor,...} + timestamps. */
function planTenant(data) {
  const patch = {};
  let changed = false;

  // theme -> themeSettings
  const hasThemeSettings = data.themeSettings && typeof data.themeSettings === 'object';
  const legacyTheme = data.theme && typeof data.theme === 'object' ? data.theme : null;
  if (!hasThemeSettings && legacyTheme) {
    patch.themeSettings = {
      primaryColor: legacyTheme.primary_color ?? legacyTheme.primaryColor ?? '#3b82f6',
      secondaryColor: legacyTheme.secondary_color ?? legacyTheme.secondaryColor ?? '#8b5cf6',
      fontFamily: legacyTheme.font ?? legacyTheme.fontFamily ?? legacyTheme.font_family ?? 'Inter',
      ...(data.logo_url || legacyTheme.logo_url
        ? { logoUrl: data.logo_url ?? legacyTheme.logo_url }
        : {}),
    };
    patch.theme = FieldValue.delete();
    changed = true;
  }
  if (data.logo_url !== undefined) {
    patch.logo_url = FieldValue.delete();
    changed = true;
  }
  // timestamps
  for (const [legacy, canonical] of [['created_at', 'createdAt'], ['updated_at', 'updatedAt']]) {
    if (data[legacy] !== undefined) {
      if (data[canonical] === undefined) patch[canonical] = data[legacy];
      patch[legacy] = FieldValue.delete();
      changed = true;
    }
  }
  return changed ? patch : null;
}

async function migrateCollection(name, planner) {
  const db = admin.firestore();
  const snap = await db.collection(name).get();
  let toChange = 0;
  let batch = db.batch();
  let ops = 0;

  for (const doc of snap.docs) {
    const patch = planner(doc.data());
    if (!patch) continue;
    toChange += 1;
    if (DRY_RUN) {
      console.log(`  [${name}/${doc.id}] mudaria:`, Object.keys(patch).join(', '));
    } else {
      batch.set(doc.ref, patch, { merge: true });
      ops += 1;
      if (ops >= 400) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
  }
  if (!DRY_RUN && ops > 0) await batch.commit();
  console.log(
    `${name}: ${snap.size} docs lidos, ${toChange} ${DRY_RUN ? 'mudariam' : 'migrados'}.`
  );
  return toChange;
}

async function main() {
  initAdmin();
  console.log(`\n=== Migração de schema — modo: ${DRY_RUN ? 'DRY-RUN (nada será escrito)' : 'APPLY'} ===\n`);

  let total = 0;
  total += await migrateCollection('tenants', planTenant);
  total += await migrateCollection('services', (d) =>
    planRename(
      d,
      [
        ['tenant_id', 'tenantId'],
        ['image_url', 'imageUrl'],
        ['duration_minutes', 'duration'],
        ['created_at', 'createdAt'],
        ['updated_at', 'updatedAt'],
      ],
      { addUpdatedAt: true }
    )
  );
  total += await migrateCollection('bookings', (d) =>
    planRename(
      d,
      [
        ['tenant_id', 'tenantId'],
        ['service_id', 'serviceId'],
        ['customer_name', 'customerName'],
        ['customer_phone', 'customerPhone'],
        ['booking_date', 'bookingDate'],
        ['booking_time', 'bookingTime'],
        ['created_at', 'createdAt'],
      ],
      { addUpdatedAt: true }
    )
  );
  total += await migrateCollection('availability', (d) =>
    planRename(d, [
      ['tenant_id', 'tenantId'],
      ['week_availability', 'weekAvailability'],
      ['created_at', 'createdAt'],
      ['updated_at', 'updatedAt'],
    ])
  );

  console.log(
    `\n=== Total: ${total} docs ${DRY_RUN ? 'mudariam' : 'migrados'}. ` +
      `${DRY_RUN ? 'Rode com --apply para aplicar.' : 'Concluído.'} ===\n`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('Falha na migração:', err);
  process.exit(1);
});
</content>
