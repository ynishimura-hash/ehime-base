
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Handling __dirname for ES modules if needed, but ts-node usually handles it.
// Simulating __dirname for safety if executed as module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

// Construct connection string if not present
let connectionString = process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;

    if (supabaseUrl && dbPassword) {
        // Extract project ref from URL (https://[ref].supabase.co)
        const projectRefMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
        if (projectRefMatch && projectRefMatch[1]) {
            const projectRef = projectRefMatch[1];
            // Use direct connection for migrations (port 5432)
            connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;
            console.log('Constructed connection string from env vars.');
        }
    }
}

if (!connectionString) {
    console.error('Missing Database Connection URL (SUPABASE_DB_URL or POSTGRES_URL) and could not construct it.');
    process.exit(1);
}

async function runMigration() {
    console.log('Connecting to DB...');
    const client = new Client({ connectionString });
    await client.connect();

    try {
        const sqlPath = path.join(__dirname, '../supabase/migrations/20260129_add_lesson_options.sql');
        console.log('Reading migration file:', sqlPath);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying migration...');
        await client.query(sql);
        console.log('Migration applied successfully!');
    } catch (err: any) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
