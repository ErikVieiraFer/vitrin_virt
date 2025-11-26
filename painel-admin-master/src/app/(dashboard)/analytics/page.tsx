'use client';

import { StatsCard } from '@/components/stats-card';
import { AnalyticsChart } from '@/components/analytics-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  const growthData = [
    { name: 'Jan', newTenants: 2, bookings: 15 },
    { name: 'Fev', newTenants: 5, bookings: 28 },
    { name: 'Mar', newTenants: 7, bookings: 42 },
    { name: 'Abr', newTenants: 4, bookings: 35 },
    { name: 'Mai', newTenants: 6, bookings: 48 },
    { name: 'Jun', newTenants: 8, bookings: 55 },
  ];

  const topClients = [
    { name: 'Salão Beleza', bookings: 45 },
    { name: 'Barbearia Top', bookings: 38 },
    { name: 'Estética Avançada', bookings: 32 },
    { name: 'Clínica Saúde', bookings: 28 },
    { name: 'Studio Fit', bookings: 25 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Crescimento" value="12.5%" icon={TrendingUp} trend={{ value: 12.5, isPositive: true }} />
        <StatsCard title="Clientes Ativos" value="24" icon={Users} />
        <StatsCard title="Agendamentos Mês" value="156" icon={Calendar} trend={{ value: 8.3, isPositive: true }} />
        <StatsCard title="Receita Estimada" value="R$ 15.2k" icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Crescimento ao Longo do Tempo</CardTitle></CardHeader>
          <CardContent><AnalyticsChart type="line" data={growthData} dataKey="newTenants" xKey="name" /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top 5 Clientes Mais Ativos</CardTitle></CardHeader>
          <CardContent><AnalyticsChart type="bar" data={topClients} dataKey="bookings" xKey="name" /></CardContent>
        </Card>
      </div>
    </div>
  );
}
