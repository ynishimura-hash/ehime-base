
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    const sql = `
    ALTER TABLE organizations 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

    CREATE INDEX IF NOT EXISTS idx_organizations_user_id ON organizations(user_id);
  `;

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    // NOTE: exec_sql might not be available or might be restricted. 
    // If this fails, we might need another way or assume user runs it manually.
    // However, often raw SQL execution isn't directly exposed via JS client unless custom RPC exists.
    // Let's try a different approach: modifying code implies we have access to the codebase.
    // Ideally, 'npx supabase db push' is the way. Since it failed, check if we can simply use the SQL editor or if there's a workaround.
    // Given we are in an agent flow, we can try to use a specialized tool if available, but here we don't have 'run_sql'.
    // We will assume the user has a way to run migrations OR we can try to use a postgres client if available.

    // But wait, we have a running Next.js app. We can add a temporary API route to execute this SQL if needed, 
    // OR since we likely don't have direct DB access from here without proper setup.

    // Let's try to notify user to run it? No, we should try to do it.

    // Actually, for this environment, let's assume valid migration is needed. 
    // Since 'supabase db push' failed, it implies local dev environment linking issue.
    // I will skip the direct execution script and instead ask the user to run it or assume it's done via 'implementation_plan' approval if they have a way.
    // BUT, I can try to use the 'supabase' CLI if I can link it.

    // Alternative: We can add the column via a database function if one exists for arbitrary SQL, but standard Supabase doesn't have one enabled by default.

    // Let's try to infer if we can use 'psql' or similar? 
    // No, let's just proceed to code changes and assume the column exists or I can ask user to add it.
    // Better yet, I will use a 'notify_user' to ask them to run the SQL in their Supabase dashboard SQL editor since CLI failed.
    // THIS IS SAFER.
}

console.log("Please run the migration SQL manually in Supabase Dashboard.");
