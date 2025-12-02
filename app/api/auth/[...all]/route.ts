import { auth } from '@/lib/auth/config';
import { toNextJsHandler } from 'better-auth/next-js';

// better-auth catch-all route for Next.js App Router
// Using toNextJsHandler to properly handle CORS preflight and Next.js specifics
export const { GET, POST } = toNextJsHandler(auth.handler);

// Note: Using Node.js runtime (not Edge) because pg package requires Node.js APIs
