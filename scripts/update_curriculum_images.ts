
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

// Course image mappings
const courseImageMappings = [
    { titlePattern: 'リスキル大学', image: '/courses/reskill_archive.png' },
    { titlePattern: 'ITパスポート', image: '/courses/it_passport.png' },
    { titlePattern: '基本情報', image: '/courses/fe_exam.png' },
    { titlePattern: 'デジタル', image: '/courses/digital_basics.png' },
    { titlePattern: 'キャリア', image: '/courses/career_support.png' },
];

async function updateCourseImages() {
    console.log('Updating course curriculum images...');

    // First, let's get all course_curriculums to see what we have
    const { data: curriculums, error: fetchError } = await supabase
        .from('course_curriculums')
        .select('id, title, image');

    if (fetchError) {
        console.error('Error fetching curriculums:', fetchError);
        return;
    }

    console.log(`Found ${curriculums?.length || 0} curriculums`);

    for (const curriculum of curriculums || []) {
        // Find matching image
        const mapping = courseImageMappings.find(m =>
            curriculum.title.includes(m.titlePattern)
        );

        if (mapping) {
            console.log(`Updating ${curriculum.title} with ${mapping.image}`);

            const { error: updateError } = await supabase
                .from('course_curriculums')
                .update({ image: mapping.image })
                .eq('id', curriculum.id);

            if (updateError) {
                console.error(`Error updating ${curriculum.title}:`, updateError);
            } else {
                console.log(`✓ Updated ${curriculum.title}`);
            }
        } else {
            // Default image for unmatched courses
            console.log(`No specific image for ${curriculum.title}, using default`);
            const { error: updateError } = await supabase
                .from('course_curriculums')
                .update({ image: '/courses/digital_basics.png' })
                .eq('id', curriculum.id);

            if (updateError) {
                console.error(`Error updating ${curriculum.title}:`, updateError);
            }
        }
    }

    console.log('Done updating course images!');
}

updateCourseImages();
