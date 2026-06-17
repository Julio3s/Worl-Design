import { ChevronDown } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

const COUNTRIES = [
  { code: 'TG', name: 'Togo', dial: '+228' },
  { code: 'BJ', name: 'Bénin', dial: '+229' },
  { code: 'BF', name: 'Burkina Faso', dial: '+226' },
  { code: 'CI', name: "Côte d'Ivoire", dial: '+225' },
  { code: 'SN', name: 'Sénégal', dial: '+221' },
  { code: 'ML', name: 'Mali', dial: '+223' },
  { code: 'NE', name: 'Niger', dial: '+227' },
  { code: 'GN', name: 'Guinée', dial: '+224' },
  { code: 'GH', name: 'Ghana', dial: '+233' },
  { code: 'NG', name: 'Nigeria', dial: '+234' },
  { code: 'CM', name: 'Cameroun', dial: '+237' },
  { code: 'GA', name: 'Gabon', dial: '+241' },
  { code: 'CD', name: 'RDC', dial: '+243' },
  { code: 'CG', name: 'Congo', dial: '+242' },
  { code: 'TD', name: 'Tchad', dial: '+235' },
  { code: 'CF', name: 'Centrafrique', dial: '+236' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'BE', name: 'Belgique', dial: '+32' },
  { code: 'CH', name: 'Suisse', dial: '+41' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'US', name: 'États-Unis', dial: '+1' },
  { code: 'GB', name: 'Royaume-Uni', dial: '+44' },
  { code: 'DE', name: 'Allemagne', dial: '+49' },
  { code: 'IT', name: 'Italie', dial: '+39' },
  { code: 'ES', name: 'Espagne', dial: '+34' },
  { code: 'PT', name: 'Portugal', dial: '+351' },
  { code: 'NL', name: 'Pays-Bas', dial: '+31' },
  { code: 'MA', name: 'Maroc', dial: '+212' },
  { code: 'DZ', name: 'Algérie', dial: '+213' },
  { code: 'TN', name: 'Tunisie', dial: '+216' },
  { code: 'EG', name: 'Égypte', dial: '+20' },
  { code: 'ZA', name: 'Afrique du Sud', dial: '+27' },
  { code: 'AO', name: 'Angola', dial: '+244' },
  { code: 'MZ', name: 'Mozambique', dial: '+258' },
  { code: 'KE', name: 'Kenya', dial: '+254' },
  { code: 'ET', name: 'Éthiopie', dial: '+251' },
  { code: 'UG', name: 'Ouganda', dial: '+256' },
  { code: 'RW', name: 'Rwanda', dial: '+250' },
];

const TG = COUNTRIES[0];

function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 0x1F1E6 + char.charCodeAt(0) - 0x41);
  return String.fromCodePoint(...codePoints);
}

export function PhoneInput({ value, onChange, required, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Extraire l'indicatif et le numéro
  const { selectedCountry, phoneNumber } = useMemo(() => {
    for (const country of COUNTRIES) {
      if (value.startsWith(country.dial)) {
        return {
          selectedCountry: country,
          phoneNumber: value.slice(country.dial.length).trim(),
        };
      }
    }
    return { selectedCountry: TG, phoneNumber: value };
  }, [value]);

  const filtered = useMemo(
    () =>
      search
        ? COUNTRIES.filter(
            (c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.dial.includes(search) ||
              c.code.toLowerCase().includes(search.toLowerCase()),
          ).slice(0, 10)
        : COUNTRIES,
    [search],
  );

  const handleSelect = (country) => {
    setOpen(false);
    setSearch('');
    onChange(`${country.dial} ${phoneNumber}`);
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/[^0-9\s]/g, '');
    onChange(`${selectedCountry.dial} ${raw}`);
  };

  return (
    <div className="flex flex-col gap-2 text-sm font-medium text-text-dark">
      <span>Téléphone</span>
      <div className="relative flex items-center">
        {/* Sélecteur d'indicatif */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-11 items-center gap-1 rounded-l-[8px] border border-r-0 border-[#E0DBD5] bg-gray-50 px-3 text-sm font-medium text-text-dark outline-none transition hover:bg-gray-100"
            aria-label="Sélectionner le pays"
          >
            <span className="text-base leading-none">{getFlagEmoji(selectedCountry.code)}</span>
            <span className="hidden sm:inline">{selectedCountry.dial}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown des pays */}
          {open && (
            <div
              ref={dropdownRef}
              className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-[#E0DBD5] bg-white shadow-lg ring-1 ring-black/5"
            >
              {/* Recherche */}
              <div className="p-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un pays..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-accent"
                  autoFocus
                />
              </div>

              {/* Liste */}
              <div className="max-h-56 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-gray-400">Aucun pays trouvé</p>
                ) : (
                  filtered.map((country) => (
                    <button
                      key={`${country.code}-${country.dial}`}
                      type="button"
                      onClick={() => handleSelect(country)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                        selectedCountry.code === country.code && selectedCountry.dial === country.dial
                          ? 'bg-accent/5 font-medium text-accent'
                          : 'text-text-dark'
                      }`}
                    >
                      <span className="text-lg leading-none">{getFlagEmoji(country.code)}</span>
                      <span className="flex-1 truncate">{country.name}</span>
                      <span className="text-xs font-medium text-gray-400">{country.dial}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Champ numéro */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          required={required}
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder || '+228 90 00 00 00'}
          className="h-11 flex-1 rounded-r-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
        />
      </div>
    </div>
  );
}
