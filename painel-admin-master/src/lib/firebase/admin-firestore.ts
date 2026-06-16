import { adminDb } from './admin-config';
import admin from './admin-config';
import { Tenant, TenantStats } from '@/types/tenant';
import { Booking, BookingFilters } from '@/types/booking';
import { ActivityLog, ActivityLogFilters } from '@/types/activity-log';
import { GlobalStats } from '@/types/stats';
import { toDate, pick } from './mappers';

type Raw = Record<string, unknown>;

/**
 * Busca docs por tenant tolerando ambos os nomes de campo (`tenantId` canônico e
 * `tenant_id` legado), mesclando por id. Ver /SCHEMA.md.
 */
async function getByTenant(
  collectionName: string,
  tenantId: string
): Promise<Array<{ id: string; data: Raw }>> {
  const ref = adminDb.collection(collectionName);
  const [camelSnap, snakeSnap] = await Promise.all([
    ref.where('tenantId', '==', tenantId).get(),
    ref.where('tenant_id', '==', tenantId).get(),
  ]);
  const byId = new Map<string, Raw>();
  for (const snap of [camelSnap, snakeSnap]) {
    snap.docs.forEach((doc) => {
      if (!byId.has(doc.id)) byId.set(doc.id, doc.data() as Raw);
    });
  }
  return Array.from(byId.entries()).map(([id, data]) => ({ id, data }));
}

/**
 * Get all tenants
 */
export async function getAllTenants(): Promise<Tenant[]> {
  try {
    // Sem orderBy no servidor: tenants criados pelo painel-cliente usam `createdAt` (camel)
    // e seriam excluídos por um orderBy('created_at'). Ordenamos em memória. Ver /SCHEMA.md.
    const tenantsSnapshot = await adminDb.collection('tenants').get();

    return tenantsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as Tenant)
      .sort(
        (a, b) =>
          toDate(pick(b as unknown as Raw, 'createdAt', 'created_at')).getTime() -
          toDate(pick(a as unknown as Raw, 'createdAt', 'created_at')).getTime()
      );
  } catch (error) {
    console.error('Error getting all tenants:', error);
    throw error;
  }
}

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  try {
    const tenantDoc = await adminDb.collection('tenants').doc(tenantId).get();

    if (!tenantDoc.exists) {
      return null;
    }

    return {
      id: tenantDoc.id,
      ...tenantDoc.data(),
    } as Tenant;
  } catch (error) {
    console.error('Error getting tenant:', error);
    throw error;
  }
}

/**
 * Get tenant stats
 */
export async function getTenantStats(tenantId: string): Promise<TenantStats> {
  try {
    // Serviços ficam na coleção TOP-LEVEL `services` filtrada por tenantId
    // (não na subcoleção tenants/{id}/services). Ver /SCHEMA.md.
    const services = await getByTenant('services', tenantId);
    const activeServices = services.filter(s => s.data.active === true).length;

    // Bookings tolerando tenantId/tenant_id; agregações feitas em memória sobre
    // createdAt normalizado (o campo varia entre dados legados e canônicos).
    const bookings = await getByTenant('bookings', tenantId);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let bookingsThisMonth = 0;
    let lastBookingDate: Date | undefined;
    for (const b of bookings) {
      const created = toDate(pick(b.data, 'createdAt', 'created_at'));
      if (created >= startOfMonth) bookingsThisMonth += 1;
      if (!lastBookingDate || created > lastBookingDate) lastBookingDate = created;
    }

    return {
      total_services: services.length,
      active_services: activeServices,
      total_bookings: bookings.length,
      bookings_this_month: bookingsThisMonth,
      last_booking_date: lastBookingDate
        ? admin.firestore.Timestamp.fromDate(lastBookingDate)
        : undefined,
    };
  } catch (error) {
    console.error('Error getting tenant stats:', error);
    throw error;
  }
}

/**
 * Get all bookings with filters
 */
export async function getAllBookings(filters?: BookingFilters): Promise<Booking[]> {
  try {
    let query: admin.firestore.Query = adminDb.collection('bookings');

    if (filters?.tenant_id) {
      query = query.where('tenant_id', '==', filters.tenant_id);
    }

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters?.startDate) {
      query = query.where('date', '>=', admin.firestore.Timestamp.fromDate(filters.startDate));
    }

    if (filters?.endDate) {
      query = query.where('date', '<=', admin.firestore.Timestamp.fromDate(filters.endDate));
    }

    query = query.orderBy('date', 'desc').limit(100);

    const bookingsSnapshot = await query.get();

    let bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];

    // Filter by search term (client-side)
    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      bookings = bookings.filter(booking =>
        booking.client_name.toLowerCase().includes(searchLower) ||
        booking.client_phone.includes(searchLower)
      );
    }

    return bookings;
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw error;
  }
}

/**
 * Get activity logs with filters
 */
export async function getActivityLogs(filters?: ActivityLogFilters): Promise<ActivityLog[]> {
  try {
    let query: admin.firestore.Query = adminDb.collection('activity_logs');

    if (filters?.type) {
      query = query.where('type', '==', filters.type);
    }

    if (filters?.tenant_id) {
      query = query.where('tenant_id', '==', filters.tenant_id);
    }

    if (filters?.startDate) {
      query = query.where('created_at', '>=', admin.firestore.Timestamp.fromDate(filters.startDate));
    }

    if (filters?.endDate) {
      query = query.where('created_at', '<=', admin.firestore.Timestamp.fromDate(filters.endDate));
    }

    query = query.orderBy('created_at', 'desc').limit(100);

    const logsSnapshot = await query.get();

    return logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ActivityLog[];
  } catch (error) {
    console.error('Error getting activity logs:', error);
    throw error;
  }
}

