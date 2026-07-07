import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const app =
  getApps()[0] ??
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });

export const db = getFirestore(app);
export const functions = getFunctions(app, 'southamerica-east1');

export const fn = {
  listarSlots: httpsCallable(functions, 'listarSlots'),
  criarAgendamento: httpsCallable(functions, 'criarAgendamento'),
  obterAgendamentoPorToken: httpsCallable(functions, 'obterAgendamentoPorToken'),
  cancelarAgendamento: httpsCallable(functions, 'cancelarAgendamento'),
  reagendarAgendamento: httpsCallable(functions, 'reagendarAgendamento'),
};
