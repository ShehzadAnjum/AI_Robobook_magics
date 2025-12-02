import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// better-auth configuration for Next.js Edge Runtime with PostgreSQL
export const auth = betterAuth({
  database: pool,

  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
  },

  // Social OAuth providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
  },

  // Session configuration
  session: {
    expiresIn: Number(process.env.SESSION_EXPIRY_DAYS || 7) * 24 * 60 * 60, // Default: 7 days in seconds
    updateAge: 24 * 60 * 60, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache cookie for 5 minutes
    },
  },

  // Account linking
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github'],
    },
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 15 * 60, // 15 minutes
    max: 5, // Max 5 requests per window
    storage: 'memory', // Use memory for MVP, upgrade to Redis for production
  },

  // Trusted origins for CORS (cross-domain support)
  trustedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],

  // Base URL for callbacks
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  // Secret for JWT signing
  secret: process.env.BETTER_AUTH_SECRET || '',
});

// Export auth instance for use in API routes
