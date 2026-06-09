export function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={['animate-pulse rounded-[8px] bg-[#E0DBD5]', className].filter(Boolean).join(' ')}
    />
  );
}
