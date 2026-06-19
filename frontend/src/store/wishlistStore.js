import { create } from 'zustand';

import { readJSON, writeJSON } from '../utils/storage';

const WISHLIST_STORAGE_KEY = 'world-design-wishlist';

export const useWishlistStore = create((set, get) => ({
  items: [],
  loadFromStorage: () => {
    const stored = readJSON(WISHLIST_STORAGE_KEY, []);
    set({ items: Array.isArray(stored) ? stored : [] });
  },
  toggleItem: (product) => {
    const items = [...get().items];
    const index = items.findIndex((item) => item.id === product.id);

    if (index >= 0) {
      items.splice(index, 1);
    } else {
      items.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image_url: product.image_url || product.image,
        addedAt: Date.now(),
      });
    }

    set({ items });
    writeJSON(WISHLIST_STORAGE_KEY, items);
  },
  isWishlisted: (productId) => {
    return get().items.some((item) => item.id === productId);
  },
  removeItem: (productId) => {
    const items = get().items.filter((item) => item.id !== productId);
    set({ items });
    writeJSON(WISHLIST_STORAGE_KEY, items);
  },
  getCount: () => get().items.length,
}));