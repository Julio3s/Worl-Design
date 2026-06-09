import { useState } from 'react';
import { ChevronDown, Upload, X } from 'lucide-react';

import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { validateCustomFile } from '../utils/customFileValidation';

export function CartItemCustomization({ item, product }) {
  const [expanded, setExpanded] = useState(false);
  const [, setFileRevision] = useState(0);
  const updateCustomText = useCartStore((state) => state.updateCustomText);
  const setCustomFile = useCartStore((state) => state.setCustomFile);
  const getCustomFile = useCartStore((state) => state.getCustomFile);
  const showToast = useToastStore((state) => state.showToast);

  const customFile = getCustomFile(item.key);
  const isCustomizable = Boolean(product?.is_customizable);

  if (!isCustomizable) {
    return null;
  }

  const handleTextChange = (e) => {
    updateCustomText(item.key, e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateCustomFile(file);
      if (validationError) {
        showToast(validationError, 'error');
        e.target.value = '';
        return;
      }

      setCustomFile(item.key, file);
      setFileRevision((current) => current + 1);
    }
  };

  const handleRemoveFile = () => {
    setCustomFile(item.key, null);
    setFileRevision((current) => current + 1);
  };

  return (
    <div className="mt-3 rounded-[6px] border border-gold/30 bg-gold/5">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-accent hover:bg-gold/10"
      >
        <span>⚙️ Personnalisation</span>
        <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-gold/30 px-3 py-3">
          {/* Texte de personnalisation */}
          <div>
            <label className="block text-xs font-semibold text-text-muted">
              {product.customization_hint || 'Texte de personnalisation'}
            </label>
            <textarea
              value={item.customText || ''}
              onChange={handleTextChange}
              placeholder={product.customization_hint || 'Décrivez comment personnaliser ce produit...'}
              className="mt-1 h-20 w-full resize-none rounded-[6px] border border-[#E0DBD5] bg-white px-2 py-2 text-xs outline-none transition focus:border-accent"
            />
            <p className="mt-1 text-xs text-text-muted">
              {item.customText?.length || 0}/500 caractères
            </p>
          </div>

          {/* Upload fichier */}
          <div>
            <label className="block text-xs font-semibold text-text-muted">Logo ou fichier (optionnel)</label>
            {customFile ? (
              <div className="mt-1 flex items-center gap-2 rounded-[6px] border border-[#D1FAE5] bg-[#D1FAE5]/20 px-2 py-2">
                <span className="flex-1 truncate text-xs font-medium text-text-dark">
                  ✓ {customFile.name}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-red-300 text-red-600 hover:bg-red-50"
                  title="Supprimer le fichier"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-[6px] border border-dashed border-[#E0DBD5] bg-white px-3 py-2 transition hover:border-accent hover:bg-cream">
                <Upload className="h-4 w-4 text-text-muted" />
                <span className="text-xs font-medium text-text-muted">JPG, PNG, PDF, AI, SVG (max 10 MB)</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.ai,.svg"
                  className="hidden"
                  aria-label="Uploader un fichier personnalisé"
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
