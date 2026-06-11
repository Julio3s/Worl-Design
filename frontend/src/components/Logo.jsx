import { Link } from 'react-router-dom';

const SIZE_CLASSES = {
  sm: 'h-12',
  md: 'h-16',
  lg: 'h-20',
  xl: 'h-24',
};

export function Logo({ to = '/', size = 'md', className = '', showLink = true }) {
  const frameClassName = [SIZE_CLASSES[size] || SIZE_CLASSES.md, 'aspect-[2.6/1]', className]
    .filter(Boolean)
    .join(' ');

  const image = (
    <img
      src="/logo.png"
      alt="World Design"
      className="block h-full w-full object-contain"
    />
  );

  const framedImage = (
    <span className={`inline-flex items-center justify-center overflow-hidden rounded-lg bg-white px-3 py-1.5 shadow-sm ring-1 ring-black/5 ${frameClassName}`}>
      {image}
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
