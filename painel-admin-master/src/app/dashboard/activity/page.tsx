'use client';

import { useEffect, useState } from 'react';
import { ActivityLogItem } from '@/components/activity-log-item';
import type { ActivityLogView } from '@/types/activity-log';
import { authedFetch } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLogView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await authedFetch('/api/admin/activity');
        if (!res.ok) throw new Error('Falha ao carregar atividades');
        const data = await res.json();
        if (active) setLogs(data.logs ?? []);
      } catch (err) {
        console.error(err);
        if (active) setError('Não foi possível carregar as atividades.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Atividades</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma atividade registrada ainda.</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <ActivityLogItem key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
