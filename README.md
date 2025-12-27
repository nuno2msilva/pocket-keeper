# 🧾 Pocket Keeper - Personal Expense Tracker

A mobile-first personal expense tracking application built with React, TypeScript, and Tailwind CSS. Track your receipts, manage merchants and products, and gain insights into your spending habits with beautiful visualizations.

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?logo=pwa)

## 📱 Screenshots

The app features a clean, modern interface optimized for mobile devices with:
- Dashboard with spending insights and charts
- Receipt management with QR code scanning
- Product catalog with price tracking
- Category-based spending breakdowns

---

## ✨ Features

### 📊 Dashboard & Insights
- **Monthly Overview**: Navigate between months to see spending totals and trends
- **Month-over-Month Comparison**: Visual indicators showing spending changes vs previous month
- **Category Pie Chart**: Interactive donut chart showing spending distribution
- **Spending Trends**: Line chart displaying 6-month spending history
- **Category Trends**: Stacked bar chart showing category spending over time
- **Category Breakdown**: Detailed view with subcategory spending and progress bars

### 🧾 Receipt Management
- **Add Receipts Manually**: Create detailed receipts with merchant, date, time, and items
- **QR Code Scanning**: Scan Portuguese ATCUD QR codes to auto-fill receipt data (NIF, date, time, total)
- **Itemized Tracking**: Add multiple products per receipt with quantities and prices
- **Receipt Details**: View complete receipt information with edit/delete capabilities
- **Search & Filter**: Find receipts by merchant, date, or amount

### 🏪 Merchant Management
- **Merchant Catalog**: Maintain a list of stores where you shop
- **NIF Tracking**: Store Portuguese tax numbers for each merchant
- **Merchant Details**: View all receipts and spending history per merchant
- **Auto-Creation**: Merchants are automatically created when adding new receipts
- **Smart Matching**: Find merchants by NIF or name to avoid duplicates

### 📦 Product Management
- **Product Catalog**: Track all products you purchase
- **Category Assignment**: Organize products into categories and subcategories
- **Price History**: Track price changes across different merchants over time
- **Weighted Products**: Support for products sold by weight (per kg pricing)
- **Best Price Finder**: See which merchant has the lowest price for each product
- **Barcode Support**: Associate barcodes with products for future scanning

### 🏷️ Category System
- **Default Categories**: Pre-configured categories (Food, Transport, Entertainment, etc.)
- **Custom Categories**: Add, edit, and delete your own categories
- **Subcategories**: Create subcategories for finer organization
- **Color Coding**: Each category has a unique color for charts and UI
- **Icon Support**: Emoji icons for quick visual identification
- **Category Details**: View all products and spending within a category

### ⚙️ Settings & Data Management
- **Export Data**: Download all data as a JSON backup file
- **Import Data**: Restore from a previously exported backup
- **Reset to Demo**: Load sample data for testing
- **Delete All Data**: Permanently remove all data
- **Accessibility Options**:
  - High Contrast Mode
  - Larger Touch Targets

### 🎨 User Experience
- **Dark/Light Theme**: System-aware theme with manual toggle option
- **Mobile-First Design**: Optimized for touch devices with bottom navigation
- **Swipe Actions**: Swipe left on list items to reveal edit/delete actions
- **Global Search**: Search across receipts, merchants, and products
- **Empty States**: Helpful guidance when data is empty
- **Toast Notifications**: Feedback for user actions
- **Lazy Loading**: Pages load on-demand for faster initial load

---

## 📚 Documentation

Detailed documentation for developers and rebuild efforts:

| Document | Description |
|----------|-------------|
| [FEATURES_DETAILED.md](docs/FEATURES_DETAILED.md) | Hyper-detailed feature specs with code examples, UI mockups, and rebuild priority plan |
| [TECHNICAL_SPECIFICATION.md](docs/TECHNICAL_SPECIFICATION.md) | Full architecture, Docker setup, Python models, business logic |
| [API_REFERENCE.md](docs/API_REFERENCE.md) | Complete REST API documentation with all endpoints |
| [DATABASE_SCHEMA.sql](docs/DATABASE_SCHEMA.sql) | Ready-to-run PostgreSQL schema with seed data |

---

## 🏗️ Architecture

### Project Structure

