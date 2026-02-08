
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const orgId = 'a0ee0000-0000-0000-0000-000000000003'; // Known Org ID
    const appId = '55d8c66e-73e6-4d49-adee-1380f64deacb'; // Known App ID

    const { data, error } = await supabase
        .from('interactions')
        .insert({
            user_id: orgId,
            target_id: appId,
            type: 'test_interaction',
            metadata: { note: 'test' }
        })
        .select();

    if (error) {
        console.error("Insert Failed (Constraint Violation likely):", error);
    } else {
        console.log("Insert Success!", data);
        // Clean up
        await supabase.from('interactions').delete().eq('id', data[0].id);
    }
}

testInsert();
