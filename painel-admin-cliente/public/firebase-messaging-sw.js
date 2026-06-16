/* Service worker do FCM Web Push (Fase 2). Ver /NOTIFICATIONS.md.
 *
 * A config pública do Firebase chega via query-params no registro
 * (registration em messaging.ts), pois o SW não acessa process.env.
 * Esses valores são públicos (config web do Firebase), não são segredos.
 */
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

const params = new URL(self.location).searchParams;

firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const n = payload.notification || {};
  self.registration.showNotification(n.title || 'Novo agendamento', {
    body: n.body || '',
    tag: 'vitrine-booking',
  });
});

// Ao clicar na notificação, abre/foca o painel de agendamentos.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = '/dashboard/bookings';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes('/dashboard') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
