
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Use connection string from env or reconstruct it if necessary
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || `postgres://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}.supabase.co:5432/postgres`;

async function runMigration() {
    const migrationFile = process.argv[2];
    if (!migrationFile) {
        console.error('Please specify migration file path');
        process.exit(1);
    }

    console.log(`Applying migration: ${migrationFile}`);
    const client = new Client({ connectionString });

    try {
        await client.connect();

        const sqlPath = path.resolve(migrationFile);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);
        console.log('Migration executed successfully.');

    } catch (err) {
        console.error('Error executing migration:', err);
    } finally {
        await client.end();
    }
}

runMigration();
