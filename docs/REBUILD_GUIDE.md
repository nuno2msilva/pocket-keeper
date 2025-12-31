# 🔧 Pocket Keeper - Complete Rebuild Guide

> **Version**: 1.0  
> **Last Updated**: December 2024  
> **Purpose**: Step-by-step guide for rebuilding Pocket Keeper in Python/FastAPI with PostgreSQL

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Kanban](#project-kanban)
4. [Development Environment](#development-environment)
5. [Database Setup](#database-setup)
6. [Backend Implementation](#backend-implementation)
7. [Frontend Options](#frontend-options)
8. [Deployment](#deployment)

---

## Overview

This guide provides everything needed to rebuild Pocket Keeper as a full-stack application using:

- **Backend**: Python with FastAPI
- **Database**: PostgreSQL
- **Frontend**: HTML/CSS/JavaScript (or React)
- **Deployment**: Docker + Docker Compose

### Why Rebuild?

The current React/localStorage version is great for:
- Single-user mobile use
- Quick prototyping
- Offline-first PWA

But a Python/PostgreSQL version enables:
- Multi-user support
- Server-side data persistence
- API for mobile apps
- Better data integrity
- Easier backups and migrations

---

## Technology Stack

### Required Python Libraries

```txt
# requirements.txt

# Web Framework
fastapi==0.109.0
uvicorn[standard]==0.27.0

# Database
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
alembic==1.13.1

# Data Validation
pydantic==2.5.3
pydantic-settings==2.1.0

# Authentication (optional)
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Utilities
python-dotenv==1.0.0
python-multipart==0.0.6

# Development
pytest==7.4.4
httpx==0.26.0
black==24.1.0
ruff==0.1.14
```

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Version Requirements

| Component | Minimum Version |
|-----------|-----------------|
| Python | 3.10+ |
| PostgreSQL | 14+ |
| Docker | 20+ |
| Docker Compose | 2+ |

---

## Project Kanban

Use this Kanban board to track your rebuild progress. Copy to your preferred project management tool (Trello, Notion, GitHub Projects, etc.).

### 📋 Backlog

| Task ID | Title | Priority | Estimate |
|---------|-------|----------|----------|
| DB-001 | Create PostgreSQL schema | High | 2h |
| DB-002 | Add seed data for categories | High | 1h |
| DB-003 | Create database migrations | Medium | 2h |
| API-001 | Setup FastAPI project structure | High | 1h |
| API-002 | Categories CRUD endpoints | High | 2h |
| API-003 | Subcategories CRUD endpoints | High | 1h |
| API-004 | Merchants CRUD endpoints | High | 2h |
| API-005 | Products CRUD endpoints | High | 3h |
| API-006 | Receipts CRUD endpoints | Critical | 4h |
| API-007 | Dashboard summary endpoint | High | 2h |
| API-008 | Spending insights endpoints | Medium | 3h |
| API-009 | Export/Import endpoints | Medium | 2h |
| API-010 | Price history logic | High | 2h |
| FE-001 | Dashboard page | High | 4h |
| FE-002 | Receipt list/detail pages | Critical | 4h |
| FE-003 | Receipt creation form | Critical | 4h |
| FE-004 | Merchant pages | Medium | 3h |
| FE-005 | Product pages | Medium | 3h |
| FE-006 | Category management | Medium | 2h |
| FE-007 | Insights/Charts | Medium | 4h |
| FE-008 | Settings page | Low | 2h |
| DEV-001 | Docker setup | Medium | 2h |
| DEV-002 | Environment configuration | High | 1h |
| DEV-003 | Testing setup | Medium | 2h |
| DEV-004 | CI/CD pipeline | Low | 2h |

---

### 🚀 Sprint 1: Foundation (Week 1)

**Goal**: Database and basic API structure

| Task ID | Title | Status |
|---------|-------|--------|
| DB-001 | Create PostgreSQL schema | 🔴 To Do |
| DB-002 | Add seed data for categories | 🔴 To Do |
| API-001 | Setup FastAPI project structure | 🔴 To Do |
| API-002 | Categories CRUD endpoints | 🔴 To Do |
| API-003 | Subcategories CRUD endpoints | 🔴 To Do |
| DEV-002 | Environment configuration | 🔴 To Do |

**Acceptance Criteria**:
- [ ] Database runs in Docker
- [ ] All tables created with proper constraints
- [ ] Category and subcategory endpoints work (test with curl/Postman)
- [ ] Swagger UI accessible at /docs

---

### 🚀 Sprint 2: Core Data (Week 2)

**Goal**: Merchants, Products, and basic receipts

| Task ID | Title | Status |
|---------|-------|--------|
| API-004 | Merchants CRUD endpoints | 🔴 To Do |
| API-005 | Products CRUD endpoints | 🔴 To Do |
| API-006 | Receipts CRUD endpoints | 🔴 To Do |
| API-010 | Price history logic | 🔴 To Do |
| DB-003 | Create database migrations | 🔴 To Do |

**Acceptance Criteria**:
- [ ] Can create/read/update/delete merchants
- [ ] Can create/read/update/delete products
- [ ] Can create receipts with line items
- [ ] Price history updates when receipt is saved
- [ ] Alembic migrations work

---

### 🚀 Sprint 3: Analytics (Week 3)

**Goal**: Dashboard and insights

| Task ID | Title | Status |
|---------|-------|--------|
| API-007 | Dashboard summary endpoint | 🔴 To Do |
| API-008 | Spending insights endpoints | 🔴 To Do |
| API-009 | Export/Import endpoints | 🔴 To Do |
| DEV-001 | Docker setup | 🔴 To Do |

**Acceptance Criteria**:
- [ ] Dashboard returns monthly summary
- [ ] Category breakdown works
- [ ] Spending trends returns 6-month data
- [ ] Export returns complete JSON
- [ ] Import restores from JSON
- [ ] Docker Compose starts full stack

---

### 🚀 Sprint 4: Frontend (Week 4-5)

**Goal**: User interface

| Task ID | Title | Status |
|---------|-------|--------|
| FE-001 | Dashboard page | 🔴 To Do |
| FE-002 | Receipt list/detail pages | 🔴 To Do |
| FE-003 | Receipt creation form | 🔴 To Do |
| FE-004 | Merchant pages | 🔴 To Do |
| FE-005 | Product pages | 🔴 To Do |

**Acceptance Criteria**:
- [ ] Dashboard shows monthly summary and charts
- [ ] Can view list of receipts
- [ ] Can create new receipt with items
- [ ] Can view merchant details
- [ ] Can view product details with price history

---

### 🚀 Sprint 5: Polish (Week 6)

**Goal**: Final features and deployment

| Task ID | Title | Status |
|---------|-------|--------|
| FE-006 | Category management | 🔴 To Do |
| FE-007 | Insights/Charts | 🔴 To Do |
| FE-008 | Settings page | 🔴 To Do |
| DEV-003 | Testing setup | 🔴 To Do |
| DEV-004 | CI/CD pipeline | 🔴 To Do |

**Acceptance Criteria**:
- [ ] Can manage categories (add/edit/delete)
- [ ] Charts render correctly
- [ ] Settings page works (export/import/delete)
- [ ] Unit tests pass
- [ ] Deployment pipeline works

---

## Development Environment

### Directory Structure

```
pocket-keeper-api/
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Settings/configuration
│   ├── database.py             # Database connection
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── category.py
│   │   ├── subcategory.py
│   │   ├── merchant.py
│   │   ├── product.py
│   │   ├── price_history.py
│   │   ├── receipt.py
│   │   └── receipt_item.py
│   │
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── category.py
│   │   ├── merchant.py
│   │   ├── product.py
│   │   ├── receipt.py
│   │   └── dashboard.py
│   │
│   ├── routers/                # API route handlers
│   │   ├── __init__.py
│   │   ├── categories.py
│   │   ├── subcategories.py
│   │   ├── merchants.py
│   │   ├── products.py
│   │   ├── receipts.py
│   │   ├── dashboard.py
│   │   └── export_import.py
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── category_service.py
│   │   ├── receipt_service.py
│   │   ├── price_service.py
│   │   └── dashboard_service.py
│   │
│   └── utils/                  # Utilities
│       ├── __init__.py
│       └── id_generator.py
│
├── tests/                      # Test files
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_categories.py
│   ├── test_receipts.py
│   └── test_dashboard.py
│
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── alembic.ini
├── .env.example
└── README.md
```

### Environment Variables

```bash
# .env.example

# Database
DATABASE_URL=postgresql://pocket:keeper123@localhost:5432/pocket_keeper
POSTGRES_USER=pocket
POSTGRES_PASSWORD=keeper123
POSTGRES_DB=pocket_keeper

# API
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:8080

# Optional: Authentication
# JWT_SECRET_KEY=your-super-secret-key
# JWT_ALGORITHM=HS256
# JWT_EXPIRE_MINUTES=1440
```

---

## Database Setup

### Complete SQL Schema

See `docs/DATABASE_SCHEMA.sql` for the full schema. Here's a summary:

```sql
-- Core tables
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) DEFAULT '📦',
    color VARCHAR(30) DEFAULT 'hsl(0, 0%, 50%)',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subcategories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_category_id VARCHAR(50) REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE merchants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    nif VARCHAR(20),
    address TEXT,
    is_solidified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    merchant_id VARCHAR(50) REFERENCES merchants(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE receipts (
    id VARCHAR(50) PRIMARY KEY,
    merchant_id VARCHAR(50) REFERENCES merchants(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    time TIME,
    receipt_number VARCHAR(100),
    has_receipt_number BOOLEAN DEFAULT FALSE,
    customer_nif VARCHAR(20),
    has_customer_nif BOOLEAN DEFAULT FALSE,
    total DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE receipt_items (
    id VARCHAR(50) PRIMARY KEY,
    receipt_id VARCHAR(50) REFERENCES receipts(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(300) NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    exclude_from_price_history BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_receipts_date ON receipts(date DESC);
CREATE INDEX idx_receipts_merchant ON receipts(merchant_id);
CREATE INDEX idx_receipt_items_receipt ON receipt_items(receipt_id);
CREATE INDEX idx_receipt_items_product ON receipt_items(product_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_price_history_product ON price_history(product_id);
```

### Database Migrations with Alembic

```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## Backend Implementation

### Main Application (main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import (
    categories,
    subcategories,
    merchants,
    products,
    receipts,
    dashboard,
    export_import
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pocket Keeper API",
    description="Personal expense tracking API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(subcategories.router, prefix="/api/subcategories", tags=["Subcategories"])
app.include_router(merchants.router, prefix="/api/merchants", tags=["Merchants"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(receipts.router, prefix="/api/receipts", tags=["Receipts"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(export_import.router, prefix="/api", tags=["Export/Import"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

### Database Connection (database.py)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Configuration (config.py)

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    database_url: str = "postgresql://pocket:keeper123@localhost:5432/pocket_keeper"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: List[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Example Router (categories.py)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.category import Category as CategoryModel
from app.schemas.category import Category, CategoryCreate, CategoryUpdate

router = APIRouter()

@router.get("/", response_model=List[Category])
def list_categories(db: Session = Depends(get_db)):
    return db.query(CategoryModel).all()

@router.get("/{category_id}", response_model=Category)
def get_category(category_id: str, db: Session = Depends(get_db)):
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/", response_model=Category, status_code=201)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    from app.utils.id_generator import generate_id
    
    db_category = CategoryModel(
        id=generate_id("cat"),
        name=category.name,
        icon=category.icon,
        color=category.color,
        is_default=False
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=Category)
def update_category(category_id: str, category: CategoryUpdate, db: Session = Depends(get_db)):
    db_category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: str, db: Session = Depends(get_db)):
    db_category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return None
```

### Receipt Service (Business Logic)

```python
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional

from app.models.receipt import Receipt
from app.models.receipt_item import ReceiptItem
from app.models.product import Product
from app.models.price_history import PriceHistory
from app.schemas.receipt import ReceiptCreate
from app.utils.id_generator import generate_id

class ReceiptService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_receipt(self, receipt_data: ReceiptCreate) -> Receipt:
        # Generate receipt ID
        receipt_id = generate_id("rec")
        
        # Create receipt
        receipt = Receipt(
            id=receipt_id,
            merchant_id=receipt_data.merchant_id,
            date=receipt_data.date,
            time=receipt_data.time,
            receipt_number=receipt_data.receipt_number,
            has_receipt_number=receipt_data.has_receipt_number,
            customer_nif=receipt_data.customer_nif,
            has_customer_nif=receipt_data.has_customer_nif,
            total=receipt_data.total,
            notes=receipt_data.notes
        )
        self.db.add(receipt)
        
        # Create items and update price history
        for item_data in receipt_data.items:
            item = ReceiptItem(
                id=generate_id("item"),
                receipt_id=receipt_id,
                product_id=item_data.product_id,
                product_name=item_data.product_name,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total=item_data.total,
                exclude_from_price_history=item_data.exclude_from_price_history
            )
            self.db.add(item)
            
            # Update price history
            if item_data.product_id and not item_data.exclude_from_price_history:
                self._update_price_history(
                    product_id=item_data.product_id,
                    merchant_id=receipt_data.merchant_id,
                    receipt_date=receipt_data.date,
                    price=item_data.unit_price
                )
        
        self.db.commit()
        self.db.refresh(receipt)
        return receipt
    
    def _update_price_history(
        self,
        product_id: str,
        merchant_id: str,
        receipt_date: date,
        price: float
    ):
        # Add price history entry
        history_entry = PriceHistory(
            product_id=product_id,
            merchant_id=merchant_id,
            date=receipt_date,
            price=price
        )
        self.db.add(history_entry)
        
        # Update product's default price
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if product:
            product.default_price = price
```

---

## Docker Configuration

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
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
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-pocket}"]
      interval: 5s
      timeout: 5s
      retries: 5

  # FastAPI Backend
  api:
    build: .
    container_name: pocket-keeper-api
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-pocket}:${POSTGRES_PASSWORD:-keeper123}@db:5432/${POSTGRES_DB:-pocket_keeper}
      CORS_ORIGINS: ${CORS_ORIGINS:-http://localhost:3000,http://localhost:8080}
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8000:8000"
    volumes:
      - ./app:/app/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  postgres_data:
```

### Running with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset database (removes data)
docker-compose down -v
docker-compose up -d
```

---

## API Endpoints Reference

See `docs/API_REFERENCE.md` for complete endpoint documentation. Summary:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |
| GET | `/api/merchants` | List merchants |
| GET | `/api/merchants/{id}` | Get merchant with stats |
| POST | `/api/merchants` | Create merchant |
| GET | `/api/products` | List products |
| GET | `/api/products/{id}` | Get product with price history |
| POST | `/api/products/{id}/price` | Add manual price |
| GET | `/api/receipts` | List receipts (paginated) |
| POST | `/api/receipts` | Create receipt with items |
| GET | `/api/dashboard/summary` | Dashboard data |
| GET | `/api/insights/spending-trends` | 6-month trends |
| GET | `/api/export` | Export all data |
| POST | `/api/import` | Import data |

---

## Testing

### Test Configuration (conftest.py)

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    def override_get_db():
        yield db
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
```

### Example Tests

```python
def test_create_category(client):
    response = client.post("/api/categories", json={
        "name": "Test Category",
        "icon": "🧪",
        "color": "hsl(200, 50%, 50%)"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Category"
    assert "id" in data

def test_create_receipt(client):
    # First create a merchant
    merchant = client.post("/api/merchants", json={
        "name": "Test Store"
    }).json()
    
    # Create receipt
    response = client.post("/api/receipts", json={
        "merchant_id": merchant["id"],
        "date": "2024-12-27",
        "total": 25.50,
        "items": [
            {
                "product_name": "Test Product",
                "quantity": 2,
                "unit_price": 12.75,
                "total": 25.50
            }
        ]
    })
    assert response.status_code == 201
```

---

## Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] CORS origins set correctly
- [ ] SSL/HTTPS configured (for production)

### Production Considerations

1. **Use production database**: Not SQLite
2. **Set strong passwords**: Especially for database
3. **Enable HTTPS**: Use reverse proxy (nginx)
4. **Configure backups**: Regular database backups
5. **Set up monitoring**: Logging and error tracking
6. **Rate limiting**: Protect against abuse

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

*This guide provides the foundation for rebuilding Pocket Keeper. Customize as needed for your specific requirements.*
