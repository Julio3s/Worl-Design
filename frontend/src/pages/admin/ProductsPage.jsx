import { useCallback, useEffect, useState } from 'react';
import { EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';

import {
  createAdminProduct,
  deactivateAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from '../../api/adminProducts';
import { getCategories } from '../../api/catalog';
import { AdminPage } from '../../components/admin/AdminPage';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { ErrorState } from '../../components/ErrorState';
import FilterDrawer from '../../components/FilterDrawer';
import { TableSkeleton } from '../../components/skeletons/TableSkeleton';
import { Modal } from '../../components/Modal';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { getProductImage } from '../../utils/media';

const PAGE_SIZE = 1000;

function StatusBadge({ active }) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        active ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]',
      ].join(' ')}
    >
      {active ? 'Actif' : 'Inactif'}
    </span>
  );
}

export default function ProductsPage() {
  usePageTitle('Admin produits');

  const showToast = useToastStore((state) => state.showToast);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {
      page_size: PAGE_SIZE,
    };

    if (search.trim()) {
      params.search = search.trim();
    }
    if (categoryFilter) {
      params.category = categoryFilter;
    }
    if (statusFilter) {
      params.is_active = statusFilter;
    }

    try {
      const data = await getAdminProducts(params);
      setProducts(Array.isArray(data.results) ? data.results : []);
    } catch (caughtError) {
      setError(
        caughtError?.response?.data?.detail
          || caughtError?.message
          || 'Impossible de charger les produits.',
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search, statusFilter]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadProducts();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [loadProducts]);

  const handleCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    if (editingProduct?.id) {
      await updateAdminProduct(editingProduct.id, payload);
      showToast('Produit mis à jour avec succès.');
    } else {
      await createAdminProduct(payload);
      showToast('Produit créé avec succès.');
    }

    await loadProducts();
  };

  const handleToggleFeatured = async (product) => {
    try {
      await updateAdminProduct(product.id, {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        is_active: product.is_active,
        is_featured: !product.is_featured,
        is_customizable: product.is_customizable,
        customization_hint: product.customization_hint || '',
        imagesData: (product.images || []).map((img, idx) => ({
          public_id: img.image_url || '',
          order: idx,
          media_type: img.media_type || 'image',
        })),
      });
      showToast(product.is_featured ? 'Produit retiré des vedettes.' : 'Produit mis en vedette.');
      await loadProducts();
    } catch (caughtError) {
      showToast(
        caughtError?.response?.data?.detail || 'Impossible de modifier le statut vedette.',
        'error',
      );
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) {
      return;
    }

    setDeactivating(true);
    try {
      await deactivateAdminProduct(deactivateTarget.id);
      showToast('Produit désactivé.');
      setDeactivateTarget(null);
      await loadProducts();
    } catch (caughtError) {
      showToast(
        caughtError?.response?.data?.detail || 'Impossible de désactiver le produit.',
        'error',
      );
    } finally {
      setDeactivating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await deleteAdminProduct(deleteTarget.id);
      showToast('Produit supprimé définitivement.');
      setDeleteTarget(null);
      await loadProducts();
    } catch (caughtError) {
      showToast(
        caughtError?.response?.data?.detail || 'Impossible de supprimer le produit.',
        'error',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminPage
      title="Produits"
      description="Gérez le catalogue, les stocks et la visibilité des produits."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FilterDrawer label="Filtrer ici">
            <div className="space-y-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
                <span>Recherche</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher un produit..."
                  className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
                <span>Catégorie</span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
                <span>Statut</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
                >
                  <option value="">Tous les statuts</option>
                  <option value="true">Actifs</option>
                  <option value="false">Inactifs</option>
                </select>
              </label>
            </div>
          </FilterDrawer>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter un produit
        </button>
      </div>

      {loading ? (
        <div className="mt-6">
          <TableSkeleton rows={8} columns={7} />
        </div>
      ) : error ? (
        <div className="mt-6">
          <ErrorState description={error} onRetry={loadProducts} />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6 rounded-[8px] border border-dashed border-[#E0DBD5] bg-white px-6 py-10 text-center text-sm text-text-muted">
          Aucun produit trouvé pour ces filtres.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[8px] border border-[#E0DBD5] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#E0DBD5] bg-[#F8F5F0] text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Image</th>
                <th className="px-4 py-3 font-semibold">Nom</th>
                <th className="px-4 py-3 font-semibold">Catégorie</th>
                <th className="px-4 py-3 font-semibold">Prix</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-[#F1ECE6] last:border-0">
                  <td className="px-4 py-3">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="h-10 w-10 rounded-[8px] object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-text-dark">{product.name}</td>
                  <td className="px-4 py-3 text-text-muted">{product.category_name || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-price">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3 text-text-dark">{product.stock}</td>
                  <td className="px-4 py-3">
                    <StatusBadge active={product.is_active} />
                  </td>
                   <td className="px-4 py-3">
                     <div className="flex items-center gap-2">
                       <button
                         type="button"
                         onClick={() => handleToggleFeatured(product)}
                         className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                           product.is_featured
                             ? 'border-[#FEF3C7] bg-[#FEF3C7] text-[#D97706]'
                             : 'border-[#E0DBD5] text-text-muted hover:border-[#FEF3C7] hover:text-[#D97706]'
                         }`}
                         aria-label={product.is_featured ? `Retirer ${product.name} des vedettes` : `Mettre ${product.name} en vedette`}
                         title={product.is_featured ? 'Retirer des vedettes' : 'Mettre en vedette'}
                       >
                         <Star className={`h-4 w-4 ${product.is_featured ? 'fill-[#D97706]' : ''}`} aria-hidden="true" />
                       </button>
                       <button
                         type="button"
                         onClick={() => handleEdit(product)}
                         className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E0DBD5] text-primary transition hover:border-primary hover:bg-[#F8F5F0]"
                         aria-label={`Modifier ${product.name}`}
                       >
                         <Pencil className="h-4 w-4" aria-hidden="true" />
                       </button>
                       {product.is_active ? (
                         <button
                           type="button"
                           onClick={() => setDeactivateTarget(product)}
                           className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FEE2E2] text-accent transition hover:bg-[#FEE2E2]"
                           aria-label={`Désactiver ${product.name}`}
                         >
                           <EyeOff className="h-4 w-4" aria-hidden="true" />
                         </button>
                       ) : null}
                       <button
                         type="button"
                         onClick={() => setDeleteTarget(product)}
                         className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FEE2E2] text-[#991B1B] transition hover:bg-[#FEE2E2]"
                         aria-label={`Supprimer ${product.name}`}
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

      <ProductFormModal
        open={formOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <Modal
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        title="Désactiver le produit"
        footer={(
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeactivateTarget(null)}
              className="inline-flex items-center justify-center rounded-full border border-[#E0DBD5] bg-white px-5 py-2.5 text-sm font-semibold text-text-dark transition hover:border-accent hover:text-accent"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={deactivating}
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
            >
              {deactivating ? 'Désactivation...' : 'Confirmer'}
            </button>
          </div>
        )}
      >
        <p className="text-sm leading-7 text-text-muted">
          Le produit <strong className="text-text-dark">{deactivateTarget?.name}</strong> sera
          retiré du site public mais restera visible dans l'administration.
        </p>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le produit"
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
              className="inline-flex items-center justify-center rounded-full bg-[#991B1B] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
            >
              {deleting ? 'Suppression...' : 'Supprimer définitivement'}
            </button>
          </div>
        )}
      >
        <p className="text-sm leading-7 text-text-muted">
          Êtes-vous sûr de vouloir supprimer définitivement le produit
          <strong className="text-text-dark"> {deleteTarget?.name}</strong> ?
          Cette action est irréversible.
        </p>
      </Modal>
    </AdminPage>
  );
}
