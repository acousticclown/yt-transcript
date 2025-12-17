# Deployment Guide

## Overview

This guide covers deploying Notely to production using:
- **Frontend:** Vercel (Next.js)
- **Backend:** Railway or Supabase
- **Database:** PostgreSQL (Supabase or Railway)

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Railway account (or Supabase for database)
- Domain name (optional)

## Step 1: Database Setup

### Option A: Supabase (Recommended for Free Tier)

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Wait for database to provision

2. **Get Connection String:**
   - Go to Settings > Database
   - Copy "Connection string" (URI format)
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

3. **Run Migrations:**
   ```bash
   cd apps/api
   DATABASE_URL="your-connection-string" npx prisma migrate deploy
   ```

### Option B: Railway PostgreSQL

1. **Create Railway Project:**
   - Go to https://railway.app
   - New Project > Add PostgreSQL
   - Copy connection string from Variables

2. **Run Migrations:**
   ```bash
   cd apps/api
   DATABASE_URL="your-connection-string" npx prisma migrate deploy
   ```

## Step 2: Backend Deployment

### Option A: Railway (Recommended)

1. **Connect GitHub:**
   - Go to Railway dashboard
   - New Project > Deploy from GitHub
   - Select your repository
   - Select `apps/api` as root directory

2. **Configure Environment Variables:**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   PORT=3001
   CORS_ORIGIN=https://your-domain.vercel.app
   ```

3. **Deploy:**
   - Railway auto-deploys on push to main
   - Or manually trigger deployment

4. **Get Backend URL:**
   - Copy the generated Railway URL
   - Example: `https://api-production.up.railway.app`

### Option B: Vercel (Serverless Functions)

1. **Add API to Vercel:**
   - Add `apps/api` as a separate Vercel project
   - Configure build settings
   - Set environment variables

2. **Note:** Railway is recommended for long-running processes

## Step 3: Frontend Deployment (Vercel)

1. **Import Project:**
   - Go to https://vercel.com
   - Import Git Repository
   - Select your repository

2. **Configure Project:**
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

4. **Deploy:**
   - Click Deploy
   - Vercel will build and deploy automatically

5. **Get Frontend URL:**
   - Copy the generated Vercel URL
   - Example: `https://notely.vercel.app`

## Step 4: Update Environment Variables

### Backend (Railway):
```
DATABASE_URL=postgresql://...
JWT_SECRET=generate-a-secure-random-string
PORT=3001
CORS_ORIGIN=https://your-frontend-url.vercel.app
NODE_ENV=production
```

### Frontend (Vercel):
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

## Step 5: Domain Setup (Optional)

### Vercel Domain:
1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL is automatic

### Backend Domain (Railway):
1. Go to Railway project settings
2. Add custom domain
3. Configure DNS records
4. SSL is automatic

## Step 6: CI/CD Setup

### GitHub Actions (Already Configured)

1. **Add Secrets to GitHub:**
   - Go to Repository > Settings > Secrets
   - Add:
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`
     - `RAILWAY_TOKEN`
     - `DATABASE_URL`

2. **Get Vercel Tokens:**
   - Vercel Dashboard > Settings > Tokens
   - Create new token
   - Get Org ID and Project ID from project settings

3. **Get Railway Token:**
   - Railway Dashboard > Account Settings > Tokens
   - Create new token

4. **Auto-deploy:**
   - Push to `main` branch triggers deployment
   - Or use GitHub Actions manually

## Step 7: Testing Production

1. **Test Frontend:**
   - Visit your Vercel URL
   - Test signup/login
   - Test all features

2. **Test Backend:**
   - Check Railway logs
   - Test API endpoints
   - Verify database connections

3. **Test Database:**
   - Use Prisma Studio: `npx prisma studio`
   - Or Supabase dashboard
   - Verify data persistence

## Step 8: Monitoring & Logs

### Vercel:
- View logs in Vercel dashboard
- Check Analytics tab
- Monitor performance

### Railway:
- View logs in Railway dashboard
- Check Metrics tab
- Monitor resource usage

### Database:
- Supabase: Built-in monitoring
- Railway: Database metrics in dashboard

## Troubleshooting

### Build Failures:
```bash
# Check logs
vercel logs
railway logs

# Test locally
npm run build
```

### Database Connection Issues:
```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check migrations
npx prisma migrate status
```

### CORS Issues:
- Verify `CORS_ORIGIN` matches frontend URL
- Check backend allows frontend origin
- Verify API URL in frontend env vars

### Environment Variables:
- Double-check all variables are set
- Verify no typos
- Check variable names match code

## Production Checklist

- [ ] Database created and migrated
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] Domain configured (if using)
- [ ] SSL certificates active
- [ ] CI/CD pipeline working
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Error tracking configured
- [ ] Performance tested
- [ ] Security reviewed

## Cost Estimation

### Free Tier:
- **Vercel:** Free (hobby plan)
- **Railway:** $5/month (or free trial)
- **Supabase:** Free (up to 500MB database)

### Paid Tier (if needed):
- **Vercel Pro:** $20/month
- **Railway:** Pay-as-you-go
- **Supabase Pro:** $25/month

## Next Steps

After deployment:
1. Set up error tracking (Sentry)
2. Configure analytics
3. Set up backups
4. Monitor performance
5. Plan for scaling

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

