# Railway Deployment Guide

This guide will help you deploy the Notely API to Railway.

## Prerequisites

1. A GitHub account
2. A Railway account (sign up at [railway.app](https://railway.app))
3. Your API code pushed to GitHub

## Step 1: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign up with GitHub (recommended for easy deployment)

## Step 2: Create a New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `yt-transcript` repository
4. Railway will detect it's a monorepo

## Step 3: Configure the Service

1. **Set Root Directory**:

   - Go to Settings → Source
   - **Leave Root Directory EMPTY** (build from monorepo root)
   - This allows access to both `apps/api` and `packages` folders
   - The nixpacks.toml will handle building from the correct directory

2. **Add PostgreSQL Database**:

   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway will automatically create a `DATABASE_URL` environment variable

3. **Set Environment Variables**:
   Go to Variables tab and add:

   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-secret-key-here (generate a strong random string)
   GEMINI_API_KEY=your-gemini-api-key (optional, for AI features)
   CORS_ORIGIN=https://your-frontend-domain.vercel.app,http://localhost:3000
   ```

   **Important**: Replace `your-secret-key-here` with a strong random string (you can generate one with: `openssl rand -base64 32`)

## Step 4: Run Database Migrations

1. Go to your service → "Deployments" tab
2. Click on the latest deployment
3. Open the "Logs" tab
4. Railway will automatically run `prisma generate` during build
5. After first deployment, you may need to run migrations manually:
   - Go to service → "Settings" → "Deploy" → "Run Command"
   - Run: `npx prisma migrate deploy`

## Step 5: Get Your API URL

1. Go to your service → "Settings" → "Networking"
2. Click "Generate Domain" to get a public URL
3. Your API will be available at: `https://your-service-name.up.railway.app`

## Step 6: Update Frontend

Update your frontend's `NEXT_PUBLIC_API_URL` environment variable in Vercel:

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Add/Update: `NEXT_PUBLIC_API_URL=https://your-service-name.up.railway.app`

## Step 7: Test the Deployment

1. Visit `https://your-service-name.up.railway.app/health`
2. You should see: `{"status":"ok","database":"connected",...}`

## Troubleshooting

### Database Connection Issues

If you see database errors:

1. Check that PostgreSQL service is running
2. Verify `DATABASE_URL` is set correctly
3. Run migrations: `npx prisma migrate deploy`

### Build Failures

1. Check build logs in Railway dashboard
2. Ensure `apps/api` is set as root directory
3. Verify all dependencies are in `package.json`

### CORS Errors

1. Update `CORS_ORIGIN` to include your frontend domain
2. Check that the frontend is using the correct API URL

## Railway vs Vercel for API

**Why Railway for API:**

- ✅ Dedicated IP address (better for YouTube transcript extraction)
- ✅ Persistent server (not serverless)
- ✅ Better for long-running processes
- ✅ PostgreSQL database included

**Keep Vercel for Frontend:**

- ✅ Excellent for Next.js
- ✅ Edge network for fast static assets
- ✅ Free tier is generous

## Cost

Railway's free tier includes:

- $5 credit/month
- Enough for small to medium apps
- Pay-as-you-go after that

Estimated cost: $5-10/month for this API

## Next Steps

1. Test YouTube transcript extraction (should work better than Vercel!)
2. Monitor logs in Railway dashboard
3. Set up custom domain (optional)
4. Configure auto-deployments from GitHub

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
