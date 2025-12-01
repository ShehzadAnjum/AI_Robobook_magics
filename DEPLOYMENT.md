# Quick Deployment Guide

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Vercel account (free)
- [ ] Google Gemini API key ([Get it here](https://ai.google.dev/))

## Step-by-Step Deployment

### 1. Create GitHub Repository

```bash
cd /home/anjum/dev/robotics-book-chat-api

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AI Robotics Book Chat API"

# Create main branch
git branch -M main
```

Then on GitHub:
1. Go to https://github.com/new
2. Create a new repository named `robotics-book-chat-api`
3. Don't initialize with README (we already have one)
4. Copy the remote URL

```bash
# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/robotics-book-chat-api.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `robotics-book-chat-api` repository
4. Configure environment variables:
   - Click "Environment Variables"
   - Add these variables:

   ```
   AI_PROVIDER = gemini
   GEMINI_API_KEY = your_actual_api_key_here
   BOOK_NAME = AI & Robotics Book
   BOOK_TOPICS = artificial intelligence, robotics, machine learning, computer vision, autonomous systems, control theory, path planning, sensor fusion
   ```

5. Click "Deploy"
6. Wait 1-2 minutes for deployment

### 3. Create Vercel Postgres Database

After first deployment:

1. In your Vercel project dashboard, click "Storage" tab
2. Click "Create Database"
3. Select "Postgres"
4. Choose region closest to your users
5. Click "Create"
6. Wait for database creation

### 4. Initialize Database Schema

Option A: Via Vercel Dashboard (Easiest)

1. Click on your Postgres database
2. Go to "Query" tab
3. Open `lib/db/schema.sql` in your local editor
4. Copy ALL the SQL content
5. Paste into Vercel query editor
6. Click "Run Query"
7. Verify tables created: sessions, messages, analytics_events

Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Run schema
vercel postgres exec "$(cat lib/db/schema.sql)"
```

### 5. Test Your API

After deployment, your API URL will be:
```
https://your-project-name.vercel.app
```

Test it:

```bash
curl -X POST https://your-project-name.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is a PID controller in robotics?"}'
```

You should see streaming response chunks.

### 6. Update Frontend (Docusaurus)

In your Docusaurus book repository, update the API endpoint:

```typescript
// In your chat component
const API_URL = 'https://your-project-name.vercel.app/api/chat';
```

## Verification Checklist

After deployment, verify:

- [ ] Visit `https://your-project-name.vercel.app` - Should show API info page
- [ ] Check Vercel deployment logs - No errors
- [ ] Test `/api/chat` endpoint - Returns streaming response
- [ ] Check database in Vercel - Tables exist
- [ ] Test from frontend - Chat works end-to-end
- [ ] Check CORS - No browser console errors

## Troubleshooting

### "GEMINI_API_KEY is not set"

- Go to Vercel project → Settings → Environment Variables
- Add `GEMINI_API_KEY` with your actual key
- Redeploy: Deployments tab → Click "Redeploy"

### "Error: connect ECONNREFUSED"

- Database not created or linked
- Go to Storage tab and create Postgres database
- Redeploy after database is ready

### CORS Errors in Browser

- Check that frontend URL matches the CORS config in `next.config.js`
- Current: `https://shehzadanjum.github.io`
- Update if your frontend is at a different URL

### Database Connection Errors

- Ensure database schema was run successfully
- Check Vercel logs for specific error messages
- Verify database is in same region as functions

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | Yes | `gemini` | AI provider: `gemini` or `openai` |
| `GEMINI_API_KEY` | If using Gemini | - | Google Gemini API key |
| `OPENAI_API_KEY` | If using OpenAI | - | OpenAI API key |
| `GEMINI_MODEL` | No | `gemini-pro` | Gemini model to use (gemini-pro, gemini-2.0-flash, etc.) |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model to use |
| `BOOK_NAME` | No | `AI & Robotics Book` | Book name for prompts |
| `BOOK_TOPICS` | No | (see above) | Comma-separated topics |

## Monitoring

- **Logs**: Vercel Dashboard → Deployments → [Latest] → Logs
- **Analytics**: Functions tab shows usage, errors, duration
- **Database**: Storage → [Your DB] → Data tab to view records

## Updating the API

```bash
# Make changes to code
git add .
git commit -m "Update: description of changes"
git push

# Vercel auto-deploys on push to main branch
```

## Cost Estimate

**Free Tier Limits:**
- Vercel: 100GB bandwidth, 100k function invocations/month
- Vercel Postgres: 256MB storage, 60 hours compute/month
- Gemini: 1,500 requests/day (free tier)

**Expected for moderate use (100 students):**
- Cost: $0/month (within free tiers)

**For high use (1000+ students):**
- Vercel: ~$20/month
- Vercel Postgres: ~$5/month
- Gemini: Free (or switch to paid $0.00015/request)

## Next Steps

After successful deployment:

1. Save your API URL
2. Integrate with Docusaurus frontend
3. Test end-to-end chat functionality
4. Monitor usage in Vercel dashboard
5. Plan for RAG implementation (next phase)

## Support

Issues? Check:
1. Vercel deployment logs
2. Browser console (for CORS/network issues)
3. Database query results
4. GitHub repository issues

---

**Deployment completed?** Update the frontend to use your new API URL! 🚀
