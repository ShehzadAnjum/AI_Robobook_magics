/**
 * Verification Script for Authentication Setup
 * Checks that all required tables and environment variables are configured
 *
 * Usage: npx tsx scripts/verify-auth-setup.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { sql } from '@vercel/postgres';

async function verifySetup() {
  console.log('🔍 Verifying Authentication Setup...\n');

  let allPassed = true;

  // 1. Check Environment Variables
  console.log('📋 Checking Environment Variables:');

  const requiredEnvVars = [
    'POSTGRES_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
  ];

  const optionalEnvVars = [
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'GOOGLE_CLIENT_ID',
    'GITHUB_CLIENT_ID',
  ];

  requiredEnvVars.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ❌ ${varName} (REQUIRED)`);
      allPassed = false;
    }
  });

  optionalEnvVars.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ⚠️  ${varName} (optional)`);
    }
  });

  // 2. Check Database Connection
  console.log('\n🔌 Testing Database Connection:');

  try {
    const result = await sql`SELECT NOW() as current_time;`;
    console.log(`  ✅ Connected to PostgreSQL`);
    console.log(`  ⏰ Server time: ${result.rows[0].current_time}`);
  } catch (error) {
    console.log(`  ❌ Database connection failed:`, error);
    allPassed = false;
    return;
  }

  // 3. Check Authentication Tables
  console.log('\n📊 Checking Authentication Tables:');

  const requiredTables = [
    'auth_user',
    'auth_session',
    'auth_account',
    'auth_verification',
    'user_progress',
    'user_bookmarks',
    'security_events',
  ];

  try {
    const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (table_name LIKE 'auth_%' OR table_name LIKE 'user_%' OR table_name = 'security_events')
      ORDER BY table_name;
    `;

    const existingTables = tablesResult.rows.map((row) => row.table_name);

    requiredTables.forEach((tableName) => {
      if (existingTables.includes(tableName)) {
        console.log(`  ✅ ${tableName}`);
      } else {
        console.log(`  ❌ ${tableName} (missing - run migration)`);
        allPassed = false;
      }
    });
  } catch (error) {
    console.log(`  ❌ Failed to check tables:`, error);
    allPassed = false;
  }

  // 4. Check Indexes
  console.log('\n🔍 Checking Indexes:');

  try {
    const indexResult = await sql`
      SELECT COUNT(*) as index_count
      FROM pg_indexes
      WHERE tablename LIKE 'auth_%' OR tablename LIKE 'user_%' OR tablename = 'security_events';
    `;

    const indexCount = indexResult.rows[0].index_count;
    console.log(`  ✅ Found ${indexCount} indexes`);

    if (indexCount < 20) {
      console.log(`  ⚠️  Expected ~23 indexes (found ${indexCount})`);
    }
  } catch (error) {
    console.log(`  ❌ Failed to check indexes:`, error);
  }

  // 5. Summary
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ All checks passed! Authentication setup is ready.');
    console.log('\n🎯 You can now:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Test signup: POST http://localhost:3000/api/auth/sign-up/email');
    console.log('  3. Test signin: POST http://localhost:3000/api/auth/sign-in/email');
  } else {
    console.log('❌ Some checks failed. Please review the issues above.');
    console.log('\n🔧 Common fixes:');
    console.log('  - Run: npx tsx scripts/migrate-auth-db.ts');
    console.log('  - Add missing environment variables to .env.local');
    console.log('  - Check DATABASE_URL is correct');
  }
  console.log('='.repeat(50) + '\n');
}

// Run verification
verifySetup();
