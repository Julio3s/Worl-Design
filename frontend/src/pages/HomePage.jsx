import { useEffect, useState, useCallback } from 'react';
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  Star,
  Eye,
  ChevronRight,
  ArrowUpRight,
  Quote,
  Pencil,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/skeletons/ProductGridSkeleton';
import { usePageTitle } from '../hooks/usePageTitle';
import { getFeaturedProducts, getCategories } from '../api/catalog';
import { getCategoryImage } from '../utils/media';

// ─── Images ───────────────────────────────────────────────────────
const HERO_IMAGE = '/images/hero-products-personalized.jpg';

const STEPS = [
  {
    num: '01',
    icon: Eye,
    title: 'Choisissez votre produit',
    desc: 'Parcourez notre catalogue et trouvez le goodie parfait.',
  },
  {
    num: '02',
    icon: Pencil,
    title: 'Ajoutez votre texte ou logo',
    desc: 'Personnalisez en ligne, sans compétence graphique.',
  },
  {
    num: '03',
    icon: CheckCircle2,
    title: 'Validez votre commande',
    desc: 'Payez en Mobile Money ou par carte. Simple et rapide.',
  },
  {
    num: '04',
    icon: Truck,
    title: 'Recevez votre produit',
    desc: 'Livraison partout au Togo. Suivi transparent.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Aminata K.',
    role: 'Responsable communication',
    avatar: 'AK',
    text: "Qualité irréprochable et délais respectés. Nos calendriers ont fait l'unanimité.",
    note: 5,
  },
  {
    name: 'Jean-Marc T.',
    role: 'Entrepreneur',
    avatar: 'JT',
    text: "Commande simple, paiement facile. Je recommande les yeux fermés.",
    note: 5,
  },
  {
    name: 'Fatou B.',
    role: 'Étudiante',
    avatar: 'FB',
    text: "J'ai commandé un seul stylo personnalisé pour un cadeau. Résultat top !",
    note: 4,
  },
  {
    name: 'David O.',
    role: 'Designer freelance',
    avatar: 'DO',
    text: "La qualité d'impression est bluffante. Mes clients adorent.",
    note: 5,
  },
];

const FAQ = [
  {
    q: 'Quel est le délai de livraison ?',
    a: '5 à 10 jours ouvrés après validation de votre commande, selon votre localisation.',
  },
  {
    q: 'Puis-je commander sans créer de compte ?',
    a: 'Oui. La commande invité est disponible. Vous recevez un lien de suivi par email.',
  },
  {
    q: 'Quels moyens de paiement acceptez-vous ?',
    a: 'Paiement par carte ou mobile money. Rapide et sécurisé.',
  },
  {
    q: 'Proposez-vous des échantillons ?',
    a: 'Oui. Contactez-nous avant la production pour recevoir un aperçu.',
  },
];

