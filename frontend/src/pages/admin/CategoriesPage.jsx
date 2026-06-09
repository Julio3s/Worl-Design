import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Search, Tags, Trash2 } from 'lucide-react';

import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from '../../api/adminCategories';
import { AdminPage } from '../../components/admin/AdminPage';
import { CategoryFormModal } from '../../components/admin/CategoryFormModal';
import { ErrorState } from '../../components/ErrorState';
import { Modal } from '../../components/Modal';
import { TableSkeleton } from '../../components/skeletons/TableSkeleton';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useToastStore } from '../../store/toastStore';
import { getCategoryImage } from '../../utils/media';

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function CategoriesPage() {
  usePageTitle('Admin catégories');

  const showToast = useToastStore((state) => state.showToast);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminCategories({
        search: search.trim() || undefined,
      });
      setCategories(Array.isArray(data) ? data : []);
    } catch (caughtError) {
      setError(
        caughtError?.response?.data?.detail
          || caughtError?.message
          || 'Impossible de charger les catégories.',
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadCategories();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [loadCategories]);

  const handleCreate = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    if (editingCategory?.id) {
      await updateAdminCategory(editingCategory.id, payload);
      showToast('Catégorie mise à jour avec succès.');
    } else {
      await createAdminCategory(payload);
      showToast('Catégorie créée avec succès.');
    }

    await loadCategories();
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await deleteAdminCategory(deleteTarget.id);
      showToast('Catégorie supprimée.');
      setDeleteTarget(null);
      await loadCategories();
    } catch (caughtError) {
      showToast(
        caughtError?.response?.data?.detail || 'Impossible de supprimer la catégorie.',
        'error',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminPage
      title="Catégories"
      description="Créez, modifiez et supprimez les catégories visibles sur le site public."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une catégorie..."
            className="h-11 w-full rounded-[8px] border border-[#E0DBD5] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-accent"
          />
        </label>

        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter une catégorie
        </button>
      </div>

      {loading ? (
        <div className="mt-6">
          <TableSkeleton rows={6} columns={5} />
        </div>
      ) : error ? (
        <div className="mt-6">
          <ErrorState description={error} onRetry={loadCategories} />
        </div>
      ) : categories.length === 0 ? (
        <div className="mt-6 rounded-[8px] border border-dashed border-[#E0DBD5] bg-white px-6 py-10 text-center text-sm text-text-muted">
          Aucune catégorie trouvée pour cette recherche.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[8px] border border-[#E0DBD5] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#E0DBD5] bg-[#F8F5F0] text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Image</th>
                <th className="px-4 py-3 font-semibold">Nom</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Produits</th>
                <th className="px-4 py-3 font-semibold">Mise à jour</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-[#F1ECE6] last:border-0">
                  <td className="px-4 py-3">
                    <div className="h-14 w-20 overflow-hidden rounded-[8px] bg-[#F8F5F0]">
                      <img
                        src={getCategoryImage(category)}
                        alt={category.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-text-dark">{category.name}</td>
                  <td className="px-4 py-3 text-text-muted">{category.slug || '—'}</td>
                  <td className="px-4 py-3 text-text-dark">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8F5F0] px-3 py-1 text-xs font-semibold text-text-dark">
                      <Tags className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      {Number(category.product_count || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(category.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(category)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E0DBD5] text-primary transition hover:border-primary hover:bg-[#F8F5F0]"
                        aria-label={`Modifier ${category.name}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(category)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FEE2E2] text-accent transition hover:bg-[#FEE2E2]"
                        aria-label={`Supprimer ${category.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CategoryFormModal
        open={formOpen}
        category={editingCategory}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer la catégorie"
        footer={(
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="inline-flex items-center justify-center rounded-full border border-[#E0DBD5] bg-white px-5 py-2.5 text-sm font-semibold text-text-dark transition hover:border-accent hover:text-accent"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
            >
              {deleting ? 'Suppression...' : 'Confirmer'}
            </button>
          </div>
        )}
      >
        <p className="text-sm leading-7 text-text-muted">
          La catégorie <strong className="text-text-dark">{deleteTarget?.name}</strong> sera supprimée.
          Les produits associés resteront dans la base mais sans catégorie.
        </p>
      </Modal>
    </AdminPage>
  );
}
