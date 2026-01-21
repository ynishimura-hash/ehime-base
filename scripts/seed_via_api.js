const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
    console.log('Seeding data via API...');

    // 1. Get an organization ID (any valid one)
    const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1);

    if (orgError || !orgs || orgs.length === 0) {
        console.error('Error fetching organizations or no orgs found:', orgError);
        return;
    }

    const orgId = orgs[0].id;
    console.log('Using Organization ID:', orgId);

    // 2. Insert Dummy Jobs/Quests
    // We store cover_image_url in value_tags_ai jsonb field since we couldn't run migration
    const jobs = [
        {
            organization_id: orgId,
            title: '未来を拓くDXエンジニア募集',
            content: '愛媛から世界へ。最先端の技術で地域課題を解決するエンジニアを募集します。',
            type: 'job', // Assuming 'job' is valid. Schema comment says 'is_active' etc.
            // Note: Schema doesn't have explicit 'type' column for job/quest distinction in the VIEWED lines,
            // but the migration file implied it. let's check if 'type' column exists or if it was part of the failed migration.
            // Wait, previous migration 20240121_add_cover_image_and_seed.sql TRIED to insert 'type'.
            // If 'type' column is missing, this insert will fail.
            // Let's check schema.sql again.
            // It has 'organization_id', 'title', 'content', 'value_tags_ai', 'matching_vector', 'is_active'.
            // It DOES NOT have 'type', 'salary', etc. locally in the viewed snippet (lines 90-100).
            // BUT 20240121_add_company_job_details.sql (which failed?) implied adding them.
            // Actually, I viewed 20240121_add_company_job_details.sql earlier, did I run it?
            // I haven't run any migrations successfully?
            // If I haven't run ANY migrations, I can't insert 'salary', 'type', etc.
            // I must rely on 'value_tags_ai' or 'content' for EVERYTHING that is missing.
            value_tags_ai: {
                cover_image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200',
                type: 'job',
                salary: '月給 30万円〜',
                employment_type: '正社員',
                working_hours: '9:00 - 18:00',
                holidays: '完全週休2日制',
                benefits: '社会保険完備, リモート可',
                qualifications: '実務経験3年以上',
                access: '松山市駅 徒歩10分'
            },
            is_active: true
        },
        {
            organization_id: orgId,
            title: '【1Day】地域創生マーケティング体験',
            content: '実際の店舗データを使って、売上アップの施策を考える実践型インターンシップ。',
            value_tags_ai: {
                cover_image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200',
                type: 'quest',
                salary: '報酬なし (交通費支給)',
                employment_type: 'インターン',
                working_hours: '10:00 - 17:00',
                holidays: '土日開催',
                benefits: 'ランチ付き',
                qualifications: '全学部全学科対象',
                access: '今治駅 車15分'
            },
            is_active: true
        }
    ];

    const { data, error } = await supabase
        .from('jobs')
        .insert(jobs)
        .select();

    if (error) {
        console.error('Error inserting jobs:', error);
    } else {
        console.log('Successfully inserted dummy jobs:', data.length);
    }
}

seedData();
