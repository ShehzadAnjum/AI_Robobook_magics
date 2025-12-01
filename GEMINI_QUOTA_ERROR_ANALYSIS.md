# Gemini API Quota Error Analysis

## Error Summary

```
Error: [429 Too Many Requests] You exceeded your current quota
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
limit: 0, model: gemini-2.0-flash-exp
```

## Root Cause

The model `gemini-2.0-flash-exp` is **not available on the free tier** or has been exhausted. The error shows:
- **Limit: 0** for free tier requests
- Model: `gemini-2.0-flash-exp` (experimental model)
- Retry delay: 51 seconds

## Why This Happens

1. **Experimental Model**: `gemini-2.0-flash-exp` is an experimental model that may not be available on free tier
2. **Free Tier Limits**: Google Gemini free tier has strict rate limits
3. **Model Availability**: Some newer models require paid plans

## Solutions

### Solution 1: Switch to Free Tier Model (Recommended)

Change the model to one that's available on the free tier:

**Option A: Use `gemini-1.5-flash`** (Recommended - Fast and free)
```env
GEMINI_MODEL=gemini-1.5-flash
```

**Option B: Use `gemini-pro`** (More capable, still free tier)
```env
GEMINI_MODEL=gemini-pro
```

**Option C: Use `gemini-1.5-pro`** (If available on your account)
```env
GEMINI_MODEL=gemini-1.5-pro
```

### Solution 2: Update Default Model in Code

Change the default model in `lib/ai/providers/gemini.ts`:

```typescript
this.model = config.model || 'gemini-1.5-flash';  // Instead of 'gemini-2.0-flash-exp'
```

### Solution 3: Upgrade to Paid Plan

If you need `gemini-2.0-flash-exp`:
1. Go to https://ai.google.dev/
2. Upgrade to a paid plan
3. Enable billing
4. The model will then be available

### Solution 4: Add Retry Logic with Exponential Backoff

Implement automatic retry for rate limit errors (see implementation below).

## Available Gemini Models (Free Tier)

| Model | Free Tier | Speed | Capability |
|-------|-----------|-------|------------|
| `gemini-1.5-flash` | ✅ Yes | Fast | Good |
| `gemini-1.5-pro` | ✅ Yes (limited) | Slower | Excellent |
| `gemini-pro` | ✅ Yes | Medium | Good |
| `gemini-2.0-flash-exp` | ❌ No | Fast | Experimental |

## Quick Fix

**Immediate fix** - Update your `.env.local`:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash
```

Then restart your dev server.

## Verification

After changing the model, test with:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

## Additional Notes

- Free tier typically allows 15 requests per minute
- Rate limits reset after the retry delay period
- Check your quota at: https://ai.dev/usage?tab=rate-limit
- Consider implementing rate limiting in your application

