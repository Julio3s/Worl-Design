import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { getProductBySlug } from '../api/catalog';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import ProductImageCarousel from '../components/ProductImageCarousel';
import { QuantitySelector } from '../components/QuantitySelector';
import { SectionHeading } from '../components/SectionHeading';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSeo } from '../hooks/useSeo';
import { useCartStore } from '../store/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import { validateCustomFile } from '../utils/customFileValidation';
import { getProductImage } from '../utils/media';

function buildImagesArray(product) {
  if (!product) return [];

  // Union : image principale + images supplémentaires
  const result = [];

  if (product.image_url) {
    result.push({ image_url: product.image_url, order: 0 });
  }

  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      if (img.image_url && img.image_url !== product.image_url) {
        result.push(img);
      }
    });
  }

  return result.length > 0 ? result : product.image_url ? [{ image_url: product.image_url, order: 0 }] : [];
}

function DetailStat({ label, value, highlight = false }) {
  return (
    <div className="rounded-[8px] border border-[#E0DBD5] bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">{label}</p>
      <p className={highlight ? 'mt-1 text-base font-semibold text-accent' : 'mt-1 text-sm font-medium text-text-dark'}>
        {value}
      </p>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState('');
  const [customFile, setCustomFile] = useState(null);
  const [customFileError, setCustomFileError] = useState('');
  const [addedFeedback, setAddedFeedback] = useState('');

  usePageTitle(product?.name || 'Produit');

  const image = getProductImage(product);

  useSeo({
    title: product?.name || 'Produit',
    description: product?.description || 'Détail produit WORLD DESIGN',
    image,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setLoading(true);
      setError('');
      setProduct(null);

      try {
        const nextProduct = await getProductBySlug(slug);
        if (!isMounted) {
          return;
        }
        setProduct(nextProduct);
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }
        setError(caughtError?.message || 'Impossible de charger le produit.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      loadProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    setQuantity(1);
    setCustomText('');
    setCustomFile(null);
    setCustomFileError('');
  }, [slug]);

  const outOfStock = Number(product?.stock || 0) <= 0;
  const isCustomizable = Boolean(product?.is_customizable);

  const handleAddToCart = () => {
    if (!product || outOfStock) {
      return;
    }

    addItem(
      {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        price: Number(product.price || 0),
        isCustomizable: Boolean(product.is_customizable),
        imageUrl: image,
        categorySlug: product.category?.slug || '',
        customText: customText.trim(),
        customFile: customFile || undefined,
        customFileName: customFile?.name || '',
        customFileType: customFile?.type || '',
        customFileSize: customFile?.size || 0,
      },
      quantity,
    );

    setAddedFeedback(`${quantity} article(s) ajouté(s) au panier.`);
  };

  const handleCustomFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    const validationError = validateCustomFile(file);

    if (validationError) {
      setCustomFile(null);
      setCustomFileError(validationError);
      event.target.value = '';
      return;
    }

    setCustomFile(file);
    setCustomFileError('');
  };

  useEffect(() => {
    if (!addedFeedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setAddedFeedback(''), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [addedFeedback]);

  if (loading) {
    return (
    <div className="bg-cream overflow-x-hidden">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <LoadingState label="Chargement du produit..." />
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-cream">
        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ErrorState description={error} onRetry={() => window.location.reload()} />
        </section>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="bg-cream">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour au catalogue
        </Link>

        <div className="mt-5 grid gap-6 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <ProductImageCarousel
            images={buildImagesArray(product)}
            productName={product.name}
          />

          <div className="flex flex-col gap-5 w-full min-w-0">
              <div className="space-y-3 min-w-0">
                <p className="text-sm font-semibold uppercase tracking-normal text-gold">
                  {product.category?.name || 'WORLD DESIGN'}
                </p>
                <h1 className="font-display text-2xl font-bold leading-tight text-primary sm:text-4xl md:text-5xl">
                  {product.name}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
                  {product.description}
                </p>
              </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-3xl font-bold text-price">
                {formatCurrency(product.price)}
              </p>
              {product.is_customizable ? (
                <span className="inline-flex rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#92400E]">
                  Personnalisable
                </span>
              ) : null}
            </div>

            {isCustomizable ? (
              <div className="space-y-4 rounded-[8px] border border-[#E0DBD5] bg-white px-4 py-4 w-full min-w-0 overflow-hidden">
                <SectionHeading
                  eyebrow="Personnalisation"
                  title="Ajoutez votre touche"
                  description="Le texte personnalisé est facultatif, et le fichier logo est optionnel."
                />

                <label className="flex flex-col gap-2 text-sm font-medium text-text-dark min-w-0">
                  <span>Texte de personnalisation</span>
                  <textarea
                    value={customText}
                    onChange={(event) => setCustomText(event.target.value)}
                    maxLength={500}
                    placeholder={product.customization_hint || 'Écrivez votre message'}
                    className="min-h-28 w-full min-w-0 rounded-[8px] border border-[#E0DBD5] bg-white px-3 py-3 text-sm text-text-dark outline-none transition placeholder:text-text-muted focus:border-accent box-border"
                  />
                  <span className="text-xs text-text-muted">{customText.length}/500 caractères</span>
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-text-dark min-w-0">
                  <span>Fichier logo</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.ai,.svg"
                    onChange={handleCustomFileChange}
                    className="w-full min-w-0 rounded-[8px] border border-[#E0DBD5] bg-white px-3 py-2 text-sm text-text-dark file:mr-2 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white overflow-hidden"
                  />
                </label>

                {customFileError ? (
                  <p className="rounded-[8px] bg-[#FEE2E2] px-3 py-2 text-sm font-medium text-[#991B1B]">
                    {customFileError}
                  </p>
                ) : null}

                {customFile ? (
                  <p className="text-sm text-text-muted">
                    Sélectionné: {customFile.name}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-4 rounded-[8px] border border-[#E0DBD5] bg-white px-4 py-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-text-muted">Quantité</p>
                  <div className="mt-2">
                    <QuantitySelector
                      value={quantity}
                      onChange={(nextQuantity) => setQuantity(Math.max(1, Number(nextQuantity || 1)))}
                      min={1}
                      max={Math.max(1, Number(product.stock || 1))}
                    />
                  </div>
                </div>

                {addedFeedback ? (
                  <p
                    role="status"
                    className="w-full rounded-[8px] bg-[#D1FAE5] px-4 py-3 text-sm font-medium text-[#065F46]"
                  >
                    {addedFeedback}
                  </p>
                ) : null}

                <div className="flex flex-1 flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={outOfStock}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    {outOfStock ? 'Indisponible' : 'Ajouter au panier'}
                  </button>
                  <Link
                    to="/cart"
                    className="inline-flex items-center justify-center rounded-full border border-[#E0DBD5] bg-white px-5 py-3 text-sm font-semibold text-text-dark transition hover:border-accent hover:text-accent"
                  >
                    Voir le panier
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
