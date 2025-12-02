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
  trustedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3001',
    'https://shehzadanjum.github.io'
  ],

  // Advanced options for cross-domain authentication
  advanced: {
    // CRITICAL: Set default cookie attributes for cross-domain authentication
    // This allows GitHub Pages (github.io) to send cookies to Vercel (vercel.app)
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    },
  },
});

// Export auth instance for use in API routes
