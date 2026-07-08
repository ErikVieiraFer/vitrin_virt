'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { TenantStatusBadge } from '@/components/tenant-status-badge';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { normalizeBooking, type MasterBookingRow } from '@/lib/firebase/mappers';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<MasterBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Sem orderBy no servidor: dados legados (Flutter) usam `created_at`/`booking_date`
    // e seriam excluídos por um orderBy('createdAt'). Normalizamos e ordenamos em memória.
    const q = query(collection(db, 'bookings'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => normalizeBooking(doc.id, doc.data()))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setBookings(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching bookings:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = bookings.filter(b =>
    b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    b.tenantId?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Agendamentos</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente ou tenant..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Cliente Final</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(booking => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.bookingDate.toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{booking.bookingTime}</TableCell>
                    <TableCell className="font-mono text-xs">{booking.tenantName || booking.tenantId}</TableCell>
                    <TableCell>{booking.customerName}</TableCell>
                    <TableCell>{booking.customerPhone}</TableCell>
                    <TableCell><TenantStatusBadge status={booking.status} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
