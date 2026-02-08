
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetchCourses() {
    console.log('Testing fetchCourses...');
    try {
        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                curriculums:course_curriculums(
                    *,
                    lessons:course_lessons(*)
                )
            `)
            .eq('is_published', true)
            .order('order_index');

        if (error) {
            console.error('Error fetching courses:', error);
        } else {
            console.log(`Successfully fetched ${data?.length} courses.`);
            if (data && data.length > 0) {
                console.log('Sample course:', data[0].title);
                console.log('Curriculums count:', data[0].curriculums?.length);
            }
        }
    } catch (e) {
        console.error('Exception in fetchCourses:', e);
    }
}

async function testFetchRecs(userId: string) {
    console.log(`Testing fetchRecommendations for user: ${userId}...`);
    // Simulate API call logic locally
    try {
        const { data, error } = await supabase
            .from('user_course_recommendations')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching recommendations:', error);
        } else {
            console.log(`Successfully fetched ${data?.length} recommendations.`);
            if (data && data.length > 0) {
                console.log('Sample Rec:', JSON.stringify(data[0], null, 2));
            }
        }
    } catch (e) {
        console.error('Exception in fetchRecommendations:', e);
    }
}

async function run() {
    await testFetchCourses();
    // Use a known existing user ID or the test user ID
    await testFetchRecs('061fbf87-f36e-4612-80b4-dedc77b55d5e');
}

run();
