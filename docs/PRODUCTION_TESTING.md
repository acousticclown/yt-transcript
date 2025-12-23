# Production Testing Guide

This guide explains how to test your app locally using production environment variables (database, API URLs, etc.).

## Quick Start

### Frontend (Production API)

```bash
cd apps/web
npm run dev:prod
```

This will:
- Connect to production backend API (`https://notely-api-eight.vercel.app`)
- Use production service worker settings
- Test against production database (via backend)

### Backend (Production Database)

1. **Create `.env.production` file:**
   ```bash
   cd apps/api
   # Create .env.production with your production values
   # The app will automatically load .env.production if it exists
   ```

2. **Run with production env:**
   ```bash
   npm run dev:prod
   ```
   
   The app automatically loads `.env.production` if it exists, otherwise falls back to `.env`.

## Environment Variables

### Frontend (`apps/web/.env.production.local`)

Create `apps/web/.env.production.local`:

```bash
NEXT_PUBLIC_API_URL=https://notely-api-eight.vercel.app
```

Or use inline env var:
```bash
NEXT_PUBLIC_API_URL=https://notely-api-eight.vercel.app npm run dev
```

### Backend (`apps/api/.env.production`)

Create `apps/api/.env.production` with your production values:

```bash
# Database (Supabase Transaction Pooler - port 6543)
DATABASE_URL=postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# JWT Secret (same as production)
JWT_SECRET=your-production-jwt-secret

# Server
PORT=3001
NODE_ENV=production

# CORS (your frontend URL)
CORS_ORIGIN=https://your-frontend.vercel.app

# Optional: AI APIs
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
```

**Important:** 
- `.env.production` and `.env.production.local` are gitignored
- Never commit production secrets to git
- Get values from Vercel dashboard (Settings → Environment Variables)

## Available Scripts

### Frontend

- `npm run dev` - Development mode (localhost:3001)
- `npm run dev:prod` - Development mode with production API
- `npm run build:prod` - Build with production API URL
- `npm run start:prod` - Start production build with production API

### Backend

- `npm run dev` - Development mode (uses `.env` with local SQLite)
- `npm run dev:prod` - Development mode with production database (uses `.env.production` if it exists)
- `npm run start:prod` - Start with production database (uses `.env.production` if it exists)

**Note:** The backend automatically detects and loads `.env.production` if it exists. No need for separate scripts.

## Testing Checklist

When testing with production environment:

1. **Authentication:**
   - [ ] Sign up works (creates user in production DB)
   - [ ] Login works (authenticates against production DB)
   - [ ] Logout works

2. **Notes:**
   - [ ] Create note (saves to production DB)
   - [ ] Edit note (updates in production DB)
   - [ ] Delete note (removes from production DB)
   - [ ] View notes list (loads from production DB)

3. **Service Worker:**
   - [ ] Chunks load correctly (no "Failed to load chunk" errors)
   - [ ] App works offline (basic functionality)
   - [ ] Update notifications work

4. **API Connection:**
   - [ ] Frontend connects to production backend
   - [ ] CORS is configured correctly
   - [ ] All API endpoints work

## Troubleshooting

### "Failed to load chunk" error

This happens when the service worker caches old Next.js chunks. The fix is already applied - make sure you've:
1. Updated `sw.source.js` (excludes Next.js chunks from caching)
2. Regenerated `sw.js` (run `npm run inject-sw-version`)
3. Cleared browser cache or hard refresh (Cmd+Shift+R)

### Database connection errors

- Verify `DATABASE_URL` uses Transaction Pooler (port 6543) for serverless
- Ensure password is URL-encoded
- Check Supabase dashboard for connection string

### CORS errors

- Verify `CORS_ORIGIN` matches your frontend URL exactly
- Check backend logs for CORS errors
- Ensure backend is redeployed after env var changes

## Security Notes

⚠️ **Important:** When testing with production environment:

- You're using the **production database** - be careful with test data
- You're using **production API keys** - don't expose them
- Consider creating a separate test user account
- Don't run production tests on shared machines

## Next Steps

After successful production testing:

1. Commit and push changes
2. Vercel will auto-deploy frontend
3. Vercel will auto-deploy backend (if connected)
4. Test on deployed URLs
5. Monitor for errors

