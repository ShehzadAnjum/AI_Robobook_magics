# Database Connection Error Analysis

## Error Summary

```
NeonDbError: Error connecting to database: fetch failed
at async createSession (lib/db/queries.ts:31:18)
```

## Root Cause

The application is trying to connect to a Vercel Postgres database (which uses Neon under the hood), but the database connection string is not available in the local development environment.

### Technical Details

1. **Package Used**: `@vercel/postgres` (v0.10.0)
   - This package internally uses `@neondatabase/serverless`
   - Requires `POSTGRES_URL` environment variable

2. **Edge Runtime**: The route uses `export const runtime = 'edge'`
   - Edge runtime requires environment variables to be explicitly set
   - Cannot use Node.js-specific connection methods

3. **Missing Environment Variable**: `POSTGRES_URL` is not set in `.env.local`

## Solutions

### Solution 1: Pull Environment Variables from Vercel (Recommended)

If you have a Vercel project with a database already set up:

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link your local project to Vercel project
vercel link

# Pull environment variables (this will create/update .env.local)
vercel env pull .env.local
```

This will download all environment variables including `POSTGRES_URL` from your Vercel project.

### Solution 2: Create Local Database Connection

If you want to use a local PostgreSQL database:

1. **Install PostgreSQL locally** or use Docker:
   ```bash
   docker run --name postgres-dev -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres
   ```

2. **Create `.env.local` file**:
   ```env
   POSTGRES_URL=postgresql://postgres:dev@localhost:5432/postgres
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_key_here
   ```

3. **Run the schema**:
   ```bash
   psql $POSTGRES_URL -f lib/db/schema.sql
   ```

### Solution 3: Switch to Node.js Runtime (Quick Fix for Local Dev)

If you want to test without database setup, you can temporarily switch the runtime:

**File**: `app/api/chat/route.ts`

Change:
```typescript
export const runtime = 'edge';
```

To:
```typescript
export const runtime = 'nodejs';
```

**Note**: This changes the runtime behavior. Edge runtime is preferred for production.

### Solution 4: Mock Database for Development

Create a development mode that skips database operations:

```typescript
// In lib/db/queries.ts
const isDevelopment = process.env.NODE_ENV === 'development';
const hasDatabase = !!process.env.POSTGRES_URL;

export async function createSession(userMetadata: Record<string, any> = {}): Promise<Session> {
  if (isDevelopment && !hasDatabase) {
    // Return mock session for local dev
    return {
      id: crypto.randomUUID(),
      created_at: new Date(),
      last_active: new Date(),
      user_metadata: userMetadata,
    };
  }
  
  const result = await sql<Session>`
    INSERT INTO sessions (user_metadata)
    VALUES (${JSON.stringify(userMetadata)}::jsonb)
    RETURNING *
  `;
  return result.rows[0];
}
```

## Required Environment Variables

For the application to work, you need:

```env
# Database (Required for production)
POSTGRES_URL=postgresql://user:password@host:port/database

# AI Provider (Required)
AI_PROVIDER=gemini  # or 'openai'
GEMINI_API_KEY=your_key_here  # if using Gemini
OPENAI_API_KEY=your_key_here  # if using OpenAI

# Optional
GEMINI_MODEL=gemini-2.0-flash-exp
OPENAI_MODEL=gpt-4o-mini
BOOK_NAME=AI & Robotics Book
BOOK_TOPICS=artificial intelligence, robotics, machine learning...
```

## Verification Steps

1. **Check if `.env.local` exists**:
   ```bash
   ls -la .env.local
   ```

2. **Verify POSTGRES_URL is set**:
   ```bash
   grep POSTGRES_URL .env.local
   ```

3. **Test database connection**:
   ```bash
   # If using Vercel Postgres
   vercel postgres connect
   ```

## Next Steps

1. Choose one of the solutions above
2. Set up the database connection
3. Run the schema: `lib/db/schema.sql`
4. Restart the dev server: `npm run dev`
5. Test the API endpoint

## Additional Notes

- The error occurs at the first database operation (`createSession`)
- All subsequent database operations will also fail until connection is established
- Edge runtime is more restrictive than Node.js runtime for database connections
- Vercel Postgres automatically provides connection strings when linked to a project

