'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  getBookingsByTenantId,
  updateBookingStatus,
  updateBookingNotes,
} from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Loader2,
  Filter,
  Check,
  X,
  CheckCheck,
  StickyNote,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatPrice, formatPhone } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types/booking';

const STATUS_OPTIONS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

function getStatusVariant(status: BookingStatus) {
  switch (status) {
    case 'confirmed':
      return 'success' as const;
    case 'completed':
      return 'secondary' as const;
    case 'pending':
      return 'warning' as const;
    case 'cancelled':
      return 'destructive' as const;
    default:
      return 'default' as const;
  }
}

function getStatusLabel(status: BookingStatus) {
  switch (status) {
    case 'confirmed':
      return 'Confirmado';
    case 'completed':
      return 'Concluído';
    case 'pending':
      return 'Pendente';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
}

export default function BookingsPage() {
  const { tenant } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Ação em andamento (desabilita botões da linha) e erro de operação.
  const [actionId, setActionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal de nota interna.
  const [notesBooking, setNotesBooking] = useState<Booking | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      fetchBookings();
    }
  }, [tenant?.id]);

  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    if (!tenant?.id) return;

    try {
      const data = await getBookingsByTenantId(tenant.id);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setErrorMsg('Não foi possível carregar os agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(
        (b) => b.date.toDateString() === filterDate.toDateString()
      );
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFilter('');
  };

  // Atualiza o status com update otimista; reverte em caso de erro.
  const handleStatusChange = async (booking: Booking, status: BookingStatus) => {
    const previous = booking.status;
    setActionId(booking.id);
    setErrorMsg(null);
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status } : b))
    );
    try {
      await updateBookingStatus(booking.id, status);
    } catch (error) {
      console.error('Error updating booking status:', error);
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: previous } : b))
      );
      setErrorMsg('Não foi possível atualizar o status. Tente novamente.');
    } finally {
      setActionId(null);
    }
  };

  const openNotes = (booking: Booking) => {
    setNotesBooking(booking);
    setNotesDraft(booking.notes ?? '');
    setErrorMsg(null);
  };

  const saveNotes = async () => {
    if (!notesBooking) return;
    setSavingNotes(true);
    try {
      await updateBookingNotes(notesBooking.id, notesDraft);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === notesBooking.id ? { ...b, notes: notesDraft } : b
        )
      );
      setNotesBooking(null);
    } catch (error) {
      console.error('Error saving notes:', error);
      setErrorMsg('Não foi possível salvar a nota. Tente novamente.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agendamentos</h1>
        <p className="text-muted-foreground">Visualize e gerencie seus agendamentos</p>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-filter">Data</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Agendamentos ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Nenhum agendamento encontrado</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all' || dateFilter
                  ? 'Tente ajustar os filtros'
                  : 'Você ainda não recebeu agendamentos'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBookings.map((booking) => {
                    const busy = actionId === booking.id;
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          {format(booking.date, 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>{booking.time}</TableCell>
                        <TableCell className="font-medium">
                          {booking.serviceName || '—'}
                        </TableCell>
                        <TableCell>{booking.customer.name}</TableCell>
                        <TableCell>{formatPhone(booking.customer.phone)}</TableCell>
                        <TableCell>
                          {booking.price ? formatPrice(booking.price) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(booking.status)}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {booking.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="default"
                                disabled={busy}
                                onClick={() => handleStatusChange(booking, 'confirmed')}
                                title="Confirmar"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="default"
                                disabled={busy}
                                onClick={() => handleStatusChange(booking, 'completed')}
                                title="Marcar como concluído"
                              >
                                <CheckCheck className="h-4 w-4" />
                              </Button>
                            )}
                            {(booking.status === 'pending' ||
                              booking.status === 'confirmed') && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => handleStatusChange(booking, 'cancelled')}
                                title="Cancelar"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy}
                              onClick={() => openNotes(booking)}
                              title="Nota interna"
                            >
                              <StickyNote
                                className={`h-4 w-4 ${booking.notes ? 'text-primary' : ''}`}
                              />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de nota interna */}
      {notesBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !savingNotes && setNotesBooking(null)}
        >
          <Card
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Nota interna
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {notesBooking.customer.name} ·{' '}
                {format(notesBooking.date, 'dd/MM/yyyy', { locale: ptBR })} às{' '}
                {notesBooking.time}
              </p>
              <Textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Anotação visível só para você (ex.: cliente pediu para remarcar)"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setNotesBooking(null)}
                  disabled={savingNotes}
                >
                  Cancelar
                </Button>
                <Button onClick={saveNotes} disabled={savingNotes}>
                  {savingNotes ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Salvar nota'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
