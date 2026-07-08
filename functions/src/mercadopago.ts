import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { Timestamp } from 'firebase-admin/firestore';
import { createHmac } from 'crypto';
import { db } from './util';
import { PLANOS, PlanoId, Ciclo, precoPorMes, DESCONTO_PRIMEIRO_MES } from './planos';

const REGION = 'southamerica-east1';
const MP_API = 'https://api.mercadopago.com';

// Config via functions/.env (não versionado — ver functions/.env.example):
//   MP_ACCESS_TOKEN  — token da aplicação MP (sandbox: TEST-..., produção: APP_USR-...)
//   MP_WEBHOOK_SECRET — assinatura secreta do webhook (painel MP > Webhooks)
//   PAINEL_URL       — URL do painel do cliente (back_url pós-checkout)
function cfg(nome: 'MP_ACCESS_TOKEN' | 'MP_WEBHOOK_SECRET' | 'PAINEL_URL'): string {
  const v = process.env[nome];
  if (!v) throw new HttpsError('failed-precondition', `Config ausente: ${nome}`);
  return v;
}

async function mpFetch(caminho: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const resp = await fetch(`${MP_API}${caminho}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg('MP_ACCESS_TOKEN')}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const body = (await resp.json().catch(() => ({}))) as Record<string, unknown>;
  if (!resp.ok) {
    console.error('Erro MP', resp.status, JSON.stringify(body));
    throw new HttpsError('internal', `Mercado Pago retornou ${resp.status}`);
  }
  return body;
}

interface CicloInfo {
  frequency: number; // meses entre cobranças
  meses: number;
}
const CICLOS: Record<Ciclo, CicloInfo> = {
  mensal: { frequency: 1, meses: 1 },
  semestral: { frequency: 6, meses: 6 },
  anual: { frequency: 12, meses: 12 },
};

/** Valor de UMA cobrança do ciclo, em reais (MP usa decimal, não centavos). */
function valorCobranca(plano: PlanoId, ciclo: Ciclo): number {
  return (precoPorMes(plano, ciclo) * CICLOS[ciclo].meses) / 100;
}

/**
 * Cria a assinatura (preapproval) e devolve o init_point para o checkout do MP.
 * Chamada do painel web do cliente — NUNCA do app (política de lojas).
 *
 * Promo de 1º mês com 50% (apenas ciclo mensal): a preapproval nasce com o
 * valor promocional e, após o primeiro pagamento aprovado (webhook), o valor
 * é atualizado para o cheio.
 */
export const criarAssinatura = onCall({ region: REGION }, async (req) => {
  if (!req.auth?.token.tenantId) throw new HttpsError('unauthenticated', 'Faça login');
  const tenantId = req.auth.token.tenantId as string;
  const email = req.auth.token.email as string | undefined;
  if (!email) throw new HttpsError('failed-precondition', 'Conta sem e-mail');

  const { plano, ciclo } = req.data as { plano: PlanoId; ciclo: Ciclo };
  if (!PLANOS[plano] || !CICLOS[ciclo]) {
    throw new HttpsError('invalid-argument', 'Plano ou ciclo inválido');
  }

  const tenantRef = db().collection('tenants').doc(tenantId);
  const tenantSnap = await tenantRef.get();
  if (!tenantSnap.exists) throw new HttpsError('not-found', 'Negócio não encontrado');
  const assinaturaAtual = tenantSnap.data()!.assinatura ?? {};
  if (assinaturaAtual.status === 'ativa' && assinaturaAtual.mpPreapprovalId) {
    throw new HttpsError(
      'already-exists',
      'Já existe uma assinatura ativa. Cancele antes de trocar de plano.'
    );
  }

  const promoPrimeiroMes = ciclo === 'mensal' && !assinaturaAtual.descontoPrimeiroMesAplicado;
  const cheio = valorCobranca(plano, ciclo);
  const primeiraCobranca = promoPrimeiroMes
    ? Math.round(cheio * (1 - DESCONTO_PRIMEIRO_MES) * 100) / 100
    : cheio;

  const preapproval = await mpFetch('/preapproval', {
    method: 'POST',
    body: JSON.stringify({
      reason: `Vitrine Virtual — plano ${PLANOS[plano].nome} (${ciclo})`,
      external_reference: tenantId,
      payer_email: email,
      back_url: `${cfg('PAINEL_URL')}/dashboard/assinatura?retorno=mp`,
      auto_recurring: {
        frequency: CICLOS[ciclo].frequency,
        frequency_type: 'months',
        transaction_amount: primeiraCobranca,
        currency_id: 'BRL',
      },
    }),
  });

  await tenantRef.update({
    'assinatura.plano': plano,
    'assinatura.ciclo': ciclo,
    'assinatura.limiteProfissionais': PLANOS[plano].limiteProfissionais,
    'assinatura.mpPreapprovalId': preapproval.id,
    // status só muda para 'ativa' via webhook (authorized)
    'assinatura.promoPendente': promoPrimeiroMes,
    'assinatura.valorCheioReais': cheio,
    atualizadoEm: Timestamp.now(),
  });

  return { initPoint: preapproval.init_point, preapprovalId: preapproval.id };
});

/** Cancela a assinatura no MP e marca o tenant. */
export const cancelarAssinatura = onCall({ region: REGION }, async (req) => {
  if (!req.auth?.token.tenantId) throw new HttpsError('unauthenticated', 'Faça login');
  const tenantId = req.auth.token.tenantId as string;

  const tenantRef = db().collection('tenants').doc(tenantId);
  const snap = await tenantRef.get();
  const preapprovalId = snap.data()?.assinatura?.mpPreapprovalId;
  if (!preapprovalId) throw new HttpsError('not-found', 'Nenhuma assinatura para cancelar');

  await mpFetch(`/preapproval/${preapprovalId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'cancelled' }),
  });
  // O webhook confirma e atualiza o status; marcamos a intenção aqui.
  await tenantRef.update({
    'assinatura.cancelamentoSolicitadoEm': Timestamp.now(),
    atualizadoEm: Timestamp.now(),
  });
  return { ok: true };
});

