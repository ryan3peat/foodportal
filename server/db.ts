import { config as loadEnv } from "dotenv";
// Ensure env vars load before any connection checks
loadEnv({ path: ".env.local" });
loadEnv();

// Demo mode: Database is optional - if DATABASE_URL is not set, run in demo mode without database
const isDemoMode = !process.env.DATABASE_URL;

let db: any = null;

if (isDemoMode) {
  console.log('\n⚠️  DEMO MODE: Running without database connection');
  console.log('   All data will be stored in browser localStorage (client-side)');
  console.log('   No backend storage required for demo purposes\n');
} else {
  try {
    const postgres = require('postgres');
    const { drizzle } = require('drizzle-orm/postgres-js');
    const schema = require("@shared/schema");

    // Create postgres client with connection error handling
    // Supabase requires SSL for external connections
    const databaseUrl = process.env.DATABASE_URL;
    const isSupabase = databaseUrl?.includes('supabase.co');

    // Configure SSL for Supabase - use rejectUnauthorized: false for Supabase's self-signed certs
    // or use 'require' for basic SSL requirement
    const sslConfig = isSupabase 
      ? { rejectUnauthorized: false } // Supabase uses self-signed certificates
      : false;

    const client = postgres(databaseUrl, {
      max: 1, // Limit connection pool for serverless environments
      onnotice: () => {}, // Suppress notices
      connection: {
        application_name: 'foodportal',
      },
      connect_timeout: 30, // 30 second connection timeout (increased for network issues)
      idle_timeout: 20, // 20 second idle timeout
      ssl: sslConfig,
      transform: {
        undefined: null, // Transform undefined to null for PostgreSQL
      },
    });

    // Test connection on startup (non-blocking)
    client`SELECT 1`.catch((err: any) => {
      console.error('\n❌ Database Connection Error:');
      const maskedUrl = process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@');
      console.error(`   Unable to connect to: ${maskedUrl}`);
      console.error(`   Error: ${err.message}`);
      console.error('   ⚠️  Continuing in demo mode without database...\n');
    });

    db = drizzle(client, { schema });
    console.log('✅ Database connection initialized\n');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    console.error('⚠️  Continuing in demo mode without database...\n');
  }
}

export { db };
export const isDatabaseAvailable = () => db !== null;
