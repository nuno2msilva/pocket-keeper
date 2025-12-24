import { Category, Subcategory } from "../types";

/**
 * Default categories - these are backend-ready fixed categories.
 * In production, these would come from the database.
 * Users can edit name/icon but cannot delete default categories.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-groceries", name: "Groceries", icon: "🛒", color: "hsl(152, 55%, 45%)", isDefault: true },
  { id: "cat-dining", name: "Dining", icon: "🍽️", color: "hsl(15, 75%, 55%)", isDefault: true },
  { id: "cat-transport", name: "Transport", icon: "🚗", color: "hsl(38, 85%, 50%)", isDefault: true },
  { id: "cat-shopping", name: "Shopping", icon: "🛍️", color: "hsl(280, 55%, 55%)", isDefault: true },
  { id: "cat-health", name: "Health", icon: "💊", color: "hsl(200, 70%, 50%)", isDefault: true },
  { id: "cat-utilities", name: "Utilities", icon: "💡", color: "hsl(220, 60%, 55%)", isDefault: true },
  { id: "cat-entertainment", name: "Entertainment", icon: "🎬", color: "hsl(340, 65%, 55%)", isDefault: true },
  { id: "cat-other", name: "Other", icon: "📦", color: "hsl(0, 0%, 50%)", isDefault: true },
];

export const DEFAULT_SUBCATEGORIES: Subcategory[] = [];

// Sample data for demo purposes
export const SAMPLE_MERCHANTS = [
  { id: "mer-1", name: "Continente", address: "Centro Comercial Colombo", isSolidified: true },
  { id: "mer-2", name: "Pingo Doce", address: "Av. da República", isSolidified: true },
  { id: "mer-3", name: "McDonalds", address: "Baixa-Chiado", isSolidified: true },
];

export const SAMPLE_PRODUCTS = [
  { id: "prod-1", name: "Leite Mimosa 1L", categoryId: "cat-groceries", defaultPrice: 1.29, isSolidified: true },
  { id: "prod-2", name: "Pão de Forma Bimbo", categoryId: "cat-groceries", defaultPrice: 2.49, isSolidified: true },
  { id: "prod-3", name: "Big Mac Menu", categoryId: "cat-dining", defaultPrice: 8.50, isSolidified: true },
];

export const SAMPLE_RECEIPTS = [
  {
    id: "rec-1",
    merchantId: "mer-1",
    date: "2024-12-22",
    hasCustomerNif: true,
    customerNif: "123456789",
    items: [
      { id: "item-1", productId: "prod-1", productName: "Leite Mimosa 1L", quantity: 2, unitPrice: 1.29, total: 2.58 },
      { id: "item-2", productId: "prod-2", productName: "Pão de Forma Bimbo", quantity: 1, unitPrice: 2.49, total: 2.49 },
    ],
    total: 5.07,
    notes: "Weekly groceries",
  },
];
