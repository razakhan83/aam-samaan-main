import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 pb-2 pt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-10 rounded-md" />
          <Skeleton className="h-4 w-4 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-4 rounded-md" />
          <Skeleton className="h-4 w-36 rounded-md" />
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 pb-20 pt-4 md:py-8">
        <div className="flex flex-col gap-6 md:flex-row md:gap-10 lg:gap-14">
          <div className="w-full md:w-[55%] lg:w-[58%]">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square w-20 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="w-full md:w-[45%] lg:w-[42%]">
            <div className="flex flex-col gap-5 md:sticky md:top-28">
              <Skeleton className="h-7 w-32 rounded-lg" />
              <div className="flex flex-wrap items-start gap-3">
                <Skeleton className="h-10 w-3/4 rounded-lg" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <Skeleton className="h-12 w-40 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-18 rounded-md" />
              </div>
              <Skeleton className="h-px w-full rounded-none" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
              </div>
              <Skeleton className="h-px w-full rounded-none" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 mt-12 rounded-2xl border border-border p-6 md:p-8">
          <Skeleton className="mb-4 h-8 w-48 rounded-lg" />
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-muted/35 py-10 md:py-14">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-6 flex max-w-2xl flex-col gap-2 md:mb-8">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
            <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
            <Skeleton className="h-4 w-4/5 max-w-xl rounded-md" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-5 w-4/5 rounded-md" />
                  <Skeleton className="h-6 w-24 rounded-md" />
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-10 w-24 rounded-md" />
                    <Skeleton className="size-10 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
