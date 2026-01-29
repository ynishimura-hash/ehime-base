import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Custom CSV parser
function parseCSV(content: string) {
    const lines = content.replace(/\r/g, '').split('\n').filter(l => l.trim().length > 0);
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);
        const obj: any = {};
        headers.forEach((h, i) => {
            const key = h.trim();
            obj[key] = values[i]?.trim().replace(/^"|"$/g, '') || '';
        });
        return obj;
    });
}

async function run() {
    console.log('Starting migration...');
    const baseDir = '/Users/yuyu24/2ndBrain/Ehime Base app/元データ';

    try {
        const coursesCSV = fs.readFileSync(path.join(baseDir, 'カリキュラム一覧.csv'), 'utf8');
        const contentsCSV = fs.readFileSync(path.join(baseDir, 'コンテンツ一覧.csv'), 'utf8');

        const coursesData = parseCSV(coursesCSV).filter(c => c.コース名);
        const contentsData = parseCSV(contentsCSV).filter(c => c.コンテンツ名);

        console.log(`Found ${coursesData.length} courses and ${contentsData.length} lessons.`);

        // Clear existing data to avoid duplicates and ensure match with CSV
        console.log('Clearing old e-learning data...');
        await supabase.from('course_lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('course_curriculums').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        for (const c of coursesData) {
            console.log(`Processing course: ${c.コース名}...`);

            let imageUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'; // Fallback
            if (c.コース画像 && c.コース画像.startsWith('{')) {
                try {
                    const imgData = JSON.parse(c.コース画像.replace(/'/g, '"'));
                    // Since specific URL is unknown, we use a placeholder that looks like the hash if real one fails
                    imageUrl = imgData.url ? `https://raw.githubusercontent.com/yone-ehime/reskill-assets/main/images/${imgData.url}` : imageUrl;
                } catch (e) {
                    console.warn(`Could not parse image JSON for ${c.コース名}`);
                }
            }

            const { data: course, error: cError } = await supabase
                .from('courses')
                .insert({
                    title: c.コース名,
                    description: c.コース概要 || '愛媛でのキャリアアップを目指すための特別講座です。',
                    category: c.コンテンツカテゴリ || 'ビジネス',
                    level: '初級',
                    duration: c.学習所要時間 || '2時間',
                    image: imageUrl,
                    order_index: parseInt(c.並び順) || 0,
                    instructor: {
                        name: "Ehime Base Expert",
                        role: "Lead Instructor",
                        image: "https://i.pravatar.cc/150?u=instructor"
                    }
                })
                .select()
                .single();

            if (cError) {
                console.error(`Error inserting course ${c.コース名}:`, cError.message);
                continue;
            }

            // Create one curriculum (chapter) for now as requested
            const { data: curr, error: currError } = await supabase
                .from('course_curriculums')
                .insert({
                    course_id: course.id,
                    title: '基本メニュー',
                    description: 'このコースの主要な講義内容です。',
                    order_index: 0
                })
                .select()
                .single();

            if (currError) {
                console.error(`Error inserting curriculum for ${c.コース名}:`, currError.message);
                continue;
            }

            const lessons = contentsData.filter(ct => ct.コース === c.コース名);
            console.log(`  Adding ${lessons.length} lessons...`);

            for (const l of lessons) {
                const { error: lError } = await supabase
                    .from('course_lessons')
                    .insert({
                        curriculum_id: curr.id,
                        title: l.コンテンツ名,
                        youtube_url: l.YOUTUBE_URL || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        order_index: parseInt(l.並び順) || 0,
                        description: l.コンテンツ名,
                        duration: l.動画視聴時間 || '15:00'
                    });
                if (lError) console.error(`    Error inserting lesson ${l.コンテンツ名}:`, lError.message);
            }
        }

        console.log('Migration complete!');
    } catch (err: any) {
        console.error('Fatal error during migration:', err.message);
    }
}

run();
