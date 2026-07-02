import { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Share2, ShoppingCart } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { getProductBySlug } from '../api/catalog';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import ProductImageCarousel from '../components/ProductImageCarousel';
import { QuantitySelector } from '../components/QuantitySelector';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSeo } from '../hooks/useSeo';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { formatCurrency } from '../utils/formatCurrency';
import { validateCustomFile } from '../utils/customFileValidation';
import { getProductImage, optimizeImageUrl } from '../utils/media';

function buildImagesArray(product) {
  if (!product) return [];

  // Union : images + vidéos
  const result = [];

  // Image principale
  const mainImageUrl = product.image_url || product.image || '';
  if (mainImageUrl) {
    result.push({ image_url: mainImageUrl, media_type: 'image', order: 0 });
  }

  // Images et vidéos supplémentaires
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img, idx) => {
      if (img.media_type === 'video') {
        // C'est une vidéo
        if (img.video_url) {
          const thumbnail = optimizeImageUrl(img.image_url || img.image || '', 800);
          result.push({
            video_url: img.video_url,
            media_type: 'video',
            thumbnail_url: thumbnail,
            order: idx + 1,
          });
        }
      } else {
        // C'est une image
        const imgUrl = optimizeImageUrl(img.image_url || img.image || '', 800);
        if (imgUrl && imgUrl !== mainImageUrl) {
          result.push({ image_url: imgUrl, media_type: 'image', order: idx + 1 });
        }
      }
    });
  }

  return result;
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState('');
  const [customFile, setCustomFile] = useState(null);
  const [customFileError, setCustomFileError] = useState('');
  const [addedFeedback, setAddedFeedback] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [modelError, setModelError] = useState('');

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
  const customTextEmpty = isCustomizable && !customText.trim();
  const isWishlisted = useWishlistStore((state) => (product ? state.isWishlisted(product.id) : false));

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || 'World Design',
          text: product?.description || '',
          url,
        });
      } catch {
        // ignore
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papier');
    }
  };

  const handleAddToCart = () => {
    if (!product || outOfStock || customTextEmpty) {
      return;
    }

    // Vérifier si un modèle est requis mais non sélectionné
    if (product.has_models && product.models && product.models.length > 0 && !selectedModel) {
      setModelError('Veuillez sélectionner un modèle');
      
      // Faire défiler vers le sélecteur de modèle
      const modelSelect = document.getElementById('model-select');
      if (modelSelect) {
        modelSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
        modelSelect.focus();
        
        // Ajouter une bordure rouge temporairement
        modelSelect.classList.add('border-red-500');
        setTimeout(() => {
          modelSelect.classList.remove('border-red-500');
        }, 2000);
      }
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
          to={location.state?.fromProducts ? `/products?page=${location.state.page || 1}` : '/products'}
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E0DBD5] bg-white transition hover:border-accent hover:text-accent ${
                      isWishlisted ? 'text-accent' : 'text-text-muted'
                    }`}
                    aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-accent' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E0DBD5] bg-white text-text-muted transition hover:border-accent hover:text-accent"
                    aria-label="Partager"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <p className="text-sm font-semibold uppercase tracking-normal text-black">
                    {product.name}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-roboto text-xl font-bold text-black">
                    {formatCurrency(product.price)}
                  </p>
                  {product.is_customizable ? (
                    <span className="inline-flex rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#92400E]">
                      Personnalisable
                    </span>
                  ) : null}
                </div>
                <p className="max-w-2xl text-sm leading-5 font-semibold text-text-muted sm:text-base">
                  {product.description}
                </p>

              </div>

            {/* Sélecteur de modèle - seulement si has_models est true */}
            {product.has_models && product.models && product.models.length > 0 ? (
              <div className="rounded-[8px] border border-[#E0DBD5] bg-white px-4 py-4">
                <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
                  <span>
                    Choisissez votre modèle{' '}
                    <span className="text-accent font-semibold">(obligatoire)</span>
                  </span>
                  <select
                    id="model-select"
                    value={selectedModel}
                    onChange={(e) => {
                      setSelectedModel(e.target.value);
                      if (modelError) setModelError('');
                    }}
                    className={`h-11 rounded-[8px] border bg-white px-3 text-sm outline-none transition focus:border-accent ${
                      modelError ? 'border-red-500' : 'border-[#E0DBD5]'
                    }`}
                  >
                    <option value="">Sélectionnez un modèle</option>
                    {product.models.map((model) => (
                      <option key={model.id} value={model.model_value}>
                        {model.model_value}
                      </option>
                    ))}
                  </select>
                  {modelError ? (
                    <p className="text-sm font-medium text-red-600">{modelError}</p>
                  ) : null}
                </label>
              </div>
            ) : null}

            {isCustomizable ? (
              <div className="space-y-4 rounded-[8px] border border-[#E0DBD5] bg-white px-4 py-4 w-full min-w-0 overflow-hidden">
                <label className="flex flex-col gap-2 text-sm font-medium text-text-dark min-w-0">
                  <span>
                    Ajoutez votre touche{' '}
                    <span className="text-accent font-semibold">(obligatoire)</span>
                  </span>
                  <textarea
                    value={customText}
                    onChange={(event) => setCustomText(event.target.value)}
                    maxLength={500}
                    placeholder="Ex: Texte personnalisé, nom, date, message..."
                    className="min-h-[80px] w-full min-w-0 rounded-[8px] border border-[#E0DBD5] bg-white px-3 py-2 text-sm text-text-dark outline-none transition placeholder:text-text-muted focus:border-accent box-border"
                  />
                  <span className="text-xs text-text-muted">{customText.length}/500 caractères</span>
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-text-dark min-w-0">
                  <span>Ajouter "logo ou image de la personnalisation"</span>
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
                  <div className="flex items-center gap-3 rounded-[8px] border border-[#E0DBD5] bg-[#FAFAFA] p-3">
                    {customFile.type?.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(customFile)}
                        alt="Aperçu du logo"
                        className="h-14 w-14 rounded-[6px] border border-[#E0DBD5] object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-[6px] border border-[#E0DBD5] bg-white text-xs font-semibold text-text-muted">
                        PDF
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-dark">
                        {customFile.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {(customFile.size / 1024).toFixed(1)} Ko
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomFile(null);
                        setCustomFileError('');
                      }}
                      className="shrink-0 rounded-full p-1 text-text-muted transition hover:bg-[#FEE2E2] hover:text-[#991B1B]"
                      aria-label="Supprimer le fichier"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-4 rounded-[8px] border border-[#E0DBD5] bg-white px-4 py-4">
              {addedFeedback ? (
                <p
                  role="status"
                  className="rounded-[8px] bg-[#D1FAE5] px-4 py-3 text-sm font-medium text-[#065F46]"
                >
                  {addedFeedback}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                {/* Boutons côte à côte */}
                <div className="flex w-full flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={outOfStock || customTextEmpty}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-[8px] bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    {outOfStock ? 'Indisponible' : 'Ajouter au panier'}
                  </button>
                  <Link
                    to="/cart"
                    className="inline-flex flex-1 items-center justify-center rounded-[8px] border border-[#E0DBD5] bg-white px-5 py-2.5 text-sm font-semibold text-text-dark transition hover:border-accent hover:text-accent"
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