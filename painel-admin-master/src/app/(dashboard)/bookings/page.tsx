'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { TenantStatusBadge } from '@/components/tenant-status-badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function BookingsPage() {
  const bookings = [
    { id: '1', date: '2024-11-16', time: '10:00', tenant: 'Salão Beleza', service: 'Corte + Escova', client: 'Maria Silva', status: 'confirmed' as const },
    { id: '2', date: '2024-11-16', time: '14:00', tenant: 'Barbearia Top', service: 'Corte', client: 'João Santos', status: 'pending' as const },
    { id: '3', date: '2024-11-15', time: '16:00', tenant: 'Estética Avançada', service: 'Limpeza de Pele', client: 'Ana Costa', status: 'completed' as const },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Agendamentos</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar agendamento..." className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Cliente (Tenant)</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Cliente Final</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.time}</TableCell>
                  <TableCell>{booking.tenant}</TableCell>
                  <TableCell>{booking.service}</TableCell>
                  <TableCell>{booking.client}</TableCell>
                  <TableCell><TenantStatusBadge status={booking.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
