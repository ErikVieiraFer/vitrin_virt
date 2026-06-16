'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toDate, pick } from '@/lib/firebase/mappers';
import { StatsCard } from '@/components/stats-card';
import { AnalyticsChart } from '@/components/analytics-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Calendar } from 'lucide-react';
import { Loader2 } from 'lucide-react';

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
    async function fetchData() {
      try {
        const [tenantsSnap, bookingsSnap] = await Promise.all([
          getDocs(query(collection(db, 'tenants'))),
          getDocs(query(collection(db, 'bookings'))),
        ]);

        setTotalTenants(tenantsSnap.size);
        setTotalBookings(bookingsSnap.size);

        // Agrupa bookings por mês (tolera bookingDate/booking_date/date). Ver /SCHEMA.md.
        const bookingsByMonth: Record<number, number> = {};
        bookingsSnap.docs.forEach(doc => {
          const raw = doc.data();
          const date = toDate(pick(raw, 'bookingDate', 'booking_date', 'date'));
          if (date.getTime() > 0) {
            const month = date.getMonth();
            bookingsByMonth[month] = (bookingsByMonth[month] ?? 0) + 1;
          }
        });

        // Agrupa tenants por mês de criação (tolera createdAt/created_at)
        const tenantsByMonth: Record<number, number> = {};
        tenantsSnap.docs.forEach(doc => {
          const date = toDate(pick(doc.data(), 'createdAt', 'created_at'));
          if (date.getTime() > 0) {
            const month = date.getMonth();
            tenantsByMonth[month] = (tenantsByMonth[month] ?? 0) + 1;
          }
        });

        const data: MonthData[] = MONTHS.map((name, i) => ({
          name,
          bookings: bookingsByMonth[i] ?? 0,
          newTenants: tenantsByMonth[i] ?? 0,
        }));

        setMonthlyData(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
        <StatsCard title="Média Agend./Cliente" value={totalTenants ? (totalBookings / totalTenants).toFixed(1) : '0'} icon={TrendingUp} />
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
