/**
 * Demo Data for First-Time Users
 * 
 * Provides sample data to help users explore the app's features.
 * Only loads if no existing data is found.
 */

import type { Merchant, Product, Receipt, ReceiptItem } from "../types";
import { setStoredData, getStoredData } from "./repository";
import { DEFAULT_CATEGORIES, DEFAULT_SUBCATEGORIES } from "./defaultCategories";

const DEMO_MERCHANTS: Merchant[] = [
  { id: "merchant-demo-1", name: "Continente", nif: "500100144", address: "Av. da Liberdade 123, Lisboa", isSolidified: true },
  { id: "merchant-demo-2", name: "Pingo Doce", nif: "500829993", address: "Rua Augusta 45, Lisboa", isSolidified: true },
  { id: "merchant-demo-3", name: "Lidl", nif: "500917351", address: "Praça do Comércio 78, Lisboa", isSolidified: true },
  { id: "merchant-demo-4", name: "Worten", nif: "502584951", address: "Centro Comercial Colombo, Lisboa", isSolidified: true },
  { id: "merchant-demo-5", name: "Galp", nif: "504499777", address: "Av. da República 200, Lisboa", isSolidified: true },
  { id: "merchant-demo-6", name: "Zara", nif: "503264032", address: "Rua Garrett 15, Lisboa", isSolidified: true },
  { id: "merchant-demo-7", name: "Auchan", nif: "500101270", address: "Centro Comercial Amoreiras, Lisboa", isSolidified: true },
  { id: "merchant-demo-8", name: "El Corte Inglés", nif: "500248670", address: "Av. António Augusto de Aguiar, Lisboa", isSolidified: true },
  { id: "merchant-demo-9", name: "BP", nif: "500227796", address: "Av. Almirante Reis 150, Lisboa", isSolidified: true },
  { id: "merchant-demo-10", name: "IKEA", nif: "501777990", address: "Alfragide, Lisboa", isSolidified: true },
];

