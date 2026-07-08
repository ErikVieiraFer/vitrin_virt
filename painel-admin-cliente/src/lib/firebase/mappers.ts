/**
 * Mappers do contrato de schema (ver /SCHEMA.md).
 *
 * Os escritores deste app já emitem camelCase canônico. Os LEITORES, porém, precisam
 * tolerar dados legados em snake_case (ex.: bookings criados pelo app Flutter, tenants
 * criados pelo painel-master) até a migração (`scripts/migrate-schema.mjs`) rodar em produção.
 *
 * Regra: estes mappers leem `camelCase` OU `snake_case` e devolvem sempre o objeto canônico
 * tipado. Mantenha em sincronia com `painel-admin-master/src/lib/firebase/mappers.ts`.
 */
import type { Tenant, ThemeSettings } from '@/types/tenant';
import type { Service } from '@/types/service';
import type { Booking, BookingStatus } from '@/types/booking';
import type { Availability } from '@/types/availability';
import type { VitrineSection } from '@/types/section';

type Raw = Record<string, unknown>;

/** Converte Timestamp do Firestore / Date / string / number em Date. */
export function toDate(value: unknown): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  // Firestore Timestamp (client ou admin SDK): possui .toDate()
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === 'number' || typeof value === 'string') return new Date(value);
  return new Date(0);
}

/** Primeiro valor definido entre os candidatos. */
function pick<T = unknown>(data: Raw, ...keys: string[]): T | undefined {
  for (const k of keys) {
    if (data[k] !== undefined && data[k] !== null) return data[k] as T;
  }
  return undefined;
}

export function mapThemeSettings(raw: unknown): ThemeSettings {
  const t = (raw ?? {}) as Raw;
  return {
    primaryColor: (pick<string>(t, 'primaryColor', 'primary_color') ?? '#3b82f6'),
    secondaryColor: (pick<string>(t, 'secondaryColor', 'secondary_color') ?? '#8b5cf6'),
    fontFamily: (pick<string>(t, 'fontFamily', 'font_family', 'font') ?? 'Inter'),
    logoUrl: pick<string>(t, 'logoUrl', 'logo_url'),
  };
}

export function mapTenant(id: string, data: Raw): Tenant {
  return {
    id,
    name: (pick<string>(data, 'name') ?? ''),
    subdomain: (pick<string>(data, 'subdomain') ?? ''),
    ownerUid: (pick<string>(data, 'ownerUid', 'owner_uid') ?? ''),
    whatsapp: pick<string>(data, 'whatsapp'),
    active: (pick<boolean>(data, 'active') ?? true),
    themeSettings: mapThemeSettings(pick(data, 'themeSettings', 'theme')),
    sections: (pick<VitrineSection[]>(data, 'sections') ?? []),
    createdAt: toDate(pick(data, 'createdAt', 'created_at')),
    updatedAt: toDate(pick(data, 'updatedAt', 'updated_at')),
  };
}

export function mapService(id: string, data: Raw): Service {
  return {
    id,
    tenantId: (pick<string>(data, 'tenantId', 'tenant_id') ?? ''),
    name: (pick<string>(data, 'name') ?? ''),
    description: (pick<string>(data, 'description') ?? ''),
    duration: (pick<number>(data, 'duration', 'duration_minutes') ?? 0),
    price: (pick<number>(data, 'price') ?? 0),
    imageUrl: pick<string>(data, 'imageUrl', 'image_url'),
    active: (pick<boolean>(data, 'active') ?? true),
    createdAt: toDate(pick(data, 'createdAt', 'created_at')),
    updatedAt: toDate(pick(data, 'updatedAt', 'updated_at')),
  };
}

export function mapBooking(id: string, data: Raw): Booking {
  const customer = (pick<Raw>(data, 'customer') ?? {}) as Raw;
  return {
    id,
    tenantId: (pick<string>(data, 'tenantId', 'tenant_id') ?? ''),
    serviceId: (pick<string>(data, 'serviceId', 'service_id') ?? ''),
    serviceName: (pick<string>(data, 'serviceName', 'service_name') ?? ''),
    customer: {
      name: (pick<string>(data, 'customerName', 'customer_name') ??
        (customer.name as string) ?? ''),
      phone: (pick<string>(data, 'customerPhone', 'customer_phone') ??
        (customer.phone as string) ?? ''),
      email: (pick<string>(data, 'customerEmail', 'customer_email') ??
        (customer.email as string | undefined)),
    },
    date: toDate(pick(data, 'bookingDate', 'booking_date', 'date')),
    time: (pick<string>(data, 'bookingTime', 'booking_time', 'time') ?? ''),
    duration: (pick<number>(data, 'serviceDuration', 'duration') ?? 0),
    price: (pick<number>(data, 'servicePrice', 'price') ?? 0),
    status: (pick<BookingStatus>(data, 'status') ?? 'pending'),
    notes: pick<string>(data, 'notes'),
    createdAt: toDate(pick(data, 'createdAt', 'created_at')),
    updatedAt: toDate(pick(data, 'updatedAt', 'updated_at')),
  };
}

export function mapAvailability(id: string, data: Raw): Availability {
  return {
    id,
    tenantId: (pick<string>(data, 'tenantId', 'tenant_id') ?? ''),
    weekAvailability: pick(data, 'weekAvailability', 'week_availability') as Availability['weekAvailability'],
    createdAt: toDate(pick(data, 'createdAt', 'created_at')),
    updatedAt: toDate(pick(data, 'updatedAt', 'updated_at')),
  };
}
