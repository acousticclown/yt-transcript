# PostgreSQL Migration Guide

## Overview

This guide helps you migrate from SQLite (local development) to PostgreSQL (production).

## Prerequisites

- PostgreSQL database (local or cloud)
- PostgreSQL connection string
- SQLite database with existing data

## Step 1: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb notely_prod

# Get connection string
echo "postgresql://user:password@localhost:5432/notely_prod"
```

### Option B: Cloud PostgreSQL (Recommended)

**Supabase (Free tier):**
1. Go to https://supabase.com
2. Create a new project
3. Get connection string from Settings > Database

**Railway:**
1. Go to https://railway.app
2. Create new PostgreSQL service
3. Get connection string from Variables

**Other options:**
- Neon (serverless PostgreSQL)
- AWS RDS
- Google Cloud SQL

## Step 2: Update Prisma Schema

The schema is already configured for PostgreSQL. Verify:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Step 3: Set Environment Variables

Create `.env.production`:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

## Step 4: Run Migrations

```bash
cd apps/api

# Generate Prisma client for PostgreSQL
npx prisma generate

# Create migration
npx prisma migrate dev --name init_postgres

# Or push schema (for new database)
npx prisma db push
```

## Step 5: Migrate Data from SQLite

### Option A: Manual Export/Import (Recommended)

1. **Export SQLite data:**
```bash
# Export to JSON
sqlite3 data/dev.db <<EOF
.mode json
.output export.json
SELECT * FROM User;
SELECT * FROM Note;
SELECT * FROM Section;
SELECT * FROM Tag;
SELECT * FROM NoteTag;
EOF
```

2. **Import to PostgreSQL:**
```bash
# Use the migration script
tsx scripts/migrate-to-postgres.ts
```

### Option B: Direct SQL Export

```bash
# Export SQLite
sqlite3 data/dev.db .dump > export.sql

# Transform SQL (remove SQLite-specific syntax)
# Then import to PostgreSQL
psql $DATABASE_URL < export.sql
```

### Option C: Prisma Studio (Small datasets)

1. Open SQLite in Prisma Studio
2. Export data manually
3. Open PostgreSQL in Prisma Studio
4. Import data manually

## Step 6: Validate Migration

```bash
# Check data
npx prisma studio

# Or use SQL
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Note\";"
```

## Step 7: Update Application

1. **Update environment variables:**
   - Production: Use PostgreSQL DATABASE_URL
   - Development: Keep SQLite (optional)

2. **Test all endpoints:**
   - Authentication
   - CRUD operations
   - Relationships
   - Sharing features

3. **Performance testing:**
   - Check query performance
   - Verify indexes are created
   - Test concurrent requests

## Differences: SQLite vs PostgreSQL

### Data Types
- SQLite: More flexible, fewer types
- PostgreSQL: Strict types, better performance

### Features
- **SQLite:** Simpler, file-based, good for dev
- **PostgreSQL:** Full-featured, better for production

### Migration Notes
- UUIDs work the same
- JSON stored as TEXT in SQLite, JSONB in PostgreSQL
- Indexes are compatible
- Foreign keys work the same

## Troubleshooting

### Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

### Migration Errors
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Data Type Issues
- Check for NULL values in NOT NULL fields
- Verify string lengths
- Check date formats

## Production Checklist

- [ ] PostgreSQL database created
- [ ] Connection string configured
- [ ] Schema migrated
- [ ] Data migrated and validated
- [ ] Indexes created
- [ ] Backups configured
- [ ] Environment variables set
- [ ] Application tested
- [ ] Performance verified
- [ ] Monitoring set up

## Rollback Plan

If migration fails:

1. Keep SQLite backup
2. Revert DATABASE_URL
3. Restart application
4. Fix issues
5. Retry migration

## Next Steps

After successful migration:

1. Set up database backups
2. Configure connection pooling
3. Set up monitoring
4. Optimize queries
5. Plan for scaling

## Resources

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Guide](https://supabase.com/docs/guides/database)

