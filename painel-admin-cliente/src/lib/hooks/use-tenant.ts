'use client';

import { useState, useEffect } from 'react';
import { getTenantByOwnerId } from '@/lib/firebase/firestore';
import type { Tenant } from '@/types/tenant';

interface UseTenantReturn {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTenant = (ownerUid: string | null): UseTenantReturn => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = async () => {
    if (!ownerUid) {
      setTenant(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const tenantData = await getTenantByOwnerId(ownerUid);
      setTenant(tenantData);
    } catch (err) {
      console.error('Error fetching tenant:', err);
      setError('Erro ao carregar dados do tenant');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [ownerUid]);

  return { tenant, loading, error, refetch: fetchTenant };
};
