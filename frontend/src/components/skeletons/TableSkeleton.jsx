import { Skeleton } from '../Skeleton';

export function TableSkeleton({ rows = 6, columns = 5 }) {
  return (
    <div
      className="overflow-hidden rounded-[8px] border border-[#E0DBD5] bg-white"
      aria-label="Chargement du tableau"
      role="status"
    >
      <div className="border-b border-[#E0DBD5] bg-[#F8F5F0] px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b border-[#F1ECE6] px-4 py-3 last:border-0"
        >
          {Array.from({ length: columns }).map((__, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
