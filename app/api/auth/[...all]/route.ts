import { auth } from '@/lib/auth/config';

// better-auth catch-all route for Next.js App Router
// Direct handler approach (not using toNextJsHandler)
export const GET = auth.handler;
export const POST = auth.handler;
export const OPTIONS = auth.handler; // Add OPTIONS for CORS preflight

// Note: Using Node.js runtime (not Edge) because pg package requires Node.js APIs
