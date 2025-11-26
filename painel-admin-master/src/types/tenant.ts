import { Timestamp } from 'firebase/firestore';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  whatsapp: string;
  logo_url?: string;
  active: boolean;
  theme: {
    primary_color: string;
    secondary_color: string;
    font: string;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface TenantStats {
  total_services: number;
  active_services: number;
  total_bookings: number;
  bookings_this_month: number;
  last_booking_date?: Timestamp;
}

export interface TenantWithStats extends Tenant {
  stats?: TenantStats;
}
