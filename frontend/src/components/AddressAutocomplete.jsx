import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

const SUGGESTIONS = [
  'Lomé, Togo',
  'Cotonou, Bénin',
  'Porto-Novo, Bénin',
  'Abidjan, Côte d\'Ivoire',
  'Accra, Ghana',
  'Lagos, Nigeria',
  'Ouagadougou, Burkina Faso',
  'Bamako, Mali',
  'Dakar, Sénégal',
  'Niamey, Niger',
  'Conakry, Guinée',
  'Libreville, Gabon',
  'Yaoundé, Cameroun',
  'Kinshasa, RDC',
  'Brazzaville, Congo',
];

export function AddressAutocomplete({ value, onChange, placeholder = 'Adresse de livraison' }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [locating, setLocating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.trim().length > 0) {
      const filtered = SUGGESTIONS.filter((suggestion) =>
        suggestion.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (!apiKey) {
            setLocating(false);
            return;
          }

          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=fr`
          );
          const data = await response.json();
          
          if (data.results && data.results[0]) {
            const address = data.results[0].formatted_address;
            setInputValue(address);
            onChange(address);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocating(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 300000 
      }
    );
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
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
          onBlur={handleBlur}
          onFocus={() => {
            if (inputValue.trim().length > 0) {
              const filtered = SUGGESTIONS.filter((suggestion) =>
                suggestion.toLowerCase().includes(inputValue.toLowerCase())
              );
              setFilteredSuggestions(filtered);
              setShowSuggestions(filtered.length > 0);
            }
          }}
          placeholder={placeholder}
          className="h-11 w-full rounded-[8px] border border-[#E0DBD5] bg-white px-3 pr-12 text-sm outline-none transition focus:border-accent"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-[#F8F5F0] hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Utiliser ma position"
          title="Utiliser ma position actuelle"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </button>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-[8px] border border-[#E0DBD5] bg-white shadow-lg">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left text-sm text-text-dark transition hover:bg-[#F8F5F0] first:rounded-t-[8px] last:rounded-b-[8px]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}