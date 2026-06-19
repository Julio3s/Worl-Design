import { useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import ImageViewer from './ImageViewer';

const SWIPE_THRESHOLD = 50;

export default function ProductImageCarousel({ images, productName }) {
  const [active, setActive] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

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

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-[8px] border border-[#E0DBD5] bg-white">
      <div
        className="group/carousel relative aspect-square bg-[#F1ECE6] select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImage}
          alt={`${productName} - image ${active + 1}`}
          className="pointer-events-none h-full w-full object-cover"
          draggable={false}
        />


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
        hasMultiple={total > 1}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  );
}
