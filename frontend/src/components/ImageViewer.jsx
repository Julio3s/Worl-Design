import { useEffect, useCallback, useState } from 'react';
import { X } from 'lucide-react';

export default function ImageViewer({ src, alt, isOpen, onClose }) {
  const [loaded, setLoaded] = useState(false);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Image en plein écran'}
    >
      {/* Bouton fermer */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Fermer"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Image */}
      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {!loaded ? (
          <div className="flex h-40 w-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        ) : null}
        <img
          src={src}
          alt={alt || ''}
          className={`max-h-[90vh] max-w-[90vw] rounded-lg object-contain transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}