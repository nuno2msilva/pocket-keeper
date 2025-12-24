/**
 * Community database routes
 * Opt-in shared products and merchants with median pricing
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection.js';

const router = Router();

// Search community products
router.get('/products', async (req, res, next) => {
  try {
    const { q, barcode, limit = 20 } = req.query;

    let query = 'SELECT * FROM community_products WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (barcode) {
      query += ` AND barcode = $${paramCount++}`;
      params.push(barcode);
    } else if (q) {
      query += ` AND name ILIKE $${paramCount++}`;
      params.push(`%${q}%`);
    }

    query += ` ORDER BY trust_score DESC, contribution_count DESC LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    const result = await db.query(query, params);

    res.json({
      products: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        barcode: row.barcode,
        categoryHint: row.category_hint,
        trustScore: row.trust_score,
        contributionCount: row.contribution_count,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Search community merchants
router.get('/merchants', async (req, res, next) => {
  try {
    const { q, nif, limit = 20 } = req.query;

    let query = 'SELECT * FROM community_merchants WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (nif) {
      query += ` AND nif = $${paramCount++}`;
      params.push(nif);
    } else if (q) {
      query += ` AND name ILIKE $${paramCount++}`;
      params.push(`%${q}%`);
    }

    query += ` ORDER BY trust_score DESC, contribution_count DESC LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    const result = await db.query(query, params);

    res.json({
      merchants: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        nif: row.nif,
        address: row.address,
        trustScore: row.trust_score,
        contributionCount: row.contribution_count,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Contribute a product to community (requires opt-in)
router.post('/products', async (req, res, next) => {
  try {
    if (!req.user.communityOptedIn) {
      return res.status(403).json({ error: 'Community sharing is not enabled for your account' });
    }

    const { name, barcode, categoryHint } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    // Upsert - if exists, increment contribution count and update trust score
    const result = await db.query(
      `INSERT INTO community_products (name, barcode, category_hint)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET
         contribution_count = community_products.contribution_count + 1,
         trust_score = LEAST(community_products.trust_score + 5, 100),
         barcode = COALESCE(EXCLUDED.barcode, community_products.barcode),
         category_hint = COALESCE(EXCLUDED.category_hint, community_products.category_hint),
         updated_at = NOW()
       RETURNING *`,
      [name.trim(), barcode || null, categoryHint || null]
    );

    res.json({
      product: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        barcode: result.rows[0].barcode,
        trustScore: result.rows[0].trust_score,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Contribute a merchant to community (requires opt-in)
router.post('/merchants', async (req, res, next) => {
  try {
    if (!req.user.communityOptedIn) {
      return res.status(403).json({ error: 'Community sharing is not enabled for your account' });
    }

    const { name, nif, address } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Merchant name is required' });
    }

    // Upsert by name + nif
    const result = await db.query(
      `INSERT INTO community_merchants (name, nif, address)
       VALUES ($1, $2, $3)
       ON CONFLICT (name, nif) DO UPDATE SET
         contribution_count = community_merchants.contribution_count + 1,
         trust_score = LEAST(community_merchants.trust_score + 5, 100),
         address = COALESCE(EXCLUDED.address, community_merchants.address),
         updated_at = NOW()
       RETURNING *`,
      [name.trim(), nif || null, address || null]
    );

    res.json({
      merchant: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        nif: result.rows[0].nif,
        address: result.rows[0].address,
        trustScore: result.rows[0].trust_score,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Sync user's solidified items to community
router.post('/sync-contributions', async (req, res, next) => {
  try {
    if (!req.user.communityOptedIn) {
      return res.status(403).json({ error: 'Community sharing is not enabled for your account' });
    }

    // Get user's solidified products
    const products = await db.query(
      `SELECT name, barcode FROM products WHERE user_id = $1 AND is_solidified = TRUE`,
      [req.user.id]
    );

    // Get user's solidified merchants
    const merchants = await db.query(
      `SELECT name, nif, address FROM merchants WHERE user_id = $1 AND is_solidified = TRUE`,
      [req.user.id]
    );

    let productsAdded = 0;
    let merchantsAdded = 0;

    // Contribute products
    for (const product of products.rows) {
      await db.query(
        `INSERT INTO community_products (name, barcode)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET
           contribution_count = community_products.contribution_count + 1,
           trust_score = LEAST(community_products.trust_score + 2, 100),
           updated_at = NOW()`,
        [product.name, product.barcode]
      );
      productsAdded++;
    }

    // Contribute merchants
    for (const merchant of merchants.rows) {
      await db.query(
        `INSERT INTO community_merchants (name, nif, address)
         VALUES ($1, $2, $3)
         ON CONFLICT (name, nif) DO UPDATE SET
           contribution_count = community_merchants.contribution_count + 1,
           trust_score = LEAST(community_merchants.trust_score + 2, 100),
           updated_at = NOW()`,
        [merchant.name, merchant.nif, merchant.address]
      );
      merchantsAdded++;
    }

    res.json({
      message: 'Contributions synced successfully',
      productsAdded,
      merchantsAdded,
    });
  } catch (error) {
    next(error);
  }
});

// Pull community data to replace user's unsolidified items
router.post('/pull', async (req, res, next) => {
  try {
    if (!req.user.communityOptedIn) {
      return res.status(403).json({ error: 'Community sharing is not enabled for your account' });
    }

    // Get community products not yet in user's products
    const newProducts = await db.query(
      `SELECT cp.* FROM community_products cp
       WHERE NOT EXISTS (
         SELECT 1 FROM products p WHERE p.user_id = $1 AND LOWER(p.name) = LOWER(cp.name)
       )
       AND cp.trust_score >= 50
       ORDER BY cp.trust_score DESC
       LIMIT 100`,
      [req.user.id]
    );

    // Get community merchants not yet in user's merchants
    const newMerchants = await db.query(
      `SELECT cm.* FROM community_merchants cm
       WHERE NOT EXISTS (
         SELECT 1 FROM merchants m WHERE m.user_id = $1 AND LOWER(m.name) = LOWER(cm.name)
       )
       AND cm.trust_score >= 50
       ORDER BY cm.trust_score DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({
      products: newProducts.rows.map(p => ({
        id: p.id,
        name: p.name,
        barcode: p.barcode,
        categoryHint: p.category_hint,
        trustScore: p.trust_score,
      })),
      merchants: newMerchants.rows.map(m => ({
        id: m.id,
        name: m.name,
        nif: m.nif,
        address: m.address,
        trustScore: m.trust_score,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export { router as communityRoutes };
