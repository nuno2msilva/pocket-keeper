# 🧾 Pocket Keeper - Complete Feature Documentation

> **Version**: 1.0  
> **Last Updated**: December 2024  
> **Purpose**: Hyper-detailed feature specifications for understanding and rebuilding the application

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Dashboard & Month Navigation](#1-dashboard--month-navigation)
3. [Receipt Management](#2-receipt-management)
4. [Merchant Management](#3-merchant-management)
5. [Product Management](#4-product-management)
6. [Category System](#5-category-system)
7. [Insights & Charts](#6-insights--charts)
8. [Settings & Data Management](#7-settings--data-management)
9. [User Experience Features](#8-user-experience-features)
10. [Rebuild Priority Plan](#rebuild-priority-plan)

---

## Feature Overview

Pocket Keeper is a personal expense tracking app focused on receipt digitization. Core value propositions:

- **Receipt-centric**: Unlike budget apps that track accounts, this tracks individual receipts with line items
- **Portugal-focused**: Supports Portuguese ATCUD QR code scanning and NIF (tax number) tracking
- **Price tracking**: Monitors product prices across different merchants over time
- **Offline-first**: Works entirely offline using localStorage (or PostgreSQL in backend version)

---

## 1. Dashboard & Month Navigation

### 1.1 Month Navigation

**What it does**: Allows users to navigate between months to view spending for any month.

**Detailed Behavior**:

```
┌─────────────────────────────────────────┐
│  [<]     December 2024     [>]          │
│              €847.32                     │
│         ▼ 8.2% vs last month            │
└─────────────────────────────────────────┘
```

**Date Range Logic**:
- **If today is December 27, 2024**:
  - Current month range: `December 1, 2024` to `December 31, 2024`
  - Uses `startOfMonth(selectedDate)` and `endOfMonth(selectedDate)` from date-fns
  
- **Example Date Calculations**:
  ```javascript
  // For December 2024:
  const monthStart = startOfMonth(new Date("2024-12-27")); // → 2024-12-01T00:00:00
  const monthEnd = endOfMonth(new Date("2024-12-27"));     // → 2024-12-31T23:59:59
  ```

- **Filtering receipts for selected month**:
  ```javascript
  receipts.filter(receipt => {
    const date = new Date(receipt.date);
    return isWithinInterval(date, { start: monthStart, end: monthEnd });
  });
  ```

**Navigation Rules**:
- Left arrow (`<`): Go to previous month (no limit)
- Right arrow (`>`): Go to next month (DISABLED if already on current month)
- Cannot navigate to future months

**Display Format**:
- Month label: "December 2024" (MMMM yyyy format)
- Total: "€847.32" (with € symbol, 2 decimal places)

### 1.2 Month-over-Month Comparison

**What it does**: Shows percentage change compared to the previous month.

**Calculation**:
```javascript
const monthChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
```

**Display Rules**:
| Condition | Display | Color |
|-----------|---------|-------|
| Spending increased | `▲ 8.2% vs last month` | Red (destructive) |
| Spending decreased | `▼ 12.5% vs last month` | Green (success) |
| Previous month = 0 | Hidden | N/A |

**Example**:
- December 2024: €847.32
- November 2024: €923.15
- Change: ((847.32 - 923.15) / 923.15) × 100 = -8.22%
- Display: "▼ 8.2% vs last month" (green)

### 1.3 Summary Cards

Three cards showing quick stats for the selected month:

| Card | Calculation | Example |
|------|-------------|---------|
| **Receipts** | `monthReceipts.length` | 24 |
| **Avg Receipt** | `monthTotal / monthReceipts.length` | €35 |
| **All Time** | Sum of all receipts ever | €5,432 |

---

## 2. Receipt Management

### 2.1 Receipt Data Structure

```typescript
interface Receipt {
  id: string;              // "rec-20241227-abc123"
  merchantId: string;      // Reference to merchant
  date: string;            // "2024-12-27" (YYYY-MM-DD)
  time?: string;           // "14:35" (HH:MM, optional)
  receiptNumber?: string;  // "FT 2024/123456"
  customerNif?: string;    // Customer's tax number "123456789"
  hasCustomerNif: boolean; // Quick flag for filtering
  items: ReceiptItem[];    // Line items
  total: number;           // 45.67
  notes?: string;          // User notes
}

interface ReceiptItem {
  id: string;              // "item-20241227-xyz789"
  productId: string;       // Reference to product
  productName: string;     // Snapshot at time of purchase
  quantity: number;        // 2 (or 0.5 for weighted items)
  unitPrice: number;       // 1.29
  total: number;           // 2.58 (quantity × unitPrice)
  excludeFromPriceHistory?: boolean; // Per-item toggle for promos
}
```

### 2.2 Receipt List Page

**URL**: `/receipts`

**Features**:
- **Search**: Searches in merchant name, receipt number, and notes
- **Sort options**:
  - Date (default, descending)
  - Total amount
  - Store name
  - Item count
- **Filters**:
  - "Has NIF" - receipts where customer requested tax number
  - "This Month" - current calendar month
  - "Last Month" - previous calendar month
  - By specific merchant (top 10 shown)

**List Item Display**:
```
┌─────────────────────────────────────────┐
│ 🧾  Continente                   €45.67 │
│     22 Dec • 8 items              ✓ NIF │
│                                      [>]│
└─────────────────────────────────────────┘
```

**"New" Badge**: Shown when merchant `isSolidified === false` (auto-created, not yet confirmed)

### 2.3 Receipt Creation/Editing

**Dialog Fields**:

| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| Store | ✅ | Empty | Autocomplete from existing merchants |
| Date | ✅ | Today | Date picker, format YYYY-MM-DD |
| Time | ❌ | Empty | 24h format HH:MM |
| Receipt # | ❌ | Empty | Store's receipt number |
| Customer NIF | ❌ | Empty | Toggle + input field |
| Items | Conditional | Empty | Required if no scanned total |
| Notes | ❌ | Empty | Freeform text |

### 2.4 QR Code Scanning (Portuguese ATCUD)

**Mobile only feature** - detected via `useDeviceType()` hook checking for camera.

**ATCUD QR Format**:
```
A:509123456*B:999999990*C:PT*D:FT*E:N*F:20241227*G:FT 0090032025110001/001107*H:J6F32MXV-001107*I1:PT*I2:0*I3:0.00*I4:0.00*I5:0.00*I6:0.00*I7:45.67*I8:10.50*N:35.17*O:45.67*Q:ABCD*R:1234
```

**Parsed Fields**:
| Field | Key | Example | Meaning |
|-------|-----|---------|---------|
| Merchant NIF | A | 509123456 | Store's tax number |
| Customer NIF | B | 123456789 | Customer's tax number (999999990 = no NIF) |
| Date | F | 20241227 | YYYYMMDD format |
| Receipt Number | G | FT 0090032025110001/001107 | Document ID |
| Total | O | 45.67 | Total with tax (primary) |
| Tax Base | N | 35.17 | Total without tax (fallback) |

**Important**: Time is NOT in ATCUD QR codes! User must enter manually.

### 2.5 Scanned Total vs Item Total Logic

This is a key feature for progressive receipt entry:

**Scenario**: User scans QR code getting €45.67 total, then adds items one by one.

**Behavior**:
1. User scans QR → `scannedTotal = 45.67`
2. A "placeholder item" is auto-created: "Unidentified Items" = €45.67
3. User adds "Milk" €1.29 × 2 = €2.58
4. Placeholder updates: "Unidentified Items" = €45.67 - €2.58 = €43.09
5. User adds more items...
6. When items equal scanned total, placeholder disappears
7. **If items EXCEED scanned total** → Error shown, cannot save

**Force Edit Total**: When a receipt has a scanned total (from QR), the total can be force-edited via pencil icon. This is useful for:
- Returns/refunds where the actual total changed
- QR scan errors
- Partial receipt entry

When edited, the scanned total is replaced with the new value, and discrepancy logic continues as normal.

**Visual**:
```
┌─────────────────────────────────────────┐
│ Milk × 2              €1.29      €2.58  │
│ Bread × 1             €2.49      €2.49  │
│ ─────────────────────────────────────── │
│ ⚠️ Unidentified Items           €40.60  │ ← Yellow/warning style
├─────────────────────────────────────────┤
│ Receipt Total (scanned)         €45.67  │
└─────────────────────────────────────────┘
```

### 2.6 Barcode Scanning

**Mobile only** - scans product barcodes.

**Behavior**:
1. User taps barcode icon on item row
2. Camera opens to scan barcode
3. **If barcode found in products**: Auto-fills product name and default price
4. **If barcode not found**: Adds item with "Barcode: 5601234567890" as name, user enters actual name

### 2.7 Auto-creation Logic

**Merchants**: If user types a name that doesn't exist, a new merchant is created with `isSolidified: false`.

**Products**: If user types a product name that doesn't exist, a new product is created with:
- `isSolidified: false`
- `categoryId: undefined` (uncategorized)
- `defaultPrice`: from the receipt item

---

## 3. Merchant Management

### 3.1 Merchant Data Structure

```typescript
interface Merchant {
  id: string;           // "mer-20241227-abc123"
  name: string;         // "Continente"
  nif?: string;         // "500100144" (Portuguese NIF)
  address?: string;     // "Centro Comercial Colombo"
  isSolidified: boolean;// false = auto-created, true = user confirmed
}
```

### 3.2 Merchant List Page

**URL**: `/merchants`

**Features**:
- Search by name or NIF
- Sort by name, receipt count, total spent
- Shows receipt count and total spent per merchant

**List Item**:
```
┌─────────────────────────────────────────┐
│ 🏪  Continente                  €1,547  │
│     NIF: 500100144 • 24 receipts    [>] │
└─────────────────────────────────────────┘
```

### 3.3 Merchant Detail Page

**URL**: `/merchants/:id`

**Shows**:
- Merchant info (name, NIF, address)
- **Edit button** in header to modify merchant details
- Statistics:
  - Total receipts
  - Total spent
  - Average receipt value
- Monthly spending breakdown (progress bars)
- List of all receipts from this merchant (searchable, sortable, filterable)

### 3.4 Merchant Editing

Merchants can be edited from the detail page. **Editable fields**:
- **Name**: Store name
- **NIF**: Portuguese tax ID (9 digits)
- **Address**: Store location

Editing a merchant automatically sets `isSolidified: true`.

### 3.5 Solidification

When a merchant is auto-created from a receipt, `isSolidified = false`. When user:
- Edits the merchant details, OR
- Explicitly confirms it

It becomes `isSolidified = true`. This affects:
- UI badge ("New" shown for non-solidified)
- Future: could affect merge suggestions

---

## 4. Product Management

### 4.1 Product Data Structure

```typescript
interface Product {
  id: string;                       // "prod-20241227-abc123"
  name: string;                     // "Leite Mimosa 1L"
  categoryId?: string;              // "cat-groceries"
  subcategoryId?: string;           // "subcat-dairy"
  defaultPrice?: number;            // 1.29 (most recent price, auto-updated)
  isWeighted: boolean;              // true = sold by kg
  isSolidified: boolean;            // User confirmed vs auto-created
  barcode?: string;                 // "5601234567890" or "N/A" if no barcode
  priceHistory: PriceHistoryEntry[];
}

interface PriceHistoryEntry {
  date: string;       // "2024-12-27"
  price: number;      // 1.29
  merchantId: string; // Which store had this price
}
```

**Note**: `excludeFromPriceHistory` is now a per-receipt-item setting, not a product-level setting.

### 4.2 Product List Page

**URL**: `/products`

**Features**:
- Search by product name
- Filter by category
- Sort by name, price, purchase count

**List Item**:
```
┌─────────────────────────────────────────┐
│ 📦  Leite Mimosa 1L              €1.29  │
│     Dairy • Last: Continente        [>] │
└─────────────────────────────────────────┘
```

### 4.3 Product Detail Page

**URL**: `/products/:id`

**Shows**:
- Product info (name, category, barcode/EAN)
- **Edit button** in header to modify product details
- Price statistics:
  - Current price (most recent)
  - Min/Max/Average price ever
  - Best price (lowest) and where
- Price history chart (line chart over time)
- Price by merchant table

### 4.4 Product Editing

Products can be edited from the detail page via the pencil icon. **Editable fields**:
- **Name**: User-preferred product name (receipts use abbreviations, users can rename)
- **Has EAN checkbox**: Toggle to indicate if product has a barcode
- **EAN/Barcode**: Product barcode for scanning lookup (shown only when "Has EAN" is checked)
- **Category**: Product categorization
- **Subcategory**: Fine-grained categorization
- **Pricing Type**: Unit-based or weight-based (per kg)

**Non-editable fields**:
- **Price**: Prices are derived exclusively from receipts to maintain accuracy. The `defaultPrice` is automatically updated when a new receipt is added.

**Barcode display**: Products always show the barcode line on the detail page. Displays "N/A" when no barcode is set.

**Per-receipt settings** (in ReceiptDialog, not ProductDialog):
- **Exclude from Price History**: Toggle per receipt item for promotional prices. This allows users to add receipts quickly and mark promotional items when reviewing later.

### 4.5 Price History Tracking

**When a receipt is saved**:
1. For each item where `excludeFromPriceHistory !== true`
2. Add entry to product's `priceHistory[]`:
   ```javascript
   priceHistory.push({
     date: receipt.date,
     price: item.unitPrice,
     merchantId: receipt.merchantId
   });
   ```
3. Update `defaultPrice` to this new price

**Products excluded from price history**:
- Placeholder items (unidentified)
- Items explicitly marked `excludeFromPriceHistory`
- Weighted items where price varies by actual weight

### 4.6 Weighted Products

Products like meat, cheese, fruits sold by weight:
- `isWeighted: true`
- Quantity can be fractional (e.g., 0.5 kg)
- Price is per kg
- Often excluded from price history (weight varies)

---

## 5. Category System

### 5.1 Category Data Structure

```typescript
interface Category {
  id: string;        // "cat-groceries"
  name: string;      // "Groceries"
  icon: string;      // "🛒" (emoji)
  color: string;     // "hsl(152, 55%, 45%)"
  isDefault: boolean;// true = cannot delete
}

interface Subcategory {
  id: string;              // "subcat-dairy"
  name: string;            // "Dairy"
  parentCategoryId: string;// "cat-groceries"
}
```

### 5.2 Default Categories

These are pre-loaded and cannot be deleted:

| ID | Name | Icon | Color (HSL) |
|----|------|------|-------------|
| cat-groceries | Groceries | 🛒 | hsl(152, 55%, 45%) |
| cat-dining | Dining | 🍽️ | hsl(15, 75%, 55%) |
| cat-transport | Transport | 🚗 | hsl(38, 85%, 50%) |
| cat-shopping | Shopping | 🛍️ | hsl(280, 55%, 55%) |
| cat-health | Health | 💊 | hsl(200, 70%, 50%) |
| cat-utilities | Utilities | 💡 | hsl(220, 60%, 55%) |
| cat-entertainment | Entertainment | 🎬 | hsl(340, 65%, 55%) |
| cat-other | Other | 📦 | hsl(0, 0%, 50%) |

### 5.3 Default Subcategories

| Subcategory | Parent |
|-------------|--------|
| Dairy, Bakery, Meat & Fish, Fruits & Vegetables, Frozen, Beverages | Groceries |
| Fast Food, Restaurants, Cafés | Dining |
| Fuel, Public Transport, Parking | Transport |
| Clothing, Electronics, Home & Garden | Shopping |

### 5.4 Category Detail Page

**URL**: `/categories/:id`

**Shows**:
- Category info (name, icon)
- Products in this category
- Subcategories
- Spending in this category (for selected month)

---

## 6. Insights & Charts

### 6.1 Spending Trends Chart

**Type**: Area chart  
**Data**: Last 6 months of spending  
**X-axis**: Month labels (Jan, Feb, Mar...)  
**Y-axis**: Total spent in €

**Data Calculation**:
```javascript
// For each of last 6 months:
for (let i = 5; i >= 0; i--) {
  const monthStart = startOfMonth(subMonths(now, i));
  const monthEnd = endOfMonth(monthStart);
  
  const total = receipts
    .filter(r => isWithinInterval(new Date(r.date), { start: monthStart, end: monthEnd }))
    .reduce((sum, r) => sum + r.total, 0);
  
  data.push({ month: format(monthStart, "MMM"), total });
}
// Result: [{month: "Jul", total: 756}, {month: "Aug", total: 834}, ...]
```

### 6.2 Category Pie Chart

**Type**: Donut/Pie chart  
**Data**: Spending by category for selected month  
**Colors**: Each category's `color` property

**Data Calculation**:
```javascript
// For each receipt item in the selected month:
receipt.items.forEach(item => {
  const product = products.find(p => p.id === item.productId);
  const categoryId = product?.categoryId || "uncategorized";
  spending[categoryId] += item.total;
});
```

### 6.3 Category Trends Chart

**Type**: Stacked bar chart  
**Data**: Category spending over last 6 months  
**Each bar**: One month, stacked by category

### 6.4 Category Breakdown

**Type**: List with progress bars  
**Data**: Each category with spending amount, percentage, and subcategory breakdown

```
┌─────────────────────────────────────────┐
│ 🛒 Groceries              €523.40  62%  │
│ [████████████████████░░░░░░░░░░░░░]     │
│   ├─ Dairy                     €89.50   │
│   ├─ Beverages                 €67.20   │
│   └─ Frozen                    €45.80   │
└─────────────────────────────────────────┘
```

---

## 7. Settings & Data Management

### 7.1 Data Export

**Format**: JSON file  
**Filename**: `pocket-keeper-backup-YYYY-MM-DD.json`

**Structure**:
```json
{
  "version": "1.0",
  "exportedAt": "2024-12-27T10:30:00.000Z",
  "categories": [...],
  "subcategories": [...],
  "merchants": [...],
  "products": [...],
  "receipts": [...]
}
```

### 7.2 Data Import

**Process**:
1. User selects JSON file
2. Validate `version` field exists
3. Replace all existing data with imported data
4. Show success/error toast

### 7.3 Reset to Demo Data

Loads sample data for testing:
- 3 sample merchants (Continente, Pingo Doce, McDonalds)
- 3 sample products
- 1 sample receipt

### 7.4 Delete All Data

- Clears all localStorage
- Reloads default categories only
- Requires confirmation dialog

### 7.5 Accessibility Options

| Option | Effect |
|--------|--------|
| High Contrast | Increases color contrast ratios |
| Larger Touch Targets | Increases button/tap area sizes |

---

## 8. User Experience Features

### 8.1 Theme Support

- **Light Mode**: Light backgrounds, dark text
- **Dark Mode**: Dark backgrounds, light text
- **System**: Follows device preference
- **Toggle**: In app header

### 8.2 Bottom Navigation (Mobile)

Fixed bottom bar with:
- Home (Dashboard)
- Receipts
- Add (FAB - floating action button)
- Products
- Settings

### 8.3 Swipe Actions

On list items, swipe left reveals:
- Edit button
- Delete button

### 8.4 Global Search

Searches across:
- Receipt merchant names
- Product names
- Merchant names

### 8.5 Empty States

When no data exists, shows helpful message with action button:
- "No receipts yet" → "Add Receipt" button
- "No products yet" → "Add Product" button

### 8.6 Toast Notifications

Feedback for user actions:
- "Receipt created" ✓
- "Product updated" ✓
- "Data exported" ✓
- Errors in red

---

## Rebuild Priority Plan

### Phase 1: Core Data Layer (Week 1)

**Priority**: Must have first - everything depends on this.

```
1. Database Schema
   └── Set up PostgreSQL with tables for:
       ├── categories (with defaults seeded)
       ├── subcategories (with defaults seeded)
       ├── merchants
       ├── products
       ├── price_history
       ├── receipts
       └── receipt_items

2. API Endpoints (CRUD)
   └── Basic REST endpoints for all entities:
       ├── GET/POST/PUT/DELETE /api/categories
       ├── GET/POST/PUT/DELETE /api/subcategories
       ├── GET/POST/PUT/DELETE /api/merchants
       ├── GET/POST/PUT/DELETE /api/products
       └── GET/POST/PUT/DELETE /api/receipts
```

### Phase 2: Receipt Entry (Week 2)

**Priority**: Core feature - this is what users do most.

```
3. Receipt Creation Form
   ├── Merchant selection with autocomplete
   ├── Date/time picker
   ├── Line item management (add/edit/remove)
   ├── Auto-total calculation
   └── Save to database

4. Receipt List & Detail
   ├── List page with search/filter/sort
   └── Detail page showing all info

5. Auto-creation Logic
   ├── Create merchant if new name entered
   └── Create product if new name entered
```

### Phase 3: Dashboard & Insights (Week 3)

**Priority**: Value-add - shows users their spending patterns.

```
6. Dashboard
   ├── Month navigation
   ├── Monthly total with comparison
   ├── Summary cards (count, average, all-time)
   └── Category breakdown list

7. Charts
   ├── Spending trends (6-month line chart)
   ├── Category pie chart
   └── Category trends (stacked bar)

8. Insights Calculations
   ├── Category spending aggregation
   ├── Month-over-month comparison
   └── Subcategory breakdown
```

### Phase 4: Product & Price Tracking (Week 4)

**Priority**: Secondary feature - enhances core value.

```
9. Product Management
   ├── Product list with category filter
   ├── Product detail page
   └── Category assignment

10. Price History
    ├── Track prices when receipts saved
    ├── Price history chart on product page
    ├── Min/max/average statistics
    └── Best price by merchant
```

### Phase 5: Merchant & Category Management (Week 5)

**Priority**: Supporting features.

```
11. Merchant Management
    ├── Merchant list page
    ├── Merchant detail with stats
    └── Merchant editing

12. Category Management
    ├── Category list page
    ├── Custom category creation
    └── Subcategory management
```

### Phase 6: Mobile & QR Features (Week 6)

**Priority**: Nice-to-have - enhances mobile experience.

```
13. QR Code Scanning (Mobile)
    ├── Camera integration
    ├── ATCUD parser
    └── Auto-fill from scan

14. Barcode Scanning (Mobile)
    ├── Product barcode scanning
    └── Auto-lookup and fill

15. PWA Setup
    ├── Service worker
    ├── Manifest
    └── Offline support
```

### Phase 7: Polish & Settings (Week 7)

**Priority**: Final polish.

```
16. Settings
    ├── Data export (JSON)
    ├── Data import
    ├── Delete all data
    └── Accessibility options

17. UX Polish
    ├── Theme support (dark/light)
    ├── Empty states
    ├── Toast notifications
    ├── Swipe actions
    └── Global search
```

---

## Dependency Graph

```
┌─────────────┐
│  Database   │ ← Everything depends on this
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ Categories  │────►│  Products   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       │    ┌─────────────┐│
       │    │  Merchants  ││
       │    └──────┬──────┘│
       │           │       │
       ▼           ▼       ▼
      ┌─────────────────────┐
      │      Receipts       │ ← Core feature
      └──────────┬──────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  Dashboard  │   │Price History│
└─────────────┘   └─────────────┘
```

---

## Testing Checklist

### Receipt Entry
- [ ] Can create receipt with new merchant
- [ ] Can create receipt with existing merchant
- [ ] Can add multiple items
- [ ] Total calculates correctly
- [ ] Date picker works
- [ ] Search merchants works
- [ ] Search products works

### Dashboard
- [ ] Month navigation works
- [ ] Cannot go to future months
- [ ] Total updates when changing months
- [ ] Comparison shows correct direction
- [ ] Charts render with data
- [ ] Charts handle empty data

### Products
- [ ] Price history updates on receipt save
- [ ] Category filter works
- [ ] Statistics calculate correctly

### Data
- [ ] Export downloads file
- [ ] Import restores data
- [ ] Delete clears all data
- [ ] Default categories remain after delete

---

*This document provides the complete specification needed to rebuild Pocket Keeper in any technology stack.*
