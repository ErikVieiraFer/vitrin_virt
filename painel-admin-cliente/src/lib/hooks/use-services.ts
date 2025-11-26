'use client';

import { useState, useEffect } from 'react';
import { getServicesByTenantId } from '@/lib/firebase/firestore';
import type { Service } from '@/types/service';

interface UseServicesReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useServices = (tenantId: string | null): UseServicesReturn => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    if (!tenantId) {
      setServices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const servicesData = await getServicesByTenantId(tenantId);
      setServices(servicesData);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [tenantId]);

  return { services, loading, error, refetch: fetchServices };
};
