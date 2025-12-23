export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Merchant {
  id: string;
  name: string;
  categoryId: string;
  nif?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  defaultPrice?: number;
  excludeFromPriceHistory?: boolean;
}

export interface ReceiptItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  excludeFromPriceHistory?: boolean;
}

export interface Receipt {
  id: string;
  merchantId: string;
  date: string;
  time?: string;
  receiptNumber?: string;
  customerNif?: string;
  hasCustomerNif: boolean;
  items: ReceiptItem[];
  total: number;
  notes?: string;
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
  merchantId: string;
}

export interface ATCUDData {
  nif?: string;
  date?: string;
  time?: string;
  total?: number;
  customerNif?: string;
  receiptNumber?: string;
}
