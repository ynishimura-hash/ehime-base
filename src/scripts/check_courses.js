
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listCourses() {
    const { data: courses, error } = await supabase.from('course_curriculums').select('id, title, tags');
    if (error) {
        console.error(error);
    } else {
        // console.tableだと長い文字列が省略されることがあるので、JSON文字列で見やすく出力
        courses.forEach(c => {
            console.log(`ID: ${c.id}`);
            console.log(`Title: ${c.title}`);
            console.log(`Tags: ${JSON.stringify(c.tags)}`);
            console.log('---');
        });
    }
}
listCourses();
