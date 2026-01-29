import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { RECOMMENDED_TRACKS } from '../src/lib/curriculumData';
import { ALL_CURRICULUMS, ContentItem } from '../src/data/mock_elearning_data';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Starting seed with Correct Schema...');

    // 1. Seed Tracks (mapped to 'courses' table in DB)
    const trackIdMap = new Map<string, string>(); // track.id -> db_id

    for (const trackMock of RECOMMENDED_TRACKS) {
        console.log(`Seeding Track: ${trackMock.title}`);

        let trackDbId;
        const { data: existingTrack } = await supabase
            .from('courses')
            .select('id')
            .eq('title', trackMock.title)
            .single();

        if (existingTrack) {
            trackDbId = existingTrack.id;
        } else {
            const { data: newTrack, error } = await supabase
                .from('courses')
                .insert({
                    title: trackMock.title,
                    description: trackMock.description,
                    is_published: true,
                    category: 'Track',
                    level: 'Bootcamp'
                })
                .select()
                .single();

            if (error) {
                console.error('Error seeding track:', trackMock.title, error);
                continue;
            }
            trackDbId = newTrack.id;
        }
        trackIdMap.set(trackMock.id, trackDbId);
    }

    // 2. Seed Modules/Curriculums (mapped to 'course_curriculums' table)
    // We iterate ALL_CURRICULUMS and assign them to Tracks
    console.log('Seeding Modules/Curriculums...');

    const webKeywords = ['Web', 'HTML', 'CSS', 'PHP', 'JavaScript', 'React', 'Vue', 'Next.js', 'デザイン', 'Figma', 'Wordpress'];

    for (const curriculumMock of ALL_CURRICULUMS) {
        // Determine which track this belongs to
        // Default to DX track (track_dx_model), use Web track (track_web_dev) if keyword matches
        let targetTrackId = trackIdMap.get('track_dx_model'); // Default
        const isWeb = webKeywords.some(k => curriculumMock.title.includes(k) || (curriculumMock.description && curriculumMock.description.includes(k)));

        if (isWeb && trackIdMap.has('track_web_dev')) {
            targetTrackId = trackIdMap.get('track_web_dev');
        }

        if (!targetTrackId) {
            console.warn('Track ID not found for mapping, skipping curriculum:', curriculumMock.title);
            continue;
        }

        console.log(`  Seeding Curriculum: ${curriculumMock.title} -> Track ID: ${targetTrackId}`);

        let curriculumDbId;
        const { data: existingCurr } = await supabase
            .from('course_curriculums')
            .select('id')
            .eq('course_id', targetTrackId)
            .eq('title', curriculumMock.title)
            .single();

        if (existingCurr) {
            curriculumDbId = existingCurr.id;
        } else {
            const { data: newCurr, error: currError } = await supabase
                .from('course_curriculums')
                .insert({
                    course_id: targetTrackId,
                    title: curriculumMock.title,
                    description: curriculumMock.description,
                    order_index: 0 // Could calc index
                })
                .select()
                .single();

            if (currError) {
                console.error('  Error seeding curriculum:', curriculumMock.title, currError);
                continue;
            }
            curriculumDbId = newCurr.id;
        }

        // 3. Seed Lessons (mapped to 'course_lessons')
        if (curriculumMock.lessons && Array.isArray(curriculumMock.lessons)) {
            let lessonOrder = 0;
            // Access lessons. Cast to any if needed to avoid overly strict TS on intermediate processing
            for (const lesson of (curriculumMock.lessons as any[])) {
                // Check existence
                const { data: existingLesson } = await supabase
                    .from('course_lessons')
                    .select('id')
                    .eq('curriculum_id', curriculumDbId)
                    .eq('title', lesson.title)
                    .single();

                if (!existingLesson) {
                    // Calc duration
                    let durationSeconds = 0;
                    if (lesson.duration) {
                        const parts = lesson.duration.split(':').map(Number);
                        if (parts.length === 3) durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                        else if (parts.length === 2) durationSeconds = parts[0] * 60 + parts[1];
                    }

                    const { error: lessonError } = await supabase
                        .from('course_lessons')
                        .insert({
                            curriculum_id: curriculumDbId,
                            title: lesson.title,
                            description: '', // ContentItem interface has no description
                            youtube_url: lesson.url,
                            duration: lesson.duration || null, // Store string as per schema
                            order_index: lessonOrder++,
                            quiz: lesson.quiz ? lesson.quiz : null
                        });

                    if (lessonError) {
                        console.error('    Error seeding lesson:', lesson.title, lessonError);
                    }
                }
            }
        }
    }

    console.log('Seeding Complete!');
}

seed().catch(err => console.error(err));
