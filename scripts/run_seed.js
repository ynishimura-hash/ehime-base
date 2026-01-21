const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// const dbConfig = { ... };

// Using connection string with encoded password
// Password: Yc*qax57h?*eVDz -> Yc%2Aqax57h%3F%2AeVDz
const connectionString = `postgres://postgres:Yc%2Aqax57h%3F%2AeVDz@db.tgtifzajkpfqpnwbjqds.supabase.co:5432/postgres`;

async function runMigration() {
    console.log('Connecting to database via URL...');
    const client = new Client({ connectionString });


    try {
        await client.connect();
        console.log('Connected.');

        const sqlPath = path.join(__dirname, '../supabase/migrations/20240121_add_cover_image_and_seed.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await client.query(sql);
        console.log('Migration executed successfully.');

    } catch (err) {
        console.error('Error executing migration:', err);
    } finally {
        await client.end();
    }
}

runMigration();
