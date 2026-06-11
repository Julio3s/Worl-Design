import { Link } from 'react-router-dom';

const SIZE_CLASSES = {
  sm: 'h-12',
  md: 'h-16',
  lg: 'h-20',
  xl: 'h-24',
};

const TEXT_SIZE_CLASSES = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

const ICON_SIZE_CLASSES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-14 w-14',
};

export function Logo({ to = '/', size = 'md', className = '', showLink = true }) {
  const frameClassName = [SIZE_CLASSES[size] || SIZE_CLASSES.md, 'aspect-[2.6/1]', className]
    .filter(Boolean)
    .join(' ');

  const textSizeClass = TEXT_SIZE_CLASSES[size] || TEXT_SIZE_CLASSES.md;
  const iconSizeClass = ICON_SIZE_CLASSES[size] || ICON_SIZE_CLASSES.md;

  const framedImage = (
    <span
      className={`inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-white px-2.5 py-1 shadow-sm ring-1 ring-black/5 ${frameClassName}`}
    >
      <img
        src="/logo-icon.png"
        alt=""
        aria-hidden="true"
        className={`shrink-0 object-contain ${iconSizeClass}`}
      />
      <span
        className={`flex min-w-0 flex-col justify-center font-sans font-extrabold leading-[0.92] tracking-tight text-[#1B4BA0] ${textSizeClass}`}
      >
        <span>World</span>
        <span>Design</span>
      </span>
    </span>
  );

  if (!showLink) {
    return framedImage;
  }

  return (
    <Link to={to} className="inline-flex items-center" aria-label="World Design - Accueil">
      {framedImage}
    </Link>
  );
}
