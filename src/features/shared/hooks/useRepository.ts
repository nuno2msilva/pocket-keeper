import { useState, useEffect, useCallback } from "react";
import { Category, Subcategory, Merchant, Product, Receipt } from "../types";
import { getStoredData, setStoredData, generateId } from "../data/repository";
import { DEFAULT_CATEGORIES, DEFAULT_SUBCATEGORIES, SAMPLE_MERCHANTS, SAMPLE_PRODUCTS, SAMPLE_RECEIPTS } from "../data/defaultCategories";

// Categories Hook - Users can edit, add, and delete custom categories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() =>
    getStoredData("categories", DEFAULT_CATEGORIES)
  );

  useEffect(() => {
    setStoredData("categories", categories);
  }, [categories]);

  const addCategory = useCallback((category: Omit<Category, "id">) => {
    const newCategory = { ...category, id: generateId("cat") };
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Reset to default categories
  const resetToDefaults = useCallback(() => {
    setCategories(DEFAULT_CATEGORIES);
  }, []);

  return { categories, addCategory, updateCategory, deleteCategory, resetToDefaults };
}

// Subcategories Hook - User-created, auto-deleted when empty
export function useSubcategories() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>(() =>
    getStoredData("subcategories", DEFAULT_SUBCATEGORIES)
  );

  useEffect(() => {
    setStoredData("subcategories", subcategories);
  }, [subcategories]);

  const addSubcategory = useCallback((subcategory: Omit<Subcategory, "id">) => {
    const newSubcategory = { ...subcategory, id: generateId("subcat") };
    setSubcategories((prev) => [...prev, newSubcategory]);
    return newSubcategory;
  }, []);

  const updateSubcategory = useCallback((id: string, updates: Partial<Subcategory>) => {
    setSubcategories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const deleteSubcategory = useCallback((id: string) => {
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const getSubcategoriesByCategory = useCallback((categoryId: string) => {
    return subcategories.filter((s) => s.parentCategoryId === categoryId);
  }, [subcategories]);

  // Clean up subcategories that have no products (called automatically by useProducts)
  const cleanupEmptySubcategories = useCallback((usedSubcategoryIds: Set<string>) => {
    setSubcategories((prev) => {
      const filtered = prev.filter((s) => usedSubcategoryIds.has(s.id));
      // Only update if something changed
      if (filtered.length !== prev.length) {
        return filtered;
      }
      return prev;
    });
  }, []);

  return { 
    subcategories, 
    addSubcategory, 
    updateSubcategory, 
    deleteSubcategory, 
    getSubcategoriesByCategory,
    cleanupEmptySubcategories 
  };
}

// Merchants Hook - With limbo state like products
export function useMerchants() {
  const [merchants, setMerchants] = useState<Merchant[]>(() =>
    getStoredData("merchants", SAMPLE_MERCHANTS)
  );

  useEffect(() => {
    setStoredData("merchants", merchants);
  }, [merchants]);

  const addMerchant = useCallback((merchant: Omit<Merchant, "id">) => {
    const newMerchant = { ...merchant, id: generateId("mer") };
    setMerchants((prev) => [...prev, newMerchant]);
    return newMerchant;
  }, []);

  const updateMerchant = useCallback((id: string, updates: Partial<Merchant>) => {
    setMerchants((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const deleteMerchant = useCallback((id: string) => {
    setMerchants((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const findMerchantByNif = useCallback((nif: string) => {
    return merchants.find((m) => m.nif === nif);
  }, [merchants]);

  const findMerchantByName = useCallback((name: string) => {
    const lowerName = name.toLowerCase().trim();
    return merchants.find((m) => m.name.toLowerCase() === lowerName);
  }, [merchants]);

  // Fuzzy search for merchant suggestions
  const searchMerchants = useCallback((query: string): Merchant[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase().trim();
    
    return merchants
      .filter((m) => m.name.toLowerCase().includes(lowerQuery))
      .slice(0, 6);
  }, [merchants]);

  // Auto-create merchant when used in receipt
  const getOrCreateMerchant = useCallback((name: string, nif?: string): Merchant => {
    // First try to find by NIF
    if (nif) {
      const byNif = findMerchantByNif(nif);
      if (byNif) return byNif;
    }
    
    // Then try by name
    const existing = findMerchantByName(name);
    if (existing) return existing;
    
    // Create new merchant in limbo state
    const newMerchant: Merchant = {
      id: generateId("mer"),
      name: name.trim(),
      nif,
      isSolidified: false,
    };
    setMerchants((prev) => [...prev, newMerchant]);
    return newMerchant;
  }, [findMerchantByNif, findMerchantByName]);

  return { 
    merchants, 
    addMerchant, 
    updateMerchant, 
    deleteMerchant, 
    findMerchantByNif,
    findMerchantByName,
    searchMerchants,
    getOrCreateMerchant 
  };
}

// Products Hook - with auto-cleanup of empty subcategories
export function useProducts(onSubcategoryCleanup?: (usedIds: Set<string>) => void) {
  const [products, setProducts] = useState<Product[]>(() =>
    getStoredData("products", SAMPLE_PRODUCTS)
  );

  useEffect(() => {
    setStoredData("products", products);
    // Trigger subcategory cleanup when products change
    if (onSubcategoryCleanup) {
      const usedSubcategoryIds = new Set(
        products.filter(p => p.subcategoryId).map(p => p.subcategoryId!)
      );
      onSubcategoryCleanup(usedSubcategoryIds);
    }
  }, [products, onSubcategoryCleanup]);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const newProduct = { ...product, id: generateId("prod") };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const findProductByName = useCallback((name: string) => {
    const lowerName = name.toLowerCase().trim();
    return products.find((p) => p.name.toLowerCase() === lowerName);
  }, [products]);

  // Fuzzy search for product suggestions
  const searchProducts = useCallback((query: string): Product[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase().trim();
    
    return products
      .filter((p) => {
        const lowerName = p.name.toLowerCase();
        if (lowerName.includes(lowerQuery)) return true;
        
        let queryIdx = 0;
        for (const char of lowerName) {
          if (char === lowerQuery[queryIdx]) {
            queryIdx++;
            if (queryIdx === lowerQuery.length) return true;
          }
        }
        return false;
      })
      .slice(0, 8);
  }, [products]);

  const getOrCreateProduct = useCallback((name: string): Product => {
    const existing = findProductByName(name);
    if (existing) return existing;
    
    const newProduct: Product = {
      id: generateId("prod"),
      name: name.trim(),
      isSolidified: false,
    };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  }, [findProductByName]);

  // Find product by barcode
  const findProductByBarcode = useCallback((barcode: string) => {
    return products.find((p) => p.barcode === barcode);
  }, [products]);

  return { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    findProductByName, 
    searchProducts,
    getOrCreateProduct,
    findProductByBarcode
  };
}

// Receipts Hook
export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>(() =>
    getStoredData("receipts", SAMPLE_RECEIPTS)
  );

  useEffect(() => {
    setStoredData("receipts", receipts);
  }, [receipts]);

  const addReceipt = useCallback((receipt: Omit<Receipt, "id">) => {
    const newReceipt = { ...receipt, id: generateId("rec") };
    setReceipts((prev) => [...prev, newReceipt]);
    return newReceipt;
  }, []);

  const updateReceipt = useCallback((id: string, updates: Partial<Receipt>) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const deleteReceipt = useCallback((id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getReceiptById = useCallback((id: string) => {
    return receipts.find((r) => r.id === id);
  }, [receipts]);

  return { receipts, addReceipt, updateReceipt, deleteReceipt, getReceiptById };
}
