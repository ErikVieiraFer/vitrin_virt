/**
 * Mappers do contrato de schema (ver /SCHEMA.md).
 *
 * O painel-master já renderiza em camelCase canônico, mas os dados legados (bookings do
 * app Flutter, tenants criados antes do contrato) podem estar em snake_case. Estes helpers
 * leem `camelCase` OU `snake_case` e devolvem o objeto canônico, até a migração
 * (`scripts/migrate-schema.mjs`) rodar em produção.
 *
 * Mantenha em sincronia com `painel-admin-cliente/src/lib/firebase/mappers.ts`.
 */

type Raw = Record<string, unknown>;

/** Converte Timestamp (client ou admin SDK) / Date / string / number em Date. */
export function toDate(value: unknown): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === 'number' || typeof value === 'string') return new Date(value);
  return new Date(0);
}

/** Primeiro valor definido entre os candidatos. */
export function pick<T = unknown>(data: Raw, ...keys: string[]): T | undefined {
  for (const k of keys) {
    if (data[k] !== undefined && data[k] !== null) return data[k] as T;
  }
  return undefined;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/** Linha de booking canônica usada nas telas do master. */
export interface MasterBookingRow {
  id: string;
  tenantId: string;
  tenantName: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  bookingDate: Date;
  bookingTime: string;
  status: BookingStatus;
  createdAt: Date;
}

export function normalizeBooking(id: string, data: Raw): MasterBookingRow {
  return {
    id,
    tenantId: pick<string>(data, 'tenantId', 'tenant_id') ?? '',
    tenantName: pick<string>(data, 'tenantName', 'tenant_name') ?? '',
    serviceName: pick<string>(data, 'serviceName', 'service_name') ?? '',
    customerName: pick<string>(data, 'customerName', 'customer_name', 'client_name') ?? '',
    customerPhone: pick<string>(data, 'customerPhone', 'customer_phone', 'client_phone') ?? '',
    bookingDate: toDate(pick(data, 'bookingDate', 'booking_date', 'date')),
    bookingTime: pick<string>(data, 'bookingTime', 'booking_time', 'time') ?? '',
    status: (pick<BookingStatus>(data, 'status') ?? 'pending'),
    createdAt: toDate(pick(data, 'createdAt', 'created_at')),
  };
}

/** Data de criação de um tenant, tolerando ambos os formatos. */
export function tenantCreatedAt(data: Raw): Date {
  return toDate(pick(data, 'createdAt', 'created_at'));
}
</content>
