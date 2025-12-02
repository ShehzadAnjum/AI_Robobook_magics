# Deployment Architecture

## Repository Information

**GitHub Repository**: https://github.com/ShehzadAnjum/AI_Robobook_magics
**Local Path**: `/home/anjum/dev/robotics-book-chat-api/`
**Deployment Platform**: Vercel
**Production URL**: https://airobobookmagic.vercel.app

## How Deployment Works

### Automatic Vercel Deployment

Vercel is **directly connected** to your GitHub repository. This means:

1. **Push to GitHub** → `git push`
2. **Vercel Detects Change** → Automatic trigger
3. **Vercel Builds & Deploys** → Within 1-2 minutes
4. **Live at Production URL** → https://airobobookmagic.vercel.app

**Important**: You do NOT push directly to Vercel. Vercel watches your GitHub repository and deploys automatically.

### Deployment Flow

```
┌─────────────────┐
│  Local Changes  │
└────────┬────────┘
         │
         │ git add .
         │ git commit -m "message"
         │ git push
         ▼
┌─────────────────┐
│  GitHub Repo    │ ◄── Connected to Vercel
│  (main branch)  │
└────────┬────────┘
         │
         │ (automatic trigger)
         ▼
┌─────────────────┐
│  Vercel CI/CD   │
│  - Builds       │
│  - Tests        │
│  - Deploys      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Production     │
│  airobobookmagic│
│  .vercel.app    │
└─────────────────┘
```

## GitHub Actions (CI)

GitHub Actions run **before** Vercel deployment to catch errors early.

### What Gets Checked

- ✅ **TypeScript Type Checking** (`tsc --noEmit`)
- ✅ **ESLint Validation** (`npm run lint`)
- ✅ **Build Verification** (`npm run build`)
- ✅ **Artifact Upload** (for debugging)

### When Actions Run

- On every **push** to `main` or `develop` branch
- On every **pull request** to `main` branch

### Workflow File

`.github/workflows/ci.yml`

## Environment Variables

Environment variables are stored in **two places**:

### 1. Vercel Dashboard (Production)

- Go to: https://vercel.com/shehzadanjums-projects/ai_robobook_magic/settings/environment-variables
- Set: `GEMINI_API_KEY`, `AI_PROVIDER`, etc.
- These are used in production deployment

### 2. Local Development

- File: `.env.local` (not committed to git)
- Copy from: `.env.local.example`
- Set your local API keys here

## API Endpoints

### Available Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Streaming chat with AI assistant |
| `/api/translate` | POST | Instant English-to-Urdu translation |
| `/api/history/[sessionId]` | GET | Get conversation history |
| `/api/analytics/[sessionId]` | GET | Get session analytics |

## Development Workflow

### Making Changes

```bash
# 1. Make code changes
vim app/api/translate/route.ts

# 2. Test locally
npm run dev

# 3. Stage and commit
git add .
git commit -m "feat: description"

# 4. Push to GitHub (triggers Vercel)
git push
```

## Security Notes

- ✅ API keys in Vercel environment variables
- ✅ CORS restricted to `https://shehzadanjum.github.io`
- ✅ Input validation on all endpoints
- ✅ `.env` files excluded from git

---

**Last Updated**: 2025-12-02
