/**
 * Admin routes - User management only
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require admin role
router.use(requireAdmin);

// List all users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT u.id, u.email, u.display_name, u.is_active, u.community_opted_in,
             u.created_at, u.last_login_at, u.email_verified,
             COALESCE(
               (SELECT array_agg(role) FROM user_roles WHERE user_id = u.id),
               ARRAY[]::app_role[]
             ) as roles
      FROM users u
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` WHERE u.email ILIKE $${paramCount++} OR u.display_name ILIKE $${paramCount++}`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users';
    if (search) {
      countQuery += ' WHERE email ILIKE $1 OR display_name ILIKE $2';
    }
    const countResult = await db.query(countQuery, search ? [`%${search}%`, `%${search}%`] : []);

    res.json({
      users: result.rows.map(row => ({
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        isActive: row.is_active,
        communityOptedIn: row.community_opted_in,
        emailVerified: row.email_verified,
        roles: row.roles,
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single user
router.get('/users/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT u.*, 
              COALESCE((SELECT array_agg(role) FROM user_roles WHERE user_id = u.id), ARRAY[]::app_role[]) as roles,
              (SELECT COUNT(*) FROM receipts WHERE user_id = u.id) as receipt_count,
              (SELECT COUNT(*) FROM products WHERE user_id = u.id) as product_count
       FROM users u WHERE u.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      isActive: user.is_active,
      communityOptedIn: user.community_opted_in,
      emailVerified: user.email_verified,
      roles: user.roles,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      stats: {
        receiptCount: parseInt(user.receipt_count),
        productCount: parseInt(user.product_count),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Toggle user active status
router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }

    // Prevent self-deactivation
    if (req.params.id === req.user.id && !isActive) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const result = await db.query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, is_active',
      [isActive, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If deactivating, revoke all refresh tokens
    if (!isActive) {
      await db.query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [req.params.id]);
    }

    res.json({
      id: result.rows[0].id,
      email: result.rows[0].email,
      isActive: result.rows[0].is_active,
    });
  } catch (error) {
    next(error);
  }
});

// Assign or remove admin role
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role, action } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (!['add', 'remove'].includes(action)) {
      return res.status(400).json({ error: 'Action must be add or remove' });
    }

    // Prevent removing own admin role
    if (req.params.id === req.user.id && role === 'admin' && action === 'remove') {
      return res.status(400).json({ error: 'Cannot remove your own admin role' });
    }

    if (action === 'add') {
      await db.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.params.id, role]
      );
    } else {
      await db.query('DELETE FROM user_roles WHERE user_id = $1 AND role = $2', [req.params.id, role]);
    }

    // Return updated roles
    const rolesResult = await db.query('SELECT role FROM user_roles WHERE user_id = $1', [req.params.id]);

    res.json({
      userId: req.params.id,
      roles: rolesResult.rows.map(r => r.role),
    });
  } catch (error) {
    next(error);
  }
});

// Get system stats
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as active_users,
        (SELECT COUNT(*) FROM users WHERE community_opted_in = TRUE) as community_users,
        (SELECT COUNT(*) FROM receipts) as total_receipts,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM merchants) as total_merchants,
        (SELECT COUNT(*) FROM community_products) as community_products,
        (SELECT COUNT(*) FROM community_merchants) as community_merchants
    `);

    res.json({
      users: {
        total: parseInt(stats.rows[0].total_users),
        active: parseInt(stats.rows[0].active_users),
        communityOptedIn: parseInt(stats.rows[0].community_users),
      },
      data: {
        receipts: parseInt(stats.rows[0].total_receipts),
        products: parseInt(stats.rows[0].total_products),
        merchants: parseInt(stats.rows[0].total_merchants),
      },
      community: {
        products: parseInt(stats.rows[0].community_products),
        merchants: parseInt(stats.rows[0].community_merchants),
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as adminRoutes };
