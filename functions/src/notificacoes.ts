import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { db } from './util';

const REGION = 'southamerica-east1';

/**
 * Push FCM para o dono quando um agendamento é criado ou cancelado.
 * (Tokens são registrados pelo app de gestão em users/{uid}.fcmTokens — Fase 2.)
 */
export const aoMudarAgendamento = onDocumentWritten(
  { region: REGION, document: 'tenants/{tenantId}/agendamentos/{agendamentoId}' },
  async (event) => {
    const antes = event.data?.before?.data();
    const depois = event.data?.after?.data();
    if (!depois) return; // deleção — ignora

    let titulo: string | null = null;
    if (!antes) {
      titulo = 'Novo agendamento!';
    } else if (antes.status === 'agendado' && depois.status === 'cancelado_cliente') {
      titulo = 'Agendamento cancelado pelo cliente';
    }
    if (!titulo) return;

    const tenantId = event.params.tenantId;
    const donos = await db().collection('users').where('tenantId', '==', tenantId).get();
    const tokens = donos.docs.flatMap((d) => (d.data().fcmTokens ?? []) as string[]);
    if (tokens.length === 0) return;

    const inicio = depois.inicio.toDate() as Date;
    const corpo = `${depois.cliente?.nome ?? 'Cliente'} — ${inicio.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    })}`;

    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title: titulo, body: corpo },
      data: { tenantId, agendamentoId: event.params.agendamentoId, tipo: 'agendamento' },
    });
  }
);
