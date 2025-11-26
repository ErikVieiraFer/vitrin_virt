export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  imageUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceData {
  tenantId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  imageUrl?: string;
  active?: boolean;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  imageUrl?: string;
  active?: boolean;
}
