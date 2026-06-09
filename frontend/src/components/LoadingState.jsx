export function LoadingState({ label = 'Chargement' }) {
  return (
    <div className="grid min-h-[240px] place-items-center rounded-[8px] border border-dashed border-[#E0DBD5] bg-white/70 px-4 text-text-muted">
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
