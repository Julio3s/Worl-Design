import { useRef, useState } from 'react';
import { Eye, Play } from 'lucide-react';
import { optimizeImageUrl } from '../utils/media';
import ImageViewer from './ImageViewer';

const SWIPE_THRESHOLD = 50;

/**
 * Extrait l'ID YouTube d'une URL YouTube
 */
function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Extrait l'ID Vimeo d'une URL Vimeo
 */
function getVimeoId(url) {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Détermine si une URL est une vidéo (YouTube, Vimeo, ou URL directe)
 */
function getVideoEmbedUrl(url) {
  if (!url) return null;

  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`,
    };
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
    };
  }

  // URL vidéo directe (mp4, webm, etc.)
  if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i) || url.includes('/video/upload/')) {
    return {
      type: 'direct',
      embedUrl: url,
    };
  }

  return null;
}

export default function ProductImageCarousel({ images, productName }) {
  const [active, setActive] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  if (!images || images.length === 0) {
    return null;
  }

  const total = images.length;
  const currentItem = images[active];
  const isVideo = currentItem?.media_type === 'video';

  // Pour une image, on prend l'URL optimisée ; pour une vidéo, la vignette
  const currentImage = isVideo
    ? optimizeImageUrl(currentItem?.thumbnail_url || '', 800)
    : optimizeImageUrl(currentItem?.image_url || currentItem?.image || '', 800);

  const videoEmbed = isVideo ? getVideoEmbedUrl(currentItem?.video_url) : null;

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

  /**
   * Rend une vidéo directement dans le carousel avec contrôles
   */
  const renderVideoInCarousel = () => {
    if (!videoEmbed) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-black text-white/60 text-sm">
          Vidéo indisponible
        </div>
      );
    }

    // Fichier vidéo direct (mp4, webm, ogg)
    if (videoEmbed.type === 'direct') {
      return (
        <video
          src={videoEmbed.embedUrl}
          title={`${productName} - vidéo ${active + 1}`}
          className="h-full w-full"
          controls
          autoPlay
          playsInline
          preload="metadata"
        >
          <source src={videoEmbed.embedUrl} type="video/mp4" />
          <source src={videoEmbed.embedUrl} type="video/webm" />
          <source src={videoEmbed.embedUrl} type="video/ogg" />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      );
    }

    // YouTube ou Vimeo : iframe embed
    return (
      <iframe
        src={videoEmbed.embedUrl}
        title={`${productName} - vidéo ${active + 1}`}
        className="h-full w-full"
        allow="autoplay; fullscreen; encrypted-media"
        allowFullScreen
        loading="lazy"
      />
    );
  };

/**
 * Rend un lecteur vidéo (iframe pour YouTube/Vimeo, <video> pour fichiers directs)
 */
  const renderVideoEmbed = () => {
    if (!videoEmbed) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-black text-white/60 text-sm">
          Vidéo indisponible
        </div>
      );
    }

    // Fichier vidéo direct (mp4, webm, ogg)
    if (videoEmbed.type === 'direct') {
      return (
        <video
          src={videoEmbed.embedUrl}
          title={`${productName} - vidéo ${active + 1}`}
          className="h-full w-full"
          controls
          autoPlay
          playsInline
          preload="metadata"
        >
          <source src={videoEmbed.embedUrl} type="video/mp4" />
          <source src={videoEmbed.embedUrl} type="video/webm" />
          <source src={videoEmbed.embedUrl} type="video/ogg" />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      );
    }

    // YouTube ou Vimeo : iframe embed
    return (
      <iframe
        src={videoEmbed.embedUrl}
        title={`${productName} - vidéo ${active + 1}`}
        className="h-full w-full"
        allow="autoplay; fullscreen; encrypted-media"
        allowFullScreen
        loading="lazy"
      />
    );
  };

  return (
    <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-[8px] border border-[#E0DBD5] bg-white">
      <div
        className="group/carousel relative aspect-square bg-[#F1ECE6] select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isVideo ? (
          renderVideoInCarousel()
        ) : currentImage ? (
          <img
            src={currentImage}
            alt={`${productName} - image ${active + 1}`}
            className="pointer-events-none h-full w-full object-cover"
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            {isVideo ? 'Vidéo' : 'Image'} indisponible
          </div>
        )}

        {/* Bouton œil plein écran (coin haut-droit) */}
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          className="absolute top-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/60 group-hover/carousel:opacity-100 focus:outline-none focus-visible:opacity-100"
          aria-label={isVideo ? "Voir la vidéo en plein écran" : "Voir l'image en plein écran"}
        >
          {isVideo ? <Play className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>

        {/* Badge vidéo en haut à gauche */}
        {isVideo && (
          <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
            <Play className="h-3 w-3" />
            Vidéo
          </div>
        )}
      </div>

      {/* Dots de navigation */}
      {total > 1 ? (
        <div className="flex items-center justify-center gap-2 py-3">
          {images.map((item, index) => {
            const isVideoItem = item.media_type === 'video';
            return (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                className={`h-2 w-2 rounded-full transition ${
                  index === active
                    ? isVideoItem
                      ? 'bg-black scale-125'
                      : 'bg-accent scale-125'
                    : 'bg-[#D1CFCA] hover:bg-[#A9A6A0]'
                }`}
                aria-label={`${isVideoItem ? 'Vidéo' : 'Image'} ${index + 1}`}
              />
            );
          })}
        </div>
      ) : null}

      {/* Pour les images, on utilise ImageViewer ; pour les vidéos, un lecteur plein écran */}
      {isVideo ? (
        <VideoViewer
          videoUrl={currentItem?.video_url || ''}
          alt={`${productName} - vidéo ${active + 1}`}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      ) : (
        <ImageViewer
          src={currentImage}
          alt={`${productName} - image ${active + 1}`}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          hasMultiple={total > 1}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </div>
  );
}

/**
 * Visionneuse vidéo plein écran
 */
function VideoViewer({ videoUrl, alt, isOpen, onClose }) {
  const videoEmbed = getVideoEmbedUrl(videoUrl);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Vidéo en plein écran'}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Fermer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative w-full max-w-4xl aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        {videoEmbed ? (
          <iframe
            src={videoEmbed.embedUrl}
            title={alt || ''}
            className="h-full w-full rounded-lg"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-black/60 text-white/60 text-sm">
            Vidéo indisponible
          </div>
        )}
      </div>
    </div>
  );
}
