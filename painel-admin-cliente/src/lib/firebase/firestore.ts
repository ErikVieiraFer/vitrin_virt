import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Tenant, CreateTenantData, UpdateTenantData } from '@/types/tenant';
import type { Service, CreateServiceData, UpdateServiceData } from '@/types/service';
import type { Availability } from '@/types/availability';
import type { Booking } from '@/types/booking';
import {
  mapTenant,
  mapService,
  mapAvailability,
  mapBooking,
} from './mappers';

// TENANT OPERATIONS
export const createTenant = async (data: CreateTenantData): Promise<string> => {
  const tenantData = {
    ...data,
    active: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    themeSettings: data.themeSettings || {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      fontFamily: 'Inter',
    },
  };
  const docRef = await addDoc(collection(db, 'tenants'), tenantData);
  return docRef.id;
};

export const getTenantByOwnerId = async (ownerUid: string): Promise<Tenant | null> => {
  const q = query(collection(db, 'tenants'), where('ownerUid', '==', ownerUid));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return mapTenant(doc.id, doc.data());
};

export const getTenantBySubdomain = async (subdomain: string): Promise<Tenant | null> => {
  const q = query(collection(db, 'tenants'), where('subdomain', '==', subdomain));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return mapTenant(doc.id, doc.data());
};

export const updateTenant = async (id: string, data: UpdateTenantData): Promise<void> => {
  const tenantRef = doc(db, 'tenants', id);
  await updateDoc(tenantRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

// SERVICE OPERATIONS
export const createService = async (data: CreateServiceData): Promise<string> => {
  const serviceData = {
    ...data,
    active: data.active !== undefined ? data.active : true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, 'services'), serviceData);
  return docRef.id;
};

export const getServicesByTenantId = async (tenantId: string): Promise<Service[]> => {
  const q = query(
    collection(db, 'services'),
    where('tenantId', '==', tenantId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => mapService(doc.id, doc.data()));
};

export const getServiceById = async (id: string): Promise<Service | null> => {
  const docRef = doc(db, 'services', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return mapService(docSnap.id, docSnap.data());
};

export const updateService = async (id: string, data: UpdateServiceData): Promise<void> => {
  const serviceRef = doc(db, 'services', id);
  await updateDoc(serviceRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteService = async (id: string): Promise<void> => {
  const serviceRef = doc(db, 'services', id);
  await deleteDoc(serviceRef);
};

// AVAILABILITY OPERATIONS
export const getAvailabilityByTenantId = async (tenantId: string): Promise<Availability | null> => {
  const q = query(collection(db, 'availability'), where('tenantId', '==', tenantId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return mapAvailability(doc.id, doc.data());
};

export const createOrUpdateAvailability = async (
  tenantId: string,
  weekAvailability: any
): Promise<void> => {
  const existing = await getAvailabilityByTenantId(tenantId);

  if (existing) {
    const availabilityRef = doc(db, 'availability', existing.id);
    await updateDoc(availabilityRef, {
      weekAvailability,
      updatedAt: Timestamp.now(),
    });
  } else {
    await addDoc(collection(db, 'availability'), {
      tenantId,
      weekAvailability,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
};

// BOOKING OPERATIONS
//
// Bookings são criados pelo app Flutter. Durante a transição do contrato de schema
// (ver /SCHEMA.md) podem existir docs legados com `tenant_id` (snake) e docs canônicos
// com `tenantId` (camel). Consultamos os dois campos e mesclamos, ordenando em memória —
// assim a tela funciona antes e depois da migração rodar.
export const getBookingsByTenantId = async (
  tenantId: string,
  filters?: { date?: Date; status?: string }
): Promise<Booking[]> => {
  const bookingsRef = collection(db, 'bookings');
  const [camelSnap, snakeSnap] = await Promise.all([
    getDocs(query(bookingsRef, where('tenantId', '==', tenantId))),
    getDocs(query(bookingsRef, where('tenant_id', '==', tenantId))),
  ]);

  // Mescla por id (um doc pode aparecer só em uma das queries).
  const byId = new Map<string, Booking>();
  for (const snap of [camelSnap, snakeSnap]) {
    snap.docs.forEach((doc) => {
      if (!byId.has(doc.id)) byId.set(doc.id, mapBooking(doc.id, doc.data()));
    });
  }

  let bookings = Array.from(byId.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  if (filters?.status) {
    bookings = bookings.filter((b) => b.status === filters.status);
  }

  if (filters?.date) {
    const filterDate = filters.date.toDateString();
    bookings = bookings.filter((b) => b.date.toDateString() === filterDate);
  }

  return bookings;
};
