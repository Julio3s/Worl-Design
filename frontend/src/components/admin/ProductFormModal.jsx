import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';

import { formatProductError } from '../../api/adminProducts';
import { optimizeImage } from '../../utils/imageOptimizer';
import { Modal } from '../Modal';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  category: '',
  is_active: true,
  is_featured: false,
  is_customizable: false,
  customization_hint: '',
};

function ExtraImageRow({ preview, order, onRemove }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-[#E0DBD5] bg-[#F8F5F0] px-3 py-2">
      <img
        src={preview}
        alt={`Image ${order + 1}`}
        className="h-14 w-14 rounded-[6px] object-cover"
      />
      <span className="flex-1 text-sm text-text-muted">Image {order + 1}</span>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-accent transition hover:bg-[#FEE2E2]"
        aria-label="Supprimer cette image"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ProductFormModal({
  open,
  product,
  categories,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [extraImages, setExtraImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(product?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: String(product.price ?? ''),
        stock: String(product.stock ?? 0),
        category: product.category ? String(product.category) : '',
        is_active: Boolean(product.is_active),
        is_featured: Boolean(product.is_featured),
        is_customizable: Boolean(product.is_customizable),
        customization_hint: product.customization_hint || '',
      });
      setImagePreview(product.image_url || '');
      const imgs = (product.images || []).map((img) => ({
        id: img.id,
        image_url: img.image_url,
        order: img.order,
      }));
      setExistingImages(imgs);
      setRemovedImageIds([]);
    } else {
      setForm(EMPTY_FORM);
      setImagePreview('');
      setExistingImages([]);
      setRemovedImageIds([]);
    }

    setImageFile(null);
    setExtraImages([]);
    setError('');
  }, [open, product]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const optimizedFile = await optimizeImage(file);
      setImageFile(optimizedFile);
      setImagePreview(URL.createObjectURL(optimizedFile));
    } catch (error) {
      console.error('Image optimization failed:', error);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddExtraImage = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const optimizedFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        try {
          const optimized = await optimizeImage(file);
          return {
            file: optimized,
            preview: URL.createObjectURL(optimized),
          };
        } catch (error) {
          console.error('Image optimization failed:', error);
          return {
            file,
            preview: URL.createObjectURL(file),
          };
        }
      })
    );

    setExtraImages((prev) => [...prev, ...optimizedFiles]);
    event.target.value = '';
  };

  const handleRemoveExtraImage = (index) => {
    setExtraImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleRemoveExistingImage = useCallback((imageId) => {
    setRemovedImageIds((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    // Métadonnées des images existantes conservées (JSON-safe)
    const imagesData = existingImages.map((img, idx) => ({
      public_id: img.image_url || '',
      order: idx,
      media_type: 'image',
    }));

    // Fichiers des nouvelles images (indices séquentiels à partir de 0)
    const newFiles = extraImages.map((item, idx) => ({
      index: idx,
      file: item.file,
    }));

    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category || null,
        imageFile,
        imagesData,
        newImageFiles: newFiles,
      });
      onClose();
    } catch (caughtError) {
      setError(formatProductError(caughtError));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      extraImages.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [extraImages]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le produit' : 'Ajouter un produit'}
      size="lg"
      footer={(
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-[#E0DBD5] bg-white px-5 py-2.5 text-sm font-semibold text-text-dark transition hover:border-accent hover:text-accent"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="admin-product-form"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le produit'}
          </button>
        </div>
      )}
    >
      <form id="admin-product-form" onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
          <span>Nom</span>
          <input
            required
            value={form.name}
            onChange={handleChange('name')}
            className="h-11 rounded-[8px] border border-[#E0DBD5] px-3 outline-none transition focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
          <span>Description</span>
          <textarea
            required
            value={form.description}
            onChange={handleChange('description')}
            className="min-h-28 rounded-[8px] border border-[#E0DBD5] px-3 py-3 outline-none transition focus:border-accent"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
            <span>Prix (XOF)</span>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={form.price}
              onChange={handleChange('price')}
              className="h-11 rounded-[8px] border border-[#E0DBD5] px-3 outline-none transition focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
            <span>Stock</span>
            <input
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={handleChange('stock')}
              className="h-11 rounded-[8px] border border-[#E0DBD5] px-3 outline-none transition focus:border-accent"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
          <span>Catégorie</span>
          <select
            value={form.category}
            onChange={handleChange('category')}
            className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 outline-none transition focus:border-accent"
          >
            <option value="">Sans catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-3 rounded-[8px] border border-[#E0DBD5] p-4">
          <label className="flex items-center justify-between gap-3 text-sm font-medium text-text-dark">
            <span>Produit personnalisable</span>
            <input
              type="checkbox"
              checked={form.is_customizable}
              onChange={handleChange('is_customizable')}
              className="h-4 w-4 accent-accent"
            />
          </label>

          {form.is_customizable ? (
            <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
              <span>Texte d'aide personnalisation</span>
              <input
                value={form.customization_hint}
                onChange={handleChange('customization_hint')}
                placeholder="Ex: Inscrivez le nom de votre entreprise"
                className="h-11 rounded-[8px] border border-[#E0DBD5] px-3 outline-none transition focus:border-accent"
              />
            </label>
          ) : null}
        </div>

        <div className="space-y-3">
          <span className="text-sm font-medium text-text-dark">Image principale</span>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[8px] border border-dashed border-[#E0DBD5] bg-[#F8F5F0] px-4 py-8 text-center transition hover:border-accent">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Aperçu produit"
                className="h-32 w-32 rounded-[8px] object-cover"
              />
            ) : (
              <Upload className="h-8 w-8 text-text-muted" aria-hidden="true" />
            )}
            <span className="text-sm text-text-muted">
              Cliquez pour choisir une image ou glissez-déposez
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        {/* Images supplémentaires */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-dark">Images supplémentaires</span>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#E0DBD5] bg-white px-3 py-1.5 text-xs font-semibold text-text-dark transition hover:border-accent hover:text-accent">
              <Plus className="h-3.5 w-3.5" />
              Ajouter
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddExtraImage} />
            </label>
          </div>

          {existingImages.length > 0 || extraImages.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {existingImages.map((img) => (
                <ExtraImageRow
                  key={`existing-${img.id}`}
                  preview={img.image_url}
                  order={img.order}
                  onRemove={() => handleRemoveExistingImage(img.id)}
                />
              ))}
              {extraImages.map((item, idx) => (
                <ExtraImageRow
                  key={`new-${idx}`}
                  preview={item.preview}
                  order={existingImages.length + idx}
                  onRemove={() => handleRemoveExtraImage(idx)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">Aucune image supplémentaire. Ajoutez-en pour enrichir la page détail.</p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-3 rounded-[8px] border border-[#E0DBD5] px-4 py-3 text-sm font-medium text-text-dark">
            <span>Produit actif</span>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={handleChange('is_active')}
              className="h-4 w-4 accent-accent"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-[8px] border border-[#E0DBD5] px-4 py-3 text-sm font-medium text-text-dark">
            <span>Produit vedette</span>
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={handleChange('is_featured')}
              className="h-4 w-4 accent-accent"
            />
          </label>
        </div>

        {error ? (
          <p className="rounded-[8px] border border-[#FEE2E2] bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