// ─── Sous-composants ──────────────────────────────────────────────
function StarRating({ count = 5 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < count ? 'fill-[#F5A623] text-[#F5A623]' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white transition-all">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-4 text-left font-semibold text-[#1A1A2E] transition hover:text-[#E94560] sm:px-6 sm:py-5"
        aria-expanded={isOpen}
      >
        {item.q}
        <ChevronRight
          className={`h-5 w-5 shrink-0 text-[#1A1A2E]/30 transition-transform duration-300 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-40 pb-5' : 'max-h-0'
        }`}
      >
        <p className="px-4 text-sm text-[#1A1A2E]/60 sm:px-6">{item.a}</p>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────
export default function HomePage() {
  usePageTitle('WORLD DESIGN — Goodies personnalisés au Togo');

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cats, featured] = await Promise.all([getCategories(), getFeaturedProducts()]);
      setCategories(cats);
      setFeaturedProducts(featured);
    } catch (err) {
      setError(err?.message || "Quelque chose s'est mal passé.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F8F5F0' }}>
      {/* ================================================================ */}
      {/* SECTION 1 — HERO                                                  */}
      {/* ================================================================ */}
      <header className="relative flex min-h-[95svh] items-center overflow-hidden">
        {/* Image de fond */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_480px] lg:px-8">
          <div>
            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Transformez vos idées en{' '}
              <span className="text-[#F5A623]">objets uniques</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-white sm:text-lg">
              Goodies personnalisés, cadeaux d'entreprise et objets promotionnels conçus sur mesure pour particuliers et professionnels.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: '#E94560' }}
              >
                Commander maintenant
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-4 text-sm font-bold text-white transition hover:border-[#F5A623] hover:text-[#F5A623]"
              >
                Découvrir nos produits
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative mx-auto max-w-[440px] overflow-hidden rounded-3xl shadow-2xl shadow-black/30">
              <img
                src={HERO_IMAGE}
                alt="Produits personnalisés WORLD DESIGN"
                className="h-[320px] w-full object-cover sm:h-[360px] lg:h-[420px]"
              />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
            </div>
          </div>
        </div>

      </header>

      {/* ================================================================ */}
{/* ================================================================ */}
      {/* SECTION 2 - PRODUITS VEDETTES                                    */}
      {/* ================================================================ */}
      <section className="section-shell" style={{ backgroundColor: '#F8F5F0' }}>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1A1A2E] sm:text-4xl lg:text-5xl">
                Produits vedettes
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#1A1A2E]/60 sm:text-base">
                Faites defiler horizontalement pour voir les produits, avec une mise en page adaptee a tous les ecrans.
              </p>
            </div>
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-sm font-bold text-[#E94560] transition hover:text-[#E94560]/70"
            >
              Tout voir
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-0 lg:px-0">
                <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[420px] w-[82vw] max-w-[340px] flex-shrink-0 animate-pulse rounded-3xl bg-[#EFE7DC] sm:w-[360px] md:w-[380px] lg:w-[400px]"
                    />
                  ))}
                </div>
              </div>
            ) : error ? (
              <ErrorState description={error} onRetry={loadData} />
            ) : featuredProducts.length > 0 ? (
              <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-0 lg:px-0">
                <div className="flex snap-x snap-mandatory gap-4 pb-2" style={{ minWidth: 'min-content' }}>
                  {featuredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="w-[82vw] max-w-[340px] flex-shrink-0 snap-start sm:w-[360px] md:w-[380px] lg:w-[400px] animate-fadeInUp"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <ProductCard product={product} badgeLabel="BEST SELLER" showAddButton />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Pas encore de produits vedettes"
                description="Revenez bientot ou explorez tout le catalogue."
                action={
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 rounded-full text-white px-6 py-3 text-sm font-bold transition hover:opacity-90"
                    style={{ backgroundColor: '#E94560' }}
                  >
                    Voir le catalogue
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 3 - CATEGORIES                                           */}
      {/* SECTION 3 — CATÉGORIES                                            */}
      {/* ================================================================ */}
      <section className="section-shell bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1A1A2E] sm:text-4xl lg:text-5xl">
                Nos catégories
              </h2>
            </div>
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-sm font-bold text-[#E94560] transition hover:text-[#E94560]/70"
            >
              Tout voir
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-[#F8F5F0]" />
                ))}
              </div>
            ) : error ? (
              <ErrorState description={error} onRetry={loadData} />
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white transition-all duration-300"
                  >
                    <div className="aspect-[5/2] overflow-hidden bg-[#F8F5F0]">
                      <img
                        src={getCategoryImage(cat)}
                        alt={cat.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#1A1A2E] transition group-hover:text-[#E94560]">
                        {cat.name}
                      </h3>
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#E94560]">
                        Découvrir
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucune catégorie pour le moment"
                description="Notre catalogue se remplit. Revenez bientôt !"
              />
            )}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 5 — COMMENT ÇA MARCHE                                    */}
      {/* ================================================================ */}
      <section 
        className="section-shell bg-white relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/steps-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay blanc semi-transparent */}
        <div className="absolute inset-0 bg-white/85" aria-hidden="true" />
        
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] sm:text-4xl lg:text-5xl">
              Commander en 4 étapes
            </h2>
          </div>

          {/* Desktop - Grid normal */}
          <div className="hidden md:block relative mt-14">
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
              {/* Ligne de connexion */}
              <div
                className="absolute top-10 left-[12.5%] right-[12.5%] h-px"
                style={{
                  background: 'linear-gradient(90deg, #F5A623, #E94560, #F5A623)',
                }}
                aria-hidden="true"
              />

              {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
                <div key={num} className="relative flex flex-col items-center text-center">
                  <div
                    className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#E94560]/10 bg-white"
                    style={{ borderColor: '#F5A62340' }}
                  >
                    <Icon className="h-7 w-7 text-[#E94560]" aria-hidden="true" />
                    <span
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white"
                      style={{ backgroundColor: '#E94560' }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-[#1A1A2E]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#1A1A2E]/55 max-w-[200px]">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile - Horizontal scroll */}
          <div className="md:hidden mt-10">
            <div className="overflow-x-auto scroll-smooth" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
              <div className="flex gap-4 pb-2" style={{ minWidth: 'min-content' }}>
                {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
                  <div
                    key={num}
                    className="flex-shrink-0 w-72 flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-[#E94560]/10"
                    style={{ borderColor: '#F5A62340' }}
                  >
                    <div
                      className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#E94560]/10"
                      style={{ borderColor: '#F5A62340' }}
                    >
                      <Icon className="h-6 w-6 text-[#E94560]" aria-hidden="true" />
                      <span
                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white"
                        style={{ backgroundColor: '#E94560' }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-[#1A1A2E]">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#1A1A2E]/55">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 6 — GALERIE DE RÉALISATIONS                              */}
      {/* ================================================================ */}
      <section className="section-shell" style={{ background: 'linear-gradient(135deg, #F7F2EA 0%, #EFE4D4 100%)' }}>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] sm:text-4xl lg:text-5xl">
              Quelques réalisations
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[#1A1A2E]/70">
              Découvrez des créations déjà réalisées pour nos clients. Vous pouvez commander le vôtre.
            </p>
          </div>

          <div className="mt-10">
            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : featuredProducts.length > 0 ? (
              <div className="section-stack-2">
                {featuredProducts.slice(0, 6).map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <ProductCard product={product} showAddButton />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucune réalisation pour le moment"
                description="Nos créations arrivent bientôt."
              />
            )}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full border border-[#1A1A2E]/20 px-7 py-4 text-sm font-bold text-[#1A1A2E] transition hover:border-[#F5A623] hover:text-[#F5A623]"
            >
              Voir tout le catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 7 — APPEL À L'ACTION                                      */}
      {/* ================================================================ */}
      <section style={{ background: 'linear-gradient(135deg, #E94560 0%, #D63A54 100%)' }} className="section-shell">
        <div className="mx-auto w-full max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Prêt à créer votre produit personnalisé ?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/80 text-lg">
            Passez votre commande en quelques minutes.
          </p>
          <div className="mt-8 flex flex-col flex-wrap justify-center gap-4 sm:flex-row">
            <Link
              to="/products"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-[#E94560] transition-all hover:bg-white/90 active:scale-[0.98] sm:w-auto"
            >
              Commander maintenant
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-4 text-sm font-bold text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
            >
              Voir tout le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TÉMOIGNAGES                                                       */}
      {/* ================================================================ */}
      <section className="section-shell" style={{ backgroundColor: '#F8F5F0' }}>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] sm:text-4xl">
              Ce que nos clients disent
            </h2>
          </div>

          <div className="section-stack-4 mt-10">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="group relative rounded-2xl bg-white p-6 transition-all duration-300"
              >
                <Quote className="absolute right-4 top-4 h-7 w-7 text-[#E94560]/6" aria-hidden="true" />
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #E94560, #F5A623)' }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A2E]">{t.name}</p>
                    <p className="text-xs text-[#1A1A2E]/40">{t.role}</p>
                  </div>
                </div>
                <StarRating count={t.note} />
                <p className="mt-3 text-xs leading-6 text-[#1A1A2E]/60 sm:text-sm">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FAQ                                                               */}
      {/* ================================================================ */}
      <section className="section-shell bg-white">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] sm:text-4xl">
              Vous avez des questions ?
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#1A1A2E]/50">
              On a les réponses.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {FAQ.map((item, i) => (
              <FaqItem
                key={i}
                item={item}
                isOpen={activeFaq === i}
                onToggle={() => setActiveFaq(activeFaq === i ? null : i)}
              />
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-[#1A1A2E]/45">
            Autre question ?{' '}
            <a
              href="https://wa.me/22892455800"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#E94560] hover:underline"
            >
              Écrivez-nous sur WhatsApp
            </a>
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* BOUTON PANIER FLOTTANT                                          */}
      {/* ================================================================ */}
      <Link
        to="/cart"
        aria-label="Voir le panier"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#E94560] text-white shadow-lg shadow-accent/25 transition-transform hover:scale-105 active:scale-95"
      >
        <ShoppingBag className="h-6 w-6" />
      </Link>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out both;
        }
      `}</style>
    </div>
  );
}


