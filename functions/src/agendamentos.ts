import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { Timestamp } from 'firebase-admin/firestore';
import { db, gerarToken, normalizarWhatsapp, dentroDoHorario, Horarios } from './util';
import { assertTenantAtivo } from './util';

const REGION = 'southamerica-east1';

interface DadosAgendamento {
  tenantId: string;
  profId: string;
  servicoId: string;
  inicioIso: string;
  cliente: { nome: string; whatsapp: string };
}

async function carregarContexto(tenantId: string, profId: string, servicoId: string) {
  const tenantRef = db().collection('tenants').doc(tenantId);
  const [tenantSnap, profSnap, servicoSnap] = await Promise.all([
    tenantRef.get(),
    tenantRef.collection('profissionais').doc(profId).get(),
    tenantRef.collection('servicos').doc(servicoId).get(),
  ]);
  if (!tenantSnap.exists) throw new HttpsError('not-found', 'Negócio não encontrado');
  if (!profSnap.exists || profSnap.data()!.ativo !== true) {
    throw new HttpsError('not-found', 'Profissional indisponível');
  }
  if (!servicoSnap.exists || servicoSnap.data()!.ativo !== true) {
    throw new HttpsError('not-found', 'Serviço indisponível');
  }
  return { tenantRef, tenant: tenantSnap.data()!, prof: profSnap.data()!, servico: servicoSnap.data()! };
}

/**
 * Valida a janela [inicio, fim) contra horário de funcionamento, antecedência
 * e conflitos, e cria o agendamento em transação.
 */
