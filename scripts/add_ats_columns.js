
const { Client } = require('pg');

async function updateSchema() {
    // Check if env var is available. If not, user needs to set it.
    // Assuming process.env.DATABASE_URL is set or we ask user.
    // However, I can try to read from .env first if not set.

    // BUT! Since I cannot read .env easily without loading it, I will ask user OR try to infer.
    // Actually, I can use require('dotenv').config() since it is in devDependencies!

    require('dotenv').config({ path: '.env.local' });

    let connectionString = process.env.DATABASE_URL;

    // Try to construct if missing
    if (!connectionString && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD) {
        // Extract ref from URL: https://[ref].supabase.co
        const urlObj = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
        const ref = urlObj.hostname.split('.')[0];
        const pass = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);
        connectionString = `postgres://postgres:${pass}@db.${ref}.supabase.co:5432/postgres`;
        console.log(`Connecting to: db.${ref}.supabase.co`);
    }

    if (!connectionString) {
        console.error("DATABASE_URL is not set and could not be constructed from Supabase config.");
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log("Connected to database.");

        await client.query(`
            ALTER TABLE applications 
            ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
        `);
        console.log("Added is_favorite column.");

        await client.query(`
            ALTER TABLE applications 
            ADD COLUMN IF NOT EXISTS internal_memo TEXT;
        `);
        console.log("Added internal_memo column.");

        console.log("Schema update complete.");
    } catch (err) {
        console.error("Error updating schema:", err);
    } finally {
        await client.end();
    }
}

updateSchema();
