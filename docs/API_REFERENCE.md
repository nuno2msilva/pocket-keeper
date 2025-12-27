# Pocket Keeper - API Reference

Complete API documentation for the Pocket Keeper backend.

---

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently no authentication required. For production, implement JWT Bearer tokens.

---

## Categories

### List All Categories

```http
GET /api/categories
```

**Response:**
```json
[
  {
    "id": "cat-groceries",
    "name": "Groceries",
    "icon": "🛒",
    "color": "hsl(152, 55%, 45%)",
    "is_default": true
  }
]
```

### Get Category by ID

```http
GET /api/categories/{id}
```

**Response:**
```json
{
  "id": "cat-groceries",
  "name": "Groceries",
  "icon": "🛒",
  "color": "hsl(152, 55%, 45%)",
  "is_default": true,
  "product_count": 45,
  "subcategories": [
    { "id": "subcat-dairy", "name": "Dairy" }
  ]
}
```

### Create Category

```http
POST /api/categories
Content-Type: application/json

{
  "name": "Pet Supplies",
  "icon": "🐕",
  "color": "hsl(30, 60%, 50%)"
}
```

**Response:** `201 Created`
```json
{
  "id": "cat-1703934567-abc123",
  "name": "Pet Supplies",
  "icon": "🐕",
  "color": "hsl(30, 60%, 50%)",
  "is_default": false
}
```

### Update Category

```http
PUT /api/categories/{id}
Content-Type: application/json

{
  "name": "Pet Food & Supplies",
  "icon": "🐾",
  "color": "hsl(30, 65%, 55%)"
}
```

### Delete Category

```http
DELETE /api/categories/{id}
```

**Note:** Cannot delete default categories (`is_default: true`).

**Response:** `204 No Content`

---

## Subcategories

### List All Subcategories

```http
GET /api/subcategories
GET /api/subcategories?category_id=cat-groceries
```

**Response:**
```json
[
  {
    "id": "subcat-dairy",
    "name": "Dairy",
    "parent_category_id": "cat-groceries"
  }
]
```

### Create Subcategory

```http
POST /api/subcategories
Content-Type: application/json

{
  "name": "Organic",
  "parent_category_id": "cat-groceries"
}
```

### Update Subcategory

```http
PUT /api/subcategories/{id}
Content-Type: application/json

{
  "name": "Organic & Bio"
}
```

### Delete Subcategory

```http
DELETE /api/subcategories/{id}
```

---

## Merchants

### List All Merchants

```http
GET /api/merchants
GET /api/merchants?search=continente
```

**Response:**
```json
[
  {
    "id": "mer-1",
    "name": "Continente",
    "nif": "500100144",
    "address": "Centro Comercial Colombo",
    "is_solidified": true
  }
]
```

### Get Merchant with Stats

```http
GET /api/merchants/{id}
```

**Response:**
```json
{
  "id": "mer-1",
  "name": "Continente",
  "nif": "500100144",
  "address": "Centro Comercial Colombo",
  "is_solidified": true,
  "stats": {
    "receipt_count": 24,
    "total_spent": 1547.32,
    "last_visit": "2024-12-22",
    "average_receipt": 64.47
  }
}
```

### Get Merchant Receipts

```http
GET /api/merchants/{id}/receipts
GET /api/merchants/{id}/receipts?limit=10&offset=0
```

**Response:**
```json
{
  "total": 24,
  "receipts": [
    {
      "id": "rec-1",
      "date": "2024-12-22",
      "total": 45.67,
      "item_count": 8
    }
  ]
}
```

### Create Merchant

```http
POST /api/merchants
Content-Type: application/json

{
  "name": "Lidl",
  "nif": "500100645",
  "address": "Av. da Liberdade 123"
}
```

### Update Merchant

```http
PUT /api/merchants/{id}
Content-Type: application/json

{
  "name": "Lidl Portugal",
  "address": "Updated address"
}
```

### Delete Merchant

```http
DELETE /api/merchants/{id}
```

**Note:** Cannot delete if merchant has associated receipts.

---

## Products

### List All Products

