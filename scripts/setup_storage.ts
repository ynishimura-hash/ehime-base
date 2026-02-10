import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function setupStorage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;

    if (!supabaseUrl || !dbPassword) {
        console.error('Missing env variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD)');
        process.exit(1);
    }

    // Extract project ID from URL
    // https://[project_id].supabase.co
    const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];

    if (!projectRef) {
        console.error('Invalid Supabase URL format');
        process.exit(1);
    }

    const dbConfig = {
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: dbPassword,
        ssl: { rejectUnauthorized: false }
    };

    console.log('Connecting to database...');
    const client = new Client(dbConfig);

    try {
        await client.connect();
        console.log('Connected!');

        const migrationFile = path.resolve(__dirname, '../supabase/migrations/20260209_create_chat_assets_bucket.sql');
        const sql = fs.readFileSync(migrationFile, 'utf8');

        console.log('Executing migration...');
        await client.query(sql);

        console.log('Migration executed successfully!');

    } catch (err) {
        console.error('Error executing migration:', err);
    } finally {
        await client.end();
    }
}

setupStorage();
