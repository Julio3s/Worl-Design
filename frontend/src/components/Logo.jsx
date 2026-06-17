import { Link } from 'react-router-dom';

const SIZE_CLASSES = {
  sm: 'h-12',
  md: 'h-16',
  lg: 'h-20',
  xl: 'h-24',
};

export function Logo({ to = '/', size = 'md', className = '', showLink = true }) {
  const imageClassName = [SIZE_CLASSES[size] || SIZE_CLASSES.md, 'w-auto object-contain', className]
    .filter(Boolean)
    .join(' ');

  const brandedImage = (
    <img
      src="/logo-wd.png"
      alt="World Design"
      className={imageClassName}
    />
  );

  if (!showLink) {
    return brandedImage;
  }

  return (
    <Link to={to} className="inline-flex items-center" aria-label="World Design - Accueil">
      {brandedImage}
    </Link>
  );
}
