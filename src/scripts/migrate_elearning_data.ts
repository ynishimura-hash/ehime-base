
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_PATH = path.join(process.cwd(), 'src/data/courses.json');

async function migrateData() {
    try {
        console.log('Reading JSON data...');
        const fileContent = fs.readFileSync(DATA_PATH, 'utf8');
        const courses = JSON.parse(fileContent);

        console.log(`Found ${courses.length} courses to migrate.`);

        for (const course of courses) {
            console.log(`Migrating Course: ${course.title}...`);

            // 1. Insert Course
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .insert({
                    title: course.title,
                    description: course.description,
                    instructor: course.instructor,
                    category: course.category,
                    level: course.level,
                    duration: course.duration,
                    image: course.image,
                    is_published: true,
                    order_index: 0 // You might want to map this if JSON has order
                })
                .select()
                .single();

            if (courseError) {
                console.error(`Error inserting course ${course.title}:`, courseError);
                continue;
            }

            const newCourseId = courseData.id;
            console.log(`  -> Created Course ID: ${newCourseId}`);

            // 2. Insert Curriculums
            if (course.curriculums && course.curriculums.length > 0) {
                for (const curr of course.curriculums) {
                    const { data: currData, error: currError } = await supabase
                        .from('course_curriculums')
                        .insert({
                            course_id: newCourseId,
                            title: curr.title,
                            description: curr.description,
                            order_index: curr.order || 0
                        })
                        .select()
                        .single();

                    if (currError) {
                        console.error(`  Error inserting curriculum ${curr.title}:`, currError);
                        continue;
                    }

                    const newCurrId = currData.id;
                    // console.log(`    -> Created Curriculum ID: ${newCurrId}`);

                    // 3. Insert Lessons
                    if (curr.lessons && curr.lessons.length > 0) {
                        const lessonsToInsert = curr.lessons.map((lesson: any) => ({
                            curriculum_id: newCurrId,
                            title: lesson.title,
                            description: lesson.description,
                            youtube_url: lesson.youtubeUrl, // Note mapping: youtubeUrl -> youtube_url
                            duration: lesson.duration,
                            quiz: lesson.quiz,
                            order_index: lesson.order || 0
                        }));

                        const { error: lessonsError } = await supabase
                            .from('course_lessons')
                            .insert(lessonsToInsert);

                        if (lessonsError) {
                            console.error(`    Error inserting lessons for ${curr.title}:`, lessonsError);
                        } else {
                            console.log(`    -> Inserted ${lessonsToInsert.length} lessons.`);
                        }
                    }
                }
            }
        }

        console.log('Migration completed!');

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateData();
