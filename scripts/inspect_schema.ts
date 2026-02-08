
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    // 1. List all tables (approximation via checking common names or using rpc if available, 
    // but since we can't easily query information_schema with supabase-js easily without permissions,
    // we'll try to select from likely tables)

    console.log('--- Checking for tables ---');
    const tableNames = ['courses', 'curriculums', 'curriculum', 'modules', 'lessons', 'course_contents'];

    for (const table of tableNames) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`Table '${table}': Not found or no access (${error.message})`);
        } else {
            console.log(`Table '${table}': Exists (Rows: ${count})`);

            // If exists, show one row to guess schema
            const { data } = await supabase.from(table).select('*').limit(1);
            if (data && data.length > 0) {
                console.log(`  Sample keys: ${Object.keys(data[0]).join(', ')}`);
            }
        }
    }

    console.log('\n--- Checking specific course "DX推進担当者育成カリキュラム" ---');
    const { data: dxCourse } = await supabase
        .from('courses')
        .select('*')
        .ilike('title', '%DX推進%');

    if (dxCourse && dxCourse.length > 0) {
        console.log('Found in courses table:', dxCourse);
    }
}

inspect();
