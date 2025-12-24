/**
 * Authentication middleware
 */

import jwt from 'jsonwebtoken';
import { db } from '../db/connection.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_production';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user still exists and is active
    const result = await db.query(
      'SELECT id, email, display_name, is_active, community_opted_in FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      displayName: result.rows[0].display_name,
      communityOptedIn: result.rows[0].community_opted_in,
    };

    // Check for admin role
    const roleResult = await db.query(
      "SELECT 1 FROM user_roles WHERE user_id = $1 AND role = 'admin'",
      [decoded.userId]
    );
    req.user.isAdmin = roleResult.rows.length > 0;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
