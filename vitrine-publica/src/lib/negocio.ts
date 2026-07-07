import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Negocio, Profissional, Servico } from './tipos';

export async function buscarNegocioPorSlug(slug: string): Promise<Negocio | null> {
  const slugSnap = await getDoc(doc(db, 'slugs', slug));
  if (!slugSnap.exists()) return null;

  const tenantId = slugSnap.data().tenantId as string;
  const tenantSnap = await getDoc(doc(db, 'tenants', tenantId));
  if (!tenantSnap.exists()) return null;

  const d = tenantSnap.data();
  const perfil = d.perfil ?? {};
  const pers = d.personalizacao ?? {};
  const assinatura = d.assinatura ?? {};
  const operando =
    ['trial', 'ativa'].includes(assinatura.status) &&
    assinatura.bloqueadoManualmente !== true;

  return {
    id: tenantId,
    nome: perfil.nome ?? '',
    slug: perfil.slug ?? slug,
    descricao: perfil.descricao ?? '',
    categoria: perfil.categoria ?? 'outro',
    telefoneWhatsapp: perfil.telefoneWhatsapp ?? '',
    endereco: perfil.endereco ?? null,
    redes: perfil.redes ?? {},
    personalizacao: {
      logoUrl: pers.logoUrl ?? null,
      capaUrl: pers.capaUrl ?? null,
      fotos: pers.fotos ?? [],
      corPrimaria: pers.corPrimaria ?? '#1E88E5',
      corSecundaria: pers.corSecundaria ?? '#0D47A1',
      corFundo: pers.corFundo ?? '#FFFFFF',
    },
    ativo: operando,
    janelaMaxAgendamentoDias: d.configAgenda?.janelaMaxAgendamentoDias ?? 90,
  };
}

export async function buscarServicos(tenantId: string): Promise<Servico[]> {
  const snap = await getDocs(
    query(
      collection(db, 'tenants', tenantId, 'servicos'),
      where('ativo', '==', true),
      orderBy('nome'),
    ),
  );
  return snap.docs.map((s) => ({ id: s.id, ...s.data() }) as Servico);
}

export async function buscarProfissionais(tenantId: string): Promise<Profissional[]> {
  const snap = await getDocs(
    query(
      collection(db, 'tenants', tenantId, 'profissionais'),
      where('ativo', '==', true),
      orderBy('nome'),
    ),
  );
  return snap.docs.map((p) => ({ id: p.id, ...p.data() }) as Profissional);
}
