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
      className={[SIZE_CLASSES[size] || SIZE_CLASSES.md, 'block object-contain', className]
        .filter(Boolean)
        .join(' ')}
    />
  );

  const framedImage = (
    <span className="inline-flex items-center rounded-[10px] bg-white px-2 py-1 shadow-sm ring-1 ring-black/5">
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
