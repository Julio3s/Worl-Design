import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

export function AddressAutocomplete({ value, onChange, placeholder = 'Adresse de livraison' }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(value || '');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialiser l'autocomplete
  const initAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) {
      return;
    }

    if (autocompleteRef.current) {
      return; // Déjà initialisé
    }

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'tg' }, // Togo
      types: ['geocode'],
      fields: ['formatted_address', 'geometry', 'address_components'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        setInputValue(place.formatted_address);
        onChange(place.formatted_address);
      }
    });
  };

  // Charger l'API Google Maps
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('VITE_GOOGLE_MAPS_API_KEY not configured');
      setIsLoaded(false);
      return;
    }

    // Vérifier si l'API est déjà chargée
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      initAutocomplete();
      return;
    }

    // Charger le script Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
      initAutocomplete();
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setIsLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
    };
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
      <span className="inline-flex items-center gap-1">
        <MapPin className="h-4 w-4 text-accent" />
        Adresse de livraison
      </span>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          required
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="h-11 w-full rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
          autoComplete="off"
        />
        {!isLoaded && (
          <p className="mt-1 text-xs text-text-muted">
            (Autocomplete Google Maps non disponible - entrez manuellement)
          </p>
        )}
      </div>
    </label>
  );
}
