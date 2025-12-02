# Authentication Setup Guide

## Overview

This backend now includes **better-auth** authentication integrated with the existing Next.js API for chatbot and translation services.

**Tech Stack**:
- Framework: Next.js 16 (App Router, Edge Runtime)
- Auth: better-auth v1.3.4
- Database: Neon PostgreSQL (existing)
- Email: Resend
- OAuth: Google + GitHub

---

## Setup Steps

### 1. Database Migration

Run the authentication schema SQL to create auth tables:

```bash
# Copy SQL from lib/db/auth-schema.sql
# Paste into Neon Dashboard SQL Editor
# Or use psql:
psql $POSTGRES_URL < lib/db/auth-schema.sql
```

**Tables Created**:
- `auth_user` - User accounts
- `auth_session` - Authentication sessions
- `auth_account` - OAuth linked accounts (Google/GitHub)
- `auth_verification` - Email verification & password reset tokens
- `user_progress` - Chapter completion tracking
- `user_bookmarks` - Saved chapters with notes
- `security_events` - Audit log for security events

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

**Required Variables**:
```env
# Authentication Secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET="your-generated-secret-here"

# Application URL
BETTER_AUTH_URL="https://your-backend.vercel.app"  # Production
# BETTER_AUTH_URL="http://localhost:3000"  # Development

# Frontend URLs (comma-separated)
ALLOWED_ORIGINS="https://yourusername.github.io,http://localhost:3001"

# Email Service (Resend)
RESEND_API_KEY="re_your_api_key_from_resend"
EMAIL_FROM="noreply@yourdomain.com"  # Must be verified in Resend
EMAIL_FROM_NAME="Physical AI & Humanoid Robotics Book"

# OAuth Providers (optional, for social login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 3. Get API Keys

**Resend (Email Service)**:
1. Sign up at https://resend.com
2. Create API key at https://resend.com/api-keys
3. Verify sender email domain
4. Free tier: 3,000 emails/month

**Google OAuth** (Optional):
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://your-backend.vercel.app/api/auth/callback/google`
4. Copy Client ID and Secret

**GitHub OAuth** (Optional):
1. Go to https://github.com/settings/developers
2. Create New OAuth App
3. Set callback URL: `https://your-backend.vercel.app/api/auth/callback/github`
4. Copy Client ID and generate Client Secret

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings > Environment Variables
```

### 5. Test Authentication

**Local Development**:
```bash
npm run dev
# Backend: http://localhost:3000
# Frontend: http://localhost:3001 (run from ~/dev/robotics_book)
```

**Test Endpoints**:
- `POST /api/auth/sign-up/email` - Create account
- `POST /api/auth/sign-in/email` - Sign in
- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/callback/github` - GitHub OAuth callback

---

## API Routes

### Existing Routes (Unchanged)
- `POST /api/chat` - AI chatbot
- `POST /api/translate` - Translation service
- `GET /api/analytics/[sessionId]` - Learning analytics
- `GET /api/history/[sessionId]` - Conversation history

### New Authentication Routes
All under `/api/auth/`:
- Email/Password: `sign-up/email`, `sign-in/email`, `sign-out`
- Session: `session`
- Password Reset: `reset-password`, `update-password`
- Email Verification: `verify-email`, `resend-verification`
- OAuth: `callback/google`, `callback/github`

### Future User Feature Routes
- `GET /api/user/profile` - User profile
- `GET/POST /api/user/progress` - Chapter progress tracking
- `GET/POST/DELETE /api/user/bookmarks` - Saved bookmarks

---

## Architecture

### Cross-Domain Setup

**Frontend**: GitHub Pages (`https://yourusername.github.io`)
**Backend**: Vercel (`https://robotics-book-chat-api.vercel.app`)

**Session Strategy**: SameSite=None cookies
- Allows cross-domain authentication
- Requires HTTPS in production
- Safari Private Browsing has limitations (acceptable for MVP)

### Security Features

✅ **Enabled by better-auth**:
- CSRF protection (double-submit cookies)
- Password breach detection (HaveIBeenPwned)
- Rate limiting (5 login attempts per 15 min)
- Secure session tokens (UUID v4)
- Bcrypt password hashing (work factor 12+)
- SQL injection prevention (parameterized queries)

---

## Troubleshooting

### Issue: Email not sending
- Check `RESEND_API_KEY` is correct
- Verify sender email in Resend dashboard
- Check Resend logs for delivery status

### Issue: OAuth not working
- Verify callback URLs match exactly (no trailing slash)
- Check Client ID and Secret are correct
- Ensure OAuth app is not in development mode

### Issue: Cross-domain cookies blocked
- Verify both frontend and backend use HTTPS in production
- Check `ALLOWED_ORIGINS` includes frontend URL
- Safari Private Browsing blocks third-party cookies (expected)

### Issue: Database connection fails
- Check `POSTGRES_URL` environment variable
- Verify Neon database is running
- Check if schema tables exist

---

## Next Steps

1. **Run Database Migration** - Create auth tables in Neon
2. **Configure Environment** - Add all required env variables to Vercel
3. **Set up Resend** - Create account and verify sender email
4. **Test Locally** - Run `npm run dev` and test signup/signin
5. **Deploy** - Push to Vercel and test in production
6. **Setup OAuth** (Optional) - Configure Google/GitHub if needed

---

## Support

- **better-auth Docs**: https://www.better-auth.com/docs
- **Resend Docs**: https://resend.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Next.js Docs**: https://nextjs.org/docs
