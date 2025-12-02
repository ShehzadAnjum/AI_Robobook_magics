/**
 * Database Migration Script for Authentication Tables
 * Run this to create all authentication tables in Neon PostgreSQL
 *
 * Usage: npx tsx scripts/migrate-auth-db.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  console.log('🚀 Starting authentication database migration...\n');

  try {
    // Read the SQL schema file
    const schemaPath = join(process.cwd(), 'lib', 'db', 'auth-schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');

    console.log('📖 Reading schema from:', schemaPath);
    console.log('📊 Schema size:', schemaSql.length, 'characters\n');

    console.log('🚀 Executing schema as single transaction...\n');

    // Execute the entire SQL file as a single batch
    // This properly handles multi-line statements like CREATE FUNCTION
    try {
      await sql.query(schemaSql);
      console.log('✅ Schema executed successfully!\n');
    } catch (error) {
      // If batch execution fails, try to provide more details
      if (error instanceof Error) {
        console.error('❌ Schema execution failed:', error.message);
        throw error;
      }
    }

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (table_name LIKE 'auth_%' OR table_name LIKE 'user_%' OR table_name = 'security_events')
      ORDER BY table_name;
    `;

    console.log('\n📋 Authentication Tables:');
    tablesResult.rows.forEach((row) => {
      console.log(`  ✓ ${row.table_name}`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('\n🎯 Next Steps:');
    console.log('  1. Add BETTER_AUTH_SECRET to .env.local');
    console.log('  2. Set up Resend email service');
    console.log('  3. Run: npm run dev');
    console.log('  4. Test signup at: http://localhost:3000/api/auth/sign-up/email\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
runMigration();