const DEMO_PRODUCTS: Product[] = [
  { id: "product-demo-1", name: "Milk 1L", categoryId: "cat-groceries", subcategoryId: "subcat-dairy", defaultPrice: 0.95, isSolidified: true, priceHistory: [
    { date: "2025-12-20", price: 0.95, merchantId: "merchant-demo-1" },
    { date: "2025-12-15", price: 0.89, merchantId: "merchant-demo-2" },
    { date: "2025-11-28", price: 0.85, merchantId: "merchant-demo-3" },
    { date: "2025-11-10", price: 0.82, merchantId: "merchant-demo-1" },
    { date: "2025-10-25", price: 0.79, merchantId: "merchant-demo-2" },
  ]},
  { id: "product-demo-2", name: "Bread", categoryId: "cat-groceries", subcategoryId: "subcat-bakery", defaultPrice: 1.35, isSolidified: true, priceHistory: [
    { date: "2025-12-22", price: 1.35, merchantId: "merchant-demo-1" },
    { date: "2025-12-10", price: 1.29, merchantId: "merchant-demo-3" },
    { date: "2025-11-20", price: 1.25, merchantId: "merchant-demo-2" },
  ]},
  { id: "product-demo-3", name: "Eggs (12)", categoryId: "cat-groceries", subcategoryId: "subcat-dairy", defaultPrice: 2.69, isSolidified: true, priceHistory: [
    { date: "2025-12-18", price: 2.69, merchantId: "merchant-demo-1" },
    { date: "2025-11-25", price: 2.49, merchantId: "merchant-demo-2" },
    { date: "2025-10-30", price: 2.39, merchantId: "merchant-demo-3" },
  ]},
  { id: "product-demo-4", name: "Chicken Breast", categoryId: "cat-groceries", subcategoryId: "subcat-meat", defaultPrice: 10.49, isWeighted: true, isSolidified: true, priceHistory: [
    { date: "2025-12-20", price: 10.49, merchantId: "merchant-demo-1" },
    { date: "2025-12-05", price: 9.99, merchantId: "merchant-demo-7" },
    { date: "2025-11-15", price: 9.49, merchantId: "merchant-demo-2" },
  ]},
  { id: "product-demo-5", name: "Rice 1kg", categoryId: "cat-groceries", defaultPrice: 1.69, isSolidified: true, priceHistory: [
    { date: "2025-12-15", price: 1.69, merchantId: "merchant-demo-2" },
    { date: "2025-11-20", price: 1.59, merchantId: "merchant-demo-3" },
  ]},
  { id: "product-demo-6", name: "Olive Oil 750ml", categoryId: "cat-groceries", subcategoryId: "subcat-beverages", defaultPrice: 6.49, isSolidified: true, priceHistory: [
    { date: "2025-12-10", price: 6.49, merchantId: "merchant-demo-1" },
    { date: "2025-11-15", price: 5.99, merchantId: "merchant-demo-2" },
    { date: "2025-10-20", price: 5.79, merchantId: "merchant-demo-3" },
  ]},
  { id: "product-demo-7", name: "Coffee 250g", categoryId: "cat-groceries", subcategoryId: "subcat-beverages", defaultPrice: 3.79, isSolidified: true, priceHistory: [
    { date: "2025-12-18", price: 3.79, merchantId: "merchant-demo-1" },
    { date: "2025-11-25", price: 3.49, merchantId: "merchant-demo-7" },
  ]},
  { id: "product-demo-8", name: "Butter 250g", categoryId: "cat-groceries", subcategoryId: "subcat-dairy", defaultPrice: 2.39, isSolidified: true },
  { id: "product-demo-9", name: "Gasoline 95", categoryId: "cat-transport", subcategoryId: "subcat-fuel", defaultPrice: 1.78, isSolidified: true, excludeFromPriceHistory: true },
  { id: "product-demo-10", name: "Metro Ticket", categoryId: "cat-transport", subcategoryId: "subcat-publictransport", defaultPrice: 1.70, isSolidified: true },
  { id: "product-demo-11", name: "USB-C Cable", categoryId: "cat-shopping", subcategoryId: "subcat-electronics", defaultPrice: 12.99, isSolidified: true },
  { id: "product-demo-12", name: "Wireless Mouse", categoryId: "cat-shopping", subcategoryId: "subcat-electronics", defaultPrice: 24.99, isSolidified: true },
  { id: "product-demo-13", name: "T-Shirt", categoryId: "cat-shopping", subcategoryId: "subcat-clothing", defaultPrice: 15.99, isSolidified: true },
  { id: "product-demo-14", name: "Jeans", categoryId: "cat-shopping", subcategoryId: "subcat-clothing", defaultPrice: 39.99, isSolidified: true },
  { id: "product-demo-15", name: "Movie Ticket", categoryId: "cat-entertainment", defaultPrice: 8.00, isSolidified: true },
  { id: "product-demo-16", name: "Apples", categoryId: "cat-groceries", subcategoryId: "subcat-produce", defaultPrice: 2.69, isWeighted: true, isSolidified: true },
  { id: "product-demo-17", name: "Salmon Fillet", categoryId: "cat-groceries", subcategoryId: "subcat-meat", defaultPrice: 19.99, isWeighted: true, isSolidified: true },
  { id: "product-demo-18", name: "Pasta 500g", categoryId: "cat-groceries", defaultPrice: 1.29, isSolidified: true },
  { id: "product-demo-19", name: "Tomato Sauce", categoryId: "cat-groceries", defaultPrice: 1.89, isSolidified: true },
  { id: "product-demo-20", name: "Orange Juice 1L", categoryId: "cat-groceries", subcategoryId: "subcat-beverages", defaultPrice: 2.49, isSolidified: true },
  { id: "product-demo-21", name: "Cheese 200g", categoryId: "cat-groceries", subcategoryId: "subcat-dairy", defaultPrice: 3.29, isSolidified: true },
  { id: "product-demo-22", name: "Bananas", categoryId: "cat-groceries", subcategoryId: "subcat-produce", defaultPrice: 1.49, isWeighted: true, isSolidified: true },
  { id: "product-demo-23", name: "Yogurt Pack (4)", categoryId: "cat-groceries", subcategoryId: "subcat-dairy", defaultPrice: 2.99, isSolidified: true },
  { id: "product-demo-24", name: "Laundry Detergent", categoryId: "cat-utilities", defaultPrice: 8.99, isSolidified: true },
  { id: "product-demo-25", name: "Shampoo", categoryId: "cat-health", defaultPrice: 4.99, isSolidified: true },
];

// Helper to create a specific date
function makeDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Generate item ID
let itemCounter = 1;
function makeItem(productId: string, productName: string, quantity: number, unitPrice: number): ReceiptItem {
  return {
    id: `item-${itemCounter++}`,
    productId,
    productName,
    quantity,
    unitPrice,
    total: Math.round(quantity * unitPrice * 100) / 100,
  };
}

