import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export function AddressAutocomplete({ value, onChange, placeholder = 'Adresse de livraison' }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(value || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Initialiser l'autocomplete
  const initAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) {
      return;
    }

    if (autocompleteRef.current) {
      return; // Déjà initialisé
    }

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
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

  const initMiniMap = () => {
    if (!mapRef.current || !window.google?.maps) {
      console.error('Map container or Google Maps API not available');
      return;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: 6.1725, lng: 1.2314 });
      return;
    }

    try {
      const mapOptions = {
        center: { lat: 6.1725, lng: 1.2314 },
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      };

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

      // Force map to render properly
      const googleMap = mapInstanceRef.current;
      setTimeout(() => {
        window.google.maps.event.trigger(googleMap, 'resize');
        googleMap.setCenter(mapOptions.center);
      }, 100);

      mapInstanceRef.current.addListener('click', async (event) => {
        const { lat, lng } = event.latLng;

        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: { lat, lng },
            map: mapInstanceRef.current,
            animation: window.google.maps.Animation.DROP,
          });
        }

        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=fr`
          );
          const data = await response.json();
          if (data.results && data.results[0]) {
            const address = data.results[0].formatted_address;
            setInputValue(address);
            onChange(address);
            setShowMap(false);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          alert('Impossible de récupérer l\'adresse.');
        }
      });
    } catch (error) {
      console.error('Map initialization error:', error);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setLocating(true);
    setShowMap(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
          mapInstanceRef.current.setZoom(16);

          if (markerRef.current) {
            markerRef.current.setPosition({ lat: latitude, lng: longitude });
          } else {
            markerRef.current = new window.google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map: mapInstanceRef.current,
              animation: window.google.maps.Animation.DROP,
            });
          }
        }

        setLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Impossible de récupérer votre position. Veuillez autoriser l\'accès à votre position.');
        setLocating(false);
        setShowMap(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    if (showMap && isLoaded) {
      // Wait for the container to be visible and rendered
      const timer = setTimeout(() => {
        initMiniMap();
      }, 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showMap, isLoaded]);

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
          className="h-11 w-full rounded-[8px] border border-[#E0DBD5] bg-white px-3 pr-12 text-sm outline-none transition focus:border-accent"
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
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </button>
      </div>
      {showMap && (
        <div className="mt-2 overflow-hidden rounded-[8px] border border-[#E0DBD5]">
          <div 
            ref={mapRef} 
            className="h-48 w-full bg-gray-100" 
            style={{ 
              minHeight: '192px',
              position: 'relative',
              zIndex: 1
            }} 
          />
          {!isLoaded && (
            <div className="flex items-center justify-center bg-gray-200 p-4">
              <p className="text-xs text-text-muted">Vérifiez votre connexion internet...</p>
            </div>
          )}
          <div className="flex items-center justify-between bg-[#F8F5F0] px-3 py-2">
            <p className="text-xs text-text-muted">
              {locating ? 'Récupération de votre position...' : 'Cliquez sur la carte pour sélectionner votre adresse'}
            </p>
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className="text-xs font-semibold text-accent transition hover:opacity-80"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      {!isLoaded && !showMap && (
        <p className="mt-1 text-xs text-text-muted">
          (Autocomplete Google Maps non disponible - entrez manuellement)
        </p>
      )}
    </label>
  );
}