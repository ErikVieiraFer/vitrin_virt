import { Timestamp } from 'firebase/firestore';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  tenant_id: string;
  tenant_name: string;
  service_id: string;
  service_name: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  date: Timestamp;
  time: string;
  status: BookingStatus;
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface BookingFilters {
  tenant_id?: string;
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}
