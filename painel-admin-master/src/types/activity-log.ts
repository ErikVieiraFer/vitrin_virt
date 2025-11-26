import { Timestamp } from 'firebase/firestore';

export type ActivityType =
  | 'tenant_created'
  | 'tenant_updated'
  | 'tenant_deactivated'
  | 'tenant_activated'
  | 'service_created'
  | 'service_updated'
  | 'service_deleted'
  | 'booking_created'
  | 'booking_updated'
  | 'booking_cancelled'
  | 'theme_updated'
  | 'admin_impersonate';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  tenant_id?: string;
  tenant_name?: string;
  description: string;
  metadata?: {
    [key: string]: any;
  };
  created_at: Timestamp;
}

export interface ActivityLogFilters {
  type?: ActivityType;
  tenant_id?: string;
  startDate?: Date;
  endDate?: Date;
}
