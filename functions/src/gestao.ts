import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from './util';

const REGION = 'southamerica-east1';

const TRANSICOES: Record<string, string[]> = {
  agendado: ['concluido', 'cancelado_dono', 'no_show'],
  // Estados finais não transicionam.
};

/**
 * Dono atualiza o status de um agendamento do próprio tenant.
 * (Escrita direta é bloqueada nas Rules; toda mudança passa por aqui.)
 */
export const atualizarStatusAgendamento = onCall({ region: REGION }, async (req) => {
  if (!req.auth?.token.tenantId) throw new HttpsError('unauthenticated', 'Sem permissão');
  const tenantId = req.auth.token.tenantId as string;
  const { agendamentoId, status } = req.data as { agendamentoId: string; status: string };

  if (!['concluido', 'cancelado_dono', 'no_show'].includes(status)) {
    throw new HttpsError('invalid-argument', 'Status inválido');
  }

  const ref = db()
    .collection('tenants').doc(tenantId)
    .collection('agendamentos').doc(agendamentoId);

  await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Agendamento não encontrado');
    const atual = snap.data()!.status as string;
    if (!(TRANSICOES[atual] ?? []).includes(status)) {
      throw new HttpsError('failed-precondition', `Não é possível mudar de "${atual}" para "${status}"`);
    }
    tx.update(ref, {
      status,
      ...(status === 'cancelado_dono' ? { canceladoEm: Timestamp.now() } : {}),
      atualizadoEm: Timestamp.now(),
    });
  });

  return { ok: true };
});
