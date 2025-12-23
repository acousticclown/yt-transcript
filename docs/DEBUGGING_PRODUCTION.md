# Debugging Production Errors

## Quick Debugging Steps

### 1. Check Health Endpoint

First, test if the database is connected:

```bash
curl https://notely-api-eight.vercel.app/health
```

**Expected response (success):**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-12-17T..."
}
```

**Expected response (failure):**
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "Can't reach database server at...",
  "code": "P1001",
  "timestamp": "2024-12-17T..."
}
```

### 2. Check Vercel Logs

1. Go to Vercel Dashboard
2. Select your `notely-api` project
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Click "View Function Logs" or "Runtime Logs"
6. Look for errors with `❌` prefix

### 3. Common Error Codes

#### P1001 - Database Connection Failed
**Cause:** Database server unreachable
**Fix:**
- Verify `DATABASE_URL` in Vercel environment variables
- Check if using Transaction Pooler URL (port 6543) for Supabase
- Ensure password is URL-encoded
- Check Supabase dashboard for connection status

#### P2002 - Unique Constraint Violation
**Cause:** Trying to create duplicate record (e.g., email already exists)
**Fix:** This is expected - user should see "Email already registered" message

#### JWT Errors
**Cause:** Missing or invalid `JWT_SECRET`
**Fix:**
- Verify `JWT_SECRET` is set in Vercel environment variables
- Ensure it matches between deployments

### 4. Test Signup/Login Locally with Production DB

```bash
# Backend
cd apps/api
# Create .env.production with production DATABASE_URL
npm run dev:prod

# Frontend (new terminal)
cd apps/web
npm run dev:prod
```

Then test signup/login and check console logs for detailed errors.

### 5. Check Request/Response

Use curl to test endpoints directly:

```bash
# Test signup
curl -X POST https://notely-api-eight.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Test login
curl -X POST https://notely-api-eight.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 6. Environment Variables Checklist

Verify these are set in Vercel (`notely-api` project):

- [ ] `DATABASE_URL` - PostgreSQL connection string (Transaction Pooler for Supabase)
- [ ] `JWT_SECRET` - Secret key for JWT tokens (32+ characters)
- [ ] `CORS_ORIGIN` - Frontend URL (e.g., `https://your-frontend.vercel.app`)
- [ ] `PORT` - Server port (optional, defaults to 3001)
- [ ] `NODE_ENV` - Set to `production` (optional)

### 7. Database Connection String Format

For Supabase Transaction Pooler (required for serverless):

```
postgres://postgres.[PROJECT-REF]:[URL-ENCODED-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Important:**
- Use port **6543** (Transaction Pooler), not 5432
- URL-encode special characters in password
- Get the connection string from Supabase Dashboard → Settings → Database → Connection string → Transaction Pooler

### 8. Error Message Improvements

The backend now provides more detailed error messages:

- **Development:** Full error messages and stack traces
- **Production:** Safe error messages (no sensitive data)

Check Vercel logs for full error details including:
- Error message
- Error code (Prisma error codes)
- Stack trace (in development mode)

## Next Steps

If you're still getting 500 errors:

1. Check Vercel function logs for the exact error
2. Test the `/health` endpoint to verify database connection
3. Verify all environment variables are set correctly
4. Test locally with production database using `npm run dev:prod`

Share the error details from Vercel logs, and we can debug further!

