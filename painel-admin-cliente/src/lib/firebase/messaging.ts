'use client';

/**
 * FCM Web Push (Fase 2 das notificações) — push em background, app fechado.
 *
 * Tudo aqui é GUARDADO: se o navegador não suportar, ou se a VAPID key não estiver
 * configurada (NEXT_PUBLIC_FIREBASE_VAPID_KEY), as funções viram no-op e nada quebra.
 * Requer a Cloud Function `notifyNewBooking` (pasta /functions) deployada para enviar.
 * Ver /NOTIFICATIONS.md.
 */
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { app, db } from './config';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export type EnablePushResult =
  | { ok: true }
  | { ok: false; reason: 'unsupported' | 'no-vapid' | 'denied' | 'no-token' | 'error' };

/** O navegador suporta Web Push + FCM? */
export async function isPushSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return false;
  try {
    return await isSupported();
  } catch {
    return false;
  }
}

// O service worker não lê process.env, então passamos a config pública por query-params.
function swUrlWithConfig(): string {
  const params = new URLSearchParams({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

/**
 * Pede permissão, registra o token FCM deste aparelho e o salva em
 * `tenants/{tenantId}/devices/{token}` para a Cloud Function enviar push.
 */
export async function enablePushForTenant(tenantId: string): Promise<EnablePushResult> {
  if (!(await isPushSupported())) return { ok: false, reason: 'unsupported' };
  if (!VAPID_KEY) return { ok: false, reason: 'no-vapid' };

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return { ok: false, reason: 'denied' };

    const registration = await navigator.serviceWorker.register(swUrlWithConfig());
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return { ok: false, reason: 'no-token' };

    await setDoc(
      doc(db, 'tenants', tenantId, 'devices', token),
      {
        token,
        userAgent: navigator.userAgent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { ok: true };
  } catch (error) {
    console.error('Error enabling push:', error);
    return { ok: false, reason: 'error' };
  }
}

/** Notificação em foreground (painel aberto). Retorna função de unsubscribe. */
export async function listenForegroundPush(
  cb: (title: string, body: string) => void
): Promise<() => void> {
  if (!(await isPushSupported())) return () => {};
  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      const n = payload.notification;
      cb(n?.title ?? 'Novo agendamento', n?.body ?? '');
    });
  } catch {
    return () => {};
  }
}
