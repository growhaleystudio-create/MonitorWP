import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'wp-monitoring-super-secret-key';

// Extend Express Request type to include site and user details
declare global {
  namespace Express {
    interface Request {
      site?: any;
      adminUser?: any;
    }
  }
}

/**
 * Middleware to authenticate requests from the WordPress Agent Plugin.
 * Expects the API key in the 'X-API-Key' header.
 */
export async function validateAgentKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized: X-API-Key header is missing' });
  }

  try {
    const site = await prisma.site.findUnique({
      where: { apiKey },
    });

    if (!site) {
      return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    if (!site.isActive) {
      return res.status(403).json({ error: 'Forbidden: Site is inactive' });
    }

    req.site = site;
    next();
  } catch (error) {
    console.error('Error validating agent API Key:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Middleware to authenticate requests from the Dashboard UI.
 * Expects a JWT token in the 'Authorization: Bearer <token>' header.
 */
export function validateDashboardSession(req: Request, res: Response, next: NextFunction) {
  // Allow bypassing for development if needed, but secure by default
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Bearer token is missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminUser = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
export { JWT_SECRET };
