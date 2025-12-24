/**
 * Demo Data for First-Time Users
 * 
 * Provides sample data to help users explore the app's features.
 * Only loads if no existing data is found.
 */

import type { Merchant, Product, Receipt, Category, Subcategory } from "../types";
import { setStoredData, getStoredData } from "./repository";
import { DEFAULT_CATEGORIES, DEFAULT_SUBCATEGORIES } from "./defaultCategories";

const DEMO_MERCHANTS: Merchant[] = [
  { id: "merchant-demo-1", name: "Continente", nif: "500100144", address: "Av. da Liberdade 123, Lisboa", isSolidified: true },
  { id: "merchant-demo-2", name: "Pingo Doce", nif: "500829993", address: "Rua Augusta 45, Lisboa", isSolidified: true },
  { id: "merchant-demo-3", name: "Lidl", nif: "500917351", address: "Praça do Comércio 78, Lisboa", isSolidified: true },
  { id: "merchant-demo-4", name: "Worten", nif: "502584951", address: "Centro Comercial Colombo, Lisboa", isSolidified: true },
  { id: "merchant-demo-5", name: "Galp", nif: "504499777", address: "Av. da República 200, Lisboa", isSolidified: true },
  { id: "merchant-demo-6", name: "Zara", nif: "503264032", address: "Rua Garrett 15, Lisboa", isSolidified: true },
];

const DEMO_PRODUCTS: Product[] = [
  { id: "product-demo-1", name: "Milk 1L", categoryId: "cat-groceries", subcategoryId: "subcat-dairy", defaultPrice: 0.89, isSolidified: true },
  { id: "product-demo-2", name: "Bread", categoryId: "cat-groceries", subcategoryId: "subcat-bakery", defaultPrice: 1.29, isSolidified: true },
  { id: "product-demo-3", name: "Eggs (12)", categoryId: "cat-groceries", subcategoryId: "subcat-dairy", defaultPrice: 2.49, isSolidified: true },
  { id: "product-demo-4", name: "Chicken Breast", categoryId: "cat-groceries", subcategoryId: "subcat-meat", defaultPrice: 9.99, isWeighted: true, isSolidified: true },
  { id: "product-demo-5", name: "Rice 1kg", categoryId: "cat-groceries", defaultPrice: 1.59, isSolidified: true },
  { id: "product-demo-6", name: "Olive Oil 750ml", categoryId: "cat-groceries", subcategoryId: "subcat-beverages", defaultPrice: 5.99, isSolidified: true },
  { id: "product-demo-7", name: "Coffee 250g", categoryId: "cat-groceries", subcategoryId: "subcat-beverages", defaultPrice: 3.49, isSolidified: true },
  { id: "product-demo-8", name: "Butter 250g", categoryId: "cat-groceries", subcategoryId: "subcat-dairy", defaultPrice: 2.19, isSolidified: true },
  { id: "product-demo-9", name: "Gasoline 95", categoryId: "cat-transport", subcategoryId: "subcat-fuel", defaultPrice: 1.75, isSolidified: true, excludeFromPriceHistory: true },
  { id: "product-demo-10", name: "Metro Ticket", categoryId: "cat-transport", subcategoryId: "subcat-publictransport", defaultPrice: 1.65, isSolidified: true },
  { id: "product-demo-11", name: "USB-C Cable", categoryId: "cat-shopping", subcategoryId: "subcat-electronics", defaultPrice: 12.99, isSolidified: true },
  { id: "product-demo-12", name: "Wireless Mouse", categoryId: "cat-shopping", subcategoryId: "subcat-electronics", defaultPrice: 24.99, isSolidified: true },
  { id: "product-demo-13", name: "T-Shirt", categoryId: "cat-shopping", subcategoryId: "subcat-clothing", defaultPrice: 15.99, isSolidified: true },
  { id: "product-demo-14", name: "Jeans", categoryId: "cat-shopping", subcategoryId: "subcat-clothing", defaultPrice: 39.99, isSolidified: true },
  { id: "product-demo-15", name: "Movie Ticket", categoryId: "cat-entertainment", defaultPrice: 7.50, isSolidified: true },
  { id: "product-demo-16", name: "Apples", categoryId: "cat-groceries", subcategoryId: "subcat-produce", defaultPrice: 2.49, isWeighted: true, isSolidified: true },
  { id: "product-demo-17", name: "Salmon Fillet", categoryId: "cat-groceries", subcategoryId: "subcat-meat", defaultPrice: 18.99, isWeighted: true, isSolidified: true },
];

