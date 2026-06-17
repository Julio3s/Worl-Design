import { Link } from 'react-router-dom';

const SIZE_CLASSES = {
  sm: 'h-20',
  md: 'h-24',
  lg: 'h-28',
  xl: 'h-32',
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
