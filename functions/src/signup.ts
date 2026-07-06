import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from './util';
import { PLANOS, PlanoId, Ciclo, TRIAL_DIAS } from './planos';

const REGION = 'southamerica-east1';
const SLUG_RE = /^[a-z0-9-]{3,40}$/;

/**
 * Cria a conta completa: tenant + reserva de slug + doc do usuário + custom claims.
 * Chamada autenticada (usuário recém-criado no Firebase Auth pelo painel web).
 * Assinatura nasce em trial de 7 dias, sem cartão.
 */
export const criarConta = onCall({ region: REGION }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Faça login para continuar');
  const uid = req.auth.uid;
  const { nomeNegocio, slug, categoria, plano, ciclo, telefoneWhatsapp } = req.data as {
    nomeNegocio: string; slug: string; categoria: string;
    plano: PlanoId; ciclo: Ciclo; telefoneWhatsapp: string;
  };

  if (!SLUG_RE.test(slug)) throw new HttpsError('invalid-argument', 'Endereço (slug) inválido');
  if (!PLANOS[plano]) throw new HttpsError('invalid-argument', 'Plano inválido');

  const userRef = db().collection('users').doc(uid);
  const existente = await userRef.get();
  if (existente.exists && existente.data()!.tenantId) {
    throw new HttpsError('already-exists', 'Esta conta já possui um negócio');
  }

  const tenantRef = db().collection('tenants').doc();
  const slugRef = db().collection('slugs').doc(slug);
  const agora = Timestamp.now();
  const trialEndsAt = Timestamp.fromMillis(agora.toMillis() + TRIAL_DIAS * 24 * 60 * 60 * 1000);

  await db().runTransaction(async (tx) => {
    const slugSnap = await tx.get(slugRef);
    if (slugSnap.exists) throw new HttpsError('already-exists', 'Este endereço já está em uso');

    tx.set(slugRef, { tenantId: tenantRef.id });
    tx.set(tenantRef, {
      perfil: {
        nome: nomeNegocio,
        slug,
        categoria: categoria ?? 'outro',
        descricao: '',
        telefoneWhatsapp: telefoneWhatsapp ?? '',
        endereco: null,
        redes: {},
      },
      personalizacao: {
        logoUrl: null,
        capaUrl: null,
        fotos: [],
        corPrimaria: '#1E88E5',
        corSecundaria: '#0D47A1',
        corFundo: '#FFFFFF',
        tema: 'auto',
      },
      configAgenda: {
        fusoHorario: 'America/Sao_Paulo',
        duracaoSlotMin: 30,
        antecedenciaMinCancelamentoMin: 120,
        antecedenciaMinAgendamentoMin: 30,
        janelaMaxAgendamentoDias: 90,
        horarios: {
          '0': { aberto: false, faixas: [] },
          '1': { aberto: true, faixas: [{ inicio: '08:00', fim: '18:00' }] },
          '2': { aberto: true, faixas: [{ inicio: '08:00', fim: '18:00' }] },
          '3': { aberto: true, faixas: [{ inicio: '08:00', fim: '18:00' }] },
          '4': { aberto: true, faixas: [{ inicio: '08:00', fim: '18:00' }] },
          '5': { aberto: true, faixas: [{ inicio: '08:00', fim: '18:00' }] },
          '6': { aberto: true, faixas: [{ inicio: '08:00', fim: '12:00' }] },
        },
      },
      assinatura: {
        plano,
        ciclo: ciclo ?? 'mensal',
        status: 'trial',
        limiteProfissionais: PLANOS[plano].limiteProfissionais,
        trialEndsAt,
        mpPreapprovalId: null,
        descontoPrimeiroMesAplicado: false,
        bloqueadoManualmente: false,
      },
      ativo: true,
      criadoEm: agora,
      atualizadoEm: agora,
    });
    tx.set(userRef, {
      role: 'owner',
      tenantId: tenantRef.id,
      nome: req.auth!.token.name ?? '',
      email: req.auth!.token.email ?? '',
      fcmTokens: [],
      criadoEm: agora,
      atualizadoEm: agora,
    }, { merge: true });
  });

  await admin.auth().setCustomUserClaims(uid, { role: 'owner', tenantId: tenantRef.id });
  return { tenantId: tenantRef.id, slug };
});

/**
 * Cria profissional com enforcement do limite do plano (por isso não é escrita direta).
 */
export const criarProfissional = onCall({ region: REGION }, async (req) => {
  if (!req.auth?.token.tenantId) throw new HttpsError('unauthenticated', 'Sem permissão');
  const tenantId = req.auth.token.tenantId as string;
  const { nome, servicoIds, comissaoPercent } = req.data as {
    nome: string; servicoIds?: string[]; comissaoPercent?: number;
  };
  if (!nome || nome.trim().length < 2) throw new HttpsError('invalid-argument', 'Nome inválido');

  const tenantRef = db().collection('tenants').doc(tenantId);
  const profRef = tenantRef.collection('profissionais').doc();

  await db().runTransaction(async (tx) => {
    const tenantSnap = await tx.get(tenantRef);
    if (!tenantSnap.exists) throw new HttpsError('not-found', 'Negócio não encontrado');
    const limite = tenantSnap.data()!.assinatura?.limiteProfissionais ?? 1;
    const ativos = await tx.get(tenantRef.collection('profissionais').where('ativo', '==', true));
    if (ativos.size >= limite) {
      throw new HttpsError(
        'resource-exhausted',
        `Seu plano permite até ${limite} profissional(is) ativo(s). Faça upgrade para adicionar mais.`
      );
    }
    tx.set(profRef, {
      nome: nome.trim(),
      fotoUrl: null,
      servicoIds: servicoIds ?? [],
      comissaoPercent: comissaoPercent ?? 0,
      horarios: null,
      ativo: true,
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
    });
  });

  return { profId: profRef.id };
});

/**
 * Reativa profissional respeitando o limite do plano
 * (a escrita direta de ativo false -> true é bloqueada nas Rules).
 */
export const reativarProfissional = onCall({ region: REGION }, async (req) => {
  if (!req.auth?.token.tenantId) throw new HttpsError('unauthenticated', 'Sem permissão');
  const tenantId = req.auth.token.tenantId as string;
  const { profId } = req.data as { profId: string };

  const tenantRef = db().collection('tenants').doc(tenantId);
  await db().runTransaction(async (tx) => {
    const [tenantSnap, profSnap, ativos] = await Promise.all([
      tx.get(tenantRef),
      tx.get(tenantRef.collection('profissionais').doc(profId)),
      tx.get(tenantRef.collection('profissionais').where('ativo', '==', true)),
    ]);
    if (!profSnap.exists) throw new HttpsError('not-found', 'Profissional não encontrado');
    const limite = tenantSnap.data()?.assinatura?.limiteProfissionais ?? 1;
    if (ativos.size >= limite) {
      throw new HttpsError(
        'resource-exhausted',
        `Seu plano permite até ${limite} profissional(is) ativo(s). Faça upgrade para reativar.`
      );
    }
    tx.update(profSnap.ref, { ativo: true, atualizadoEm: Timestamp.now() });
  });
  return { ok: true };
});
