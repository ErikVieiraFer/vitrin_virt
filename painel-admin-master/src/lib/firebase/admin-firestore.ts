import { adminDb } from './admin-config';
import admin from './admin-config';
import { Tenant, TenantStats } from '@/types/tenant';
import { Booking, BookingFilters } from '@/types/booking';
import { ActivityLog, ActivityLogFilters } from '@/types/activity-log';
import { GlobalStats } from '@/types/stats';

/**
 * Get all tenants
 */
export async function getAllTenants(): Promise<Tenant[]> {
  try {
    const tenantsSnapshot = await adminDb.collection('tenants').orderBy('created_at', 'desc').get();

    return tenantsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Tenant[];
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
    // Get services count
    const servicesSnapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('services')
      .get();

    const activeServices = servicesSnapshot.docs.filter(doc => doc.data().active).length;

    // Get bookings count
    const bookingsSnapshot = await adminDb
      .collection('bookings')
      .where('tenant_id', '==', tenantId)
      .get();

    const totalBookings = bookingsSnapshot.size;

    // Get bookings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const bookingsThisMonthSnapshot = await adminDb
      .collection('bookings')
      .where('tenant_id', '==', tenantId)
      .where('created_at', '>=', admin.firestore.Timestamp.fromDate(startOfMonth))
      .get();

    // Get last booking date
    const lastBookingSnapshot = await adminDb
      .collection('bookings')
      .where('tenant_id', '==', tenantId)
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();

    const lastBookingDate = lastBookingSnapshot.docs.length > 0
      ? lastBookingSnapshot.docs[0].data().created_at
      : undefined;

    return {
      total_services: servicesSnapshot.size,
      active_services: activeServices,
      total_bookings: totalBookings,
      bookings_this_month: bookingsThisMonthSnapshot.size,
      last_booking_date: lastBookingDate,
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
  theme: {
    primary_color: string;
    secondary_color: string;
    font: string;
  };
}): Promise<string> {
  try {
    const tenantRef = await adminDb.collection('tenants').add({
      ...data,
      active: true,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
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
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Remove id and created_at from update
    delete (updateData as any).id;
    delete (updateData as any).created_at;

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
    // Get total tenants
    const tenantsSnapshot = await adminDb.collection('tenants').get();
    const totalTenants = tenantsSnapshot.size;
    const activeTenants = tenantsSnapshot.docs.filter(doc => doc.data().active).length;

    // Get total bookings
    const bookingsSnapshot = await adminDb.collection('bookings').get();
    const totalBookings = bookingsSnapshot.size;

    // Get bookings today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const bookingsTodaySnapshot = await adminDb
      .collection('bookings')
      .where('created_at', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
      .get();

    const bookingsToday = bookingsTodaySnapshot.size;

    // Get new tenants this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newTenantsSnapshot = await adminDb
      .collection('tenants')
      .where('created_at', '>=', admin.firestore.Timestamp.fromDate(startOfMonth))
      .get();

    const newTenantsThisMonth = newTenantsSnapshot.size;

    // Calculate growth (simplified - would need previous month data)
    const growth = {
      tenants: 0,
      bookings: 0,
    };

    // Get top tenants by bookings
    const tenantBookingCounts = new Map<string, { name: string; count: number }>();

    bookingsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const tenantId = data.tenant_id;
      const tenantName = data.tenant_name;

      if (tenantBookingCounts.has(tenantId)) {
        const current = tenantBookingCounts.get(tenantId)!;
        tenantBookingCounts.set(tenantId, { name: tenantName, count: current.count + 1 });
      } else {
        tenantBookingCounts.set(tenantId, { name: tenantName, count: 1 });
      }
    });

    const topTenants = Array.from(tenantBookingCounts.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        bookingsCount: data.count,
      }))
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 10);

    // Count total services
    let totalServices = 0;
    for (const tenantDoc of tenantsSnapshot.docs) {
      const servicesSnapshot = await adminDb
        .collection('tenants')
        .doc(tenantDoc.id)
        .collection('services')
        .get();
      totalServices += servicesSnapshot.size;
    }

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
