import { Category, Subcategory, Merchant, Product, Receipt } from "@/types/expense";

export const sampleCategories: Category[] = [
  { id: "cat-1", name: "Groceries", icon: "🛒", color: "hsl(152, 55%, 45%)" },
  { id: "cat-2", name: "Dining", icon: "🍽️", color: "hsl(15, 75%, 55%)" },
  { id: "cat-3", name: "Transport", icon: "🚗", color: "hsl(38, 85%, 50%)" },
  { id: "cat-4", name: "Shopping", icon: "🛍️", color: "hsl(280, 55%, 55%)" },
  { id: "cat-5", name: "Health", icon: "💊", color: "hsl(200, 70%, 50%)" },
  { id: "cat-6", name: "Utilities", icon: "💡", color: "hsl(220, 60%, 55%)" },
];

export const sampleSubcategories: Subcategory[] = [
  { id: "subcat-1", name: "Fruits", parentCategoryId: "cat-1" },
  { id: "subcat-2", name: "Dairy", parentCategoryId: "cat-1" },
  { id: "subcat-3", name: "Bakery", parentCategoryId: "cat-1" },
  { id: "subcat-4", name: "Fast Food", parentCategoryId: "cat-2" },
  { id: "subcat-5", name: "Fuel", parentCategoryId: "cat-3" },
];

export const sampleMerchants: Merchant[] = [
  { id: "mer-1", name: "Continente", address: "Centro Comercial Colombo" },
  { id: "mer-2", name: "Pingo Doce", address: "Av. da República" },
  { id: "mer-3", name: "McDonalds", address: "Baixa-Chiado" },
  { id: "mer-4", name: "Galp", address: "A2 Km 15" },
  { id: "mer-5", name: "Worten", address: "Amoreiras Shopping" },
  { id: "mer-6", name: "Farmácia Central", address: "Rua Augusta" },
];

export const sampleProducts: Product[] = [
  { id: "prod-1", name: "Leite Mimosa 1L", categoryId: "cat-1", subcategoryId: "subcat-2", defaultPrice: 1.29, isSolidified: true },
  { id: "prod-2", name: "Pão de Forma Bimbo", categoryId: "cat-1", subcategoryId: "subcat-3", defaultPrice: 2.49, isSolidified: true },
  { id: "prod-3", name: "Ovos M (6un)", categoryId: "cat-1", subcategoryId: "subcat-2", defaultPrice: 1.99, isSolidified: true },
  { id: "prod-4", name: "Big Mac Menu", categoryId: "cat-2", subcategoryId: "subcat-4", defaultPrice: 8.50, isSolidified: true },
  { id: "prod-5", name: "Gasóleo Simples", categoryId: "cat-3", subcategoryId: "subcat-5", defaultPrice: 1.65, isSolidified: true },
  { id: "prod-6", name: "Bananas (kg)", categoryId: "cat-1", subcategoryId: "subcat-1", defaultPrice: 1.49, isSolidified: true },
  { id: "prod-7", name: "Café Delta", categoryId: "cat-1", defaultPrice: 3.99, isSolidified: true },
];

export const sampleReceipts: Receipt[] = [
  {
    id: "rec-1",
    merchantId: "mer-1",
    date: "2024-12-22",
    hasCustomerNif: true,
    customerNif: "123456789",
    items: [
      { id: "item-1", productId: "prod-1", productName: "Leite Mimosa 1L", quantity: 2, unitPrice: 1.29, total: 2.58 },
      { id: "item-2", productId: "prod-2", productName: "Pão de Forma Bimbo", quantity: 1, unitPrice: 2.49, total: 2.49 },
      { id: "item-3", productId: "prod-3", productName: "Ovos M (6un)", quantity: 1, unitPrice: 1.99, total: 1.99 },
    ],
    total: 7.06,
    notes: "Compras semanais",
  },
  {
    id: "rec-2",
    merchantId: "mer-3",
    date: "2024-12-21",
    hasCustomerNif: false,
    items: [
      { id: "item-4", productId: "prod-4", productName: "Big Mac Menu", quantity: 2, unitPrice: 8.50, total: 17.00 },
    ],
    total: 17.00,
  },
  {
    id: "rec-3",
    merchantId: "mer-4",
    date: "2024-12-20",
    hasCustomerNif: true,
    customerNif: "123456789",
    items: [
      { id: "item-5", productId: "prod-5", productName: "Gasóleo Simples", quantity: 35, unitPrice: 1.65, total: 57.75 },
    ],
    total: 57.75,
    notes: "Depósito cheio",
  },
];
