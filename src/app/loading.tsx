import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
      <div className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border/60 bg-background/95 md:flex">
        <div className="flex h-16 items-center border-b border-border/60 px-6">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 space-y-2 px-3 py-4">
          <div className="mb-4 px-3 py-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 px-6 backdrop-blur">
          <Skeleton className="h-5 w-48" />
          <div className="flex-1" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </header>

        <main className="flex-1">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
            <div className="space-y-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </main>
      </div>
    </div>
  );
}
