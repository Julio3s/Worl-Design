import { useLocation } from 'react-router-dom';

export function PageTransition({ children }) {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="page-fade-in">
      {children}
    </div>
  );
}
