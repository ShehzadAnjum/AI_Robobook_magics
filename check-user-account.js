const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

async function checkUserAccount() {
  try {
    // Check user table
    console.log('=== Users in database ===');
    const users = await pool.query('SELECT id, email, name, "emailVerified", "createdAt" FROM "user" ORDER BY "createdAt" DESC LIMIT 10');
    users.rows.forEach(u => console.log(`- ${u.email} (ID: ${u.id}, Created: ${u.createdAt})`));
    
    console.log('\n=== Accounts (passwords) ===');
    const accounts = await pool.query('SELECT id, "userId", "providerId", password IS NOT NULL as has_password, "createdAt" FROM "account" ORDER BY "createdAt" DESC LIMIT 10');
    accounts.rows.forEach(a => console.log(`- User ID: ${a.userId}, Provider: ${a.providerId}, Has Password: ${a.has_password}`));
    
    // Check specific user
    console.log('\n=== Checking test@example.com ===');
    const testUser = await pool.query('SELECT * FROM "user" WHERE email = $1', ['test@example.com']);
    if (testUser.rows.length > 0) {
      const userId = testUser.rows[0].id;
      console.log('✓ User exists:', testUser.rows[0]);
      
      const testAccount = await pool.query('SELECT * FROM "account" WHERE "userId" = $1', [userId]);
      if (testAccount.rows.length > 0) {
        console.log('✓ Account exists:', { userId: testAccount.rows[0].userId, providerId: testAccount.rows[0].providerId, hasPassword: testAccount.rows[0].password ? 'YES' : 'NO' });
      } else {
        console.log('✗ NO ACCOUNT ENTRY - This is the problem!');
      }
    } else {
      console.log('✗ User does not exist');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUserAccount();
