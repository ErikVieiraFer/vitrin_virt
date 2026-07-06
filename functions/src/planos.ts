// Tabela de planos — fonte de verdade de preços e limites.
// Valores em centavos. Semestral −15%, anual −30% (sobre o mensal cheio).

export type PlanoId = 'basico' | 'pro' | 'business' | 'premium';
export type Ciclo = 'mensal' | 'semestral' | 'anual';

export interface Plano {
  id: PlanoId;
  nome: string;
  limiteProfissionais: number;
  precoMensalCentavos: number;
}

export const PLANOS: Record<PlanoId, Plano> = {
  basico: { id: 'basico', nome: 'Básico', limiteProfissionais: 1, precoMensalCentavos: 5990 },
  pro: { id: 'pro', nome: 'Pro', limiteProfissionais: 5, precoMensalCentavos: 8990 },
  business: { id: 'business', nome: 'Business', limiteProfissionais: 15, precoMensalCentavos: 14450 },
  premium: { id: 'premium', nome: 'Premium', limiteProfissionais: 999, precoMensalCentavos: 19990 },
};

export const DESCONTO_CICLO: Record<Ciclo, number> = {
  mensal: 0,
  semestral: 0.15,
  anual: 0.30,
};

export const TRIAL_DIAS = 7;
export const DESCONTO_PRIMEIRO_MES = 0.5;

export function precoPorMes(plano: PlanoId, ciclo: Ciclo): number {
  const cheio = PLANOS[plano].precoMensalCentavos;
  return Math.round(cheio * (1 - DESCONTO_CICLO[ciclo]));
}
