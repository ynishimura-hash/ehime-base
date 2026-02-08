
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('DATABASE_URL or POSTGRES_URL not found in environment');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
});

async function run() {
    await client.connect();

    const sql = `
    ALTER TABLE organizations 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

    CREATE INDEX IF NOT EXISTS idx_organizations_user_id ON organizations(user_id);
  `;

    try {
        const res = await client.query(sql);
        console.log('Migration executed successfully:', res);
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
