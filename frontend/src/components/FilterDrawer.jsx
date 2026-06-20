import { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

export default function FilterDrawer({ children, label = 'Filtres' }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#E0DBD5] bg-white px-4 py-2 text-sm font-semibold text-text-dark transition hover:border-accent hover:text-accent"
        aria-expanded={open}
        aria-label={label}
      >
        <Filter className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{label}</span>
      </button>

      {open ? (
        <div className="absolute left-0 z-50 mt-2 w-[320px] rounded-[8px] border border-[#E0DBD5] bg-white p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold text-text-dark">{label}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition hover:bg-[#F8F5F0] hover:text-text-dark"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </div>
  );
}