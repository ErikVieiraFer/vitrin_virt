'use client';

import { ActivityLogItem } from '@/components/activity-log-item';
import { ActivityLog } from '@/types/activity-log';
import { Timestamp } from 'firebase/firestore';

export default function ActivityPage() {
  const logs: ActivityLog[] = [
    {
      id: '1',
      type: 'tenant_created',
      tenant_id: 't1',
      tenant_name: 'Salão Beleza',
      description: 'Novo cliente criado: Salão Beleza',
      created_at: Timestamp.now(),
    },
    {
      id: '2',
      type: 'booking_created',
      tenant_id: 't1',
      tenant_name: 'Salão Beleza',
      description: 'Novo agendamento criado',
      created_at: Timestamp.now(),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Atividades</h1>
      <div className="space-y-4">
        {logs.map(log => (
          <ActivityLogItem key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}
