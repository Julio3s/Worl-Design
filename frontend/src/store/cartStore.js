import { create } from 'zustand';

import { readJSON, writeJSON } from '../utils/storage';

const CART_STORAGE_KEY = 'world-design-cart';
const customFileCache = new Map();

function normalizeCustomFile(customFile) {
  if (!customFile) {
    return null;
  }

  if (typeof customFile === 'string') {
    return customFile;
  }

  if (typeof File !== 'undefined' && customFile instanceof File) {
    return customFile.name;
  }

  if (typeof customFile === 'object') {
    return customFile.name || customFile.fileName || null;
  }

  return null;
}

function makeItemKey(item) {
  return [item.productId, item.customText || '', item.customFileName || normalizeCustomFile(item.customFile) || ''].join('::');
}

function persistCart(items) {
  writeJSON(
    CART_STORAGE_KEY,
    items.map((item) => ({
      ...item,
      customFile: undefined,
      customFileName: item.customFileName || normalizeCustomFile(item.customFile),
      customFileType: item.customFileType || item.customFile?.type || null,
      customFileSize: item.customFileSize || item.customFile?.size || null,
    })),
  );
}

function resolveTargetKey(target) {
  if (target && typeof target === 'object') {
    return target.key || makeItemKey(target);
  }

  return String(target);
}

export const useCartStore = create((set, get) => ({
  items: [],
  loadFromStorage: () => {
    const storedItems = readJSON(CART_STORAGE_KEY, []);
    if (!Array.isArray(storedItems)) {
      set({ items: [] });
      return;
    }

    const normalizedItems = storedItems.map((item) => ({
      ...item,
      key: item.key || makeItemKey(item),
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
      customFileName: item.customFileName || normalizeCustomFile(item.customFile),
      isCustomizable: Boolean(item.isCustomizable || item.is_customizable),
    }));

    set({ items: normalizedItems });
  },
  addItem: (item, quantity = 1) => {
    const incomingFile = typeof File !== 'undefined' && item.customFile instanceof File ? item.customFile : null;
    const customFileName = item.customFileName || normalizeCustomFile(item.customFile);
    const nextItem = {
      ...item,
      quantity: Number(item.quantity || quantity || 1),
      price: Number(item.price || 0),
      customFile: undefined,
      customFileName,
      customFileType: item.customFileType || incomingFile?.type || null,
      customFileSize: item.customFileSize || incomingFile?.size || null,
      isCustomizable: Boolean(item.isCustomizable || item.is_customizable),
      key: item.key || makeItemKey({ ...item, customFileName }),
    };

    const items = [...get().items];
    const existingIndex = items.findIndex((entry) => entry.key === nextItem.key);

    if (existingIndex >= 0) {
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: items[existingIndex].quantity + nextItem.quantity,
      };
      if (incomingFile) {
        customFileCache.set(items[existingIndex].key, incomingFile);
      }
    } else {
      items.push(nextItem);
      if (incomingFile) {
        customFileCache.set(nextItem.key, incomingFile);
      }
    }

    set({ items });
    persistCart(items);
  },
  getCustomFile: (key) => customFileCache.get(key) || null,
  setCustomFile: (key, file) => {
    if (!key) {
      return;
    }

    if (file) {
      customFileCache.set(key, file);
      return;
    }

    customFileCache.delete(key);
  },
  removeItem: (target) => {
    const key = resolveTargetKey(target);
    customFileCache.delete(key);
    const items = get().items.filter((item) => item.key !== key && String(item.productId) !== key);
    set({ items });
    persistCart(items);
  },
  updateQuantity: (target, quantity) => {
    const key = resolveTargetKey(target);
    const nextQuantity = Number(quantity || 0);

    if (nextQuantity <= 0) {
      get().removeItem(target);
      return;
    }

    const items = get().items.map((item) => {
      if (item.key === key || String(item.productId) === key) {
        return {
          ...item,
          quantity: nextQuantity,
        };
      }

      return item;
    });

    set({ items });
    persistCart(items);
  },
  updateCustomText: (target, customText) => {
    const key = resolveTargetKey(target);
    const items = get().items.map((item) => {
      if (item.key === key || String(item.productId) === key) {
        return {
          ...item,
          customText: customText || '',
        };
      }

      return item;
    });

    set({ items });
    persistCart(items);
  },
  clearCart: () => {
    customFileCache.clear();
    set({ items: [] });
    persistCart([]);
  },
  getTotal: () => get().items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
  getCount: () => get().items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
}));
