// ============================================================
// MediVault — Authentication & Authorization Middleware
// src/backend/middleware/auth.ts
//
// Implements the Middleware Chain (Chain of Responsibility) pattern:
//   authenticate → authorize → controller
//
// Exports:
//   authenticate   — verifies JWT and attaches userId + userRole to req
//   authorize      — factory that returns a middleware checking allowed roles
//   generateToken  — creates a signed JWT for a user
// ============================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../interfaces';

// ------------------------------------------------------------
// Extend Express Request to carry authenticated user context.
// This avoids casting `req as any` everywhere in controllers.
// ------------------------------------------------------------
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'medivault-dev-secret';
const TOKEN_EXPIRY = '24h';

interface JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ------------------------------------------------------------
// generateToken — creates a signed JWT for the given user
// Called after successful login or registration
// ------------------------------------------------------------
export function generateToken(userId: string, role: UserRole): string {
  const payload: JwtPayload = { userId, role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// ------------------------------------------------------------
// authenticate — extracts and verifies the Bearer token
// Attaches userId and userRole to req for downstream middleware
// ------------------------------------------------------------
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token has expired. Please log in again.' });
    } else {
      res.status(401).json({ error: 'Invalid token.' });
    }
  }
}

// ------------------------------------------------------------
// authorize — factory that returns a role-checking middleware
// Usage: router.get('/records', authenticate, authorize(UserRole.PATIENT), controller)
// ------------------------------------------------------------
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    if (!allowedRoles.includes(req.userRole)) {
      res.status(403).json({
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.userRole}`,
      });
      return;
    }

    next();
  };
}
