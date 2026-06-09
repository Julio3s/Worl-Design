import { Skeleton } from '../Skeleton';

export function OrderListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4" aria-label="Chargement des commandes" role="status">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-[8px] border border-[#E0DBD5] bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
