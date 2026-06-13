import { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import ImageViewer from './ImageViewer';

export default function ProductImageCarousel({ images, productName }) {
  const [active, setActive] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const total = images.length;
  const currentImage = images[active]?.image_url || '';

  const goTo = (index) => {
    setActive(Math.max(0, Math.min(total - 1, index)));
  };

  const goPrev = () => goTo(active - 1);
  const goNext = () => goTo(active + 1);

  return (
    <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-[8px] border border-[#E0DBD5] bg-white">
      <div className="group/carousel relative aspect-square bg-[#F1ECE6]">
        <img
          src={currentImage}
          alt={`${productName} - image ${active + 1}`}
          className="h-full w-full object-cover"
        />

        {/* Flèches de navigation */}
        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={active === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition hover:bg-black/50 group-hover/carousel:opacity-100 disabled:opacity-0"
              aria-label="Image précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={active === total - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition hover:bg-black/50 group-hover/carousel:opacity-100 disabled:opacity-0"
              aria-label="Image suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}

        {/* Bouton œil plein écran (coin haut-droit) */}
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          className="absolute top-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/60 group-hover/carousel:opacity-100 focus:outline-none focus-visible:opacity-100"
          aria-label="Voir l'image en plein écran"
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>

      {/* Dots de navigation */}
      {total > 1 ? (
        <div className="flex items-center justify-center gap-2 py-3">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              className={`h-2 w-2 rounded-full transition ${
                index === active ? 'bg-accent scale-125' : 'bg-[#D1CFCA] hover:bg-[#A9A6A0]'
              }`}
              aria-label={`Image ${index + 1}`}
            />
          ))}
        </div>
      ) : null}

      <ImageViewer
        src={currentImage}
        alt={`${productName} - image ${active + 1}`}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}