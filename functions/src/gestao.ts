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
 *
 * Ao CONCLUIR, cria o lançamento financeiro na mesma transação:
 * - valorCentavos opcional (default: preço registrado no agendamento)
 * - comissão do profissional congelada no momento do lançamento
 */
export const atualizarStatusAgendamento = onCall({ region: REGION }, async (req) => {
  if (!req.auth?.token.tenantId) throw new HttpsError('unauthenticated', 'Sem permissão');
  const tenantId = req.auth.token.tenantId as string;
  const { agendamentoId, status, valorCentavos } = req.data as {
    agendamentoId: string;
    status: string;
    valorCentavos?: number;
  };

  if (!['concluido', 'cancelado_dono', 'no_show'].includes(status)) {
    throw new HttpsError('invalid-argument', 'Status inválido');
  }
  if (valorCentavos != null && (!Number.isInteger(valorCentavos) || valorCentavos < 0)) {
    throw new HttpsError('invalid-argument', 'Valor inválido');
  }

  const tenantRef = db().collection('tenants').doc(tenantId);
  const ref = tenantRef.collection('agendamentos').doc(agendamentoId);

  await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Agendamento não encontrado');
    const dados = snap.data()!;
    const atual = dados.status as string;
    if (!(TRANSICOES[atual] ?? []).includes(status)) {
      throw new HttpsError('failed-precondition', `Não é possível mudar de "${atual}" para "${status}"`);
    }

    if (status === 'concluido') {
      const profSnap = await tx.get(
        tenantRef.collection('profissionais').doc(dados.profId)
      );
      const comissao = profSnap.data()?.comissaoPercent ?? 0;
      const valor = valorCentavos ?? dados.precoCentavos ?? 0;

      tx.set(tenantRef.collection('financeiro').doc(), {
        tipo: 'receita_agendamento',
        agendamentoId,
        profId: dados.profId,
        servicoId: dados.servicoId,
        valorCentavos: valor,
        comissaoPercentSnapshot: comissao,
        data: dados.inicio, // receita conta no dia do atendimento
        descricao: null,
        criadoEm: Timestamp.now(),
        atualizadoEm: Timestamp.now(),
      });
    }

    tx.update(ref, {
      status,
      ...(status === 'concluido' && valorCentavos != null
        ? { precoCentavos: valorCentavos }
        : {}),
      ...(status === 'cancelado_dono' ? { canceladoEm: Timestamp.now() } : {}),
      atualizadoEm: Timestamp.now(),
    });
  });

  return { ok: true };
});
