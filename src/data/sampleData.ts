import { Category, Merchant, Product, Receipt } from "@/types/expense";

export const sampleCategories: Category[] = [
  { id: "cat-1", name: "Groceries", icon: "🛒", color: "hsl(152, 60%, 42%)" },
  { id: "cat-2", name: "Dining", icon: "🍽️", color: "hsl(15, 85%, 60%)" },
  { id: "cat-3", name: "Transport", icon: "🚗", color: "hsl(38, 92%, 50%)" },
  { id: "cat-4", name: "Shopping", icon: "🛍️", color: "hsl(280, 60%, 55%)" },
  { id: "cat-5", name: "Health", icon: "💊", color: "hsl(174, 62%, 40%)" },
  { id: "cat-6", name: "Utilities", icon: "💡", color: "hsl(220, 60%, 50%)" },
];

export const sampleMerchants: Merchant[] = [
  { id: "mer-1", name: "Whole Foods", categoryId: "cat-1", address: "123 Main St" },
  { id: "mer-2", name: "Trader Joe's", categoryId: "cat-1", address: "456 Oak Ave" },
  { id: "mer-3", name: "Chipotle", categoryId: "cat-2", address: "789 Elm Blvd" },
  { id: "mer-4", name: "Shell Gas", categoryId: "cat-3", address: "321 Highway Rd" },
  { id: "mer-5", name: "Target", categoryId: "cat-4", address: "555 Shopping Dr" },
  { id: "mer-6", name: "CVS Pharmacy", categoryId: "cat-5", address: "888 Health Way" },
];

export const sampleProducts: Product[] = [
  { id: "prod-1", name: "Organic Milk", categoryId: "cat-1", defaultPrice: 5.99 },
  { id: "prod-2", name: "Whole Wheat Bread", categoryId: "cat-1", defaultPrice: 4.49 },
  { id: "prod-3", name: "Free Range Eggs", categoryId: "cat-1", defaultPrice: 6.99 },
  { id: "prod-4", name: "Chicken Bowl", categoryId: "cat-2", defaultPrice: 12.50 },
  { id: "prod-5", name: "Regular Gas", categoryId: "cat-3", defaultPrice: 3.89 },
  { id: "prod-6", name: "Ibuprofen", categoryId: "cat-5", defaultPrice: 8.99 },
  { id: "prod-7", name: "Avocado", categoryId: "cat-1", defaultPrice: 1.99 },
  { id: "prod-8", name: "Coffee Beans", categoryId: "cat-1", defaultPrice: 12.99 },
];

export const sampleReceipts: Receipt[] = [
  {
    id: "rec-1",
    merchantId: "mer-1",
    date: "2024-12-22",
    hasCustomerNif: false,
    items: [
      { id: "item-1", productId: "prod-1", quantity: 2, unitPrice: 5.99, total: 11.98 },
      { id: "item-2", productId: "prod-2", quantity: 1, unitPrice: 4.49, total: 4.49 },
      { id: "item-3", productId: "prod-3", quantity: 1, unitPrice: 6.99, total: 6.99 },
    ],
    total: 23.46,
    notes: "Weekly grocery run",
  },
  {
    id: "rec-2",
    merchantId: "mer-3",
    date: "2024-12-21",
    hasCustomerNif: false,
    items: [
      { id: "item-4", productId: "prod-4", quantity: 2, unitPrice: 12.50, total: 25.00 },
    ],
    total: 25.00,
  },
  {
    id: "rec-3",
    merchantId: "mer-4",
    date: "2024-12-20",
    hasCustomerNif: false,
    items: [
      { id: "item-5", productId: "prod-5", quantity: 15, unitPrice: 3.89, total: 58.35 },
    ],
    total: 58.35,
    notes: "Full tank",
  },
  {
    id: "rec-4",
    merchantId: "mer-2",
    date: "2024-12-19",
    hasCustomerNif: false,
    items: [
      { id: "item-6", productId: "prod-7", quantity: 4, unitPrice: 1.99, total: 7.96 },
      { id: "item-7", productId: "prod-8", quantity: 1, unitPrice: 12.99, total: 12.99 },
    ],
    total: 20.95,
  },
  {
    id: "rec-5",
    merchantId: "mer-6",
    date: "2024-12-18",
    hasCustomerNif: false,
    items: [
      { id: "item-8", productId: "prod-6", quantity: 1, unitPrice: 8.99, total: 8.99 },
    ],
    total: 8.99,
  },
];
