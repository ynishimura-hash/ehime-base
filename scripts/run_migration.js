const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
    try {
        console.log('Reading .env.local...');
        const envPath = path.join(__dirname, '..', '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');

        const env = {};
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, ''); // Simple unquote
                if (key && !key.startsWith('#')) {
                    env[key] = val;
                }
            }
        });

        const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
        const dbPassword = env.SUPABASE_DB_PASSWORD;

        if (!supabaseUrl || !dbPassword) {
            throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD in .env.local');
        }

        // Extract Project ID: https://[id].supabase.co
        const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
        console.log(`Detected Project Ref: ${projectRef}`);

        // Construct DB URL
        const dbUrl = `postgres://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;

        console.log('Connecting to database...');
        const client = new Client({
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false } // Required for Supabase
        });

        await client.connect();
        console.log('Connected!');

        // Read Migration File
        const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260125_create_interactions.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Executing migration...');
        await client.query(sql);
        console.log('Migration executed successfully!');

        await client.end();

    } catch (e) {
        console.error('Migration Failed:', e);
        process.exit(1);
    }
}

run();
