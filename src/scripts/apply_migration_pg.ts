
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const connectionString = `postgres://postgres.tgtifzajkpfqpnwbjqds:${process.env.SUPABASE_DB_PASSWORD}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`; // Assuming region or using direct. 
// Wait, I should decipher region from URL.
// NEXT_PUBLIC_SUPABASE_URL=https://tgtifzajkpfqpnwbjqds.supabase.co
// Usually region is ap-northeast-1 for Japanese users, but safe to try to construct standard string or check if I can just use connection string format.
// Better: standard direct connection port 5432 or pooler 6543.
// Let's try to construct it: postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
// I'll guess region is 'ap-northeast-1' or 'us-east-1'. Since user is Japanese, 'ap-northeast-1' is likely.
// Actually, I should use 'db.tgtifzajkpfqpnwbjqds.supabase.co' as host?
// Supabase host: db.[ref].supabase.co
// Port: 5432.

const dbHost = 'aws-0-ap-northeast-1.pooler.supabase.com';
const dbUser = 'postgres.tgtifzajkpfqpnwbjqds'; // pooler user format
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const dbName = 'postgres';

async function applyMigration() {
    const client = new Client({
        host: dbHost,
        port: 6543, // Pooler port
        user: dbUser,
        password: dbPassword,
        database: dbName,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to Postgres');

        const sqlPath = path.join(process.cwd(), 'supabase/migrations/20240122_add_elearning_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);
        console.log('Migration applied successfully');

    } catch (err: any) {
        console.error('Migration failed:', err);
        if (err.code === 'ENOTFOUND') {
            console.error('Check hostname. Project ref might be wrong or region specific.');
        }
    } finally {
        await client.end();
    }
}

applyMigration();
