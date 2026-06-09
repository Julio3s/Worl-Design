import { Skeleton } from '../Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Chargement du tableau de bord" role="status">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-[8px] border border-[#E0DBD5] bg-white p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-28" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-72 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-52" />
        <div className="overflow-hidden rounded-[8px] border border-[#E0DBD5] bg-white">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-4 border-b border-[#F1ECE6] px-4 py-3 last:border-0">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
