import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';
import { randomBytes } from 'crypto';

export const db = () => admin.firestore();

export function gerarToken(): string {
  return randomBytes(32).toString('hex');
}

export function normalizarWhatsapp(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) {
    throw new HttpsError('invalid-argument', 'WhatsApp inválido');
  }
  return digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
}

export interface FaixaHorario { inicio: string; fim: string }
export interface DiaHorario { aberto: boolean; faixas: FaixaHorario[] }
export type Horarios = Record<string, DiaHorario>;

/** Converte 'HH:mm' em minutos desde meia-noite. */
export function hmParaMin(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

/** Verifica se o intervalo [inicioMin, fimMin) cabe nas faixas abertas do dia. */
export function dentroDoHorario(dia: DiaHorario | undefined, inicioMin: number, fimMin: number): boolean {
  if (!dia || !dia.aberto) return false;
  return dia.faixas.some((f) => inicioMin >= hmParaMin(f.inicio) && fimMin <= hmParaMin(f.fim));
}

export function assertTenantAtivo(tenant: FirebaseFirestore.DocumentData): void {
  const status = tenant.assinatura?.status;
  const bloqueado = tenant.assinatura?.bloqueadoManualmente === true;
  if (bloqueado || !['trial', 'ativa'].includes(status)) {
    throw new HttpsError('failed-precondition', 'Este negócio está temporariamente indisponível.');
  }
}
