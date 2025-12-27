# Pocket Keeper - Technical Specification

## Overview

**Pocket Keeper** is a personal expense and receipt tracking application. This document provides complete technical specifications for rebuilding the application using **Python**, **PostgreSQL**, **Docker**, and plain **HTML/CSS/JavaScript**.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Business Logic](#business-logic)
6. [Frontend Pages](#frontend-pages)
7. [Docker Configuration](#docker-configuration)
8. [File Structure](#file-structure)

---

## Architecture Overview

### Recommended Stack

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
│  HTML5 / CSS3 / Vanilla JavaScript (or Alpine.js)       │
│  - Responsive design (mobile-first)                      │
│  - PWA capabilities (service worker)                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND API                            │
│  Python (FastAPI or Flask)                               │
│  - RESTful JSON API                                      │
│  - JWT Authentication (optional)                         │
│  - CORS enabled                                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    DATABASE                              │
│  PostgreSQL 15+                                          │
│  - Persistent storage                                    │
│  - Full-text search                                      │
│  - JSON columns for flexible data                        │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  categories  │     │   subcategories  │     │   products   │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ id (PK)      │◄────│ parent_cat_id(FK)│     │ id (PK)      │
│ name         │     │ id (PK)          │     │ name         │
│ icon         │     │ name             │     │ category_id  │──►
│ color        │     └──────────────────┘     │ subcategory_id│
│ is_default   │                              │ default_price │
└──────────────┘                              │ is_weighted   │
                                              │ barcode       │
                                              │ is_solidified │
┌──────────────┐     ┌──────────────────┐     └──────────────┘
│  merchants   │     │    receipts      │            │
├──────────────┤     ├──────────────────┤            │
│ id (PK)      │◄────│ merchant_id (FK) │            │
│ name         │     │ id (PK)          │            │
│ nif          │     │ date             │            │
│ address      │     │ time             │            ▼
│ is_solidified│     │ receipt_number   │     ┌──────────────┐
└──────────────┘     │ customer_nif     │     │ price_history│
                     │ has_customer_nif │     ├──────────────┤
                     │ total            │     │ id (PK)      │
                     │ notes            │     │ product_id(FK)│
                     └──────────────────┘     │ merchant_id  │
                              │               │ date         │
                              │               │ price        │
                              ▼               └──────────────┘
                     ┌──────────────────┐
                     │  receipt_items   │
                     ├──────────────────┤
                     │ id (PK)          │
                     │ receipt_id (FK)  │
                     │ product_id (FK)  │
                     │ product_name     │
                     │ quantity         │
                     │ unit_price       │
                     │ total            │
                     │ exclude_price_hist│
                     └──────────────────┘
```

### SQL Schema

```sql
-- Categories table
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL DEFAULT '📦',
    color VARCHAR(30) NOT NULL DEFAULT 'hsl(0, 0%, 50%)',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories table
CREATE TABLE subcategories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Merchants (stores) table
CREATE TABLE merchants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    nif VARCHAR(20),  -- Portuguese tax number
    address TEXT,
    is_solidified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id VARCHAR(50) REFERENCES subcategories(id) ON DELETE SET NULL,
    default_price DECIMAL(10, 2),
    is_weighted BOOLEAN DEFAULT FALSE,
    exclude_from_price_history BOOLEAN DEFAULT FALSE,
    is_solidified BOOLEAN DEFAULT FALSE,
    barcode VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price history table
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    merchant_id VARCHAR(50) REFERENCES merchants(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receipts table
CREATE TABLE receipts (
    id VARCHAR(50) PRIMARY KEY,
    merchant_id VARCHAR(50) NOT NULL REFERENCES merchants(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    time TIME,
    receipt_number VARCHAR(100),
    customer_nif VARCHAR(20),
    has_customer_nif BOOLEAN DEFAULT FALSE,
    total DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receipt items table
CREATE TABLE receipt_items (
    id VARCHAR(50) PRIMARY KEY,
    receipt_id VARCHAR(50) NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(300) NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    exclude_from_price_history BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_receipts_date ON receipts(date DESC);
CREATE INDEX idx_receipts_merchant ON receipts(merchant_id);
CREATE INDEX idx_receipt_items_receipt ON receipt_items(receipt_id);
CREATE INDEX idx_receipt_items_product ON receipt_items(product_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_price_history_product ON price_history(product_id);
CREATE INDEX idx_subcategories_parent ON subcategories(parent_category_id);
```

### Default Categories (Seed Data)

```sql
INSERT INTO categories (id, name, icon, color, is_default) VALUES
    ('cat-groceries', 'Groceries', '🛒', 'hsl(152, 55%, 45%)', TRUE),
    ('cat-dining', 'Dining', '🍽️', 'hsl(15, 75%, 55%)', TRUE),
    ('cat-transport', 'Transport', '🚗', 'hsl(38, 85%, 50%)', TRUE),
    ('cat-shopping', 'Shopping', '🛍️', 'hsl(280, 55%, 55%)', TRUE),
    ('cat-health', 'Health', '💊', 'hsl(200, 70%, 50%)', TRUE),
    ('cat-utilities', 'Utilities', '💡', 'hsl(220, 60%, 55%)', TRUE),
    ('cat-entertainment', 'Entertainment', '🎬', 'hsl(340, 65%, 55%)', TRUE),
    ('cat-other', 'Other', '📦', 'hsl(0, 0%, 50%)', TRUE);

INSERT INTO subcategories (id, name, parent_category_id) VALUES
    ('subcat-dairy', 'Dairy', 'cat-groceries'),
    ('subcat-bakery', 'Bakery', 'cat-groceries'),
    ('subcat-meat', 'Meat & Fish', 'cat-groceries'),
    ('subcat-produce', 'Fruits & Vegetables', 'cat-groceries'),
    ('subcat-frozen', 'Frozen', 'cat-groceries'),
    ('subcat-beverages', 'Beverages', 'cat-groceries'),
    ('subcat-fastfood', 'Fast Food', 'cat-dining'),
    ('subcat-restaurants', 'Restaurants', 'cat-dining'),
    ('subcat-cafes', 'Cafés', 'cat-dining'),
    ('subcat-fuel', 'Fuel', 'cat-transport'),
    ('subcat-publictransport', 'Public Transport', 'cat-transport'),
    ('subcat-parking', 'Parking', 'cat-transport'),
    ('subcat-clothing', 'Clothing', 'cat-shopping'),
    ('subcat-electronics', 'Electronics', 'cat-shopping'),
    ('subcat-home', 'Home & Garden', 'cat-shopping');
```

---

## API Endpoints

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/:id` | Get category by ID |
| POST | `/api/categories` | Create new category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category (not default) |

### Subcategories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subcategories` | List all subcategories |
| GET | `/api/subcategories?category_id=:id` | Filter by parent category |
| POST | `/api/subcategories` | Create subcategory |
| PUT | `/api/subcategories/:id` | Update subcategory |
| DELETE | `/api/subcategories/:id` | Delete subcategory |

### Merchants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/merchants` | List all merchants |
| GET | `/api/merchants/:id` | Get merchant with stats |
| POST | `/api/merchants` | Create merchant |
| PUT | `/api/merchants/:id` | Update merchant |
| DELETE | `/api/merchants/:id` | Delete merchant |
| GET | `/api/merchants/:id/receipts` | Get merchant's receipts |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product with price history |
| GET | `/api/products?barcode=:code` | Find product by barcode |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/products/:id/price-history` | Get price history |

### Receipts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/receipts` | List all receipts (paginated) |
| GET | `/api/receipts?month=:YYYY-MM` | Filter by month |
| GET | `/api/receipts/:id` | Get receipt with items |
| POST | `/api/receipts` | Create receipt with items |
| PUT | `/api/receipts/:id` | Update receipt |
| DELETE | `/api/receipts/:id` | Delete receipt |

### Dashboard & Insights

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Current month summary |
| GET | `/api/insights/spending-trends?months=:n` | Monthly spending data |
| GET | `/api/insights/category-breakdown?month=:YYYY-MM` | Spending by category |
| GET | `/api/insights/top-merchants?limit=:n` | Top merchants by spend |

### Data Export/Import

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export` | Export all data as JSON |
| POST | `/api/import` | Import data from JSON |

---

## Data Models

### Python Pydantic Models (FastAPI)

```python
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time
from decimal import Decimal

# Category
class CategoryBase(BaseModel):
    name: str
    icon: str = "📦"
    color: str = "hsl(0, 0%, 50%)"

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: str
    is_default: bool = False

    class Config:
        from_attributes = True

# Subcategory
class SubcategoryBase(BaseModel):
    name: str
    parent_category_id: str

class Subcategory(SubcategoryBase):
    id: str

# Merchant
class MerchantBase(BaseModel):
    name: str
    nif: Optional[str] = None
    address: Optional[str] = None

class MerchantCreate(MerchantBase):
    pass

class Merchant(MerchantBase):
    id: str
    is_solidified: bool = False

class MerchantWithStats(Merchant):
    receipt_count: int
    total_spent: Decimal
    last_visit: Optional[date]

# Product
class ProductBase(BaseModel):
    name: str
    category_id: Optional[str] = None
    subcategory_id: Optional[str] = None
    default_price: Optional[Decimal] = None
    is_weighted: bool = False
    exclude_from_price_history: bool = False
    barcode: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: str
    is_solidified: bool = False

class PriceHistoryEntry(BaseModel):
    date: date
    price: Decimal
    merchant_id: str
    merchant_name: Optional[str] = None

class ProductWithHistory(Product):
    price_history: List[PriceHistoryEntry] = []
    category_name: Optional[str] = None

# Receipt Item
class ReceiptItemBase(BaseModel):
    product_id: Optional[str] = None
    product_name: str
    quantity: Decimal
    unit_price: Decimal
    total: Decimal
    exclude_from_price_history: bool = False

class ReceiptItemCreate(ReceiptItemBase):
    pass

class ReceiptItem(ReceiptItemBase):
    id: str

# Receipt
class ReceiptBase(BaseModel):
    merchant_id: str
    date: date
    time: Optional[time] = None
    receipt_number: Optional[str] = None
    customer_nif: Optional[str] = None
    has_customer_nif: bool = False
    total: Decimal
    notes: Optional[str] = None

class ReceiptCreate(ReceiptBase):
    items: List[ReceiptItemCreate]

class Receipt(ReceiptBase):
    id: str
    items: List[ReceiptItem] = []
    merchant_name: Optional[str] = None

# Dashboard
class DashboardSummary(BaseModel):
    current_month_total: Decimal
    previous_month_total: Decimal
    month_change_percent: Optional[float]
    receipt_count: int
    top_category: Optional[str]
    top_category_amount: Optional[Decimal]

# Insights
class MonthlySpending(BaseModel):
    month: str  # YYYY-MM
    total: Decimal

class CategorySpending(BaseModel):
    category_id: str
    category_name: str
    category_icon: str
    category_color: str
    total: Decimal
    percentage: float
```

---

## Business Logic

### 1. Receipt Creation

When creating a receipt:

```python
def create_receipt(receipt_data: ReceiptCreate) -> Receipt:
    # 1. Generate unique ID
    receipt_id = generate_id("rec")
    
    # 2. Validate merchant exists
    merchant = get_merchant(receipt_data.merchant_id)
    if not merchant:
        raise ValueError("Merchant not found")
    
    # 3. Process each item
    items = []
    for item_data in receipt_data.items:
        item_id = generate_id("item")
        
        # 4. Update product price history if not excluded
        if item_data.product_id and not item_data.exclude_from_price_history:
            add_price_history(
                product_id=item_data.product_id,
                merchant_id=receipt_data.merchant_id,
                date=receipt_data.date,
                price=item_data.unit_price
            )
        
        items.append(ReceiptItem(id=item_id, **item_data.dict()))
    
    # 5. Save receipt
    receipt = Receipt(id=receipt_id, items=items, **receipt_data.dict())
    save_receipt(receipt)
    
    return receipt
```

### 2. Dashboard Calculations

```python
def get_dashboard_summary() -> DashboardSummary:
    today = date.today()
    current_month = today.strftime("%Y-%m")
    prev_month = (today.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")
    
    # Sum receipts for current month
    current_total = sum_receipts_by_month(current_month)
    prev_total = sum_receipts_by_month(prev_month)
    
    # Calculate percentage change
    if prev_total > 0:
        change_percent = ((current_total - prev_total) / prev_total) * 100
    else:
        change_percent = None
    
    # Get top category
    category_breakdown = get_category_breakdown(current_month)
    top_cat = max(category_breakdown, key=lambda x: x.total, default=None)
    
    return DashboardSummary(
        current_month_total=current_total,
        previous_month_total=prev_total,
        month_change_percent=change_percent,
        receipt_count=count_receipts_by_month(current_month),
        top_category=top_cat.category_name if top_cat else None,
        top_category_amount=top_cat.total if top_cat else None
    )
```

### 3. Category Breakdown

```python
def get_category_breakdown(month: str) -> List[CategorySpending]:
    """
    Calculate spending by category for a given month.
    Joins receipt_items → products → categories.
    """
    query = """
        SELECT 
            c.id, c.name, c.icon, c.color,
            COALESCE(SUM(ri.total), 0) as total
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        LEFT JOIN receipt_items ri ON ri.product_id = p.id
        LEFT JOIN receipts r ON r.id = ri.receipt_id
        WHERE r.date IS NULL OR TO_CHAR(r.date, 'YYYY-MM') = %s
        GROUP BY c.id, c.name, c.icon, c.color
        ORDER BY total DESC
    """
    # Execute and calculate percentages
    results = execute_query(query, [month])
    grand_total = sum(r.total for r in results)
    
    return [
        CategorySpending(
            category_id=r.id,
            category_name=r.name,
            category_icon=r.icon,
            category_color=r.color,
            total=r.total,
            percentage=(r.total / grand_total * 100) if grand_total > 0 else 0
        )
        for r in results
    ]
```

### 4. ID Generation

```python
import uuid
from datetime import datetime

def generate_id(prefix: str) -> str:
    """Generate unique ID with prefix."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique = uuid.uuid4().hex[:8]
    return f"{prefix}-{timestamp}-{unique}"
```

### 5. ATCUD QR Code Parser (Portuguese Receipts)

```python
import re

def parse_atcud_qr(qr_data: str) -> dict:
    """
    Parse Portuguese receipt QR code (ATCUD format).
    Format: A:nif*B:customerNif*C:country*D:docType*E:status*F:date*G:receiptNum*...
    """
    result = {}
    
    # Split by * and parse each field
    fields = qr_data.split("*")
    
    for field in fields:
        if ":" not in field:
            continue
        
        key, value = field.split(":", 1)
        
        if key == "A":  # Merchant NIF
            result["nif"] = value
        elif key == "B":  # Customer NIF
            result["customer_nif"] = value
        elif key == "F":  # Date (YYYYMMDD format)
            result["date"] = f"{value[:4]}-{value[4:6]}-{value[6:8]}"
        elif key == "G":  # Receipt number
            result["receipt_number"] = value
        elif key == "H":  # Total with tax
            result["total"] = float(value)
    
    return result
```

---

## Frontend Pages

### Page Structure

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Overview with stats and quick actions |
| `/receipts` | Receipt List | All receipts with search/filter |
| `/receipts/:id` | Receipt Detail | View/edit single receipt |
| `/receipts/new` | New Receipt | Create receipt form |
| `/merchants` | Merchant List | All stores |
| `/merchants/:id` | Merchant Detail | Store details + receipts |
| `/products` | Product List | All products |
| `/products/:id` | Product Detail | Product + price history |
| `/categories` | Category List | All categories |
| `/categories/:id` | Category Detail | Category products |
| `/settings` | Settings | Data export/import, theme |

### Dashboard Features

1. **Monthly Summary Card**
   - Current month total spending
   - Comparison with previous month (% change)
   - Receipt count

2. **Quick Actions**
   - Add new receipt button
   - Scan QR code (mobile)
   - View all receipts

3. **Spending Chart**
   - Line chart showing last 6 months
   - Category breakdown pie chart

4. **Recent Receipts**
   - Last 5 receipts with merchant, date, total

### Receipt Entry Features

1. **Merchant Selection**
   - Search existing merchants
   - Create new merchant inline

2. **Date/Time Entry**
   - Date picker (default: today)
   - Optional time entry

3. **Item Entry**
   - Search existing products
   - Create new product inline
   - Quantity, unit price, total calculation
   - Auto-total calculation

4. **QR Code Scanning**
   - Camera access for Portuguese ATCUD QR codes
   - Auto-fill merchant NIF, date, total

---

## Docker Configuration

### Directory Structure

```
pocket-keeper/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── backend/
│   ├── requirements.txt
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routes/
│   └── services/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   └── components/
│   └── assets/
├── migrations/
│   └── 001_initial.sql
└── nginx/
    └── nginx.conf
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: pocket-keeper-db
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-pocket_keeper}
      POSTGRES_USER: ${POSTGRES_USER:-pocket}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-keeper123}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-pocket}"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Python Backend API
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pocket-keeper-api
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-pocket}:${POSTGRES_PASSWORD:-keeper123}@db:5432/${POSTGRES_DB:-pocket_keeper}
      CORS_ORIGINS: ${CORS_ORIGINS:-http://localhost:8080}
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  # Nginx for Frontend
  frontend:
    image: nginx:alpine
    container_name: pocket-keeper-frontend
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "8080:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

### Dockerfile (Python Backend)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### requirements.txt

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
pydantic==2.5.3
python-dotenv==1.0.0
alembic==1.13.1
python-multipart==0.0.6
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Frontend static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://api:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### .env.example

```env
# Database
POSTGRES_DB=pocket_keeper
POSTGRES_USER=pocket
POSTGRES_PASSWORD=keeper123

# API
CORS_ORIGINS=http://localhost:8080

# Optional: JWT Secret for auth
# JWT_SECRET=your-secret-key
```

---

## File Structure

### Backend Structure (FastAPI)

```
backend/
├── main.py                 # FastAPI app entry point
├── database.py             # Database connection
├── models/
│   ├── __init__.py
│   ├── category.py         # Category SQLAlchemy model
│   ├── subcategory.py
│   ├── merchant.py
│   ├── product.py
│   ├── receipt.py
│   └── receipt_item.py
├── schemas/
│   ├── __init__.py
│   ├── category.py         # Pydantic schemas
│   ├── merchant.py
│   ├── product.py
│   ├── receipt.py
│   └── dashboard.py
├── routes/
│   ├── __init__.py
│   ├── categories.py       # Category endpoints
│   ├── subcategories.py
│   ├── merchants.py
│   ├── products.py
│   ├── receipts.py
│   ├── dashboard.py
│   └── export_import.py
├── services/
│   ├── __init__.py
│   ├── category_service.py
│   ├── receipt_service.py
│   ├── dashboard_service.py
│   └── atcud_parser.py
└── utils/
    ├── __init__.py
    └── id_generator.py
```

### Frontend Structure

```
frontend/
├── index.html
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── css/
│   ├── style.css           # Main styles
│   ├── variables.css       # CSS custom properties
│   └── components/
│       ├── cards.css
│       ├── forms.css
│       └── charts.css
├── js/
│   ├── app.js              # Main application
│   ├── api.js              # API client
│   ├── router.js           # Simple SPA router
│   ├── state.js            # Application state
│   └── components/
│       ├── dashboard.js
│       ├── receipts.js
│       ├── merchants.js
│       ├── products.js
│       └── categories.js
└── assets/
    └── icons/
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Git

### Quick Start

```bash
# Clone or create project
mkdir pocket-keeper && cd pocket-keeper

# Copy .env.example to .env
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the app
# Frontend: http://localhost:8080
# API: http://localhost:8000/docs (Swagger UI)
```

### Development

```bash
# Start with hot reload
docker-compose up

# Reset database
docker-compose down -v
docker-compose up -d

# Run migrations
docker-compose exec api alembic upgrade head
```

---

## Notes for Implementation

1. **Authentication**: Currently no auth. Add JWT tokens if needed.

2. **File Upload**: For receipt images, add MinIO or S3-compatible storage.

3. **Search**: Use PostgreSQL full-text search for products/merchants.

4. **Mobile**: Consider adding responsive CSS or a separate mobile view.

5. **Offline**: Service worker can cache API responses for offline viewing.

6. **Testing**: Add pytest for backend, Jest for frontend.

---

*This specification was auto-generated from the Pocket Keeper React application.*
