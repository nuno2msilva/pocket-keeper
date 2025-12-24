/**
 * Repository Pattern - Data Layer Abstraction
 * 
 * This module provides a clean abstraction over the data layer.
 * Currently uses localStorage, but can be easily swapped for Supabase/API.
 * 
 * To migrate to a database:
 * 1. Replace localStorage calls with API/Supabase calls
 * 2. Keep the same interface - no UI changes needed
 * 3. Add async/await if using API calls
 */

const STORAGE_KEYS = {
  categories: "expense-tracker-categories",
  subcategories: "expense-tracker-subcategories",
  merchants: "expense-tracker-merchants",
  products: "expense-tracker-products",
  receipts: "expense-tracker-receipts",
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

// Generic storage operations
export function getStoredData<T>(key: StorageKey, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEYS[key]);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStoredData<T>(key: StorageKey, value: T): void {
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
}

// Export/Import functionality
export function exportAllData(): string {
  const data = {
    categories: getStoredData("categories", []),
    subcategories: getStoredData("subcategories", []),
    merchants: getStoredData("merchants", []),
    products: getStoredData("products", []),
    receipts: getStoredData("receipts", []),
    exportedAt: new Date().toISOString(),
    version: "1.0",
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.version) {
      return { success: false, error: "Invalid data format" };
    }
    
    if (data.categories) setStoredData("categories", data.categories);
    if (data.subcategories) setStoredData("subcategories", data.subcategories);
    if (data.merchants) setStoredData("merchants", data.merchants);
    if (data.products) setStoredData("products", data.products);
    if (data.receipts) setStoredData("receipts", data.receipts);
    
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to parse JSON" };
  }
}

// ID generation (can be replaced with UUID or database-generated IDs)
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
