import { X } from 'lucide-react';

import { useToastStore } from '../store/toastStore';

const TYPE_STYLES = {
  success: 'border-[#D1FAE5] bg-[#D1FAE5] text-[#065F46]',
  error: 'border-[#FEE2E2] bg-[#FEE2E2] text-[#991B1B]',
};

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={[
            'pointer-events-auto flex w-full max-w-sm items-start justify-between gap-3 rounded-[8px] border px-4 py-3 text-sm font-medium shadow-lg sm:w-auto',
            TYPE_STYLES[toast.type] || TYPE_STYLES.success,
          ].join(' ')}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="rounded-full p-0.5 transition hover:opacity-80"
            aria-label="Fermer la notification"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
