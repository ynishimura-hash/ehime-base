const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const connectionString = `postgres://postgres.tgtifzajkpfqpnwbjqds:${process.env.SUPABASE_DB_PASSWORD}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`;
// Note: Supabase usually uses port 5432 or 6543 (transaction pooler). Trying 6543 first as it's common for serverless.
// If it fails, I might need to adjust host/port.
// Actually, I don't have the exact host in the env file, just the URL.
// But the URL "tgtifzajkpfqpnwbjqds.supabase.co" usually maps to db.tgtifzajkpfqpnwbjqds.supabase.co

async function migrate() {
    // Construct client manually if connection string is uncertain, but let's try standard Supabase format
    // Host: db.[project-ref].supabase.co
    const clientDirect = new Client({
        connectionString: `postgres://postgres.tgtifzajkpfqpnwbjqds:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        await clientDirect.connect();
        console.log('Connected.');

        const files = [
            'supabase/migrations/20240121_add_dummy_data_columns.sql',
            'supabase/migrations/20240121_seed_dummy_data.sql',
            'supabase/migrations/20240121_enhance_media_library.sql'
        ];

        for (const file of files) {
            console.log(`Reading ${file}...`);
            const sql = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
            console.log(`Executing ${file}...`);
            await clientDirect.query(sql);
            console.log(`Finished ${file}.`);
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await clientDirect.end();
    }
}

migrate();
