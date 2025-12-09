import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { isDatabaseAvailable } from "./db";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  // Use SESSION_SECRET from env, or generate a default for demo mode
  const sessionSecret = process.env.SESSION_SECRET || 'demo-session-secret-change-in-production';
  
  if (!process.env.SESSION_SECRET) {
    console.warn('⚠️  SESSION_SECRET not set. Using default for demo mode. Set SESSION_SECRET in .env.local for production.');
  }

  // Use memory store in demo mode, PostgreSQL store if database is available
  let sessionStore: session.Store;
  if (isDatabaseAvailable() && process.env.DATABASE_URL) {
    try {
      const connectPg = require("connect-pg-simple");
      const pgStore = connectPg(session);
      sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl: sessionTtl,
        tableName: "sessions",
      });
    } catch (error) {
      console.warn('⚠️  Could not initialize PostgreSQL session store, using memory store');
      sessionStore = new session.MemoryStore();
    }
  } else {
    // Use memory store for demo mode
    sessionStore = new session.MemoryStore();
    console.log('📝 Using memory session store (sessions cleared on server restart)');
  }
  
  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization - supports local auth and supplier sessions
  passport.serializeUser((user: any, cb) => {
    // Serialize user based on authType
    if (user.authType === "local") {
      cb(null, { localAuthUser: user.localAuthUser, authType: "local" });
    } else if (user.authType === "supplier") {
      cb(null, { supplierUser: user.supplierUser, authType: "supplier" });
    } else {
      // Fallback for local auth without explicit authType
      cb(null, { localAuthUser: user, authType: "local" });
    }
  });
  
  passport.deserializeUser(async (user: any, cb) => {
    // Demo mode: Skip database lookups
    if (!isDatabaseAvailable()) {
      cb(null, user);
      return;
    }

    // Deserialize user based on authType
    if (user.authType === "local") {
      try {
        const freshUser = await storage.getUser(user.localAuthUser.id);
        cb(null, freshUser ? { localAuthUser: freshUser, authType: "local" } : user);
      } catch (error) {
        cb(error);
      }
    } else if (user.authType === "supplier") {
      try {
        const freshSupplier = await storage.getUser(user.supplierUser.id);
        cb(null, freshSupplier ? { supplierUser: freshSupplier, authType: "supplier" } : user);
      } catch (error) {
        cb(error);
      }
    } else {
      cb(null, user);
    }
  });

  // Universal logout endpoint - handles all auth types
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('[Auth] Logout error:', err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });
}

// Demo mode: Bypass authentication - always allow access
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In demo mode, always proceed without checking authentication
  return next();
};
