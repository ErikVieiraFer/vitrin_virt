export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface Booking {
  id: string;
  tenantId: string;
  serviceId: string;
  serviceName: string;
  customer: Customer;
  date: Date;
  time: string; // HH:mm format
  duration: number; // in minutes
  price: number;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingFilters {
  date?: Date;
  status?: BookingStatus;
}
