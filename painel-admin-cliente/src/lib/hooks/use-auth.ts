'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getTenantByOwnerId } from '@/lib/firebase/firestore';
import type { Tenant } from '@/types/tenant';

interface UseAuthReturn {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);
        setError(null);

        if (firebaseUser) {
          try {
            const tenantData = await getTenantByOwnerId(firebaseUser.uid);
            setTenant(tenantData);
          } catch (err) {
            console.error('Error fetching tenant:', err);
            setError('Erro ao carregar dados do tenant');
          }
        } else {
          setTenant(null);
        }

        setLoading(false);
      },
      (err) => {
        console.error('Auth error:', err);
        setError('Erro de autenticação');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { user, tenant, loading, error };
};
