'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Dataset } from '@/lib/types';

interface DataCtx {
  data: Dataset | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateDoc: (id: string, patch: Record<string, unknown>, updatedBy?: string) => Promise<void>;
}

const Ctx = createContext<DataCtx>({
  data: null, loading: true, error: null,
  refresh: async () => {}, updateDoc: async () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/refresh', { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDoc = useCallback(async (id: string, patch: Record<string, unknown>, updatedBy?: string) => {
    const res = await fetch('/api/record', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updatedBy, ...patch }),
    });
    if (!res.ok) throw new Error(await res.text());
    setData(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const value = useMemo(() => ({ data, loading, error, refresh, updateDoc }), [data, loading, error, refresh, updateDoc]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useData = () => useContext(Ctx);
