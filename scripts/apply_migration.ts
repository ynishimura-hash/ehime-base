
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL; // Try multiple env vars

if (!connectionString) {
    console.error('Missing Database Connection URL (SUPABASE_DB_URL or POSTGRES_URL)');
    process.exit(1);
}

async function runMigration() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        const sqlPath = path.join(__dirname, '../supabase/migrations/20260128_add_elearning_constraints.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying migration...');
        await client.query(sql);
        console.log('Migration applied successfully!');
    } catch (err: any) {
        if (err.code === '42710') { // duplicate_object (constraint already exists)
            console.log('Constraints already exist, skipping.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        await client.end();
    }
}

runMigration();