const DEMO_RECEIPTS: Receipt[] = [
  // ============ DECEMBER 2025 ============
  // Week 4
  { id: "r-dec-1", merchantId: "merchant-demo-1", date: makeDate(2025, 12, 23), time: "10:30", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-1", "Milk 1L", 3, 0.95), makeItem("product-demo-2", "Bread", 2, 1.35), makeItem("product-demo-4", "Chicken Breast", 1.2, 10.49), makeItem("product-demo-21", "Cheese 200g", 2, 3.29)], total: 25.02 },
  { id: "r-dec-2", merchantId: "merchant-demo-2", date: makeDate(2025, 12, 22), time: "14:15", hasCustomerNif: false, 
    items: [makeItem("product-demo-3", "Eggs (12)", 2, 2.69), makeItem("product-demo-23", "Yogurt Pack (4)", 3, 2.99), makeItem("product-demo-20", "Orange Juice 1L", 2, 2.49)], total: 19.33 },
  { id: "r-dec-3", merchantId: "merchant-demo-5", date: makeDate(2025, 12, 21), time: "08:00", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-9", "Gasoline 95", 42, 1.78)], total: 74.76 },
  { id: "r-dec-4", merchantId: "merchant-demo-3", date: makeDate(2025, 12, 20), time: "11:45", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-16", "Apples", 1.5, 2.69), makeItem("product-demo-22", "Bananas", 0.8, 1.49), makeItem("product-demo-18", "Pasta 500g", 3, 1.29), makeItem("product-demo-19", "Tomato Sauce", 2, 1.89)], total: 12.78 },
  // Week 3
  { id: "r-dec-5", merchantId: "merchant-demo-7", date: makeDate(2025, 12, 18), time: "16:30", hasCustomerNif: false, 
    items: [makeItem("product-demo-7", "Coffee 250g", 2, 3.79), makeItem("product-demo-6", "Olive Oil 750ml", 1, 6.49), makeItem("product-demo-5", "Rice 1kg", 2, 1.69)], total: 17.45 },
  { id: "r-dec-6", merchantId: "merchant-demo-1", date: makeDate(2025, 12, 17), time: "12:00", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-17", "Salmon Fillet", 0.45, 19.99), makeItem("product-demo-1", "Milk 1L", 2, 0.95), makeItem("product-demo-8", "Butter 250g", 1, 2.39)], total: 13.29 },
  { id: "r-dec-7", merchantId: "merchant-demo-6", date: makeDate(2025, 12, 15), time: "15:00", hasCustomerNif: false, notes: "Christmas shopping", 
    items: [makeItem("product-demo-13", "T-Shirt", 3, 15.99), makeItem("product-demo-14", "Jeans", 1, 39.99)], total: 87.96 },
  { id: "r-dec-8", merchantId: "merchant-demo-9", date: makeDate(2025, 12, 14), time: "09:15", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-9", "Gasoline 95", 38, 1.78)], total: 67.64 },
  // Week 2
  { id: "r-dec-9", merchantId: "merchant-demo-2", date: makeDate(2025, 12, 12), time: "18:30", hasCustomerNif: false, 
    items: [makeItem("product-demo-4", "Chicken Breast", 0.9, 10.49), makeItem("product-demo-3", "Eggs (12)", 1, 2.69), makeItem("product-demo-21", "Cheese 200g", 1, 3.29), makeItem("product-demo-2", "Bread", 1, 1.29)], total: 16.71 },
  { id: "r-dec-10", merchantId: "merchant-demo-4", date: makeDate(2025, 12, 10), time: "14:00", hasCustomerNif: false, notes: "New headphones", 
    items: [makeItem("product-demo-11", "USB-C Cable", 1, 12.99), makeItem("product-demo-12", "Wireless Mouse", 1, 24.99)], total: 37.98 },
  { id: "r-dec-11", merchantId: "merchant-demo-1", date: makeDate(2025, 12, 8), time: "10:00", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-24", "Laundry Detergent", 1, 8.99), makeItem("product-demo-25", "Shampoo", 2, 4.99), makeItem("product-demo-1", "Milk 1L", 2, 0.95)], total: 20.87 },
  // Week 1
  { id: "r-dec-12", merchantId: "merchant-demo-3", date: makeDate(2025, 12, 5), time: "11:30", hasCustomerNif: false, 
    items: [makeItem("product-demo-16", "Apples", 2, 2.49), makeItem("product-demo-22", "Bananas", 1.2, 1.49), makeItem("product-demo-5", "Rice 1kg", 1, 1.59), makeItem("product-demo-7", "Coffee 250g", 1, 3.49)], total: 12.55 },
  { id: "r-dec-13", merchantId: "merchant-demo-5", date: makeDate(2025, 12, 3), time: "07:45", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-9", "Gasoline 95", 35, 1.76)], total: 61.60 },
  { id: "r-dec-14", merchantId: "merchant-demo-8", date: makeDate(2025, 12, 1), time: "16:00", hasCustomerNif: false, notes: "Gift shopping", 
    items: [makeItem("product-demo-13", "T-Shirt", 2, 19.99), makeItem("product-demo-14", "Jeans", 1, 49.99)], total: 89.97 },

  // ============ NOVEMBER 2025 ============
  // Week 4
  { id: "r-nov-1", merchantId: "merchant-demo-1", date: makeDate(2025, 11, 28), time: "12:30", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-1", "Milk 1L", 4, 0.89), makeItem("product-demo-2", "Bread", 2, 1.29), makeItem("product-demo-3", "Eggs (12)", 2, 2.59), makeItem("product-demo-8", "Butter 250g", 1, 2.29)], total: 13.33 },
  { id: "r-nov-2", merchantId: "merchant-demo-2", date: makeDate(2025, 11, 26), time: "17:00", hasCustomerNif: false, 
    items: [makeItem("product-demo-4", "Chicken Breast", 1.1, 9.99), makeItem("product-demo-17", "Salmon Fillet", 0.35, 18.99), makeItem("product-demo-21", "Cheese 200g", 2, 3.19)], total: 24.02 },
  { id: "r-nov-3", merchantId: "merchant-demo-9", date: makeDate(2025, 11, 25), time: "08:30", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-9", "Gasoline 95", 40, 1.74)], total: 69.60 },
  // Week 3
  { id: "r-nov-4", merchantId: "merchant-demo-7", date: makeDate(2025, 11, 22), time: "14:15", hasCustomerNif: false, 
    items: [makeItem("product-demo-6", "Olive Oil 750ml", 2, 5.89), makeItem("product-demo-7", "Coffee 250g", 3, 3.49), makeItem("product-demo-18", "Pasta 500g", 4, 1.19)], total: 27.01 },
  { id: "r-nov-5", merchantId: "merchant-demo-3", date: makeDate(2025, 11, 20), time: "10:45", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-1", "Milk 1L", 3, 0.85), makeItem("product-demo-16", "Apples", 1.8, 2.39), makeItem("product-demo-22", "Bananas", 1, 1.39), makeItem("product-demo-19", "Tomato Sauce", 3, 1.79)], total: 12.41 },
  { id: "r-nov-6", merchantId: "merchant-demo-10", date: makeDate(2025, 11, 18), time: "11:00", hasCustomerNif: false, notes: "Home decor", 
    items: [{ id: "item-ikea-1", productId: "", productName: "Picture Frame Set", quantity: 1, unitPrice: 29.99, total: 29.99 }, { id: "item-ikea-2", productId: "", productName: "LED Desk Lamp", quantity: 1, unitPrice: 19.99, total: 19.99 }], total: 49.98 },
  // Week 2
  { id: "r-nov-7", merchantId: "merchant-demo-1", date: makeDate(2025, 11, 15), time: "16:30", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-4", "Chicken Breast", 0.85, 9.49), makeItem("product-demo-3", "Eggs (12)", 1, 2.49), makeItem("product-demo-23", "Yogurt Pack (4)", 2, 2.89), makeItem("product-demo-20", "Orange Juice 1L", 3, 2.39)], total: 22.67 },
  { id: "r-nov-8", merchantId: "merchant-demo-5", date: makeDate(2025, 11, 12), time: "07:30", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-9", "Gasoline 95", 45, 1.72)], total: 77.40 },
  { id: "r-nov-9", merchantId: "merchant-demo-6", date: makeDate(2025, 11, 10), time: "15:00", hasCustomerNif: false, 
    items: [makeItem("product-demo-13", "T-Shirt", 1, 14.99), makeItem("product-demo-14", "Jeans", 2, 34.99)], total: 84.97 },
  // Week 1
  { id: "r-nov-10", merchantId: "merchant-demo-2", date: makeDate(2025, 11, 8), time: "13:00", hasCustomerNif: false, 
    items: [makeItem("product-demo-1", "Milk 1L", 2, 0.85), makeItem("product-demo-2", "Bread", 2, 1.25), makeItem("product-demo-5", "Rice 1kg", 2, 1.55), makeItem("product-demo-8", "Butter 250g", 1, 2.19)], total: 9.49 },
  { id: "r-nov-11", merchantId: "merchant-demo-4", date: makeDate(2025, 11, 5), time: "18:00", hasCustomerNif: false, notes: "Black Friday", 
    items: [makeItem("product-demo-11", "USB-C Cable", 3, 9.99), makeItem("product-demo-12", "Wireless Mouse", 1, 19.99)], total: 49.96 },
  { id: "r-nov-12", merchantId: "merchant-demo-3", date: makeDate(2025, 11, 2), time: "10:30", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-16", "Apples", 2.2, 2.29), makeItem("product-demo-22", "Bananas", 0.9, 1.35), makeItem("product-demo-7", "Coffee 250g", 2, 3.39), makeItem("product-demo-18", "Pasta 500g", 3, 1.15)], total: 16.22 },

  // ============ OCTOBER 2025 ============
  // Week 4
  { id: "r-oct-1", merchantId: "merchant-demo-1", date: makeDate(2025, 10, 30), time: "11:00", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-1", "Milk 1L", 3, 0.82), makeItem("product-demo-3", "Eggs (12)", 2, 2.45), makeItem("product-demo-4", "Chicken Breast", 1.3, 9.29), makeItem("product-demo-21", "Cheese 200g", 1, 3.09)], total: 22.46 },
  { id: "r-oct-2", merchantId: "merchant-demo-2", date: makeDate(2025, 10, 28), time: "14:30", hasCustomerNif: false, 
    items: [makeItem("product-demo-17", "Salmon Fillet", 0.5, 17.99), makeItem("product-demo-6", "Olive Oil 750ml", 1, 5.69), makeItem("product-demo-19", "Tomato Sauce", 2, 1.75)], total: 18.19 },
  { id: "r-oct-3", merchantId: "merchant-demo-5", date: makeDate(2025, 10, 26), time: "09:00", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-9", "Gasoline 95", 38, 1.70)], total: 64.60 },
  // Week 3
  { id: "r-oct-4", merchantId: "merchant-demo-7", date: makeDate(2025, 10, 23), time: "16:00", hasCustomerNif: false, 
    items: [makeItem("product-demo-2", "Bread", 3, 1.19), makeItem("product-demo-23", "Yogurt Pack (4)", 4, 2.79), makeItem("product-demo-20", "Orange Juice 1L", 2, 2.29)], total: 19.31 },
  { id: "r-oct-5", merchantId: "merchant-demo-3", date: makeDate(2025, 10, 21), time: "10:00", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-16", "Apples", 1.5, 2.19), makeItem("product-demo-22", "Bananas", 1.1, 1.29), makeItem("product-demo-5", "Rice 1kg", 2, 1.49), makeItem("product-demo-8", "Butter 250g", 1, 2.09)], total: 9.77 },
  { id: "r-oct-6", merchantId: "merchant-demo-8", date: makeDate(2025, 10, 19), time: "12:30", hasCustomerNif: false, 
    items: [makeItem("product-demo-14", "Jeans", 1, 44.99), { id: "item-elci-1", productId: "", productName: "Winter Jacket", quantity: 1, unitPrice: 89.99, total: 89.99 }], total: 134.98 },
  // Week 2
  { id: "r-oct-7", merchantId: "merchant-demo-1", date: makeDate(2025, 10, 17), time: "17:30", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-7", "Coffee 250g", 2, 3.29), makeItem("product-demo-1", "Milk 1L", 4, 0.79), makeItem("product-demo-24", "Laundry Detergent", 1, 8.49), makeItem("product-demo-25", "Shampoo", 1, 4.79)], total: 23.31 },
  { id: "r-oct-8", merchantId: "merchant-demo-9", date: makeDate(2025, 10, 14), time: "08:15", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-9", "Gasoline 95", 42, 1.68)], total: 70.56 },
  { id: "r-oct-9", merchantId: "merchant-demo-2", date: makeDate(2025, 10, 12), time: "13:00", hasCustomerNif: false, 
    items: [makeItem("product-demo-4", "Chicken Breast", 0.95, 9.19), makeItem("product-demo-3", "Eggs (12)", 1, 2.39), makeItem("product-demo-2", "Bread", 2, 1.15), makeItem("product-demo-21", "Cheese 200g", 2, 2.99)], total: 19.83 },
  // Week 1
  { id: "r-oct-10", merchantId: "merchant-demo-4", date: makeDate(2025, 10, 9), time: "15:00", hasCustomerNif: false, notes: "Tech upgrade", 
    items: [{ id: "item-worten-1", productId: "", productName: "Bluetooth Speaker", quantity: 1, unitPrice: 49.99, total: 49.99 }, makeItem("product-demo-11", "USB-C Cable", 2, 11.99)], total: 73.97 },
  { id: "r-oct-11", merchantId: "merchant-demo-3", date: makeDate(2025, 10, 6), time: "11:15", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-1", "Milk 1L", 2, 0.79), makeItem("product-demo-16", "Apples", 2, 2.09), makeItem("product-demo-22", "Bananas", 0.8, 1.25), makeItem("product-demo-18", "Pasta 500g", 4, 1.09)], total: 11.28 },
  { id: "r-oct-12", merchantId: "merchant-demo-6", date: makeDate(2025, 10, 4), time: "14:00", hasCustomerNif: false, 
    items: [makeItem("product-demo-13", "T-Shirt", 2, 12.99)], total: 25.98 },
  { id: "r-oct-13", merchantId: "merchant-demo-1", date: makeDate(2025, 10, 2), time: "10:00", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-6", "Olive Oil 750ml", 1, 5.59), makeItem("product-demo-5", "Rice 1kg", 2, 1.45), makeItem("product-demo-7", "Coffee 250g", 1, 3.19), makeItem("product-demo-8", "Butter 250g", 1, 2.05)], total: 13.73 },

  // ============ SEPTEMBER 2025 (older data) ============
  { id: "r-sep-1", merchantId: "merchant-demo-1", date: makeDate(2025, 9, 25), time: "12:00", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-1", "Milk 1L", 3, 0.75), makeItem("product-demo-2", "Bread", 2, 1.09), makeItem("product-demo-3", "Eggs (12)", 1, 2.29)], total: 6.62 },
  { id: "r-sep-2", merchantId: "merchant-demo-5", date: makeDate(2025, 9, 20), time: "07:30", hasCustomerNif: true, customerNif: "123456789", 
    items: [makeItem("product-demo-9", "Gasoline 95", 36, 1.65)], total: 59.40 },
  { id: "r-sep-3", merchantId: "merchant-demo-2", date: makeDate(2025, 9, 15), time: "16:00", hasCustomerNif: false, 
    items: [makeItem("product-demo-4", "Chicken Breast", 1, 8.99), makeItem("product-demo-6", "Olive Oil 750ml", 1, 5.39), makeItem("product-demo-21", "Cheese 200g", 1, 2.89)], total: 17.27 },
  { id: "r-sep-4", merchantId: "merchant-demo-3", date: makeDate(2025, 9, 10), time: "11:00", hasCustomerNif: false, 
    items: [makeItem("product-demo-16", "Apples", 1.8, 1.99), makeItem("product-demo-22", "Bananas", 1.2, 1.19), makeItem("product-demo-7", "Coffee 250g", 1, 3.09)], total: 8.10 },
];

const DEMO_LOADED_KEY = "expense-tracker-demo-loaded-v2";

export function loadDemoDataIfNeeded(): boolean {
  // Check if demo data was already loaded
  if (localStorage.getItem(DEMO_LOADED_KEY)) {
    return false;
  }

  // Check if user already has data (with old key or actual data)
  const oldKey = localStorage.getItem("expense-tracker-demo-loaded");
  const existingReceipts = getStoredData("receipts", []);
  
  if (oldKey && existingReceipts.length > 0) {
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
  localStorage.removeItem("expense-tracker-demo-loaded");
  setStoredData("categories", DEFAULT_CATEGORIES);
  setStoredData("subcategories", DEFAULT_SUBCATEGORIES);
  setStoredData("merchants", []);
  setStoredData("products", []);
  setStoredData("receipts", []);
}