async function validarECriar(dados: DadosAgendamento, origem: 'vitrine' | 'manual') {
  const { tenantId, profId, servicoId } = dados;
  const { tenantRef, tenant, prof, servico } = await carregarContexto(tenantId, profId, servicoId);
  assertTenantAtivo(tenant);

  if (!((prof.servicoIds ?? []) as string[]).includes(servicoId)) {
    throw new HttpsError('invalid-argument', 'Profissional não executa este serviço');
  }

  const cfg = tenant.configAgenda ?? {};
  const inicio = new Date(dados.inicioIso);
  if (isNaN(inicio.getTime())) throw new HttpsError('invalid-argument', 'Data inválida');
  const fim = new Date(inicio.getTime() + servico.duracaoMin * 60_000);
  const agora = new Date();

  const antecedenciaMin = (cfg.antecedenciaMinAgendamentoMin ?? 30) * 60_000;
  if (origem === 'vitrine' && inicio.getTime() - agora.getTime() < antecedenciaMin) {
    throw new HttpsError('failed-precondition', 'Horário muito próximo, escolha outro');
  }
  const janelaMax = (cfg.janelaMaxAgendamentoDias ?? 90) * 24 * 60 * 60_000;
  if (inicio.getTime() - agora.getTime() > janelaMax) {
    throw new HttpsError('failed-precondition', 'Data além da janela de agendamento');
  }

  // Horário de funcionamento (do profissional, se definido; senão do tenant),
  // avaliado no fuso America/Sao_Paulo.
  const local = new Date(inicio.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const diaSemana = String(local.getDay());
  const inicioMin = local.getHours() * 60 + local.getMinutes();
  const fimMin = inicioMin + servico.duracaoMin;
  const horarios: Horarios = prof.horarios ?? cfg.horarios ?? {};
  if (!dentroDoHorario(horarios[diaSemana], inicioMin, fimMin)) {
    throw new HttpsError('failed-precondition', 'Fora do horário de atendimento');
  }

  const whatsapp = normalizarWhatsapp(dados.cliente.whatsapp);
  const nome = (dados.cliente.nome ?? '').trim();
  if (nome.length < 2) throw new HttpsError('invalid-argument', 'Nome inválido');

  const token = gerarToken();
  const agendamentoRef = tenantRef.collection('agendamentos').doc();

  await db().runTransaction(async (tx) => {
    // Conflito: agendamentos do mesmo profissional que colidem com [inicio, fim)
    const conflitos = await tx.get(
      tenantRef
        .collection('agendamentos')
        .where('profId', '==', profId)
        .where('status', '==', 'agendado')
        .where('inicio', '<', Timestamp.fromDate(fim))
        .orderBy('inicio', 'desc')
        .limit(5)
    );
    for (const doc of conflitos.docs) {
      if ((doc.data().fim as Timestamp).toDate() > inicio) {
        throw new HttpsError('already-exists', 'Horário acabou de ser ocupado, escolha outro');
      }
    }

    // Bloqueios pontuais
    const bloqueios = await tx.get(
      tenantRef.collection('bloqueios').where('fim', '>', Timestamp.fromDate(inicio)).limit(20)
    );
    for (const b of bloqueios.docs) {
      const d = b.data();
      if ((d.profId == null || d.profId === profId) && (d.inicio as Timestamp).toDate() < fim) {
        throw new HttpsError('failed-precondition', 'Horário bloqueado pela agenda');
      }
    }

    tx.set(agendamentoRef, {
      cliente: { nome, whatsapp },
      profId,
      servicoId,
      inicio: Timestamp.fromDate(inicio),
      fim: Timestamp.fromDate(fim),
      status: 'agendado',
      precoCentavos: servico.precoCentavos,
      tokenGestao: token,
      origem,
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
    });
    tx.set(db().collection('tokensAgendamento').doc(token), {
      tenantId,
      agendamentoId: agendamentoRef.id,
    });
  });

  return { agendamentoId: agendamentoRef.id, token };
}

/** Vitrine pública — cliente final agenda sem login. */
export const criarAgendamento = onCall({ region: REGION }, async (req) => {
  return validarECriar(req.data as DadosAgendamento, 'vitrine');
});

/** App de gestão — dono cria agendamento manual. */
export const criarAgendamentoManual = onCall({ region: REGION }, async (req) => {
  const dados = req.data as DadosAgendamento;
  if (!req.auth || req.auth.token.tenantId !== dados.tenantId) {
    throw new HttpsError('permission-denied', 'Sem permissão neste negócio');
  }
  return validarECriar(dados, 'manual');
});

async function resolverToken(token: string) {
  const idx = await db().collection('tokensAgendamento').doc(token).get();
  if (!idx.exists) throw new HttpsError('not-found', 'Agendamento não encontrado');
  const { tenantId, agendamentoId } = idx.data()!;
  const ref = db().collection('tenants').doc(tenantId).collection('agendamentos').doc(agendamentoId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Agendamento não encontrado');
  return { tenantId: tenantId as string, ref, agendamento: snap.data()! };
}

/** Cliente final consulta o próprio agendamento via token (dados seguros p/ página /a/{token}). */
export const obterAgendamentoPorToken = onCall({ region: REGION }, async (req) => {
  const { token } = req.data as { token: string };
  const { tenantId, agendamento } = await resolverToken(token);

  const tenantSnap = await db().collection('tenants').doc(tenantId).get();
  const tenant = tenantSnap.data()!;
  const [profSnap, servicoSnap] = await Promise.all([
    tenantSnap.ref.collection('profissionais').doc(agendamento.profId).get(),
    tenantSnap.ref.collection('servicos').doc(agendamento.servicoId).get(),
  ]);

  return {
    negocio: {
      nome: tenant.perfil?.nome ?? '',
      slug: tenant.perfil?.slug ?? '',
      whatsapp: tenant.perfil?.telefoneWhatsapp ?? '',
    },
    agendamento: {
      inicioIso: (agendamento.inicio as Timestamp).toDate().toISOString(),
      status: agendamento.status,
      clienteNome: agendamento.cliente?.nome ?? '',
      profissional: profSnap.data()?.nome ?? '',
      servico: servicoSnap.data()?.nome ?? '',
      profId: agendamento.profId,
      servicoId: agendamento.servicoId,
      antecedenciaMinCancelamentoMin:
        tenant.configAgenda?.antecedenciaMinCancelamentoMin ?? 120,
    },
  };
});

/** Cliente final cancela via token (respeita antecedência mínima do tenant). */
export const cancelarAgendamento = onCall({ region: REGION }, async (req) => {
  const { token, motivo } = req.data as { token: string; motivo?: string };
  const { tenantId, ref, agendamento } = await resolverToken(token);

  if (agendamento.status !== 'agendado') {
    throw new HttpsError('failed-precondition', 'Este agendamento não pode mais ser alterado');
  }
  const tenant = (await db().collection('tenants').doc(tenantId).get()).data()!;
  const antecedencia = (tenant.configAgenda?.antecedenciaMinCancelamentoMin ?? 120) * 60_000;
  if ((agendamento.inicio as Timestamp).toDate().getTime() - Date.now() < antecedencia) {
    throw new HttpsError(
      'failed-precondition',
      'O prazo para cancelar pela internet já passou. Entre em contato pelo WhatsApp.'
    );
  }
  await ref.update({
    status: 'cancelado_cliente',
    canceladoEm: Timestamp.now(),
    motivoCancelamento: motivo ?? null,
    atualizadoEm: Timestamp.now(),
  });
  return { ok: true };
});

/** Cliente final reagenda via token = cancela + cria no novo horário, atomicamente do ponto de vista do usuário. */
export const reagendarAgendamento = onCall({ region: REGION }, async (req) => {
  const { token, novoInicioIso } = req.data as { token: string; novoInicioIso: string };
  const { tenantId, ref, agendamento } = await resolverToken(token);

  if (agendamento.status !== 'agendado') {
    throw new HttpsError('failed-precondition', 'Este agendamento não pode mais ser alterado');
  }
  const tenant = (await db().collection('tenants').doc(tenantId).get()).data()!;
  const antecedencia = (tenant.configAgenda?.antecedenciaMinCancelamentoMin ?? 120) * 60_000;
  if ((agendamento.inicio as Timestamp).toDate().getTime() - Date.now() < antecedencia) {
    throw new HttpsError('failed-precondition', 'O prazo para reagendar pela internet já passou.');
  }

  const novo = await validarECriar(
    {
      tenantId,
      profId: agendamento.profId,
      servicoId: agendamento.servicoId,
      inicioIso: novoInicioIso,
      cliente: agendamento.cliente,
    },
    'vitrine'
  );
  await ref.update({
    status: 'cancelado_cliente',
    canceladoEm: Timestamp.now(),
    motivoCancelamento: 'reagendado',
    atualizadoEm: Timestamp.now(),
  });
  return novo;
});

/** Slots livres de um profissional em uma data (para a vitrine). */
export const listarSlots = onCall({ region: REGION }, async (req) => {
  const { tenantId, profId, servicoId, dataIso } = req.data as {
    tenantId: string; profId: string; servicoId: string; dataIso: string;
  };
  const { tenantRef, tenant, prof, servico } = await carregarContexto(tenantId, profId, servicoId);
  assertTenantAtivo(tenant);

  const cfg = tenant.configAgenda ?? {};
  const passo: number = cfg.duracaoSlotMin ?? 30;
  const dia = new Date(`${dataIso}T00:00:00-03:00`);
  const diaSemana = String(dia.getDay());
  const horarios: Horarios = prof.horarios ?? cfg.horarios ?? {};
  const diaHorario = horarios[diaSemana];
  if (!diaHorario?.aberto) return { slots: [] };

  const fimDia = new Date(dia.getTime() + 24 * 60 * 60_000);
  const [ocupadosSnap, bloqueiosSnap] = await Promise.all([
    tenantRef.collection('agendamentos')
      .where('profId', '==', profId)
      .where('status', '==', 'agendado')
      .where('inicio', '>=', Timestamp.fromDate(dia))
      .where('inicio', '<', Timestamp.fromDate(fimDia))
      .get(),
    tenantRef.collection('bloqueios')
      .where('fim', '>', Timestamp.fromDate(dia))
      .get(),
  ]);
  const ocupados = ocupadosSnap.docs.map((d) => ({
    inicio: (d.data().inicio as Timestamp).toDate(),
    fim: (d.data().fim as Timestamp).toDate(),
  }));
  const bloqueios = bloqueiosSnap.docs
    .map((d) => d.data())
    .filter((b) => (b.profId == null || b.profId === profId) && (b.inicio as Timestamp).toDate() < fimDia)
    .map((b) => ({ inicio: (b.inicio as Timestamp).toDate(), fim: (b.fim as Timestamp).toDate() }));

  const antecedencia = (cfg.antecedenciaMinAgendamentoMin ?? 30) * 60_000;
  const slots: string[] = [];
  for (const faixa of diaHorario.faixas) {
    const [hi, mi] = faixa.inicio.split(':').map(Number);
    const [hf, mf] = faixa.fim.split(':').map(Number);
    let t = new Date(dia.getTime() + (hi * 60 + mi) * 60_000);
    const fimFaixa = new Date(dia.getTime() + (hf * 60 + mf) * 60_000);
    while (new Date(t.getTime() + servico.duracaoMin * 60_000) <= fimFaixa) {
      const fimSlot = new Date(t.getTime() + servico.duracaoMin * 60_000);
      const livre =
        t.getTime() - Date.now() >= antecedencia &&
        ![...ocupados, ...bloqueios].some((o) => o.inicio < fimSlot && o.fim > t);
      if (livre) slots.push(t.toISOString());
      t = new Date(t.getTime() + passo * 60_000);
    }
  }
  return { slots };
});