```http
GET /api/products
GET /api/products?category_id=cat-groceries
GET /api/products?search=milk
GET /api/products?barcode=5601234567890
```

**Response:**
```json
[
  {
    "id": "prod-1",
    "name": "Leite Mimosa 1L",
    "category_id": "cat-groceries",
    "subcategory_id": "subcat-dairy",
    "default_price": 1.29,
    "is_weighted": false,
    "barcode": "5601234567890",
    "is_solidified": true
  }
]
```

### Get Product with Price History

```http
GET /api/products/{id}
```

**Response:**
```json
{
  "id": "prod-1",
  "name": "Leite Mimosa 1L",
  "category_id": "cat-groceries",
  "category_name": "Groceries",
  "subcategory_id": "subcat-dairy",
  "subcategory_name": "Dairy",
  "default_price": 1.29,
  "is_weighted": false,
  "barcode": "5601234567890",
  "is_solidified": true,
  "price_history": [
    {
      "date": "2024-12-22",
      "price": 1.29,
      "merchant_id": "mer-1",
      "merchant_name": "Continente"
    },
    {
      "date": "2024-12-15",
      "price": 1.25,
      "merchant_id": "mer-2",
      "merchant_name": "Pingo Doce"
    }
  ],
  "stats": {
    "min_price": 1.19,
    "max_price": 1.35,
    "avg_price": 1.27,
    "purchase_count": 15
  }
}
```

### Create Product

```http
POST /api/products
Content-Type: application/json

{
  "name": "Queijo Flamengo",
  "category_id": "cat-groceries",
  "subcategory_id": "subcat-dairy",
  "default_price": 2.49,
  "is_weighted": true,
  "barcode": "5601234567891"
}
```

### Update Product

```http
PUT /api/products/{id}
Content-Type: application/json

{
  "name": "Queijo Flamengo Fatiado",
  "default_price": 2.59
}
```

### Delete Product

```http
DELETE /api/products/{id}
```

---

## Receipts

### List All Receipts

```http
GET /api/receipts
GET /api/receipts?month=2024-12
GET /api/receipts?merchant_id=mer-1
GET /api/receipts?limit=20&offset=0
```

**Query Parameters:**
- `month`: Filter by month (YYYY-MM)
- `merchant_id`: Filter by merchant
- `limit`: Pagination limit (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "total": 156,
  "receipts": [
    {
      "id": "rec-1",
      "merchant_id": "mer-1",
      "merchant_name": "Continente",
      "date": "2024-12-22",
      "time": "14:35:00",
      "total": 45.67,
      "item_count": 8,
      "has_customer_nif": true
    }
  ]
}
```

### Get Receipt Detail

```http
GET /api/receipts/{id}
```

**Response:**
```json
{
  "id": "rec-1",
  "merchant_id": "mer-1",
  "merchant_name": "Continente",
  "merchant_address": "Centro Comercial Colombo",
  "date": "2024-12-22",
  "time": "14:35:00",
  "receipt_number": "FT 2024/123456",
  "customer_nif": "123456789",
  "has_customer_nif": true,
  "total": 45.67,
  "notes": "Weekly groceries",
  "items": [
    {
      "id": "item-1",
      "product_id": "prod-1",
      "product_name": "Leite Mimosa 1L",
      "quantity": 2,
      "unit_price": 1.29,
      "total": 2.58,
      "exclude_from_price_history": false
    },
    {
      "id": "item-2",
      "product_id": "prod-2",
      "product_name": "Pão de Forma Bimbo",
      "quantity": 1,
      "unit_price": 2.49,
      "total": 2.49,
      "exclude_from_price_history": false
    }
  ]
}
```

### Create Receipt

```http
POST /api/receipts
Content-Type: application/json

{
  "merchant_id": "mer-1",
  "date": "2024-12-27",
  "time": "10:30:00",
  "receipt_number": "FT 2024/789012",
  "customer_nif": "123456789",
  "has_customer_nif": true,
  "total": 25.50,
  "notes": "Quick shopping",
  "items": [
    {
      "product_id": "prod-1",
      "product_name": "Leite Mimosa 1L",
      "quantity": 3,
      "unit_price": 1.29,
      "total": 3.87
    },
    {
      "product_name": "New Product",
      "quantity": 1,
      "unit_price": 5.99,
      "total": 5.99
    }
  ]
}
```

**Note:** Items without `product_id` will create a new product automatically.

### Update Receipt

```http
PUT /api/receipts/{id}
Content-Type: application/json

