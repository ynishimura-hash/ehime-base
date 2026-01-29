
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function update() {
    console.log('Updating Tracks images...');

    // 1. DX Track
    const { error: dxError } = await supabase
        .from('courses')
        .update({ image: '/courses/track_dx.png' })
        .eq('category', 'Track')
        .ilike('title', '%DX推進%');

    if (dxError) console.error('Error updating DX track:', dxError);
    else console.log('Updated DX Track image.');

    // 2. Web Track
    const { error: webError } = await supabase
        .from('courses')
        .update({ image: '/courses/track_web.png' })
        .eq('category', 'Track')
        .ilike('title', '%Web%');

    if (webError) console.error('Error updating Web track:', webError);
    else console.log('Updated Web Track image.');
}

update();
