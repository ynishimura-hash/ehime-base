const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Try all specific variants of connection string
let connectionString =
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;

// Parse project ref from Supabase URL & Password
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
const password = process.env.SUPABASE_DB_PASSWORD;

if (!connectionString && projectRef && password) {
    // Try Tokyo region pooler (Session mode for DDL)
    // postgres://postgres.[ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
    const encodedPassword = encodeURIComponent(password);
    connectionString = `postgres://postgres.${projectRef}:${encodedPassword}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`;
    console.log('Constructed connection string from env vars (Tokyo Pooler).');
}

console.log('Using connection string:', connectionString ? 'Found' : 'Not Found');

if (!connectionString) {
    console.error('DATABASE_URL or POSTGRES_URL or SUPABASE_DB_URL not found in environment');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
});

async function run() {
    try {
        await client.connect();

        const sql = `
        -- Drop existing policies if any to avoid errors
        DROP POLICY IF EXISTS "Participants can update messages" ON messages;
        DROP POLICY IF EXISTS "Users can update own messages" ON messages; -- Just in case
        
        -- Create update policy for messages
        CREATE POLICY "Participants can update messages" ON messages
        FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM casual_chats
                WHERE casual_chats.id = messages.chat_id
                AND (
                    casual_chats.user_id = auth.uid()
                    OR EXISTS (
                        SELECT 1 FROM organization_members
                        WHERE organization_members.organization_id = casual_chats.company_id
                        AND organization_members.user_id = auth.uid()
                    )
                )
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM casual_chats
                WHERE casual_chats.id = messages.chat_id
                AND (
                    casual_chats.user_id = auth.uid()
                    OR EXISTS (
                        SELECT 1 FROM organization_members
                        WHERE organization_members.organization_id = casual_chats.company_id
                        AND organization_members.user_id = auth.uid()
                    )
                )
            )
        );
        `;

        console.log('Applying migration...');
        const res = await client.query(sql);
        console.log('Migration executed successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