{
  "notes": "Updated notes",
  "items": [...]
}
```

### Delete Receipt

```http
DELETE /api/receipts/{id}
```

---

## Dashboard & Insights

### Get Dashboard Summary

```http
GET /api/dashboard/summary
```

**Response:**
```json
{
  "current_month": "2024-12",
  "current_month_total": 847.32,
  "previous_month_total": 923.15,
  "month_change_percent": -8.22,
  "receipt_count": 24,
  "top_category": {
    "id": "cat-groceries",
    "name": "Groceries",
    "icon": "🛒",
    "amount": 523.40
  },
  "recent_receipts": [
    {
      "id": "rec-1",
      "merchant_name": "Continente",
      "date": "2024-12-22",
      "total": 45.67
    }
  ]
}
```

### Get Spending Trends

```http
GET /api/insights/spending-trends
GET /api/insights/spending-trends?months=12
```

**Response:**
```json
{
  "months": [
    { "month": "2024-07", "total": 756.23 },
    { "month": "2024-08", "total": 834.56 },
    { "month": "2024-09", "total": 912.34 },
    { "month": "2024-10", "total": 789.12 },
    { "month": "2024-11", "total": 923.15 },
    { "month": "2024-12", "total": 847.32 }
  ],
  "average": 843.79
}
```

### Get Category Breakdown

```http
GET /api/insights/category-breakdown
GET /api/insights/category-breakdown?month=2024-12
```

**Response:**
```json
{
  "month": "2024-12",
  "total": 847.32,
  "categories": [
    {
      "category_id": "cat-groceries",
      "category_name": "Groceries",
      "category_icon": "🛒",
      "category_color": "hsl(152, 55%, 45%)",
      "total": 523.40,
      "percentage": 61.78
    },
    {
      "category_id": "cat-dining",
      "category_name": "Dining",
      "category_icon": "🍽️",
      "category_color": "hsl(15, 75%, 55%)",
      "total": 156.80,
      "percentage": 18.51
    }
  ]
}
```

### Get Top Merchants

```http
GET /api/insights/top-merchants
GET /api/insights/top-merchants?limit=5&month=2024-12
```

**Response:**
```json
{
  "merchants": [
    {
      "merchant_id": "mer-1",
      "merchant_name": "Continente",
      "total_spent": 423.56,
      "receipt_count": 12,
      "percentage": 50.0
    }
  ]
}
```

---

## Data Export/Import

### Export All Data

```http
GET /api/export
```

**Response:**
```json
{
  "version": "1.0",
  "exported_at": "2024-12-27T10:30:00Z",
  "categories": [...],
  "subcategories": [...],
  "merchants": [...],
  "products": [...],
  "receipts": [...]
}
```

### Import Data

```http
POST /api/import
Content-Type: application/json

{
  "version": "1.0",
  "categories": [...],
  "subcategories": [...],
  "merchants": [...],
  "products": [...],
  "receipts": [...]
}
```

**Query Parameters:**
- `merge`: If `true`, merge with existing data. If `false`, replace all data.

**Response:**
```json
{
  "success": true,
  "imported": {
    "categories": 8,
    "subcategories": 15,
    "merchants": 12,
    "products": 156,
    "receipts": 234
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Receipt not found",
    "details": {
      "id": "rec-invalid"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `CANNOT_DELETE` | 409 | Resource has dependencies |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

No rate limiting in development. For production, consider:
- 100 requests/minute for list endpoints
- 300 requests/minute for single resource endpoints

---

## Pagination

List endpoints support pagination:

```http
GET /api/receipts?limit=20&offset=40
```

Response includes total count:

```json
{
  "total": 156,
  "limit": 20,
  "offset": 40,
  "receipts": [...]
}
```
