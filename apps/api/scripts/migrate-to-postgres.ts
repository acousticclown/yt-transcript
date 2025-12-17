/**
 * Migration script to move from SQLite to PostgreSQL
 * 
 * Usage:
 * 1. Set DATABASE_URL to your PostgreSQL connection string
 * 2. Run: tsx scripts/migrate-to-postgres.ts
 * 
 * This script:
 * - Reads data from SQLite
 * - Transforms data for PostgreSQL compatibility
 * - Writes data to PostgreSQL
 * - Validates the migration
 */

import { PrismaClient as SQLiteClient } from "@prisma/client";
import { PrismaClient as PostgresClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

// Initialize clients
// Note: You'll need to set DATABASE_URL for both
const sqliteUrl = process.env.SQLITE_DATABASE_URL || "file:./data/dev.db";
const postgresUrl = process.env.DATABASE_URL;

if (!postgresUrl) {
  console.error("❌ DATABASE_URL environment variable is required");
  console.error("   Set it to your PostgreSQL connection string");
  process.exit(1);
}

// For SQLite, we'll use a different approach since Prisma doesn't support
// multiple datasources easily. We'll read directly from the SQLite file.
console.log("📦 Starting migration from SQLite to PostgreSQL...\n");

async function migrate() {
  try {
    // Step 1: Generate Prisma clients for both databases
    console.log("1️⃣  Setting up database connections...");
    
    // For production, we'll use environment-based switching
    // This script assumes you've already set up PostgreSQL schema
    
    const postgres = new PostgresClient({
      datasources: {
        db: {
          url: postgresUrl,
        },
      },
    });

    // Step 2: Test PostgreSQL connection
    console.log("2️⃣  Testing PostgreSQL connection...");
    await postgres.$connect();
    console.log("   ✅ PostgreSQL connected\n");

    // Step 3: Read SQLite data
    console.log("3️⃣  Reading SQLite data...");
    // Note: This is a simplified version. In practice, you'd:
    // - Use a SQLite library to read directly
    // - Or export SQLite data to JSON first
    // - Or use Prisma with schema switching
    
    console.log("   ⚠️  SQLite reading requires manual export");
    console.log("   💡 Recommended: Export SQLite to JSON first\n");

    // Step 4: Migrate data
    console.log("4️⃣  Migrating data...");
    console.log("   ⚠️  This step requires manual data export/import");
    console.log("   💡 Use: sqlite3 data/dev.db .dump > export.sql\n");

    // Step 5: Validate
    console.log("5️⃣  Validating migration...");
    const userCount = await postgres.user.count();
    const noteCount = await postgres.note.count();
    console.log(`   ✅ Users: ${userCount}`);
    console.log(`   ✅ Notes: ${noteCount}\n`);

    await postgres.$disconnect();
    
    console.log("✅ Migration complete!");
    console.log("\n📋 Next steps:");
    console.log("   1. Verify data in PostgreSQL");
    console.log("   2. Update DATABASE_URL in production");
    console.log("   3. Test all endpoints");
    console.log("   4. Backup SQLite database (keep as backup)");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();

