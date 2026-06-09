import { useEffect, useState } from 'react';

import { formatCategoryError } from '../../api/adminCategories';
import { Modal } from '../Modal';
import { getCategoryImage } from '../../utils/media';

const EMPTY_FORM = {
  name: '',
  slug: '',
  imagePublicId: '',
  image: null,
};

export function CategoryFormModal({ open, category, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(category?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (category) {
      setForm({
        name: category.name || '',
        slug: category.slug || '',
        imagePublicId: '',
        image: null,
      });
      setImagePreview(getCategoryImage(category));
    } else {
      setForm(EMPTY_FORM);
      setImagePreview('');
    }
    setError('');
  }, [open, category]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm((current) => ({ ...current, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result || '');
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onSubmit({ ...form });
      onClose();
    } catch (caughtError) {
      setError(formatCategoryError(caughtError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
      size="md"
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
            form="admin-category-form"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer la catégorie'}
          </button>
        </div>
      )}
    >
      <form id="admin-category-form" onSubmit={handleSubmit} className="space-y-4">
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
          <span>Slug</span>
          <input
            value={form.slug}
            onChange={handleChange('slug')}
            placeholder="Laisser vide pour générer automatiquement"
            className="h-11 rounded-[8px] border border-[#E0DBD5] px-3 outline-none transition focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
          <span>Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="h-11 rounded-[8px] border border-[#E0DBD5] px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
          <span>Ou Cloudinary public ID</span>
          <input
            value={form.imagePublicId}
            onChange={handleChange('imagePublicId')}
            placeholder="YKAdWXVIA8s_DyRFcv6w2CgstYQ"
            className="h-11 rounded-[8px] border border-[#E0DBD5] px-3 outline-none transition focus:border-accent"
          />
        </label>

        <div className="space-y-3">
          <span className="text-sm font-medium text-text-dark">Aperçu actuel</span>
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Aperçu catégorie"
              className="h-56 w-24 rounded-[8px] object-cover"
            />
          ) : (
            <div className="flex h-56 w-24 items-center justify-center rounded-[8px] border border-dashed border-[#E0DBD5] bg-[#F8F5F0] text-xs text-text-muted">
              Aucune image
            </div>
          )}
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
