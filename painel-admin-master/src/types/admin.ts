import { Timestamp } from 'firebase/firestore';

export interface Admin {
  email: string;
  name: string;
  created_at: Timestamp;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  name: string | null;
  isAdmin: boolean;
}
