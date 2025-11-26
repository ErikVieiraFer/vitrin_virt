import { Timestamp } from 'firebase/firestore';

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  duration: number; // em minutos
  price: number;
  image_url?: string;
  active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