// Generate dates for the last 3 months
function getDateOffset(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

const DEMO_RECEIPTS: Receipt[] = [
  // Recent grocery shopping
  {
    id: "receipt-demo-1",
    merchantId: "merchant-demo-1",
    date: getDateOffset(1),
    time: "14:30",
    hasCustomerNif: true,
    customerNif: "123456789",
    items: [
      { id: "item-1", productId: "product-demo-1", productName: "Milk 1L", quantity: 2, unitPrice: 0.89, total: 1.78 },
      { id: "item-2", productId: "product-demo-2", productName: "Bread", quantity: 1, unitPrice: 1.29, total: 1.29 },
      { id: "item-3", productId: "product-demo-3", productName: "Eggs (12)", quantity: 1, unitPrice: 2.49, total: 2.49 },
      { id: "item-4", productId: "product-demo-4", productName: "Chicken Breast 500g", quantity: 2, unitPrice: 4.99, total: 9.98 },
    ],
    total: 15.54,
  },
  {
    id: "receipt-demo-2",
    merchantId: "merchant-demo-2",
    date: getDateOffset(3),
    time: "10:15",
    hasCustomerNif: false,
    items: [
      { id: "item-5", productId: "product-demo-5", productName: "Rice 1kg", quantity: 2, unitPrice: 1.59, total: 3.18 },
      { id: "item-6", productId: "product-demo-6", productName: "Olive Oil 750ml", quantity: 1, unitPrice: 5.99, total: 5.99 },
      { id: "item-7", productId: "product-demo-7", productName: "Coffee 250g", quantity: 1, unitPrice: 3.49, total: 3.49 },
    ],
    total: 12.66,
  },
  // Gas station
  {
    id: "receipt-demo-3",
    merchantId: "merchant-demo-5",
    date: getDateOffset(5),
    time: "08:45",
    hasCustomerNif: true,
    customerNif: "123456789",
    items: [
      { id: "item-8", productId: "product-demo-9", productName: "Gasoline 95", quantity: 35, unitPrice: 1.75, total: 61.25, excludeFromPriceHistory: true },
    ],
    total: 61.25,
  },
  // Electronics
  {
    id: "receipt-demo-4",
    merchantId: "merchant-demo-4",
    date: getDateOffset(10),
    time: "16:00",
    hasCustomerNif: false,
    items: [
      { id: "item-9", productId: "product-demo-11", productName: "USB-C Cable", quantity: 2, unitPrice: 12.99, total: 25.98 },
      { id: "item-10", productId: "product-demo-12", productName: "Wireless Mouse", quantity: 1, unitPrice: 24.99, total: 24.99 },
    ],
    total: 50.97,
  },
  // Clothing
  {
    id: "receipt-demo-5",
    merchantId: "merchant-demo-6",
    date: getDateOffset(14),
    time: "12:30",
    hasCustomerNif: false,
    items: [
      { id: "item-11", productId: "product-demo-13", productName: "T-Shirt", quantity: 2, unitPrice: 15.99, total: 31.98 },
      { id: "item-12", productId: "product-demo-14", productName: "Jeans", quantity: 1, unitPrice: 39.99, total: 39.99 },
    ],
    total: 71.97,
  },
  // Older groceries
  {
    id: "receipt-demo-6",
    merchantId: "merchant-demo-3",
    date: getDateOffset(20),
    time: "11:00",
    hasCustomerNif: true,
    customerNif: "123456789",
    items: [
      { id: "item-13", productId: "product-demo-1", productName: "Milk 1L", quantity: 3, unitPrice: 0.85, total: 2.55 },
      { id: "item-14", productId: "product-demo-8", productName: "Butter 250g", quantity: 1, unitPrice: 2.19, total: 2.19 },
      { id: "item-15", productId: "product-demo-5", productName: "Rice 1kg", quantity: 1, unitPrice: 1.49, total: 1.49 },
    ],
    total: 6.23,
  },
  // Monthly groceries from last month
  {
    id: "receipt-demo-7",
    merchantId: "merchant-demo-1",
    date: getDateOffset(35),
    time: "15:45",
    hasCustomerNif: true,
    customerNif: "123456789",
    items: [
      { id: "item-16", productId: "product-demo-4", productName: "Chicken Breast 500g", quantity: 3, unitPrice: 4.79, total: 14.37 },
      { id: "item-17", productId: "product-demo-6", productName: "Olive Oil 750ml", quantity: 1, unitPrice: 5.49, total: 5.49 },
      { id: "item-18", productId: "product-demo-7", productName: "Coffee 250g", quantity: 2, unitPrice: 3.29, total: 6.58 },
    ],
    total: 26.44,
  },
  // Gas from last month
  {
    id: "receipt-demo-8",
    merchantId: "merchant-demo-5",
    date: getDateOffset(40),
    time: "09:30",
    hasCustomerNif: true,
    customerNif: "123456789",
    items: [
      { id: "item-19", productId: "product-demo-9", productName: "Gasoline 95", quantity: 40, unitPrice: 1.72, total: 68.80, excludeFromPriceHistory: true },
    ],
    total: 68.80,
  },
  // Two months ago
  {
    id: "receipt-demo-9",
    merchantId: "merchant-demo-2",
    date: getDateOffset(60),
    time: "13:00",
    hasCustomerNif: false,
    items: [
      { id: "item-20", productId: "product-demo-1", productName: "Milk 1L", quantity: 2, unitPrice: 0.79, total: 1.58 },
      { id: "item-21", productId: "product-demo-2", productName: "Bread", quantity: 2, unitPrice: 1.19, total: 2.38 },
      { id: "item-22", productId: "product-demo-3", productName: "Eggs (12)", quantity: 2, unitPrice: 2.39, total: 4.78 },
    ],
    total: 8.74,
  },
  // Entertainment
  {
    id: "receipt-demo-10",
    merchantId: "merchant-demo-1",
    date: getDateOffset(7),
    time: "19:00",
    hasCustomerNif: false,
    notes: "Date night",
    items: [
      { id: "item-23", productId: "product-demo-15", productName: "Movie Ticket", quantity: 2, unitPrice: 7.50, total: 15.00 },
    ],
    total: 15.00,
  },
];

const DEMO_LOADED_KEY = "expense-tracker-demo-loaded";

export function loadDemoDataIfNeeded(): boolean {
  // Check if demo data was already loaded
  if (localStorage.getItem(DEMO_LOADED_KEY)) {
    return false;
  }

  // Check if user already has data
  const existingReceipts = getStoredData("receipts", []);
  const existingMerchants = getStoredData("merchants", []);
  
  if (existingReceipts.length > 0 || existingMerchants.length > 0) {
    localStorage.setItem(DEMO_LOADED_KEY, "true");
    return false;
  }

  // Load demo data
  setStoredData("categories", DEFAULT_CATEGORIES);
  setStoredData("subcategories", DEFAULT_SUBCATEGORIES);
  setStoredData("merchants", DEMO_MERCHANTS);
  setStoredData("products", DEMO_PRODUCTS);
  setStoredData("receipts", DEMO_RECEIPTS);
  
  localStorage.setItem(DEMO_LOADED_KEY, "true");
  return true;
}

export function clearDemoData(): void {
  localStorage.removeItem(DEMO_LOADED_KEY);
  setStoredData("categories", DEFAULT_CATEGORIES);
  setStoredData("subcategories", []);
  setStoredData("merchants", []);
  setStoredData("products", []);
  setStoredData("receipts", []);
}
