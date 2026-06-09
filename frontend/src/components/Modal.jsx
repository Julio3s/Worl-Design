import { X } from 'lucide-react';

export function Modal({ open, title, children, footer, onClose, size = 'md' }) {
  if (!open) {
    return null;
  }

  const sizeClass = size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Fermer la fenêtre"
        onClick={onClose}
      />
      <div
        className={[
          'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[8px] border border-[#E0DBD5] bg-white shadow-2xl sm:rounded-[8px]',
          sizeClass,
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between border-b border-[#E0DBD5] px-4 py-4 sm:px-5">
          <h2 id="modal-title" className="font-display text-xl font-bold text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E0DBD5] text-text-muted transition hover:border-accent hover:text-accent"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 sm:px-5">{children}</div>

        {footer ? (
          <div className="border-t border-[#E0DBD5] bg-[#F8F5F0] px-4 py-4 sm:px-5">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
