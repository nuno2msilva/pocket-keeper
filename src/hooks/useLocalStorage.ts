import { useState, useEffect, useCallback } from "react";
import { Category, Merchant, Product, Receipt } from "@/types/expense";
import { sampleCategories, sampleMerchants, sampleProducts, sampleReceipts } from "@/data/sampleData";

const STORAGE_KEYS = {
  categories: "expense-tracker-categories",
  merchants: "expense-tracker-merchants",
  products: "expense-tracker-products",
  receipts: "expense-tracker-receipts",
};

function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredData<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() =>
    getStoredData(STORAGE_KEYS.categories, sampleCategories)
  );

  useEffect(() => {
    setStoredData(STORAGE_KEYS.categories, categories);
  }, [categories]);

  const addCategory = useCallback((category: Omit<Category, "id">) => {
    const newCategory = { ...category, id: `cat-${Date.now()}` };
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

  return { categories, addCategory, updateCategory, deleteCategory };
}

export function useMerchants() {
  const [merchants, setMerchants] = useState<Merchant[]>(() =>
    getStoredData(STORAGE_KEYS.merchants, sampleMerchants)
  );

  useEffect(() => {
    setStoredData(STORAGE_KEYS.merchants, merchants);
  }, [merchants]);

  const addMerchant = useCallback((merchant: Omit<Merchant, "id">) => {
    const newMerchant = { ...merchant, id: `mer-${Date.now()}` };
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

  return { merchants, addMerchant, updateMerchant, deleteMerchant, findMerchantByNif };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() =>
    getStoredData(STORAGE_KEYS.products, sampleProducts)
  );

  useEffect(() => {
    setStoredData(STORAGE_KEYS.products, products);
  }, [products]);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const newProduct = { ...product, id: `prod-${Date.now()}` };
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

  return { products, addProduct, updateProduct, deleteProduct };
}

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>(() =>
    getStoredData(STORAGE_KEYS.receipts, sampleReceipts.map(r => ({ ...r, hasCustomerNif: false })))
  );

  useEffect(() => {
    setStoredData(STORAGE_KEYS.receipts, receipts);
  }, [receipts]);

  const addReceipt = useCallback((receipt: Omit<Receipt, "id">) => {
    const newReceipt = { ...receipt, id: `rec-${Date.now()}` };
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

  return { receipts, addReceipt, updateReceipt, deleteReceipt };
}
