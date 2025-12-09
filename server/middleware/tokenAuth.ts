import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { isDatabaseAvailable } from '../db';

/**
 * Middleware to validate access tokens for quote submission
 * Checks if token exists, is valid, and hasn't expired
 * Demo mode: Bypasses token validation
 */
export async function validateQuoteAccessToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Demo mode: Skip token validation if database is not available
    if (!isDatabaseAvailable()) {
      return next();
    }

    const { token } = req.query;
    const { id: requestId } = req.params;

    if (!token || typeof token !== 'string') {
      return res.status(401).json({ message: 'Access token required' });
    }

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID required' });
    }

    // Get all request-supplier relationships for this request
    const requestSuppliers = await storage.getRequestSuppliers(requestId);
    console.log('[Token Auth] Request ID:', requestId);
    console.log('[Token Auth] Token from query:', token);
    console.log('[Token Auth] Request suppliers found:', requestSuppliers.length);
    if (requestSuppliers.length > 0) {
      console.log('[Token Auth] First supplier token:', requestSuppliers[0].accessToken);
      console.log('[Token Auth] Tokens match:', requestSuppliers[0].accessToken === token);
    }
    
    // Find the relationship matching this token
    const validAccess = requestSuppliers.find(
      rs => rs.accessToken === token
    );

    if (!validAccess) {
      console.log('[Token Auth] No valid access found - token mismatch');
      return res.status(401).json({ message: 'Invalid access token' });
    }
    
    console.log('[Token Auth] Valid access found for supplier:', validAccess.supplierId);

    // Check if token has expired
    if (validAccess.tokenExpiresAt && new Date() > new Date(validAccess.tokenExpiresAt)) {
      return res.status(401).json({ message: 'Access token has expired' });
    }

    // Attach supplier info to request for use in route handlers
    (req as any).supplierAccess = {
      supplierId: validAccess.supplierId,
      requestId: validAccess.requestId,
      requestSupplierId: validAccess.id,
    };

    next();
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ message: 'Failed to validate access token' });
  }
}
