/**
 * Seed de dados de demonstração para os EMULADORES.
 * Uso: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 npm run seed
 */
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('Recusando rodar seed fora do emulador (FIRESTORE_EMULATOR_HOST não definido).');
  process.exit(1);
}

admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'vitrine-virtual-dev' });
const db = admin.firestore();

async function main() {
  const agora = Timestamp.now();

  // Dono demo no Auth do emulador
  const user = await admin.auth().createUser({
    email: 'dono@demo.dev',
    password: 'demo1234',
    displayName: 'Dono Demo',
  });

  const tenantRef = db.collection('tenants').doc('demo-tenant');
  await db.collection('slugs').doc('barbearia-demo').set({ tenantId: tenantRef.id });

  await tenantRef.set({
    perfil: {
      nome: 'Barbearia Demo',
      slug: 'barbearia-demo',
      categoria: 'barbearia',
      descricao: 'A melhor barbearia de demonstração da cidade.',
      telefoneWhatsapp: '+5511999990000',
      endereco: { cep: '01310-100', logradouro: 'Av. Paulista', numero: '1000', complemento: '', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
      redes: { instagram: 'barbearia.demo' },
    },
    personalizacao: {
      logoUrl: null, capaUrl: null, fotos: [],
      corPrimaria: '#B8860B', corSecundaria: '#2B2B2B', corFundo: '#FFFFFF', tema: 'auto',
    },
    configAgenda: {
      fusoHorario: 'America/Sao_Paulo',
      duracaoSlotMin: 30,
      antecedenciaMinCancelamentoMin: 120,
      antecedenciaMinAgendamentoMin: 30,
      janelaMaxAgendamentoDias: 90,
      horarios: {
        '0': { aberto: false, faixas: [] },
        '1': { aberto: true, faixas: [{ inicio: '09:00', fim: '19:00' }] },
        '2': { aberto: true, faixas: [{ inicio: '09:00', fim: '19:00' }] },
        '3': { aberto: true, faixas: [{ inicio: '09:00', fim: '19:00' }] },
        '4': { aberto: true, faixas: [{ inicio: '09:00', fim: '19:00' }] },
        '5': { aberto: true, faixas: [{ inicio: '09:00', fim: '20:00' }] },
        '6': { aberto: true, faixas: [{ inicio: '08:00', fim: '14:00' }] },
      },
    },
    assinatura: {
      plano: 'pro', ciclo: 'mensal', status: 'trial', limiteProfissionais: 5,
      trialEndsAt: Timestamp.fromMillis(agora.toMillis() + 7 * 24 * 60 * 60 * 1000),
      mpPreapprovalId: null, descontoPrimeiroMesAplicado: false, bloqueadoManualmente: false,
    },
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  });

  const corte = tenantRef.collection('servicos').doc('svc-corte');
  const barba = tenantRef.collection('servicos').doc('svc-barba');
  await corte.set({ nome: 'Corte masculino', descricao: '', duracaoMin: 30, precoCentavos: 4500, fotoUrl: null, ativo: true, criadoEm: agora, atualizadoEm: agora });
  await barba.set({ nome: 'Barba completa', descricao: '', duracaoMin: 30, precoCentavos: 3500, fotoUrl: null, ativo: true, criadoEm: agora, atualizadoEm: agora });

  await tenantRef.collection('profissionais').doc('prof-joao').set({
    nome: 'João', fotoUrl: null, servicoIds: ['svc-corte', 'svc-barba'],
    comissaoPercent: 40, horarios: null, ativo: true, criadoEm: agora, atualizadoEm: agora,
  });
  await tenantRef.collection('profissionais').doc('prof-maria').set({
    nome: 'Maria', fotoUrl: null, servicoIds: ['svc-corte'],
    comissaoPercent: 50, horarios: null, ativo: true, criadoEm: agora, atualizadoEm: agora,
  });

  await db.collection('users').doc(user.uid).set({
    role: 'owner', tenantId: tenantRef.id, nome: 'Dono Demo', email: 'dono@demo.dev',
    fcmTokens: [], criadoEm: agora, atualizadoEm: agora,
  });
  await admin.auth().setCustomUserClaims(user.uid, { role: 'owner', tenantId: tenantRef.id });

  console.log('Seed concluído:');
  console.log('  tenant: demo-tenant (slug: barbearia-demo)');
  console.log('  login dono: dono@demo.dev / demo1234');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
