import crypto from 'crypto';

// Login magic links expire in 15 minutes for security
const MAGIC_LINK_LOGIN_EXPIRY_MINUTES = 15;
const MAGIC_LINK_LOGIN_EXPIRY_MS = MAGIC_LINK_LOGIN_EXPIRY_MINUTES * 60 * 1000;

// Password setup links expire in 24 hours for convenience
const PASSWORD_SETUP_EXPIRY_HOURS = 24;
const PASSWORD_SETUP_EXPIRY_MS = PASSWORD_SETUP_EXPIRY_HOURS * 60 * 60 * 1000;

export const MAGIC_LINK_EXPIRY_MS = MAGIC_LINK_LOGIN_EXPIRY_MS;
export const MAGIC_LINK_EXPIRY_MINUTES = MAGIC_LINK_LOGIN_EXPIRY_MINUTES;
export const PASSWORD_SETUP_EXPIRY_MINUTES = PASSWORD_SETUP_EXPIRY_HOURS * 60;

export function generateMagicLinkToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  return { token, tokenHash };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function getTokenExpiryDate(type: 'login' | 'password_setup'): Date {
  const expiryMs = type === 'password_setup' ? PASSWORD_SETUP_EXPIRY_MS : MAGIC_LINK_LOGIN_EXPIRY_MS;
  return new Date(Date.now() + expiryMs);
}

// Backwards compatibility
export function getMagicLinkExpiryDate(): Date {
  return getTokenExpiryDate('login');
}
