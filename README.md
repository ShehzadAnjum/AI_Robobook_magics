# AI & Robotics Book Chat API

Backend API for the AI & Robotics Book interactive chat with learning journey tracking.

## Features

✅ **AI-Powered Chat** - Streaming responses using Google Gemini or OpenAI
✅ **Book-Specific Context** - Only answers robotics & AI questions
✅ **Multi-turn Conversations** - Maintains conversation history
✅ **Learning Journey Tracking** - Stores all interactions for progress analysis
✅ **Provider Agnostic** - Easily switch between AI models
✅ **Session Management** - Persistent sessions across page visits
✅ **Analytics API** - Track user engagement and learning patterns

## Architecture

```
Frontend (GitHub Pages)
    ↓
Next.js API Routes (Vercel)
    ↓
AI Providers (Gemini/OpenAI) + Vercel Postgres
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, Edge Runtime)
- **Database**: Vercel Postgres
- **AI Providers**: Google Gemini, OpenAI (configurable)
- **Language**: TypeScript
- **Deployment**: Vercel

## Project Structure

```
robotics-book-chat-api/
├── app/
│   └── api/
│       ├── chat/route.ts              # Streaming chat endpoint
│       ├── history/[sessionId]/       # Get conversation history
│       └── analytics/[sessionId]/     # Learning analytics
├── lib/
│   ├── ai/
│   │   ├── providers/                 # AI provider abstraction
│   │   │   ├── types.ts
│   │   │   ├── gemini.ts
│   │   │   ├── openai.ts
│   │   │   └── index.ts
│   │   └── context-guard.ts           # Book-specific system prompts
│   ├── db/
│   │   ├── schema.sql                 # Database schema
│   │   └── queries.ts                 # Database operations
│   ├── session/
│   │   └── manager.ts                 # Session handling
│   └── utils/
│       └── response.ts                # API response helpers
├── .env.local.example
├── next.config.js
├── tsconfig.json
└── package.json
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Vercel account
- Google Gemini API key (or OpenAI API key)

### 2. Get Your AI API Key

**For Gemini (Recommended - Free):**
1. Visit https://ai.google.dev/
2. Click "Get API Key"
3. Create a new API key
4. Copy the key

**For OpenAI (Optional):**
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key

### 3. Local Development Setup

```bash
cd robotics-book-chat-api

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local and add your API key
# For Gemini:
#   AI_PROVIDER=gemini
#   GEMINI_API_KEY=your_key_here
# For OpenAI:
#   AI_PROVIDER=openai
#   OPENAI_API_KEY=your_key_here
```

### 4. Database Setup (Vercel Postgres)

#### Option A: Using Vercel Dashboard (Easier)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Create a new project and import your repository
4. In project settings, go to "Storage" tab
5. Click "Create Database" → Select "Postgres"
6. Wait for database creation
7. Copy the SQL from `lib/db/schema.sql`
8. Go to database dashboard → "Query" tab
9. Paste and run the schema

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Create Vercel Postgres database
vercel postgres create

# Link database to project
vercel link

# Pull environment variables (including database credentials)
vercel env pull .env.local

# Run schema migration
vercel postgres exec "$(cat lib/db/schema.sql)"
```

### 5. Run Development Server

```bash
npm run dev
```

API will be available at `http://localhost:3000/api/*`

### 6. Test the API

```bash
# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is a PID controller?"}'
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: AI Robotics Chat API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/robotics-book-chat-api.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure environment variables:
   - `AI_PROVIDER` = `gemini` (or `openai`)
   - `GEMINI_API_KEY` = your Gemini API key
   - `BOOK_NAME` = "AI & Robotics Book"
   - `BOOK_TOPICS` = "artificial intelligence, robotics, machine learning..."
4. Click "Deploy"
5. Create Vercel Postgres database (see step 4 above)
6. Run database schema

### 3. Get Your API URL

After deployment, your API will be available at:
```
https://your-project-name.vercel.app/api/chat
```

## API Endpoints

### POST /api/chat

Stream AI responses with conversation history.

**Request:**
```json
{
  "message": "What is machine learning?",
  "sessionId": "uuid-here",  // optional, creates new if not provided
  "includeHistory": true     // optional, default true
}
```

**Response:** Server-Sent Events (SSE) stream
```
data: {"content": "Machine", "done": false, "sessionId": "..."}
data: {"content": " learning", "done": false, "sessionId": "..."}
data: {"content": "", "done": true, "sessionId": "...", "metadata": {...}}
```

### GET /api/history/:sessionId

Retrieve full conversation history for a session.

**Response:**
```json
{
  "sessionId": "uuid",
  "session": {
    "createdAt": "2025-12-01T10:00:00Z",
    "lastActive": "2025-12-01T10:15:00Z"
  },
  "messages": [
    {
      "id": "msg-uuid",
      "role": "user",
      "content": "What is a robot?",
      "timestamp": "2025-12-01T10:00:00Z"
    }
  ],
  "totalMessages": 1
}
```

### GET /api/analytics/:sessionId

Get learning analytics and engagement metrics.

**Response:**
```json
{
  "sessionId": "uuid",
  "session": {
    "createdAt": "...",
    "lastActive": "...",
    "duration": 900000,
    "durationMinutes": 15
  },
  "engagement": {
    "totalMessages": 20,
    "userMessages": 10,
    "assistantMessages": 10
  },
  "insights": [
    "High engagement: Asked many questions",
    "Deep dive session: Spent 15 minutes"
  ]
}
```

## Switching AI Providers

Change the `AI_PROVIDER` environment variable:

**For Gemini:**
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.0-flash-exp  # optional
```

**For OpenAI:**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini  # optional
```

Redeploy on Vercel or restart your dev server.

## Database Schema

See `lib/db/schema.sql` for the complete schema with:
- `sessions` - Chat sessions with timestamps
- `messages` - All user/assistant messages
- `analytics_events` - Learning journey events

## CORS Configuration

The API is configured to accept requests from:
```
https://shehzadanjum.github.io
```

To change this, edit `next.config.js`:
```js
{ key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' }
```

## Monitoring & Logs

- **Vercel Logs**: View in Vercel dashboard under "Deployments" → Click deployment → "Logs"
- **Database**: Query analytics_events table for errors and usage patterns

## Troubleshooting

**Error: "GEMINI_API_KEY is not set"**
- Make sure `.env.local` has the API key for local dev
- For production, add it in Vercel dashboard under "Settings" → "Environment Variables"

**Error: "Session not found"**
- Database tables not created - run the schema.sql script
- Session ID format invalid - must be UUID v4

**Streaming not working:**
- Check CORS headers in browser console
- Ensure frontend uses EventSource or fetch with streaming

## Future Enhancements

- [ ] Add RAG (Retrieval-Augmented Generation) with book content
- [ ] User authentication with Clerk or Auth0
- [ ] Rate limiting per user/IP
- [ ] Advanced analytics dashboard
- [ ] Export conversation history as PDF
- [ ] Multi-language support

## License

MIT

## Support

For issues, please open a GitHub issue in the repository.
