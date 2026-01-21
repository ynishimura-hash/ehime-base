
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    // Use a hack to check columns: insert a dummy row with all keys and see if it errors on specific columns? 
    // Or just select with headers?
    // Supabase JS doesn't expose table schema directly easily without metadata API (which isn't enabled by default usually).
    // But we can try to select the new columns from a row (even if empty).

    const { data, error } = await supabase.from('media_library').select('*').limit(1);

    if (error) {
        console.log('Error selecting columns:', error.message);
    } else {
        console.log('Columns seem to exist. Data:', data);
    }
}

checkSchema();
