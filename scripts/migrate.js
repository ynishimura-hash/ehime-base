
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
    // Construct connection string for direct connection (skipping pgbouncer if possible, or using it)
    // Vercel/Supabase envs: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (not useful for DDL)
    // We need DATABASE_URL usually. Let's check if it exists in .env.local via the script first.

    // Actually, checking .env.local content earlier, it had SUPABASE_URL/KEY but maybe not DATABASE_URL.
    // The user updated Vercel envs, but did they update local .env.local with DATABASE_URL?
    // I will first assume DATABASE_URL might be missing and I can't run DDL with just anon key.
    // But wait, the user is on local. 

    // Strategy: Try to check valid connection string. If not found, notify user.
    // However, I can try to use the `supabase-js` client with SERVICE_ROLE key if available to run SQL?
    // Supabase JS client doesn't support generic SQL execution on client side usually, unless via RPC.
    // But I noticed `pg` package is installed.

    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!dbUrl) {
        console.error('Error: DATABASE_URL not found in environment.');
        console.log('Please ensure DATABASE_URL is set in .env.local for migration.');
        process.exit(1);
    }

    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false } // Supabase requires SSL usually
    });

    try {
        await client.connect();
        const sqlPath = path.join(__dirname, '../supabase/migrations/20240123_create_user_analysis.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
        await client.query(sql);
        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
