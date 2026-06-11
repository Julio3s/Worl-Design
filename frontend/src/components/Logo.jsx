import { Link } from 'react-router-dom';

const SIZE_CLASSES = {
  sm: 'h-10',
  md: 'h-12',
  lg: 'h-14',
  xl: 'h-16',
};

export function Logo({ to = '/', size = 'md', className = '', showLink = true }) {
  const frameClassName = [SIZE_CLASSES[size] || SIZE_CLASSES.md, 'aspect-square', className]
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
    <span className={`inline-flex items-center justify-center overflow-hidden rounded-xl bg-white px-2 py-2 shadow-sm ring-1 ring-black/5 ${frameClassName}`}>
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
