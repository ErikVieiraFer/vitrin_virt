'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { mapBooking } from '@/lib/firebase/mappers';
import type { Booking } from '@/types/booking';

/**
 * Notificações in-app de novos agendamentos (custo zero — sem Cloud Functions).
 *
 * Escuta os bookings do tenant em tempo real e expõe os criados depois do último
 * "visto" (persistido em localStorage). Enquanto o painel está aberto e com permissão,
 * também dispara uma notificação do navegador. Push em background virá via FCM (Fase 2).
 *
 * Observação: a query usa `tenantId` canônico (ver /SCHEMA.md); bookings legados em
 * `tenant_id` aparecem após rodar a migração.
 */

type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

interface UseBookingNotificationsReturn {
  notifications: Booking[];
  unreadCount: number;
  markAllRead: () => void;
  permission: NotificationPermissionState;
  requestPermission: () => Promise<void>;
}

function storageKey(tenantId: string) {
  return `bookingNotifLastSeen:${tenantId}`;
}

function readLastSeen(tenantId: string): number {
  if (typeof window === 'undefined') return Date.now();
  const stored = window.localStorage.getItem(storageKey(tenantId));
  if (stored) return Number(stored);
  // Primeira vez: marca "agora" para não sinalizar o histórico inteiro como novo.
  const now = Date.now();
  window.localStorage.setItem(storageKey(tenantId), String(now));
  return now;
}

function currentPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as NotificationPermissionState;
}

export function useBookingNotifications(
  tenantId: string | undefined
): UseBookingNotificationsReturn {
  const [notifications, setNotifications] = useState<Booking[]>([]);
  const [permission, setPermission] = useState<NotificationPermissionState>('default');

  const lastSeenRef = useRef<number>(0);
  const initializedRef = useRef<boolean>(false);
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setPermission(currentPermission());
  }, []);

  useEffect(() => {
    if (!tenantId) return;

    lastSeenRef.current = readLastSeen(tenantId);
    initializedRef.current = false;
    notifiedIdsRef.current = new Set();

    const q = query(collection(db, 'bookings'), where('tenantId', '==', tenantId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const all = snapshot.docs.map((d) => mapBooking(d.id, d.data()));

        const unread = all
          .filter((b) => b.createdAt.getTime() > lastSeenRef.current)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setNotifications(unread);

        // Dispara notificação do navegador só para chegadas APÓS o primeiro snapshot,
        // evitando uma enxurrada ao abrir o painel.
        if (initializedRef.current && currentPermission() === 'granted') {
          for (const change of snapshot.docChanges()) {
            if (change.type !== 'added') continue;
            const booking = mapBooking(change.doc.id, change.doc.data());
            if (
              booking.createdAt.getTime() > lastSeenRef.current &&
              !notifiedIdsRef.current.has(booking.id)
            ) {
              notifiedIdsRef.current.add(booking.id);
              try {
                new Notification('Novo agendamento', {
                  body: `${booking.customer.name} • ${booking.serviceName || 'Serviço'} • ${booking.time}`,
                  tag: booking.id,
                });
              } catch {
                // Notification pode falhar em alguns contextos; ignorar silenciosamente.
              }
            }
          }
        }

        initializedRef.current = true;
      },
      (error) => {
        console.error('Error listening to bookings:', error);
      }
    );

    return () => unsubscribe();
  }, [tenantId]);

  const markAllRead = useCallback(() => {
    const now = Date.now();
    lastSeenRef.current = now;
    if (typeof window !== 'undefined' && tenantId) {
      window.localStorage.setItem(storageKey(tenantId), String(now));
    }
    setNotifications([]);
  }, [tenantId]);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermissionState);
  }, []);

  return {
    notifications,
    unreadCount: notifications.length,
    markAllRead,
    permission,
    requestPermission,
  };
}
