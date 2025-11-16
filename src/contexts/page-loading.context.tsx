'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface PageLoadingContextValue {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  resetLoading: () => void;
}

const PageLoadingContext = createContext<PageLoadingContextValue | undefined>(undefined);

export function PageLoadingProvider({ children }: { children: ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);

  const startLoading = useCallback(() => {
    setPendingCount((prev) => prev + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setPendingCount((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const resetLoading = useCallback(() => {
    setPendingCount(0);
  }, []);

  const value = useMemo<PageLoadingContextValue>(() => ({
    isLoading: pendingCount > 0,
    startLoading,
    stopLoading,
    resetLoading,
  }), [pendingCount, startLoading, stopLoading, resetLoading]);

  return (
    <PageLoadingContext.Provider value={value}>
      {children}
    </PageLoadingContext.Provider>
  );
}

export function usePageLoading() {
  const context = useContext(PageLoadingContext);
  if (!context) {
    throw new Error('usePageLoading must be used within a PageLoadingProvider');
  }
  return context;
}
