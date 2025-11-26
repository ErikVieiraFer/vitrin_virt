'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Tenant } from '@/types/tenant';

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const tenantsQuery = query(
      collection(db, 'tenants'),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(
      tenantsQuery,
      (snapshot) => {
        const tenantsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Tenant[];

        setTenants(tenantsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching tenants:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { tenants, loading, error };
}
