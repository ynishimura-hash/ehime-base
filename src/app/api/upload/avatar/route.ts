import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate User
        const supabaseUser = await createServerClient();
        const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Form Data
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 3. Initialize Admin Client
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const adminSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

        // 4. Upload File
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await adminSupabase.storage
            .from('avatars')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error('Admin Upload Error:', uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        // 5. Get Public URL
        const { data: { publicUrl } } = adminSupabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return NextResponse.json({ publicUrl });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