```
src/
├── App.tsx                    # Main app with routing and providers
├── main.tsx                   # Entry point
├── index.css                  # Global styles and design tokens
│
├── components/ui/             # Shadcn UI components (buttons, cards, dialogs, etc.)
│
├── features/                  # Feature-based modules
│   ├── dashboard/            
│   │   └── pages/DashboardPage.tsx
│   │
│   ├── receipts/
│   │   ├── components/
│   │   │   ├── ReceiptDialog.tsx
│   │   │   ├── QRScanner.tsx
│   │   │   └── BarcodeScanner.tsx
│   │   ├── pages/
│   │   │   ├── ReceiptsPage.tsx
│   │   │   └── ReceiptDetail.tsx
│   │   └── utils/atcudParser.ts
│   │
│   ├── merchants/
│   │   ├── components/MerchantDialog.tsx
│   │   └── pages/
│   │       ├── MerchantsPage.tsx
│   │       └── MerchantDetailPage.tsx
│   │
│   ├── products/
│   │   ├── components/ProductDialog.tsx
│   │   └── pages/
│   │       ├── ProductsPage.tsx
│   │       └── ProductDetailPage.tsx
│   │
│   ├── categories/
│   │   └── pages/
│   │       ├── CategoriesPage.tsx
│   │       └── CategoryDetailPage.tsx
│   │
│   ├── insights/
│   │   └── components/
│   │       ├── SpendingTrendsChart.tsx
│   │       ├── CategoryPieChart.tsx
│   │       ├── CategoryTrendsChart.tsx
│   │       └── CategoryBreakdown.tsx
│   │
│   ├── settings/
│   │   ├── components/CategoryEditor.tsx
│   │   └── pages/SettingsPage.tsx
│   │
│   └── shared/
│       ├── components/
│       │   ├── AppLayout.tsx
│       │   ├── BottomNav.tsx
│       │   ├── PageHeader.tsx
│       │   ├── ListCard.tsx
│       │   ├── ListToolbar.tsx
│       │   ├── SwipeableItem.tsx
│       │   ├── EmptyState.tsx
│       │   ├── GlobalSearch.tsx
│       │   └── DeleteConfirmDialog.tsx
│       ├── data/
│       │   ├── repository.ts
│       │   ├── defaultCategories.ts
│       │   └── demoData.ts
│       ├── hooks/
│       │   ├── useRepository.ts
│       │   └── useAccessibility.ts
│       └── types/index.ts
│
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   └── useDeviceType.ts
│
├── lib/utils.ts               # Utility functions (cn, etc.)
│
└── pages/NotFound.tsx         # 404 page
```

### Data Layer

The app uses a **Repository Pattern** for data management:

- **Storage**: Currently uses `localStorage` for persistence
- **Abstraction**: Clean interface that can be swapped for API/database
- **Hooks**: React hooks provide reactive data access
  - `useReceipts()` - CRUD operations for receipts
  - `useMerchants()` - Merchant management with search
  - `useProducts()` - Product catalog with price history
  - `useCategories()` - Category management
  - `useSubcategories()` - Subcategory management

### Type System

Core data types defined in `src/features/shared/types/index.ts`:

```typescript
interface Receipt {
  id: string;
  merchantId: string;
  date: string;           // YYYY-MM-DD
  time?: string;          // HH:MM
  receiptNumber?: string;
  customerNif?: string;
  hasCustomerNif: boolean;
  items: ReceiptItem[];
  total: number;
  notes?: string;
}

interface Merchant {
  id: string;
  name: string;
  nif?: string;           // Portuguese tax number
  address?: string;
  isSolidified?: boolean;
}

interface Product {
  id: string;
  name: string;
  categoryId?: string;
  subcategoryId?: string;
  defaultPrice?: number;
  isWeighted?: boolean;
  excludeFromPriceHistory?: boolean;
  barcode?: string;
  priceHistory?: PriceHistoryEntry[];
}

interface Category {
  id: string;
  name: string;
  icon: string;           // Emoji
  color: string;          // Hex color
  isDefault?: boolean;
}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **bun** package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd pocket-keeper

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

---

## 🌐 Progressive Web App (PWA)

The app is PWA-ready and can be installed on any device:

### Features
- **Offline Support**: Works without internet after first load
- **Installable**: Add to home screen on mobile devices
- **Auto-Update**: Automatically updates when new versions are available

### Installing on Mobile
1. Open the app in your mobile browser
2. **iOS**: Tap Share → "Add to Home Screen"
3. **Android**: Tap menu → "Install app" or "Add to Home Screen"

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18 with TypeScript |
| **Routing** | React Router v6 |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State** | React hooks + localStorage |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **Date Handling** | date-fns |
| **Icons** | Lucide React |
| **QR Scanning** | html5-qrcode |
| **Swipe Gestures** | react-swipeable |
| **Theme** | next-themes |
| **PWA** | vite-plugin-pwa |

| **Build Tool** | Vite |

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🎨 Design System

The app uses a comprehensive design system defined in:
- `src/index.css` - CSS variables and design tokens
- `tailwind.config.ts` - Tailwind configuration

### Color Tokens
- `--background` / `--foreground` - Main surfaces
- `--primary` / `--primary-foreground` - Primary actions
- `--secondary` / `--secondary-foreground` - Secondary surfaces
- `--muted` / `--muted-foreground` - Subdued elements
- `--accent` - Highlight color
- `--destructive` - Error/delete actions
- `--success` - Success indicators

### Theme Support
- Light and dark themes with system preference detection
- Manual toggle available in the app header

---

## 🔮 Future Enhancements

Potential features for future development:

- [ ] **Cloud Sync**: Supabase integration for cross-device sync
- [ ] **Authentication**: User accounts and data privacy
- [ ] **Budgeting**: Set monthly budgets per category
- [ ] **Recurring Expenses**: Track subscriptions and regular payments
- [ ] **Receipt OCR**: Scan paper receipts and extract data
- [ ] **Multi-Currency**: Support for multiple currencies
- [ ] **Reports**: PDF export of spending reports
- [ ] **Widgets**: Home screen widgets for quick add

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Support

If you have any questions or issues, please open an issue on GitHub.

---

Built with ❤️ using [Lovable](https://lovable.dev)
