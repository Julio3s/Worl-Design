import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { createOrder, formatOrderError } from '../api/orders';
import { getProductBySlug } from '../api/catalog';
import { formatPaymentError, initiatePayment } from '../api/payments';
import { CartSummary } from '../components/CartSummary';
import { ErrorState } from '../components/ErrorState';
import { SectionHeading } from '../components/SectionHeading';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { PhoneInput } from '../components/PhoneInput';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { validateCustomFile } from '../utils/customFileValidation';

const LAST_ORDER_STORAGE_KEY = 'world-design-last-order-id';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  delivery_address: '',
  note: '',
};

function buildCustomerName(user) {
  if (!user) {
    return '';
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return fullName || user.username || '';
}

export default function CheckoutPage() {
  usePageTitle('Checkout');

  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const getCustomFile = useCartStore((state) => state.getCustomFile);
  const setCustomFile = useCartStore((state) => state.setCustomFile);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [fileErrors, setFileErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  const total = getTotal();

  useEffect(() => {
    let isMounted = true;
    const slugsToLoad = [...new Set(items.map((item) => item.productSlug).filter(Boolean))];

    if (slugsToLoad.length === 0) {
      setProducts({});
      setLoadingProducts(false);
      return () => {
        isMounted = false;
      };
    }

    setLoadingProducts(true);
    Promise.all(slugsToLoad.map((slug) => getProductBySlug(slug).catch(() => null)))
      .then((results) => {
        if (!isMounted) {
          return;
        }

        const nextProducts = {};
        results.forEach((product, index) => {
          if (product) {
            nextProducts[slugsToLoad[index]] = product;
          }
        });
        setProducts(nextProducts);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingProducts(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [items]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    setForm((current) => ({
      ...current,
      name: current.name || buildCustomerName(user),
      email: current.email || user.email || '',
      phone: current.phone || user.phone || '',
      delivery_address: current.delivery_address || user.address || '',
    }));
  }, [isAuthenticated, user]);

  const missingFiles = items.filter((item) => item.customFileName && !getCustomFile(item.key));

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleMissingFileChange = (item) => (event) => {
    const file = event.target.files?.[0] || null;
    const validationError = validateCustomFile(file);

    if (validationError) {
      setCustomFile(item.key, null);
      setFileErrors((current) => ({ ...current, [item.key]: validationError }));
      event.target.value = '';
      return;
    }

    setCustomFile(item.key, file);
    setFileErrors((current) => {
      const next = { ...current };
      delete next[item.key];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (missingFiles.length > 0) {
      setError('Merci de recharger les fichiers personnalises avant le paiement.');
      return;
    }

    setSubmitting(true);

    try {
      const customFiles = {};
      items.forEach((item) => {
        const file = getCustomFile(item.key);
        if (file) {
          customFiles[item.key] = file;
        }
      });

      const order = await createOrder({
        customer: form,
        items,
        customFiles,
      });

      try {
        const payment = await initiatePayment(order.id, order.payment_token);

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, String(order.id));
          window.location.assign(payment.payment_url);
          return;
        }
      } catch (paymentError) {
        setError(formatPaymentError(paymentError));
      }
    } catch (orderError) {
      setError(formatOrderError(orderError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-cream">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Checkout"
          title="Passer commande"
          description="Commandez sans compte ou profitez de vos informations enregistrées si vous êtes connecté."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-[8px] border border-[#E0DBD5] bg-white p-4 sm:p-5">
            <h2 className="font-display text-xl font-bold text-primary">Informations client</h2>

            <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
              <span>Nom complet</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={handleChange('name')}
                className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
                placeholder="Nom et prénom"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
              <span>Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={handleChange('email')}
                className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
                placeholder="email@exemple.com"
              />
            </label>

            <PhoneInput
              value={form.phone}
              onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
              required
              placeholder="+228 97 08 54 24"
            />

            <AddressAutocomplete
              value={form.delivery_address}
              onChange={(address) => setForm((current) => ({ ...current, delivery_address: address }))}
              placeholder="Entrez votre adresse de livraison..."
            />

            <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
              <span>Note (optionnel)</span>
              <textarea
                value={form.note}
                onChange={handleChange('note')}
                className="min-h-24 rounded-[8px] border border-[#E0DBD5] bg-white px-3 py-3 text-sm outline-none transition focus:border-accent"
                placeholder="Instructions de livraison ou remarques"
              />
            </label>

            {loadingProducts ? (
              <div className="rounded-[8px] border border-[#E0DBD5] bg-[#F8F5F0] px-4 py-4 text-sm text-text-muted">
                Vérification des produits personnalisables...
              </div>
            ) : missingFiles.length > 0 ? (
              <div className="space-y-3 rounded-[8px] border border-[#FEF3C7] bg-[#FEF3C7]/40 px-4 py-4">
                <p className="text-sm font-semibold text-[#92400E]">
                  Fichiers personnalisés à recharger
                </p>
                <p className="text-sm text-text-muted">
                  Les fichiers logo ne sont pas conservés après rechargement de page. Merci de les
                  ajouter à nouveau avant le paiement.
                </p>
                {missingFiles.map((item) => (
                  <label key={item.key} className="flex flex-col gap-2 text-sm font-medium text-text-dark">
                    <span>{item.productName}</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.ai,.svg"
                      onChange={handleMissingFileChange(item)}
                      className="rounded-[8px] border border-[#E0DBD5] bg-white px-3 py-2 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                    />
                    {fileErrors[item.key] ? (
                      <span className="text-xs font-medium text-[#991B1B]">{fileErrors[item.key]}</span>
                    ) : null}
                  </label>
                ))}
              </div>
            ) : null}

            {error ? <ErrorState description={error} /> : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting || loadingProducts || missingFiles.length > 0}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-accent px-5 py-3 text-base font-semibold text-white transition hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Redirection vers le paiement...' : 'Payer par carte ou mobile money'}
              </button>
              <Link
                to="/cart"
                className="inline-flex items-center justify-center rounded-full border border-[#E0DBD5] bg-white px-5 py-3 text-sm font-semibold text-text-dark transition hover:border-accent hover:text-accent"
              >
                Retour au panier
              </Link>
            </div>
          </form>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <CartSummary items={items} total={total} readonly />
          </div>
        </div>
      </section>
    </div>
  );
}
