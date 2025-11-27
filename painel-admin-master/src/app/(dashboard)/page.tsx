'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/stats-card';
import { TenantCard } from '@/components/tenant-card';
import { AnalyticsChart } from '@/components/analytics-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, TrendingUp, Building2 } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Tenant } from '@/types/tenant';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalBookings: 0,
    bookingsToday: 0,
    conversionRate: 0,
  });
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const monthlyData = [
    { name: 'Jun', newTenants: 4, bookings: 24 },
    { name: 'Jul', newTenants: 3, bookings: 31 },
    { name: 'Ago', newTenants: 7, bookings: 45 },
    { name: 'Set', newTenants: 5, bookings: 38 },
    { name: 'Out', newTenants: 8, bookings: 52 },
    { name: 'Nov', newTenants: 6, bookings: 48 },
  ];

  const weekdayData = [
    { name: 'Dom', bookings: 12 },
    { name: 'Seg', bookings: 45 },
    { name: 'Ter', bookings: 52 },
    { name: 'Qua', bookings: 48 },
    { name: 'Qui', bookings: 55 },
    { name: 'Sex', bookings: 58 },
    { name: 'Sáb', bookings: 35 },
  ];

  const statusData = [
    { name: 'Confirmados', value: 145 },
    { name: 'Pendentes', value: 23 },
    { name: 'Cancelados', value: 12 },
    { name: 'Concluídos', value: 89 },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const tenantsQuery = query(
        collection(db, 'tenants'),
        orderBy('created_at', 'desc'),
        limit(5)
      );
      const tenantsSnapshot = await getDocs(tenantsQuery);
      const tenantsData = tenantsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Tenant[];
      setRecentTenants(tenantsData);

      const allTenantsSnapshot = await getDocs(collection(db, 'tenants'));
      const activeTenants = allTenantsSnapshot.docs.filter(
        doc => doc.data().active
      ).length;

      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const totalBookings = bookingsSnapshot.size;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingsToday = bookingsSnapshot.docs.filter(doc => {
        const bookingDate = doc.data().created_at?.toDate();
        return bookingDate && bookingDate >= today;
      }).length;

      const conversionRate = activeTenants > 0
        ? (totalBookings / activeTenants).toFixed(1)
        : 0;

      setStats({
        totalTenants: activeTenants,
        totalBookings,
        bookingsToday,
        conversionRate: Number(conversionRate),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do sistema Vitrine Virtual
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Clientes"
          value={stats.totalTenants}
          icon={Users}
          description="Clientes ativos"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Total de Agendamentos"
          value={stats.totalBookings}
          icon={Calendar}
          description="Todos os agendamentos"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Agendamentos Hoje"
          value={stats.bookingsToday}
          icon={TrendingUp}
          description="Agendamentos de hoje"
        />
        <StatsCard
          title="Taxa de Conversão"
          value={stats.conversionRate}
          icon={Building2}
          description="Agendamentos por cliente"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Novos Clientes por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              type="line"
              data={monthlyData}
              dataKey="newTenants"
              xKey="name"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agendamentos por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              type="bar"
              data={weekdayData}
              dataKey="bookings"
              xKey="name"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status dos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsChart
            type="pie"
            data={statusData}
            dataKey="value"
            xKey="name"
          />
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Clientes Recentes</h2>
          <Button asChild variant="outline">
            <Link href="/tenants">Ver Todos</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentTenants.map(tenant => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>

        {recentTenants.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum cliente cadastrado ainda
              </p>
              <Button asChild className="mt-4">
                <Link href="/tenants/new">Criar Primeiro Cliente</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}