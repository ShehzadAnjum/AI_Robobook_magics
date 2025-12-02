import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Better-auth configuration with email/password authentication enabled
export const auth = betterAuth({
  database: pool,

  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Temporarily disabled for initial testing
    minPasswordLength: 8,
  },

  // Base URL for callbacks
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  // Secret for JWT signing
  secret: process.env.BETTER_AUTH_SECRET || '',

  // Trusted origins for CORS (cross-domain support)
  trustedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],

  // Session configuration for cross-domain cookies
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },

  // Advanced options for cross-domain authentication
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    useSecureCookies: true, // Force HTTPS-only cookies
  },
});

// Export auth instance for use in API routes
