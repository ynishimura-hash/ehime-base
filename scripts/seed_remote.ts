
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
    console.log('Starting remote seed...');


    // Helper to generate a valid UUID v4 from a number (for deterministic testing)
    function getUUID(prefix: string, id: number): string {
        // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
        // We'll use the prefix for the first part, and the id for the last part
        const hexId = id.toString(16).padStart(12, '0');
        // prefix should be 8 chars hex.
        // e.g. 'a0ee0000'
        return `${prefix}-0000-4000-8000-${hexId}`;
    }

    const companies = [
        {
            id: getUUID('a0ee0000', 1),
            name: '合同会社EIS',
            industry: 'サービス・観光・飲食店',
            location: '松山市',
            description: '「非対称なマッチング」で地域の歪みをエネルギーに変える。EISは単なる採用支援ではなく、企業と個人の本質的な成長に伴走する教育機関です。',
            is_premium: true,
            logo_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
            cover_image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
            representative_name: '代表社員 鈴木 杏奈',
            established_date: '2020',
            employee_count: '5名',
            capital: '300万円',
            website_url: 'https://eis.example.com',
            type: 'company'
        },
        {
            id: getUUID('a0ee0000', 2),
            name: 'トヨタL＆F西四国株式会社',
            industry: '物流・運送',
            location: '松山市大可賀',
            description: 'トヨタグループの一員として、物流現場の課題を解決する「物流ドクター」。',
            is_premium: true,
            logo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
            type: 'company'
        }
    ];

    const jobs = [
        {
            id: getUUID('b0ee0000', 1),
            organization_id: getUUID('a0ee0000', 1),
            title: '【テスト用】新規事業立ち上げブレスト',
            type: 'quest',
            category: '体験JOB',
            content: 'EISの新規事業に関するディスカッションパートナーを募集。',
            is_active: true,
            salary: '時給 2,500円',
            working_hours: '2時間',
            location: 'オンライン',
            reward: '¥5,000',
            value_tags_ai: ['挑戦', '創造', '柔軟な視点', '好奇心旺盛'] // Use value_tags_ai (jsonb)
        },
        {
            id: getUUID('b0ee0000', 3),
            organization_id: getUUID('a0ee0000', 1),
            title: '1日体験：レガシーシステム改修ワーク',
            type: 'quest',
            category: '体験JOB',
            content: '古いプログラムを読み解き、現代的にリファクタリングする体験。',
            is_active: true,
            salary: '日給 10,000円',
            location: '松山市（オンライン可）',
            reward: '¥10,000',
            value_tags_ai: ['探究心', '論理的思考', '専門性', '誠実'] // Use value_tags_ai (jsonb)
        }
    ];

    // 2. Courses Data
    const courses = [
        {
            id: getUUID('c0000000', 16),
            title: 'リスキル大学講座アーカイブ',
            description: 'リスキル大学の講座のアーカイブになります。',
            instructor: {
                name: "リスキル講師",
                role: "Expert Advisor",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            },
            category: 'ビジネス',
            level: '初級',
            duration: '不明',
            image: 'https://images.unsplash.com/photo-1454165833767-02486835bcd4?auto=format&fit=crop&q=80&w=800',
            is_published: true,
            order_index: 0
        }
    ];

    const curriculums = [
        {
            id: getUUID('cc000000', 1),
            course_id: getUUID('c0000000', 16),
            title: '講座アーカイブ',
            description: '', // Check schema if this column exists, likely yes
            order_index: 1
        }
    ];

    const lessons = [
        {
            id: getUUID('c1000000', 1), // Valid UUID
            curriculum_id: getUUID('cc000000', 1),
            title: '2025/10/15リスキル大学開講記念「リスキル大学」について',
            description: '',
            youtube_url: 'https://www.youtube.com/embed/EPrvQQ5_m6M',
            duration: '10:00',
            order_index: 1
        },
        {
            id: getUUID('c1000000', 2), // Valid UUID
            curriculum_id: getUUID('cc000000', 1),
            title: '2025/10/23最新AI活用戦略',
            description: '',
            youtube_url: 'https://www.youtube.com/embed/srzfgDRG4Ew',
            duration: '10:00',
            order_index: 2
        }
    ];

    // --- Execution ---

    // Companies
    console.log('Seeding organizations...');
    const { error: orgError } = await supabase.from('organizations').upsert(companies).select();
    if (orgError) console.error('Error inserting organizations:', orgError);

    // Jobs
    console.log('Seeding jobs...');
    const { error: jobError } = await supabase.from('jobs').upsert(jobs).select();
    if (jobError) console.error('Error inserting jobs:', jobError);

    // Courses
    console.log('Seeding courses...');
    const { error: courseError } = await supabase.from('courses').upsert(courses).select();
    if (courseError) console.error('Error inserting courses:', courseError);

    // Curriculums
    console.log('Seeding curriculums...');
    const { error: currError } = await supabase.from('course_curriculums').upsert(curriculums).select();
    if (currError) console.error('Error inserting curriculums:', currError);

    // Lessons
    console.log('Seeding lessons...');
    const { error: lessonError } = await supabase.from('course_lessons').upsert(lessons).select();
    if (lessonError) console.error('Error inserting lessons:', lessonError);

    console.log('Seeding complete!');
}

seed();
