# Railway Quick Start Checklist

## 🚀 5-Minute Setup

### 1. Sign Up & Create Project
- [ ] Go to [railway.app](https://railway.app) and sign up with GitHub
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select your `yt-transcript` repository

### 2. Configure Service
- [ ] **IMPORTANT**: Go to Settings → Source → Set Root Directory: `apps/api`
- [ ] Verify `nixpacks.toml` is detected (should show in build logs)
- [ ] Add PostgreSQL: Click "+ New" → "Database" → "Add PostgreSQL"

### 3. Set Environment Variables
Go to Variables tab and add:

```bash
NODE_ENV=production
JWT_SECRET=<generate-with: openssl rand -base64 32>
CORS_ORIGIN=https://notely-web-rosy.vercel.app,http://localhost:3000
```

Optional (for AI features):
```bash
GEMINI_API_KEY=your-key-here
```

### 4. Deploy
- [ ] Railway will auto-deploy
- [ ] Wait for build to complete (check Deployments tab)
- [ ] Go to Settings → Networking → Generate Domain

### 5. Run Migrations
- [ ] Go to Deployments → Latest deployment → Logs
- [ ] Or use Railway CLI: `railway run npx prisma migrate deploy`

### 6. Update Frontend
- [ ] Go to Vercel → Your project → Settings → Environment Variables
- [ ] Update `NEXT_PUBLIC_API_URL` to your Railway URL
- [ ] Redeploy frontend

### 7. Test
- [ ] Visit: `https://your-railway-url.up.railway.app/health`
- [ ] Should see: `{"status":"ok","database":"connected"}`

## ✅ Done!

Your API is now running on Railway with a dedicated IP address, which should work better for YouTube transcript extraction!

## 🔍 Troubleshooting

**Build fails?**
- Check Root Directory is set to `apps/api`
- Check build logs in Railway dashboard

**Database errors?**
- Verify PostgreSQL service is running
- Check `DATABASE_URL` is set (auto-set by Railway)
- Run: `railway run npx prisma migrate deploy`

**CORS errors?**
- Update `CORS_ORIGIN` to include your frontend domain
- Check frontend is using correct API URL

## 📝 Notes

- Railway auto-detects Node.js and runs `npm install`
- `prisma generate` runs automatically during build
- PORT is set automatically by Railway
- Free tier: $5 credit/month (usually enough for testing)

