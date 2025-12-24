/**
 * Core Domain Types for the Expense Tracker
 * 
 * This file defines all the main data structures used in the app.
 * Think of these as the "shape" of your data - what properties each thing has.
 */

// ============================================================================
// SUBCATEGORY
// A subcategory belongs to a parent category (e.g., "Dairy" under "Food")
// ============================================================================
export interface Subcategory {
  /** Unique identifier for this subcategory */
  id: string;
  /** Display name (e.g., "Dairy", "Frozen Foods") */
  name: string;
  /** The parent category this belongs to */
  parentCategoryId: string;
}

// ============================================================================
// CATEGORY
// Main spending categories (e.g., "Food", "Transport", "Entertainment")
// ============================================================================
export interface Category {
  /** Unique identifier for this category */
  id: string;
  /** Display name (e.g., "Food & Groceries") */
  name: string;
  /** Emoji icon for visual identification */
  icon: string;
  /** Hex color code for charts and UI (e.g., "#4CAF50") */
  color: string;
  /** If true, this category cannot be deleted (system default) */
  isDefault?: boolean;
}

// ============================================================================
// MERCHANT (Store)
// A store or business where you made a purchase
// ============================================================================
export interface Merchant {
  /** Unique identifier for this merchant */
  id: string;
  /** Store name (e.g., "Continente", "Pingo Doce") */
  name: string;
  /** Portuguese tax number (optional) */
  nif?: string;
  /** Store address (optional) */
  address?: string;
  /** If true, this merchant has been confirmed (not just auto-created) */
  isSolidified?: boolean;
}

// ============================================================================
// PRODUCT
// An item you can buy (e.g., "Milk", "Bread", "Bus Ticket")
// ============================================================================
export interface Product {
  /** Unique identifier for this product */
  id: string;
  /** Product name (e.g., "Semi-Skimmed Milk 1L") */
  name: string;
  /** Category this product belongs to (optional) */
  categoryId?: string;
  /** Subcategory for more specific grouping (optional) */
  subcategoryId?: string;
  /** Typical price for quick entry (optional) */
  defaultPrice?: number;
  /** If true, don't track price changes for this product */
  excludeFromPriceHistory?: boolean;
  /** If true, this product has been confirmed (not just auto-created) */
  isSolidified?: boolean;
  /** Barcode for scanning (optional) */
  barcode?: string;
}

// ============================================================================
// RECEIPT ITEM
// A single line item on a receipt (one product purchase)
// ============================================================================
export interface ReceiptItem {
  /** Unique identifier for this line item */
  id: string;
  /** Reference to the product */
  productId: string;
  /** Product name at time of purchase (in case product is renamed later) */
  productName: string;
  /** How many were bought */
  quantity: number;
  /** Price per unit */
  unitPrice: number;
  /** Total for this line (quantity × unitPrice) */
  total: number;
  /** If true, don't track price changes for this item */
  excludeFromPriceHistory?: boolean;
}

// ============================================================================
// RECEIPT
// A complete receipt from a store visit
// ============================================================================
export interface Receipt {
  /** Unique identifier for this receipt */
  id: string;
  /** Reference to the store */
  merchantId: string;
  /** Date of purchase (YYYY-MM-DD format) */
  date: string;
  /** Time of purchase (HH:MM format, optional) */
  time?: string;
  /** Receipt number from the store (optional) */
  receiptNumber?: string;
  /** Customer's tax number if requested (optional) */
  customerNif?: string;
  /** Whether customer requested tax number on receipt */
  hasCustomerNif: boolean;
  /** All items purchased */
  items: ReceiptItem[];
  /** Total amount paid */
  total: number;
  /** Any additional notes (optional) */
  notes?: string;
}

// ============================================================================
// PRICE HISTORY
// Tracks how a product's price changes over time
// ============================================================================
export interface PriceHistoryEntry {
  /** When this price was recorded (YYYY-MM-DD) */
  date: string;
  /** The price at this time */
  price: number;
  /** Which store had this price */
  merchantId: string;
}

// ============================================================================
// ATCUD DATA
// Data extracted from Portuguese receipt QR codes
// (ATCUD = Código Único de Documento - Unique Document Code)
// ============================================================================
export interface ATCUDData {
  /** Store's tax number */
  nif?: string;
  /** Purchase date */
  date?: string;
  /** Purchase time */
  time?: string;
  /** Total paid */
  total?: number;
  /** Customer's tax number (if on receipt) */
  customerNif?: string;
  /** Receipt number */
  receiptNumber?: string;
}
