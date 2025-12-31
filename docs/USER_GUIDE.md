# 📱 Pocket Keeper - Complete User Guide

> **Version**: 1.0  
> **Last Updated**: December 2024  
> **Purpose**: Comprehensive guide for using the Pocket Keeper expense tracking application

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Receipts](#managing-receipts)
4. [Managing Merchants](#managing-merchants)
5. [Managing Products](#managing-products)
6. [Managing Categories](#managing-categories)
7. [Insights & Analytics](#insights--analytics)
8. [Settings & Data Management](#settings--data-management)
9. [Tips & Best Practices](#tips--best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What is Pocket Keeper?

Pocket Keeper is a personal expense tracking application designed for detailed receipt digitization. Unlike traditional budget apps that track bank accounts, Pocket Keeper focuses on:

- **Receipt-level tracking**: Store complete receipts with individual line items
- **Price history**: Monitor how product prices change over time
- **Store comparison**: Find which merchant has the best prices
- **Category insights**: Understand where your money goes

### First Launch

When you first open Pocket Keeper, you'll see:

1. **Empty Dashboard**: Your monthly spending summary (currently €0.00)
2. **Bottom Navigation**: Quick access to all sections
3. **Demo Data Option**: Go to Settings to load sample data for testing

### Navigation

**Mobile (Bottom Bar)**:
- 🏠 **Home**: Dashboard with monthly overview
- 🧾 **Receipts**: All your receipts
- ➕ **Add**: Quick add new receipt (center button)
- 📦 **Products**: Product catalog
- ⚙️ **Settings**: App settings and data management

**Desktop (Sidebar)**:
- Full navigation menu on the left side
- Same sections as mobile

---

## Dashboard Overview

### Monthly Summary

The dashboard shows your spending for the selected month:

```
┌─────────────────────────────────────────┐
│  [<]     December 2024     [>]          │
│              €847.32                     │
│         ▼ 8.2% vs last month            │
└─────────────────────────────────────────┘
```

- **Arrow buttons**: Navigate between months
- **Total**: Your spending for the selected month
- **Comparison**: Shows if you spent more (▲ red) or less (▼ green) than last month

### Summary Cards

| Card | What it Shows |
|------|---------------|
| **Receipts** | Number of receipts this month |
| **Avg Receipt** | Average amount per receipt |
| **All Time** | Total spending since you started using the app |

### Category Pie Chart

Interactive donut chart showing spending distribution by category. Tap/click a section to see the category name and amount.

### Recent Receipts

List of your 5 most recent receipts with:
- Store name
- Date
- Total amount

Tap any receipt to view its details.

---

## Managing Receipts

### Adding a Receipt

1. Tap the **+** button (center of bottom navigation)
2. Fill in the details:

| Field | Required | Description |
|-------|----------|-------------|
| **Store** | ✅ | Start typing to search existing stores or enter a new name |
| **Date** | ✅ | Defaults to today, tap to change |
| **Time** | ❌ | Optional, useful for tracking when you shop |
| **Receipt #** | ❌ | Toggle checkbox if receipt has a number |
| **Customer NIF** | ❌ | Your tax number if requested on receipt |
| **Notes** | ❌ | Any additional notes |

3. **Add Items**:
   - Tap "Add Item"
   - Search for existing product or enter new name
   - Enter quantity and unit price
   - Total calculates automatically

4. Tap **Save** to create the receipt

### QR Code Scanning (Mobile)

For Portuguese receipts with ATCUD QR codes:

1. Tap the **QR icon** in the receipt form
2. Point camera at the QR code on receipt
3. Data auto-fills:
   - Store NIF (tax number)
   - Date
   - Total amount
4. Add items manually or leave as "Unidentified Items"

### Editing a Receipt

1. Open the receipt from the Receipts list
2. Tap the **pencil icon** (✏️) in the header
3. Make your changes
4. Tap **Save**

### Deleting a Receipt

**Option 1**: Swipe left on a receipt in the list, tap Delete

**Option 2**: Open receipt details, tap the delete icon in the header

### Receipt List Features

- **Search**: Find receipts by store name, receipt number, or notes
- **Sort**: By date, amount, store name, or item count
- **Filter**: 
  - "Has NIF" - Receipts with your tax number
  - "This Month" / "Last Month"
  - By specific merchant

---

## Managing Merchants

### What are Merchants?

Merchants (stores) are the places where you make purchases. They're automatically created when you add receipts but can be edited for accuracy.

### Viewing Merchants

1. Tap **Merchants** in the menu (or search globally)
2. See list with:
   - Store name
   - NIF (if available)
   - Number of receipts
   - Total spent

### Merchant Details

Tap any merchant to see:
- Basic info (name, NIF, address)
- Total receipts
- Total spent
- Average receipt value
- Monthly spending breakdown
- All receipts from this store

### Editing a Merchant

1. Open merchant details
2. Tap the **pencil icon** (✏️)
3. Edit:
   - **Name**: Correct or expand the store name
   - **NIF**: 9-digit Portuguese tax number
   - **Address**: Store location
4. Tap **Save**

### "New" Badge

Merchants created automatically from receipts show a "New" badge until you edit and confirm them.

---

## Managing Products

### What are Products?

Products are individual items you purchase. Each product tracks:
- Name and category
- Price history across different stores
- Barcode (if applicable)
- Whether it's sold by weight

### Viewing Products

1. Tap **Products** in the bottom navigation
2. See list with:
   - Product name
   - Current price
   - Category
   - Last purchase location

### Product Details

Tap any product to see:
- Basic info (name, barcode, category)
- **Price Statistics**:
  - Current price (most recent)
  - Minimum price ever paid
  - Maximum price ever paid
  - Average price
  - Best price and where
- **Price History Chart**: Visual timeline of price changes
- **Price by Store**: Compare prices across merchants

### Editing a Product

1. Open product details
2. Tap the **pencil icon** (✏️)
3. Edit:
   - **Name**: User-friendly product name
   - **Has EAN**: Toggle if product has a barcode
   - **Barcode/EAN**: The product barcode
   - **Category**: Main category
   - **Subcategory**: More specific grouping
   - **Pricing Type**: Unit or by weight (per kg)
4. Tap **Save**

**Note**: Prices cannot be edited directly—they come from receipts to maintain accuracy.

### Adding Manual Prices

To track a price without creating a receipt (e.g., price scouting):

1. Open product details
2. Scroll to "Price by Store" section
3. Tap **Add Price**
4. Enter:
   - **Price**: The price you observed
   - **Merchant**: Which store (type to search or create new)
5. Tap **Save**

This is useful for:
- Comparing prices before buying
- Recording sales/promotions
- Tracking competitor prices

---

## Managing Categories

### Default Categories

Pocket Keeper comes with sample categories:

| Category | Icon | Typical Use |
|----------|------|-------------|
| Groceries | 🛒 | Food and household items |
| Dining | 🍽️ | Restaurants, cafés, takeout |
| Transport | 🚗 | Fuel, parking, public transit |
| Shopping | 🛍️ | Clothing, electronics, general |
| Health | 💊 | Pharmacy, medical expenses |
| Utilities | 💡 | Bills, subscriptions |
| Entertainment | 🎬 | Movies, games, hobbies |
| Other | 📦 | Everything else |

### Customizing Categories

Go to **Settings** → **Manage Categories**:

- **Add**: Create new categories with custom names and icons
- **Edit**: Change name, icon, or color
- **Delete**: Remove any category (products become uncategorized)
- **Color Picker**: Choose a custom HEX color for charts

### Subcategories

Each category can have subcategories for finer organization:

**Groceries** → Dairy, Bakery, Meat & Fish, Produce, Frozen, Beverages

Create subcategories when editing a category or from the category detail page.

---

## Insights & Analytics

### Accessing Insights

Tap **Insights** from the dashboard or menu to see detailed analytics.

### Available Charts

#### 1. Spending Trends (Line Chart)
- Shows spending over the last 6 months
- Helps identify patterns (e.g., holiday spending spikes)

#### 2. Category Pie Chart
- Interactive donut chart
- Shows percentage of spending per category
- Tap sections for details

#### 3. Category Trends (Stacked Bar Chart)
- Monthly category comparison
- See how category spending changes over time

#### 4. Category Breakdown (List View)
- Detailed list with progress bars
- Shows amount and percentage per category
- Expandable subcategory details
- **Tap amounts to toggle** between € and % display

### Category Detail Insights

Tap any category to drill down:
- Total spending in that category
- Subcategory breakdown
- Top products in category
- Spending trend over time

---

## Settings & Data Management

### Accessing Settings

Tap the **gear icon** (⚙️) in the navigation.

### Theme

- **Light Mode**: Bright backgrounds
- **Dark Mode**: Dark backgrounds (easier on eyes)
- **System**: Follows your device setting

Toggle using the sun/moon icon in the header.

### Data Export

Create a backup of all your data:

1. Go to Settings
2. Tap **Export Data**
3. A JSON file downloads with all:
   - Categories
   - Subcategories
   - Merchants
   - Products
   - Receipts

**Filename**: `pocket-keeper-backup-YYYY-MM-DD.json`

### Data Import

Restore from a backup:

1. Go to Settings
2. Tap **Import Data**
3. Select your backup JSON file
4. Data replaces current data

**⚠️ Warning**: Import replaces ALL existing data!

### Reset to Demo Data

Load sample data for testing:

1. Go to Settings
2. Tap **Reset to Demo Data**
3. Confirm the action

This loads:
- Sample merchants (Continente, Pingo Doce, McDonald's)
- Sample products
- Sample receipts

### Delete All Data

Permanently remove everything:

1. Go to Settings
2. Tap **Delete All Data**
3. Type "DELETE" to confirm
4. Tap **Delete**

**⚠️ Warning**: This cannot be undone! Export first if you want a backup.

### Accessibility

| Option | Effect |
|--------|--------|
| **High Contrast** | Increases color contrast for better visibility |
| **Larger Touch Targets** | Bigger buttons for easier tapping |

### Manage Categories

Full category editor (see [Managing Categories](#managing-categories) section).

---

## Tips & Best Practices

### 1. Enter Receipts Promptly

The sooner you enter receipts, the more accurate your tracking. Consider entering right after shopping while details are fresh.

### 2. Use the QR Scanner (Portugal)

Portuguese receipts have ATCUD QR codes that auto-fill date, total, and store NIF. Much faster than manual entry!

### 3. Name Products Clearly

When a product is auto-created from a receipt, the name might be abbreviated. Edit products to give them clear, recognizable names.

**Example**: "LEITE MIMOSA 1L UHT" → "Leite Mimosa 1L"

### 4. Assign Categories Early

Uncategorized products won't appear in category insights. Take a moment to categorize products when you first see them.

### 5. Use Subcategories

Subcategories provide deeper insights:
- Instead of just "Groceries: €500"
- See "Dairy: €80, Beverages: €60, Meat: €120..."

### 6. Track Weighted Items Separately

Mark products like cheese, meat, or fruits as "weighted" so their variable prices don't skew your price history.

### 7. Export Regularly

Create backups regularly! Go to Settings → Export Data at least monthly.

### 8. Use Manual Price Entry

When you see a good deal but don't buy:
- Go to the product
- Tap "Add Price"
- Record the price and store

This builds your price comparison database without requiring a purchase.

### 9. Mark Promotional Prices

When entering receipts with sale items, mark them as "Exclude from price history" so they don't distort your average price calculations.

---

## Troubleshooting

### App Not Loading

1. **Clear browser cache**: The app is a PWA and caches files
2. **Check localStorage**: Make sure localStorage isn't disabled
3. **Try incognito mode**: Tests if extensions are interfering

### Data Not Saving

1. **Check localStorage quota**: Browsers limit to ~5MB
2. **Export data**: If storage is full, export and clear some old receipts
3. **Check browser settings**: Some privacy modes block localStorage

### QR Scanner Not Working

1. **Camera permission**: Make sure the app has camera access
2. **Good lighting**: QR codes need adequate lighting
3. **Focus**: Hold the camera steady until it focuses
4. **Distance**: Not too close, not too far

### Charts Not Displaying

1. **No data**: Charts need receipts with items assigned to categories
2. **Wrong month**: Check you're viewing a month with data
3. **Reload app**: Sometimes a refresh helps

### PWA Not Installing

1. **HTTPS required**: PWA installation requires secure connection
2. **Already installed**: Check if it's already in your app drawer
3. **Browser support**: Use Chrome, Edge, or Safari (iOS 11.3+)

### Data Lost After Update

1. **Check localStorage**: Data is stored in browser
2. **Different browser**: Did you switch browsers?
3. **Cleared cache**: Clearing cache doesn't delete localStorage, but clearing site data does

### White Screen on GitHub Pages

If deployed to GitHub Pages and seeing white screen:
1. Check browser console for errors (F12 → Console)
2. Verify the repository name matches the base path
3. Check that the GitHub Actions workflow completed successfully
4. Ensure GitHub Pages is enabled in repository settings

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Open global search |
| `Esc` | Close dialogs/modals |
| `Tab` | Navigate form fields |
| `Enter` | Submit forms/confirm actions |

---

## Glossary

| Term | Definition |
|------|------------|
| **ATCUD** | Portuguese tax authority QR code format on receipts |
| **NIF** | Número de Identificação Fiscal (Portuguese tax number) |
| **Solidified** | A merchant/product confirmed by the user (vs auto-created) |
| **Weighted Product** | Items sold by weight (kg) rather than unit |
| **Price History** | Record of product prices over time |
| **Subcategory** | A more specific grouping within a category |

---

## Getting Help

If you encounter issues not covered here:

1. **Check the FAQ**: Common questions are answered above
2. **GitHub Issues**: Report bugs or request features
3. **Export your data**: Before troubleshooting, always backup!

---

*Thank you for using Pocket Keeper! Track smart, spend wise.* 🧾
