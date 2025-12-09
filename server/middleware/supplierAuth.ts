import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

// Helper function to get user ID from either OIDC, local auth, or supplier magic link
function getUserId(req: any): string | undefined {
  if (req.user?.authType === "local") {
    return req.user.localAuthUser?.id;
  } else if (req.user?.authType === "supplier") {
    return req.user.supplierUser?.id;
  } else if (req.user?.claims) {
    return req.user.claims.sub;
  }
  return undefined;
}

// Helper function to get user email from either OIDC, local auth, or supplier magic link
function getUserEmail(req: any): string | undefined {
  if (req.user?.authType === "local") {
    return req.user.localAuthUser?.email;
  } else if (req.user?.authType === "supplier") {
    return req.user.supplierUser?.email;
  } else if (req.user?.claims) {
    return req.user.claims.email;
  }
  return undefined;
}

// Middleware to verify user is a registered supplier with quote requests
// Demo mode: Bypass checks and use first available supplier or create mock supplier
export async function requireSupplierAccess(req: any, res: Response, next: NextFunction) {
  try {
    // Demo mode: Bypass authentication checks
    const userId = "demo-admin-user"; // Use demo user ID
    
    // Create a mock supplier for demo mode (database not required)
    const supplier = {
      id: "demo-supplier-id",
      supplierName: "Demo Food Production Supplier",
      contactPerson: "Demo Contact",
      email: "supplier@demo.com",
      email2: null,
      phone: null,
      location: null,
      moq: null,
      leadTimes: null,
      paymentTerms: null,
      certifications: [],
      active: true,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Attach supplier info to request for downstream handlers
    req.supplier = supplier;
    req.userId = userId;
    
    next();
  } catch (error) {
    console.error("Supplier auth middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
