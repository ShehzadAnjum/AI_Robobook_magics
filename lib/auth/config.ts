import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Minimal better-auth configuration for compatibility with v1.4.4
export const auth = betterAuth({
  database: pool,

  // Base URL for callbacks
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  // Secret for JWT signing
  secret: process.env.BETTER_AUTH_SECRET || '',

  // Trusted origins for CORS (cross-domain support)
  trustedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
});

// Export auth instance for use in API routes
