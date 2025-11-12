/**
 * Centralized base URL configuration for the application.
 * 
 * Priority order:
 * 1. BASE_URL - Explicitly set production URL (e.g., https://your-app.replit.app)
 * 2. REPLIT_DEV_DOMAIN - Auto-set by Replit in development mode
 * 3. Fallback to localhost (development only)
 */

/**
 * Normalizes a base URL by removing trailing slashes.
 * Prevents double-slash issues when concatenating paths.
 */
function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getBaseUrl(): string {
  // Highest priority: Explicit BASE_URL (for production)
  if (process.env.BASE_URL) {
    const baseUrl = process.env.BASE_URL.trim();
    // Ensure it starts with https:// in production
    if (process.env.NODE_ENV === 'production' && !baseUrl.startsWith('https://')) {
      console.warn('⚠️  BASE_URL should use HTTPS in production:', baseUrl);
    }
    return normalizeBaseUrl(baseUrl);
  }

  // Second priority: REPLIT_DEV_DOMAIN (auto-set in Replit dev mode)
  if (process.env.REPLIT_DEV_DOMAIN) {
    return normalizeBaseUrl(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  }

  // Fallback: localhost (development only)
  const fallbackUrl = 'http://localhost:5000';
  
  // Warn if using localhost fallback in production
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: BASE_URL environment variable not set in production!');
    console.error('   URLs will default to localhost, which will cause failures.');
    console.error('   Please set BASE_URL in your deployment secrets.');
    console.error(`   Example: BASE_URL=https://your-app-name.replit.app`);
  }

  return normalizeBaseUrl(fallbackUrl);
}

/**
 * Validates that the base URL is properly configured.
 * Logs warnings/errors if configuration issues are detected.
 */
export function validateBaseUrl(): void {
  const baseUrl = getBaseUrl();
  const isProduction = process.env.NODE_ENV === 'production';

  console.log('\n🌐 Base URL Configuration:');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   BASE_URL: ${process.env.BASE_URL || '(not set)'}`);
  console.log(`   REPLIT_DEV_DOMAIN: ${process.env.REPLIT_DEV_DOMAIN || '(not set)'}`);
  console.log(`   Resolved URL: ${baseUrl}`);

  if (isProduction && baseUrl.includes('localhost')) {
    console.error('   ❌ ERROR: Using localhost in production!');
  } else if (isProduction && process.env.BASE_URL) {
    console.log('   ✅ Production URL configured correctly');
  } else if (!isProduction) {
    console.log('   ✅ Development URL configured');
  }
  console.log('');
}
