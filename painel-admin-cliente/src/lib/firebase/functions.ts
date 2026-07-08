import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './config';

// Mesma região das Cloud Functions do projeto (ver functions/src)
export const functions = getFunctions(app, 'southamerica-east1');

export type PlanoId = 'basico' | 'pro' | 'business' | 'premium';
export type Ciclo = 'mensal' | 'semestral' | 'anual';

export const fn = {
  criarConta: httpsCallable<
    {
      nomeNegocio: string;
      slug: string;
      categoria: string;
      plano: PlanoId;
      ciclo: Ciclo;
      telefoneWhatsapp: string;
    },
    { tenantId: string; slug: string }
  >(functions, 'criarConta'),

  criarAssinatura: httpsCallable<
    { plano: PlanoId; ciclo: Ciclo },
    { initPoint: string; preapprovalId: string }
  >(functions, 'criarAssinatura'),

  cancelarAssinatura: httpsCallable<Record<string, never>, { ok: boolean }>(
    functions,
    'cancelarAssinatura'
  ),
};

// Tabela de planos — espelho de functions/src/planos.ts (preços em centavos, mensal cheio)
export const PLANOS: Record<
  PlanoId,
  { nome: string; limiteProfissionais: string; precoMensalCentavos: number }
> = {
  basico: { nome: 'Básico', limiteProfissionais: '1 profissional', precoMensalCentavos: 5990 },
  pro: { nome: 'Pro', limiteProfissionais: 'até 5 profissionais', precoMensalCentavos: 8990 },
  business: { nome: 'Business', limiteProfissionais: 'até 15 profissionais', precoMensalCentavos: 14450 },
  premium: { nome: 'Premium', limiteProfissionais: 'profissionais ilimitados', precoMensalCentavos: 19990 },
};

export const DESCONTO_CICLO: Record<Ciclo, number> = {
  mensal: 0,
  semestral: 0.15,
  anual: 0.3,
};

export function precoPorMesCentavos(plano: PlanoId, ciclo: Ciclo): number {
  return Math.round(PLANOS[plano].precoMensalCentavos * (1 - DESCONTO_CICLO[ciclo]));
}

export function formatarReais(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
