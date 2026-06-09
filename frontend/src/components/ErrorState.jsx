import { RotateCcw } from 'lucide-react';

export function ErrorState({ title = 'Une erreur est survenue', description, onRetry }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[8px] border border-[#FEE2E2] bg-white px-4 py-4">
      <h3 className="text-base font-semibold text-[#991B1B]">{title}</h3>
      {description ? (
        <p className="text-sm leading-6 text-[#991B1B]">{description}</p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Réessayer
        </button>
      ) : null}
    </div>
  );
}
