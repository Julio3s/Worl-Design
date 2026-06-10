import { Link } from 'react-router-dom';

import { formatCurrency } from '../utils/formatCurrency';
import { getProductImage } from '../utils/media';

export function CartSummary({
  items,
  total,
  readonly = false,
  actionLabel,
  actionTo,
  onAction,
  actionDisabled = false,
  actionLoading = false,
}) {
  return (
    <div className="rounded-[8px] border border-[#E0DBD5] bg-white p-4 sm:p-5">
      <h2 className="font-display text-xl font-bold text-primary">Récapitulatif</h2>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.key} className="flex items-start gap-3 border-b border-[#F1ECE6] pb-3 last:border-0 last:pb-0">
            <div className="h-14 w-14 flex-none overflow-hidden rounded-[8px] border border-[#E0DBD5] bg-[#F1ECE6]">
              <img
                src={item.imageUrl || getProductImage(item)}
                alt={item.productName}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-dark">{item.productName}</p>
              {item.customText ? (
                <p className="mt-1 text-xs text-text-muted">Texte: {item.customText}</p>
              ) : null}
              {item.customFileName ? (
                <p className="mt-1 text-xs text-text-muted">Fichier: {item.customFileName}</p>
              ) : null}
              <p className="mt-1 text-xs text-text-muted">
                {item.quantity} x <span className="text-price">{formatCurrency(item.price)}</span>
              </p>
            </div>
            <p className="text-sm font-semibold text-price">
              {formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-[#E0DBD5] pt-4">
        <span className="text-sm font-medium text-text-muted">Total</span>
        <span className="text-2xl font-bold text-price">{formatCurrency(total)}</span>
      </div>

      {!readonly && actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      ) : null}

      {!readonly && actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          disabled={actionDisabled || actionLoading}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-base font-semibold text-white transition hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {actionLoading ? 'Traitement...' : actionLabel}
        </button>
      ) : null}
    </div>
  );
}
