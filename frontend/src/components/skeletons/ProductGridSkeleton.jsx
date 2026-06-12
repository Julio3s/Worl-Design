import { Skeleton } from '../Skeleton';

function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      <Skeleton className="h-[200px] w-full rounded-none sm:h-[220px] lg:h-[240px]" />
      <div className="flex flex-col gap-1.5 p-3 sm:p-3.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6, columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' }) {
  return (
    <div className={`grid gap-4 ${columns}`} aria-label="Chargement des produits" role="status">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}