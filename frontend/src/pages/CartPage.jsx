import { ChevronRight, ShoppingBag, Trash2, Heart, ArrowLeft, Gift, ShieldCheck, Truck, Clock, Sparkles, Minus, Plus, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import React from 'react';

import { usePageTitle } from '../hooks/usePageTitle';
import { useCartStore } from '../store/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import { getProductImage } from '../utils/media';

// ─── Données ──────────────────────────────────────────────────────
const REASSURANCE = [
  { icon: ShieldCheck, text: 'Paiement 100% sécurisé' },
  { icon: Truck, text: 'Livraison partout au Togo' },
  { icon: Clock, text: 'Expédition sous 48h' },
  { icon: Gift, text: 'Emballage cadeau offert' },
];

// ─── Sous-composants ──────────────────────────────────────────────
function QuantitySelector({ value, onChange, min = 1, max = 99 }) {
  const inputRef = React.useRef(null);
  const [localValue, setLocalValue] = React.useState(String(value));

  React.useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const apply = (next) => {
    const num = Number(next);
    if (!Number.isFinite(num)) return;
    const clamped = Math.max(min, Math.min(max, Math.round(num)));
    onChange(clamped);
  };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setLocalValue(raw);
  };

  const handleBlur = () => {
    if (localValue === '' || Number(localValue) < min) {
      apply(min);
    } else {
      apply(localValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className="inline-flex items-center rounded-xl border-2 border-[#E0DBD5] bg-white p-0.5 shadow-sm transition-all hover:border-accent/40 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
      <button
        type="button"
        onClick={() => apply(Number(localValue || value) - 1)}
        disabled={Number(localValue || value) <= min}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-primary/60 transition hover:bg-accent/10 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Diminuer la quantité"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-12 bg-transparent text-center text-sm font-bold text-primary outline-none"
        aria-label="Quantité"
      />
      <button
        type="button"
        onClick={() => apply(Number(localValue || value) + 1)}
        disabled={Number(localValue || value) >= max}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-primary/60 transition hover:bg-accent/10 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Augmenter la quantité"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────
export default function CartPage() {
  usePageTitle('Panier — WORLD DESIGN');

  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = getTotal();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const [showClearConfirm, setShowClearConfirm] = React.useState(false);

  // ─── Panier vide ──────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[80svh] bg-cream flex items-center">
        <section className="mx-auto w-full max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
          {/* Icône décorative */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg shadow-black/5 ring-1 ring-black/5">
            <ShoppingBag className="h-10 w-10 text-accent/40" />
          </div>

          <h1 className="mt-8 text-3xl font-extrabold text-primary sm:text-4xl lg:text-5xl">
            Votre panier est vide
          </h1>
          <p className="mx-auto mt-4 max-w-md text-primary/55 leading-relaxed">
            Vous n'avez pas encore ajouté de produit. Parcourez notre catalogue et trouvez votre bonheur.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-bold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98]"
            >
              <ShoppingBag className="h-4 w-4" />
              Découvrir le catalogue
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#E0DBD5] px-7 py-4 text-sm font-semibold text-primary/60 transition hover:border-accent hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Réassurance */}
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {REASSURANCE.map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                <Icon className="h-5 w-5 text-accent/50" />
                <p className="text-xs font-medium text-primary/50">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ─── Panier rempli ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream">
      {/* Barre supérieure sticky */}
      <div className="border-b border-[#E0DBD5] bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/products"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary/60 transition hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Continuer mes achats
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary/50">
              {itemCount} article{itemCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs font-semibold text-accent/60 transition hover:text-accent"
            >
              Vider le panier
            </button>
          </div>
        </div>
      </div>

      {/* Modal confirmation vider panier */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-fadeInUp">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">Vider le panier ?</h3>
                <p className="mt-1 text-sm text-primary/55">
                  Tous les articles seront supprimés. Cette action est irréversible.
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-full border-2 border-[#E0DBD5] py-3 text-sm font-semibold text-primary/60 transition hover:border-accent hover:text-accent"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="flex-1 rounded-full bg-red-500 py-3 text-sm font-bold text-white transition hover:bg-red-600 active:scale-[0.98]"
              >
                Tout supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* En-tête */}
        <div className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
            <ShoppingBag className="h-3 w-3" />
            Panier
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-primary sm:text-4xl lg:text-5xl">
            Votre sélection
          </h1>
          <p className="mt-3 max-w-lg text-primary/55">
            Vérifiez vos articles, ajustez les quantités, puis passez commande.
          </p>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Liste des articles */}
          <div className="space-y-4">
            {items.map((item) => {
              const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
              const image = item.imageUrl || getProductImage(item);

              return (
                <article
                  key={item.key}
                  className="group relative flex flex-col gap-5 rounded-2xl border border-[#E0DBD5] bg-white p-5 shadow-sm transition-all duration-300 hover:border-accent/20 hover:shadow-md sm:flex-row sm:items-start"
                >
                  {/* Image produit */}
                  <Link
                    to={`/products/${item.productSlug}`}
                    className="relative block h-28 w-28 flex-none overflow-hidden rounded-xl border border-[#E0DBD5] bg-[#F1ECE6] transition-shadow group-hover:shadow-md"
                  >
                    <img
                      src={image}
                      alt={item.productName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>

                  {/* Infos produit */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/products/${item.productSlug}`}
                        className="text-lg font-bold text-primary transition hover:text-accent"
                      >
                        {item.productName}
                      </Link>
                      {(item.customText || item.customFileName) && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">
                          <Sparkles className="h-3 w-3" />
                          Personnalisé
                        </span>
                      )}
                    </div>

                    {/* Détails personnalisation */}
                    <p className="mt-3 text-sm text-primary/45">
                      Prix unitaire : <span className="font-semibold text-price">{formatCurrency(item.price)}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(nextQuantity) => updateQuantity(item.key, nextQuantity)}
                      min={1}
                      max={99}
                    />
                    <div className="flex items-center gap-5">
                      <p className="text-lg font-extrabold text-primary">
                        <span className="text-price">{formatCurrency(lineTotal)}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-red-100 text-red-400 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-500 active:scale-90"
                        aria-label={`Supprimer ${item.productName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Résumé */}
          <div className="lg:sticky lg:top-20 lg:self-start space-y-5">
            <div className="rounded-2xl border border-[#E0DBD5] bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-xl font-bold text-primary">Récapitulatif</h2>

              <div className="mt-5 space-y-3">
                {items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                        {item.quantity}
                      </span>
                      <span className="truncate text-primary/70">{item.productName}</span>
                    </div>
                    <span className="shrink-0 font-semibold text-price">
                      {formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-[#E0DBD5] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary/60">Sous-total</span>
                  <span className="text-sm font-semibold text-price">{formatCurrency(total)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary/60">Livraison</span>
                  <span className="text-sm font-medium text-green-600">Calculée à l'étape suivante</span>
                </div>
              </div>

              <div className="mt-4 border-t border-[#E0DBD5] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-primary">Total</span>
                  <span className="text-2xl font-extrabold text-price">{formatCurrency(total)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-bold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98]"
              >
                <ShoppingBag className="h-4 w-4" />
                Passer la commande
                <ChevronRight className="h-4 w-4" />
              </Link>

              <Link
                to="/products"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#E0DBD5] bg-white px-6 py-3 text-sm font-semibold text-primary/60 transition hover:border-accent hover:text-accent"
              >
                Continuer mes achats
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            {/* Réassurance */}
            <div className="rounded-2xl border border-[#E0DBD5] bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3 className="text-sm font-bold text-primary/60 uppercase tracking-wider">
                Paiement sécurisé
              </h3>
              <div className="mt-4 space-y-3">
                {REASSURANCE.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50">
                      <Icon className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-sm font-medium text-primary/70">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code promo */}
            <div className="rounded-2xl border border-dashed border-[#E0DBD5] bg-white/50 p-5">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-accent/40" />
                <span className="text-sm font-medium text-primary/40">
                  Code promo disponible à l'étape suivante
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-16 border-t border-[#E0DBD5] pt-12">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-accent/40" />
            <p className="text-lg font-bold text-primary/30">Vous pourriez aussi aimer...</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/60" />
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out both;
        }
      `}</style>
    </div>
  );
}
