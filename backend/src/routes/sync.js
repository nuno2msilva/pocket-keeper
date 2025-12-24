/**
 * Data synchronization routes
 * Handles offline queue processing and data sync
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection.js';

const router = Router();

// Sync item schema
const syncItemSchema = z.object({
  entityType: z.enum(['category', 'subcategory', 'merchant', 'product', 'receipt']),
  entityId: z.string(),
  operation: z.enum(['create', 'update', 'delete']),
  data: z.record(z.unknown()).optional(),
  localTimestamp: z.string(),
});

const syncBatchSchema = z.object({
  items: z.array(syncItemSchema),
  lastSyncTimestamp: z.string().optional(),
});

// Get sync status
router.get('/status', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM categories WHERE user_id = $1) as categories_count,
        (SELECT COUNT(*) FROM subcategories WHERE user_id = $1) as subcategories_count,
        (SELECT COUNT(*) FROM products WHERE user_id = $1) as products_count,
        (SELECT COUNT(*) FROM merchants WHERE user_id = $1) as merchants_count,
        (SELECT COUNT(*) FROM receipts WHERE user_id = $1) as receipts_count,
        (SELECT MAX(updated_at) FROM categories WHERE user_id = $1) as categories_last_update,
        (SELECT MAX(updated_at) FROM products WHERE user_id = $1) as products_last_update,
        (SELECT MAX(updated_at) FROM merchants WHERE user_id = $1) as merchants_last_update,
        (SELECT MAX(updated_at) FROM receipts WHERE user_id = $1) as receipts_last_update`,
      [req.user.id]
    );

    res.json({
      counts: {
        categories: parseInt(result.rows[0].categories_count),
        subcategories: parseInt(result.rows[0].subcategories_count),
        products: parseInt(result.rows[0].products_count),
        merchants: parseInt(result.rows[0].merchants_count),
        receipts: parseInt(result.rows[0].receipts_count),
      },
      lastUpdates: {
        categories: result.rows[0].categories_last_update,
        products: result.rows[0].products_last_update,
        merchants: result.rows[0].merchants_last_update,
        receipts: result.rows[0].receipts_last_update,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Push changes from client
router.post('/push', async (req, res, next) => {
  try {
    const { items } = syncBatchSchema.parse(req.body);
    const results = [];
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      for (const item of items) {
        try {
          const result = await processSync(client, req.user.id, item);
          results.push({ entityId: item.entityId, success: true, serverId: result.id });
        } catch (error) {
          results.push({ entityId: item.entityId, success: false, error: error.message });
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

// Pull changes from server
router.get('/pull', async (req, res, next) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : new Date(0);

    const [categories, subcategories, products, merchants, receipts] = await Promise.all([
      db.query(
        `SELECT * FROM categories WHERE user_id = $1 AND updated_at > $2 ORDER BY updated_at`,
        [req.user.id, since]
      ),
      db.query(
        `SELECT * FROM subcategories WHERE user_id = $1 AND updated_at > $2 ORDER BY updated_at`,
        [req.user.id, since]
      ),
      db.query(
        `SELECT * FROM products WHERE user_id = $1 AND updated_at > $2 ORDER BY updated_at`,
        [req.user.id, since]
      ),
      db.query(
        `SELECT * FROM merchants WHERE user_id = $1 AND updated_at > $2 ORDER BY updated_at`,
        [req.user.id, since]
      ),
      db.query(
        `SELECT r.*, 
          json_agg(json_build_object(
            'id', ri.id,
            'productId', ri.product_id,
            'productName', ri.product_name,
            'quantity', ri.quantity,
            'unitPrice', ri.unit_price,
            'total', ri.total
          )) as items
         FROM receipts r
         LEFT JOIN receipt_items ri ON ri.receipt_id = r.id
         WHERE r.user_id = $1 AND r.updated_at > $2
         GROUP BY r.id
         ORDER BY r.updated_at`,
        [req.user.id, since]
      ),
    ]);

    res.json({
      categories: categories.rows.map(mapCategory),
      subcategories: subcategories.rows.map(mapSubcategory),
      products: products.rows.map(mapProduct),
      merchants: merchants.rows.map(mapMerchant),
      receipts: receipts.rows.map(mapReceipt),
      syncTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Full sync (download all data)
router.get('/full', async (req, res, next) => {
  try {
    const [categories, subcategories, products, merchants, receipts] = await Promise.all([
      db.query('SELECT * FROM categories WHERE user_id = $1 ORDER BY name', [req.user.id]),
      db.query('SELECT * FROM subcategories WHERE user_id = $1 ORDER BY name', [req.user.id]),
      db.query('SELECT * FROM products WHERE user_id = $1 ORDER BY name', [req.user.id]),
      db.query('SELECT * FROM merchants WHERE user_id = $1 ORDER BY name', [req.user.id]),
      db.query(
        `SELECT r.*, 
          json_agg(json_build_object(
            'id', ri.id,
            'productId', ri.product_id,
            'productName', ri.product_name,
            'quantity', ri.quantity,
            'unitPrice', ri.unit_price,
            'total', ri.total
          )) as items
         FROM receipts r
         LEFT JOIN receipt_items ri ON ri.receipt_id = r.id
         WHERE r.user_id = $1
         GROUP BY r.id
         ORDER BY r.date DESC`,
        [req.user.id]
      ),
    ]);

    res.json({
      categories: categories.rows.map(mapCategory),
      subcategories: subcategories.rows.map(mapSubcategory),
      products: products.rows.map(mapProduct),
      merchants: merchants.rows.map(mapMerchant),
      receipts: receipts.rows.map(mapReceipt),
      syncTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Process individual sync operations
async function processSync(client, userId, item) {
  const { entityType, entityId, operation, data } = item;

  switch (entityType) {
    case 'category':
      return syncCategory(client, userId, operation, entityId, data);
    case 'subcategory':
      return syncSubcategory(client, userId, operation, entityId, data);
    case 'product':
      return syncProduct(client, userId, operation, entityId, data);
    case 'merchant':
      return syncMerchant(client, userId, operation, entityId, data);
    case 'receipt':
      return syncReceipt(client, userId, operation, entityId, data);
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
}

async function syncCategory(client, userId, operation, localId, data) {
  if (operation === 'delete') {
    await client.query('DELETE FROM categories WHERE user_id = $1 AND local_id = $2', [userId, localId]);
    return { id: null };
  }

  const result = await client.query(
    `INSERT INTO categories (user_id, local_id, name, icon, color, is_default, sync_status)
     VALUES ($1, $2, $3, $4, $5, $6, 'synced')
     ON CONFLICT (user_id, name) DO UPDATE SET
       icon = EXCLUDED.icon,
       color = EXCLUDED.color,
       sync_status = 'synced',
       updated_at = NOW()
     RETURNING id`,
    [userId, localId, data.name, data.icon, data.color, data.isDefault || false]
  );
  return { id: result.rows[0].id };
}

async function syncSubcategory(client, userId, operation, localId, data) {
  if (operation === 'delete') {
    await client.query('DELETE FROM subcategories WHERE user_id = $1 AND local_id = $2', [userId, localId]);
    return { id: null };
  }

  const result = await client.query(
    `INSERT INTO subcategories (user_id, local_id, category_id, name, sync_status)
     VALUES ($1, $2, (SELECT id FROM categories WHERE user_id = $1 AND local_id = $3), $4, 'synced')
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [userId, localId, data.parentCategoryId, data.name]
  );
  return { id: result.rows[0]?.id };
}

async function syncProduct(client, userId, operation, localId, data) {
  if (operation === 'delete') {
    await client.query('DELETE FROM products WHERE user_id = $1 AND local_id = $2', [userId, localId]);
    return { id: null };
  }

  const result = await client.query(
    `INSERT INTO products (user_id, local_id, name, category_id, subcategory_id, default_price, barcode, exclude_from_price_history, is_solidified, sync_status)
     VALUES ($1, $2, $3, 
       (SELECT id FROM categories WHERE user_id = $1 AND local_id = $4),
       (SELECT id FROM subcategories WHERE user_id = $1 AND local_id = $5),
       $6, $7, $8, $9, 'synced')
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [userId, localId, data.name, data.categoryId, data.subcategoryId, data.defaultPrice || 0, data.barcode, data.excludeFromPriceHistory || false, data.isSolidified || false]
  );
  return { id: result.rows[0]?.id };
}

async function syncMerchant(client, userId, operation, localId, data) {
  if (operation === 'delete') {
    await client.query('DELETE FROM merchants WHERE user_id = $1 AND local_id = $2', [userId, localId]);
    return { id: null };
  }

  const result = await client.query(
    `INSERT INTO merchants (user_id, local_id, name, nif, address, is_solidified, sync_status)
     VALUES ($1, $2, $3, $4, $5, $6, 'synced')
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [userId, localId, data.name, data.nif, data.address, data.isSolidified || false]
  );
  return { id: result.rows[0]?.id };
}

async function syncReceipt(client, userId, operation, localId, data) {
  if (operation === 'delete') {
    await client.query('DELETE FROM receipts WHERE user_id = $1 AND local_id = $2', [userId, localId]);
    return { id: null };
  }

  // Insert receipt
  const result = await client.query(
    `INSERT INTO receipts (user_id, local_id, merchant_id, date, time, receipt_number, customer_nif, has_customer_nif, total, notes, sync_status)
     VALUES ($1, $2, 
       (SELECT id FROM merchants WHERE user_id = $1 AND local_id = $3),
       $4, $5, $6, $7, $8, $9, $10, 'synced')
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [userId, localId, data.merchantId, data.date, data.time, data.receiptNumber, data.customerNif, data.hasCustomerNif || false, data.total, data.notes]
  );

  const receiptId = result.rows[0]?.id;

  // Insert items if receipt was created
  if (receiptId && data.items) {
    for (const item of data.items) {
      await client.query(
        `INSERT INTO receipt_items (receipt_id, local_id, product_id, product_name, quantity, unit_price, total, exclude_from_price_history)
         VALUES ($1, $2, 
           (SELECT id FROM products WHERE user_id = $3 AND local_id = $4),
           $5, $6, $7, $8, $9)`,
        [receiptId, item.id, userId, item.productId, item.productName, item.quantity, item.unitPrice, item.total, item.excludeFromPriceHistory || false]
      );
    }
  }

  return { id: receiptId };
}

// Mappers
function mapCategory(row) {
  return {
    id: row.local_id || row.id,
    serverId: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isDefault: row.is_default,
  };
}

function mapSubcategory(row) {
  return {
    id: row.local_id || row.id,
    serverId: row.id,
    name: row.name,
    parentCategoryId: row.category_id,
  };
}

function mapProduct(row) {
  return {
    id: row.local_id || row.id,
    serverId: row.id,
    name: row.name,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    defaultPrice: parseFloat(row.default_price),
    barcode: row.barcode,
    excludeFromPriceHistory: row.exclude_from_price_history,
    isSolidified: row.is_solidified,
  };
}

function mapMerchant(row) {
  return {
    id: row.local_id || row.id,
    serverId: row.id,
    name: row.name,
    nif: row.nif,
    address: row.address,
    isSolidified: row.is_solidified,
  };
}

function mapReceipt(row) {
  return {
    id: row.local_id || row.id,
    serverId: row.id,
    merchantId: row.merchant_id,
    date: row.date,
    time: row.time,
    receiptNumber: row.receipt_number,
    customerNif: row.customer_nif,
    hasCustomerNif: row.has_customer_nif,
    total: parseFloat(row.total),
    notes: row.notes,
    items: row.items?.filter(i => i.id) || [],
  };
}

export { router as syncRoutes };
