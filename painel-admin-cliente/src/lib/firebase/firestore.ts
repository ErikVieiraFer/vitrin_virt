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
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import type { Tenant, CreateTenantData, UpdateTenantData } from '@/types/tenant';
import type { Service, CreateServiceData, UpdateServiceData } from '@/types/service';
import type { Availability } from '@/types/availability';
import type { Booking } from '@/types/booking';

// Helper to convert Firestore timestamp to Date
const convertTimestamp = (data: DocumentData): any => {
  const converted: any = { ...data };
  Object.keys(converted).forEach((key) => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  });
  return converted;
};

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
  return {
    id: doc.id,
    ...convertTimestamp(doc.data()),
  } as Tenant;
};

export const getTenantBySubdomain = async (subdomain: string): Promise<Tenant | null> => {
  const q = query(collection(db, 'tenants'), where('subdomain', '==', subdomain));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...convertTimestamp(doc.data()),
  } as Tenant;
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

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data()),
  })) as Service[];
};

export const getServiceById = async (id: string): Promise<Service | null> => {
  const docRef = doc(db, 'services', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...convertTimestamp(docSnap.data()),
  } as Service;
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
  return {
    id: doc.id,
    ...convertTimestamp(doc.data()),
  } as Availability;
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
export const getBookingsByTenantId = async (
  tenantId: string,
  filters?: { date?: Date; status?: string }
): Promise<Booking[]> => {
  const constraints: QueryConstraint[] = [
    where('tenantId', '==', tenantId),
    orderBy('date', 'desc'),
  ];

  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }

  const q = query(collection(db, 'bookings'), ...constraints);
  const querySnapshot = await getDocs(q);

  let bookings = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data()),
  })) as Booking[];

  // Filter by date on client side (Firestore doesn't support complex date queries easily)
  if (filters?.date) {
    const filterDate = filters.date.toDateString();
    bookings = bookings.filter((booking) => {
      return booking.date.toDateString() === filterDate;
    });
  }

  return bookings;
};