/**
 * Create activity log
 */
export async function createActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>): Promise<void> {
  try {
    await adminDb.collection('activity_logs').add({
      ...log,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
    throw error;
  }
}

/**
 * Update tenant status
 */
export async function updateTenantStatus(tenantId: string, active: boolean): Promise<void> {
  try {
    await adminDb.collection('tenants').doc(tenantId).update({
      active,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create activity log
    const tenant = await getTenantById(tenantId);
    if (tenant) {
      await createActivityLog({
        type: active ? 'tenant_activated' : 'tenant_deactivated',
        tenant_id: tenantId,
        tenant_name: tenant.name,
        description: `Cliente ${active ? 'ativado' : 'desativado'}`,
      });
    }
  } catch (error) {
    console.error('Error updating tenant status:', error);
    throw error;
  }
}

/**
 * Create new tenant
 */
export async function createTenant(data: {
  name: string;
  subdomain: string;
  email: string;
  whatsapp: string;
  ownerUid?: string;
  themeSettings: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    logoUrl?: string;
  };
}): Promise<string> {
  try {
    // Schema canônico (camelCase). Ver /SCHEMA.md.
    const tenantRef = await adminDb.collection('tenants').add({
      name: data.name,
      subdomain: data.subdomain,
      email: data.email,
      whatsapp: data.whatsapp,
      ownerUid: data.ownerUid ?? null,
      themeSettings: data.themeSettings,
      sections: [],
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create activity log
    await createActivityLog({
      type: 'tenant_created',
      tenant_id: tenantRef.id,
      tenant_name: data.name,
      description: `Novo cliente criado: ${data.name}`,
    });

    return tenantRef.id;
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
}

/**
 * Update tenant
 */
export async function updateTenant(tenantId: string, data: Partial<Tenant>): Promise<void> {
  try {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Nunca sobrescrever id nem timestamps de criação
    delete (updateData as Raw).id;
    delete (updateData as Raw).created_at;
    delete (updateData as Raw).createdAt;

    await adminDb.collection('tenants').doc(tenantId).update(updateData);

    // Create activity log
    const tenant = await getTenantById(tenantId);
    if (tenant) {
      await createActivityLog({
        type: 'tenant_updated',
        tenant_id: tenantId,
        tenant_name: tenant.name,
        description: `Cliente atualizado`,
      });
    }
  } catch (error) {
    console.error('Error updating tenant:', error);
    throw error;
  }
}

/**
 * Get global stats
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Tenants
    const tenantsSnapshot = await adminDb.collection('tenants').get();
    const totalTenants = tenantsSnapshot.size;
    let activeTenants = 0;
    let newTenantsThisMonth = 0;
    tenantsSnapshot.docs.forEach((doc) => {
      const data = doc.data() as Raw;
      if (data.active === true) activeTenants += 1;
      if (toDate(pick(data, 'createdAt', 'created_at')) >= startOfMonth) newTenantsThisMonth += 1;
    });

    // Bookings — agregações em memória sobre createdAt normalizado (campo varia). Ver /SCHEMA.md.
    const bookingsSnapshot = await adminDb.collection('bookings').get();
    const totalBookings = bookingsSnapshot.size;
    let bookingsToday = 0;
    const tenantBookingCounts = new Map<string, { name: string; count: number }>();
    bookingsSnapshot.docs.forEach((doc) => {
      const data = doc.data() as Raw;
      if (toDate(pick(data, 'createdAt', 'created_at')) >= startOfDay) bookingsToday += 1;

      const tenantId = pick<string>(data, 'tenantId', 'tenant_id') ?? '';
      const tenantName = pick<string>(data, 'tenantName', 'tenant_name') ?? '';
      const current = tenantBookingCounts.get(tenantId);
      tenantBookingCounts.set(tenantId, {
        name: tenantName || current?.name || '',
        count: (current?.count ?? 0) + 1,
      });
    });

    const growth = { tenants: 0, bookings: 0 };

    const topTenants = Array.from(tenantBookingCounts.entries())
      .map(([id, data]) => ({ id, name: data.name, bookingsCount: data.count }))
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 10);

    // Serviços ficam na coleção TOP-LEVEL `services` (não em subcoleções). Ver /SCHEMA.md.
    const servicesSnapshot = await adminDb.collection('services').get();
    const totalServices = servicesSnapshot.size;

    return {
      totalTenants: activeTenants,
      totalBookings,
      totalServices,
      bookingsToday,
      newTenantsThisMonth,
      growth,
      topTenants,
    };
  } catch (error) {
    console.error('Error getting global stats:', error);
    throw error;
  }
}

/**
 * Check if subdomain is available
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  try {
    const tenantsSnapshot = await adminDb
      .collection('tenants')
      .where('subdomain', '==', subdomain)
      .get();

    return tenantsSnapshot.empty;
  } catch (error) {
    console.error('Error checking subdomain:', error);
    throw error;
  }
}
