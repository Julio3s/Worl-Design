import { Link } from 'react-router-dom';

const SIZE_CLASSES = {
  sm: 'h-9 w-auto',
  md: 'h-11 w-auto',
  lg: 'h-14 w-auto',
  xl: 'h-16 w-auto',
};

export function Logo({ to = '/', size = 'md', className = '', showLink = true }) {
  const image = (
    <img
      src="/logo.png"
      alt="World Design"
      className={[SIZE_CLASSES[size] || SIZE_CLASSES.md, className].filter(Boolean).join(' ')}
    />
  );

  if (!showLink) {
    return image;
  }

  return (
    <Link to={to} className="inline-flex items-center" aria-label="World Design — Accueil">
      {image}
    </Link>
  );
}
