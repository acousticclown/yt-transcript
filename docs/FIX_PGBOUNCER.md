# Fix: Prepared Statement Error with PgBouncer

## Problem

Getting error: `prepared statement "s0" already exists` when using Prisma with Supabase Transaction Pooler (PgBouncer).

## Solution

Add `?pgbouncer=true` to your `DATABASE_URL` connection string in Vercel.

## Steps

1. **Go to Vercel Dashboard:**
   - Open your `notely-api` project
   - Go to Settings → Environment Variables

2. **Find `DATABASE_URL`:**
   - Click Edit on `DATABASE_URL`

3. **Add `?pgbouncer=true` to the end:**
   
   **Before:**
   ```
   postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   
   **After:**
   ```
   postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

4. **Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger auto-deploy

## Why This Works

- PgBouncer in transaction pooling mode doesn't support prepared statements
- Prisma automatically detects `pgbouncer=true` and disables prepared statements
- This prevents the "prepared statement already exists" error

## Alternative: Direct Connection (Not Recommended)

If you need to use prepared statements, you can use the direct connection (port 5432) instead of the pooler (port 6543), but this is **not recommended** for serverless because:
- Direct connections don't pool well
- Can hit connection limits
- Slower for serverless functions

**Stick with the Transaction Pooler (port 6543) + `?pgbouncer=true`**

