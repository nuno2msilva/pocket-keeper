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
  items: ReceiptItem[];
  total: number;
  notes?: string;
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
  merchantId: string;
}