// ---------------------------------------------------------------------------
// Webhook
// ---------------------------------------------------------------------------

/** Valida o header x-signature conforme doc oficial do MP (HMAC-SHA256). */
function assinaturaValida(req: {
  headers: Record<string, unknown>;
  query: Record<string, unknown>;
}): boolean {
  const xSig = String(req.headers['x-signature'] ?? '');
  const xReqId = String(req.headers['x-request-id'] ?? '');
  const dataId = String(req.query['data.id'] ?? '').toLowerCase();

  const partes = Object.fromEntries(
    xSig.split(',').map((p) => p.trim().split('=') as [string, string])
  );
  const ts = partes['ts'];
  const v1 = partes['v1'];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xReqId};ts:${ts};`;
  const esperado = createHmac('sha256', cfg('MP_WEBHOOK_SECRET'))
    .update(manifest)
    .digest('hex');
  return esperado === v1;
}

type StatusAssinatura = 'trial' | 'ativa' | 'inadimplente' | 'bloqueada' | 'cancelada';

async function aplicarStatus(
  tenantId: string,
  status: StatusAssinatura,
  extras: Record<string, unknown> = {}
): Promise<void> {
  const ref = db().collection('tenants').doc(tenantId);
  const patch: Record<string, unknown> = {
    'assinatura.status': status,
    atualizadoEm: Timestamp.now(),
    ...extras,
  };
  if (status === 'inadimplente') {
    patch['assinatura.inadimplenteDesde'] = Timestamp.now();
  }
  await ref.update(patch);
}

/** Após o 1º pagamento aprovado com promo, sobe a cobrança pro valor cheio. */
async function aplicarFimDaPromo(tenantId: string): Promise<void> {
  const ref = db().collection('tenants').doc(tenantId);
  const snap = await ref.get();
  const a = snap.data()?.assinatura ?? {};
  if (!a.promoPendente || !a.mpPreapprovalId || !a.valorCheioReais) return;

  await mpFetch(`/preapproval/${a.mpPreapprovalId}`, {
    method: 'PUT',
    body: JSON.stringify({
      auto_recurring: { transaction_amount: a.valorCheioReais },
    }),
  });
  await ref.update({
    'assinatura.promoPendente': false,
    'assinatura.descontoPrimeiroMesAplicado': true,
    atualizadoEm: Timestamp.now(),
  });
}

/**
 * Webhook do Mercado Pago (Assinaturas).
 * Nunca confia no payload: valida assinatura, busca o recurso na API,
 * registra em webhooksMp (idempotência) e aplica a máquina de estados.
 */
export const mpWebhook = onRequest({ region: REGION }, async (req, res) => {
  const tipo = String(req.query['type'] ?? req.body?.type ?? '');
  const dataId = String(req.query['data.id'] ?? req.body?.data?.id ?? '');
  const requestId = String(req.headers['x-request-id'] ?? `${Date.now()}`);

  if (
    !assinaturaValida({
      headers: req.headers as Record<string, unknown>,
      query: req.query as Record<string, unknown>,
    })
  ) {
    console.warn('Webhook MP com assinatura inválida', { tipo, dataId });
    res.status(401).send('assinatura inválida');
    return;
  }

  // Idempotência: um doc por request-id do MP
  const logRef = db().collection('webhooksMp').doc(requestId);
  const jaProcessado = await logRef.get();
  if (jaProcessado.exists && jaProcessado.data()?.resultado === 'ok') {
    res.status(200).send('duplicado');
    return;
  }

  let resultado = 'ignorado';
  try {
    if (tipo === 'subscription_preapproval') {
      const pre = await mpFetch(`/preapproval/${dataId}`);
      const tenantId = String(pre.external_reference ?? '');
      if (tenantId) {
        const mapa: Record<string, StatusAssinatura> = {
          authorized: 'ativa',
          paused: 'inadimplente',
          cancelled: 'cancelada',
        };
        const novo = mapa[String(pre.status)];
        if (novo) {
          await aplicarStatus(tenantId, novo, {
            'assinatura.mpPreapprovalId': dataId,
          });
          resultado = 'ok';
        }
      }
    } else if (tipo === 'subscription_authorized_payment') {
      const pagamento = await mpFetch(`/authorized_payments/${dataId}`);
      const preId = String(pagamento.preapproval_id ?? '');
      if (preId) {
        const pre = await mpFetch(`/preapproval/${preId}`);
        const tenantId = String(pre.external_reference ?? '');
        const statusPg = String(
          (pagamento.payment as Record<string, unknown> | undefined)?.status ??
            pagamento.status ??
            ''
        );
        if (tenantId && ['approved', 'accredited', 'processed'].includes(statusPg)) {
          await aplicarStatus(tenantId, 'ativa');
          await aplicarFimDaPromo(tenantId);
          resultado = 'ok';
        } else if (tenantId && ['rejected', 'cancelled'].includes(statusPg)) {
          await aplicarStatus(tenantId, 'inadimplente');
          resultado = 'ok';
        }
      }
    } else {
      resultado = `tipo não tratado: ${tipo}`;
    }
  } catch (e) {
    console.error('Erro processando webhook MP', e);
    resultado = `erro: ${String(e)}`;
  }

  await logRef.set({
    tipo,
    dataId,
    payload: req.body ?? null,
    processadoEm: Timestamp.now(),
    resultado,
  });

  // 200 sempre que a assinatura é válida — o MP reenvia em caso de 5xx.
  res.status(200).send('ok');
});

// ---------------------------------------------------------------------------
// Rotina diária — trials vencidos e inadimplência prolongada
// ---------------------------------------------------------------------------

const GRACE_INADIMPLENCIA_DIAS = 5;

export const verificarAssinaturas = onSchedule(
  { region: REGION, schedule: '0 3 * * *', timeZone: 'America/Sao_Paulo' },
  async () => {
    const agora = Timestamp.now();

    // Trials vencidos sem assinatura contratada -> bloqueada
    const trials = await db()
      .collection('tenants')
      .where('assinatura.status', '==', 'trial')
      .where('assinatura.trialEndsAt', '<', agora)
      .get();
    for (const doc of trials.docs) {
      if (!doc.data().assinatura?.mpPreapprovalId) {
        await doc.ref.update({
          'assinatura.status': 'bloqueada',
          atualizadoEm: agora,
        });
      }
    }

    // Inadimplência além do período de tolerância -> bloqueada
    const limite = Timestamp.fromMillis(
      agora.toMillis() - GRACE_INADIMPLENCIA_DIAS * 24 * 60 * 60 * 1000
    );
    const inadimplentes = await db()
      .collection('tenants')
      .where('assinatura.status', '==', 'inadimplente')
      .where('assinatura.inadimplenteDesde', '<', limite)
      .get();
    for (const doc of inadimplentes.docs) {
      await doc.ref.update({
        'assinatura.status': 'bloqueada',
        atualizadoEm: agora,
      });
    }

    console.log(
      `verificarAssinaturas: ${trials.size} trials vencidos, ${inadimplentes.size} bloqueios por inadimplência`
    );
  }
);
