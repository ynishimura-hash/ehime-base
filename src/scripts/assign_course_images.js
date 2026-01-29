
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const MAPPING = {
    'デジタル応用': '/courses/digital_basics.png', // Temporary fallback
    'HP制作': '/courses/hp_course.png',
    '動画制作': '/courses/video_production.png',
    'Google Apps Script': '/courses/gas_course.png',
    'アプリ開発②（業務管理）': '/courses/app_development.png',
    'アプリ開発①（モバイルアプリ）': '/courses/app_development.png',
    '業務自動化': '/courses/automation.png',
    '情報セキュリティ': '/courses/security_course.png',
    'マーケティング基礎': '/courses/marketing_basics.png',
    'Google基礎': '/courses/google_basics.png',
    'デジタル基礎（必修）': '/courses/digital_basics.png',
    'SNSマーケティング': '/courses/sns_marketing.png',
    'AI活用': '/courses/ai_course.png',
    'ITパスポート': '/courses/it_passport.png',
    'キャリアサポート': '/courses/career_support.png',
    'リスキル大学講座アーカイブ': '/courses/reskill_archive.png',
    '基本情報技術者試験': '/courses/fe_exam.png',
    'トラックDX': '/courses/track_dx.png',
    'トラックWeb': '/courses/track_web.png'
};

async function assignImages() {
    const { data: courses, error } = await supabase.from('course_curriculums').select('id, title, tags');

    if (error) {
        console.error('Error fetching courses:', error);
        return;
    }

    for (const course of courses) {
        let imagePath = null;

        // Direct match
        if (MAPPING[course.title]) {
            imagePath = MAPPING[course.title];
        } else {
            // Fuzzy match
            if (course.title.includes('ITパスポート')) imagePath = '/courses/it_passport.png';
            else if (course.title.includes('キャリア')) imagePath = '/courses/career_support.png';
            else if (course.title.includes('アーカイブ')) imagePath = '/courses/reskill_archive.png';
            else if (course.title.includes('DX')) imagePath = '/courses/track_dx.png';
        }

        if (imagePath) {
            const currentTags = course.tags || [];
            // Remove old image tags
            const newTags = currentTags.filter(t => !t.startsWith('image:'));
            newTags.push(`image:${imagePath}`);

            console.log(`Updating ${course.title} -> ${imagePath}`);

            const { error: updateError } = await supabase
                .from('course_curriculums')
                .update({ tags: newTags })
                .eq('id', course.id);

            if (updateError) console.error(`Failed to update ${course.title}:`, updateError);
        } else {
            console.log(`No mapping found for ${course.title}`);
        }
    }
    console.log('Done.');
}

assignImages();
