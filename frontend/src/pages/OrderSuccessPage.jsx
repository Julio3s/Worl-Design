import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { SectionHeading } from '../components/SectionHeading';
import { usePageTitle } from '../hooks/usePageTitle';
import { useCartStore } from '../store/cartStore';

const LAST_ORDER_STORAGE_KEY = 'world-design-last-order-id';

export default function OrderSuccessPage() {
  usePageTitle('Commande confirmée');

  const clearCart = useCartStore((state) => state.clearCart);
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    clearCart();

    const queryOrderId = searchParams.get('order_id') || searchParams.get('orderId');
    const storedOrderId =
      typeof window !== 'undefined' ? window.sessionStorage.getItem(LAST_ORDER_STORAGE_KEY) : null;

    setOrderId(queryOrderId || storedOrderId || '');

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(LAST_ORDER_STORAGE_KEY);
    }
  }, [clearCart, searchParams]);

  return (
    <div className="bg-cream">
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[8px] border border-[#D1FAE5] bg-white px-6 py-10 text-center shadow-[0_10px_30px_rgba(26,26,46,0.06)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FAE5] text-[#065F46]">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>

          <SectionHeading
            align="center"
            eyebrow="Confirmation"
            title="Commande enregistrée"
            description="Votre commande a bien été créée. Le paiement par carte ou mobile money confirmera définitivement votre achat."
          />

          {orderId ? (
            <p className="mt-6 text-sm font-medium text-[#065F46]">
              Numéro de commande: <span className="font-bold">#{orderId}</span>
            </p>
          ) : (
            <p className="mt-6 text-sm font-medium text-[#065F46]">
              Votre panier a été vidé. Retrouvez votre commande via votre email et téléphone si vous
              avez commandé en invité.
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98]"
            >
              Retour à la boutique
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#E0DBD5] bg-white px-5 py-3 text-sm font-semibold text-text-dark transition hover:border-accent hover:text-accent"
            >
              Accueil
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
