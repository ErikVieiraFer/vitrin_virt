/**
 * Cloud Function — push de novo agendamento (Fase 2 das notificações).
 *
 * Dispara no onCreate de um doc em `bookings`, busca os tokens FCM do dono do tenant
 * (subcoleção `tenants/{tenantId}/devices`) e envia o push. Tokens inválidos são limpos.
 *
 * FCM é gratuito; a execução da Function fica dentro do nível gratuito do Blaze no
 * volume de uma barbearia. Ver /NOTIFICATIONS.md para deploy.
 */
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

const PANEL_URL = 'https://painel.vitrinevirt.com/dashboard/bookings';

exports.notifyNewBooking = onDocumentCreated('bookings/{bookingId}', async (event) => {
  const snap = event.data;
  if (!snap) return;
  const b = snap.data() || {};

  // Tolera schema legado (ver /SCHEMA.md).
  const tenantId = b.tenantId || b.tenant_id;
  if (!tenantId) return;

  const db = getFirestore();
  const devicesSnap = await db
    .collection('tenants')
    .doc(tenantId)
    .collection('devices')
    .get();

  const tokens = devicesSnap.docs.map((d) => d.data().token).filter(Boolean);
  if (tokens.length === 0) return;

  const customerName = b.customerName || b.customer_name || 'Cliente';
  const serviceName = b.serviceName || b.service_name || 'Serviço';
  const time = b.bookingTime || b.booking_time || '';

  const response = await getMessaging().sendEachForMulticast({
    tokens,
    notification: {
      title: 'Novo agendamento',
      body: `${customerName} • ${serviceName}${time ? ' • ' + time : ''}`,
    },
    webpush: {
      fcmOptions: { link: PANEL_URL },
    },
  });

  // Remove tokens que não existem mais.
  const stale = [];
  response.responses.forEach((r, i) => {
    if (r.success) return;
    const code = r.error && r.error.code;
    if (
      code === 'messaging/registration-token-not-registered' ||
      code === 'messaging/invalid-registration-token'
    ) {
      stale.push(devicesSnap.docs[i].ref.delete());
    }
  });
  await Promise.all(stale);
});
