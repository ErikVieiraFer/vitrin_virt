'use client';

import { useEffect, useState } from 'react';
import { authedFetch } from '@/lib/api';
import { StatsCard } from '@/components/stats-card';
import { AnalyticsChart } from '@/components/analytics-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Calendar, Loader2 } from 'lucide-react';

interface MonthData {
  name: string;
  bookings: number;
  newTenants: number;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [totalTenants, setTotalTenants] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await authedFetch('/api/admin/analytics');
        if (!res.ok) throw new Error('Falha ao carregar analytics');
        const data = await res.json();

        setTotalTenants(data.totalTenants ?? 0);
        setTotalBookings(data.totalBookings ?? 0);

        const monthly: Array<{ month: number; bookings: number; newTenants: number }> =
          data.monthly ?? [];
        setMonthlyData(
          monthly.map((m) => ({
            name: MONTHS[m.month] ?? String(m.month),
            bookings: m.bookings,
            newTenants: m.newTenants,
          }))
        );
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total de Clientes" value={String(totalTenants)} icon={Users} />
        <StatsCard title="Total de Agendamentos" value={String(totalBookings)} icon={Calendar} />
        <StatsCard
          title="Média Agend./Cliente"
          value={totalTenants ? (totalBookings / totalTenants).toFixed(1) : '0'}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Agendamentos por Mês</CardTitle></CardHeader>
          <CardContent>
            <AnalyticsChart type="bar" data={monthlyData} dataKey="bookings" xKey="name" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Novos Clientes por Mês</CardTitle></CardHeader>
          <CardContent>
            <AnalyticsChart type="line" data={monthlyData} dataKey="newTenants" xKey="name" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
