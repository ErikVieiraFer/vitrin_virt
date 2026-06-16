'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useBookingNotifications } from '@/lib/hooks/use-booking-notifications';
import { enablePushForTenant } from '@/lib/firebase/messaging';

interface NotificationBellProps {
  tenantId?: string;
}

export function NotificationBell({ tenantId }: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, permission, requestPermission } =
    useBookingNotifications(tenantId);

  const [pushBusy, setPushBusy] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);

  const goToBookings = () => {
    markAllRead();
    setOpen(false);
    router.push('/dashboard/bookings');
  };

  // Ativa push em background (FCM). Se a VAPID ainda não estiver configurada,
  // cai para o aviso in-app (foreground), que só depende da permissão.
  const handleEnablePush = async () => {
    if (!tenantId) return;
    setPushBusy(true);
    setPushMsg(null);
    const res = await enablePushForTenant(tenantId);
    if (res.ok) {
      setPushMsg('Push ativado neste aparelho ✅');
    } else if (res.reason === 'no-vapid' || res.reason === 'unsupported') {
      await requestPermission();
      setPushMsg('Avisos do navegador ativados (push em background pendente de configuração).');
    } else if (res.reason === 'denied') {
      setPushMsg('Permissão negada. Habilite nas configurações do navegador.');
    } else {
      setPushMsg('Não foi possível ativar agora. Tente novamente.');
    }
    setPushBusy(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop para fechar ao clicar fora */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-background shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Novos agendamentos</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Marcar como lidas
                </button>
              )}
            </div>

            {permission !== 'denied' && (
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={pushBusy}
                className="w-full border-b border-border bg-muted/50 px-4 py-2 text-left text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                🔔 {pushBusy ? 'Ativando…' : 'Ativar notificações neste aparelho'}
              </button>
            )}
            {pushMsg && (
              <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
                {pushMsg}
              </p>
            )}

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                  <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum agendamento novo
                  </p>
                </div>
              ) : (
                notifications.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={goToBookings}
                    className="flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left hover:bg-muted/50"
                  >
                    <span className="text-sm font-medium">{b.customer.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {b.serviceName || 'Serviço'} •{' '}
                      {format(b.date, 'dd/MM', { locale: ptBR })} às {b.time}
                    </span>
                  </button>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={goToBookings}
              className="w-full rounded-b-lg px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-muted"
            >
              Ver todos os agendamentos
            </button>
          </div>
        </>
      )}
    </div>
  );
}
