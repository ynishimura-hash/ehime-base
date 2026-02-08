const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Construct connection string for Supabase direct connection
// Pattern: postgres://postgres:[password]@db.[ref].supabase.co:5432/postgres
const ref = 'tgtifzajkpfqpnwbjqds';
const password = process.env.SUPABASE_DB_PASSWORD;
const connectionString = `postgres://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    try {
        await client.connect();
        console.log('Connected to DB');
        const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
      ORDER BY column_name;
    `);
        const columns = res.rows.map(r => r.column_name);
        console.log('Columns in profiles table:', columns);

        if (columns.includes('graduation_year')) {
            console.log('✅ graduation_year exists');
        } else {
            console.log('❌ graduation_year MISSING');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

checkSchema();
