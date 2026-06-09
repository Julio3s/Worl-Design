import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';

import { formatProductError } from '../../api/adminProducts';
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
    } else {
      setForm(EMPTY_FORM);
      setImagePreview('');
    }

    setImageFile(null);
    setError('');
  }, [open, product]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category || null,
        imageFile,
      });
      onClose();
    } catch (caughtError) {
      setError(formatProductError(caughtError));
    } finally {
      setSubmitting(false);
    }
  };

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
          <span className="text-sm font-medium text-text-dark">Image produit</span>
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
