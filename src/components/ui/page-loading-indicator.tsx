'use client';

import { Loader2 } from 'lucide-react';
import { usePageLoading } from '@/contexts/page-loading.context';

export function PageLoadingIndicator() {
  const { isLoading } = usePageLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-3 text-sm font-medium text-muted-foreground">Loading data...</p>
    </div>
  );
}
