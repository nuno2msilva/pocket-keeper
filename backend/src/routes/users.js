/**
 * User management routes
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/connection.js';

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  communityOptedIn: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(100),
});

// Get current user profile
router.get('/me', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, email, display_name, community_opted_in, created_at, last_login_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      communityOptedIn: user.community_opted_in,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      isAdmin: req.user.isAdmin,
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.patch('/me', async (req, res, next) => {
  try {
    const updates = updateProfileSchema.parse(req.body);
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (updates.displayName !== undefined) {
      setClauses.push(`display_name = $${paramCount++}`);
      values.push(updates.displayName);
    }

    if (updates.communityOptedIn !== undefined) {
      setClauses.push(`community_opted_in = $${paramCount++}`);
      values.push(updates.communityOptedIn);

      // If opting in, sync user's products/merchants to community
      if (updates.communityOptedIn) {
        // This would trigger background sync of solidified products/merchants
        console.log(`User ${req.user.id} opted into community database`);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.user.id);
    const result = await db.query(
      `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramCount} 
       RETURNING id, email, display_name, community_opted_in`,
      values
    );

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      communityOptedIn: user.community_opted_in,
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.post('/me/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    // Get current password hash
    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);

    // Revoke all refresh tokens except current session
    await db.query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete('/me', async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password required to delete account' });
    }

    // Verify password
    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isValid = await bcrypt.compare(password, result.rows[0].password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    // Soft delete by deactivating
    await db.query('UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = $1', [req.user.id]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };
