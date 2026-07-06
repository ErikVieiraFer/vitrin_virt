import { onRequest } from 'firebase-functions/v2/https';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from './util';

const REGION = 'southamerica-east1';

/**
 * Webhook do Mercado Pago (Assinaturas / preapproval).
 *
 * FASE 5 — este é um esqueleto. Implementação completa inclui:
 *  1. Validar assinatura do webhook (header x-signature + MP_WEBHOOK_SECRET).
 *  2. Buscar o evento na API do MP (nunca confiar só no payload).
 *  3. Idempotência via webhooksMp/{eventId}.
 *  4. Atualizar tenants/{tenantId}.assinatura.status:
 *     authorized -> 'ativa' | payment failed -> 'inadimplente' (com grace) |
 *     cancelled -> 'cancelada'.
 */
export const mpWebhook = onRequest({ region: REGION }, async (req, res) => {
  const eventId = String(req.query['data.id'] ?? req.body?.data?.id ?? 'desconhecido');
  await db().collection('webhooksMp').doc(`${Date.now()}_${eventId}`).set({
    payload: req.body ?? null,
    query: req.query ?? null,
    tipo: req.body?.type ?? req.query['type'] ?? null,
    processadoEm: Timestamp.now(),
    resultado: 'recebido_nao_processado (Fase 5)',
  });
  // MP exige 200/201 rápido; processamento real virá na Fase 5.
  res.status(200).send('ok');
});
