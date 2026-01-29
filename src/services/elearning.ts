
import { createClient } from '@/utils/supabase/client';
import { ContentItem, CurriculumDef, CourseDef } from '@/data/mock_elearning_data';
import { LearningTrack } from '@/types/shared';

// -- Types Mapping (Supabase -> App) --

// Interface matches DB 'learning_curriculums' (Track in UI)
export interface DbTrack {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    is_published: boolean;
}

// Interface matches DB 'courses'  (Course/Curriculum in UI)
export interface DbCourse {
    id: string;
    title: string;
    description: string | null;
    level: string | null;
    category: string | null;
    thumbnail_url: string | null;
    // New fields
    view_count: number;
    tags: string[];
}

// Interface matches DB 'course_curriculums' (Section/Module in UI - confusing naming in DB migration vs UI)
// Actually in our seeding:
// UI "Track" -> DB "courses" (e.g. Web Engineering Master)
// UI "Course" -> DB "course_curriculums" (e.g. React Intro)
// UI "Lesson" -> DB "course_lessons" (e.g. Setup Vid)
// Wait, my seeding script used this mapping:
// 1. RECOMMENDED_TRACKS -> 'courses' table (category='Track')
// 2. ALL_CURRICULUMS -> 'course_curriculums' table (linked to track)
// 3. lessons -> 'course_lessons' table

// So we should strictly follow that mapping for the Service.

export const ElearningService = {
    // 0. Increment Course (Curriculum) View
    async incrementViewCount(courseId: string) {
        // console.log(`ElearningService: Incrementing view count for ${courseId}`); 
        // Logic maps "CourseId" (UI) to "CurriculumId" (DB)
        const supabase = createClient();
        const { error } = await supabase.rpc('increment_curriculum_view', { curriculum_id: courseId });
        if (error) {
            console.error('Failed to increment view count:', error);
        }
    },

    // 1. Get All Tracks - Uses API route for stability
    async getTracks(): Promise<LearningTrack[]> {
        console.log('ElearningService.getTracks: Fetching from API...');

        const response = await fetch('/api/elearning/tracks', {
            method: 'GET',
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('ElearningService.getTracks: API error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch tracks');
        }

        const tracks = await response.json();
        console.log(`ElearningService.getTracks: Success, found ${tracks.length} tracks`);
        return tracks;
    },

    // 2. Get Courses (Modules) for a Track - Uses API route for stability
    async getCoursesForTrack(trackId: string): Promise<CurriculumDef[]> {
        console.log(`ElearningService.getCoursesForTrack: Fetching from API for track ${trackId}...`);

        const response = await fetch(`/api/elearning/tracks/${trackId}/courses`, {
            method: 'GET',
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('ElearningService.getCoursesForTrack: API error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch courses');
        }

        const courses = await response.json();
        console.log(`ElearningService.getCoursesForTrack: Success, found ${courses.length} courses`);
        return courses;
    },

    // 2.5 Admin: Get All Modules (Curriculums) with lesson counts - Uses API route to avoid client-side lock issues
    async getAllModules(): Promise<CurriculumDef[]> {
        console.log('ElearningService.getAllModules: Fetching from API...');

        try {
            const response = await fetch('/api/elearning/modules', {
                method: 'GET',
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('ElearningService.getAllModules: API error:', errorData);
                throw new Error(errorData.error || 'Failed to fetch modules');
            }

            const modules = await response.json();
            console.log(`ElearningService.getAllModules: Success, found ${modules.length} modules`);
            return modules;
        } catch (e) {
            console.error('ElearningService.getAllModules: Caught error:', e);
            throw e;
        }
    },

    // 2.6 Get Single Module (Standard User View) - APIルート経由でAbortError回避
    async getModule(id: string): Promise<CurriculumDef | null> {
        console.log(`ElearningService.getModule: Fetching module ${id} from API...`);

        try {
            const response = await fetch(`/api/elearning/modules/${id}`, {
                method: 'GET',
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('ElearningService.getModule: API error:', errorData);
                return null;
            }

            const module = await response.json();
            console.log(`ElearningService.getModule: Success, found module "${module.title}" with ${module.lessons?.length || 0} lessons`);
            return module;
        } catch (e) {
            console.error('ElearningService.getModule: Caught error:', e);
            return null;
        }
    },

    // 2.7 Update Module (Admin)
    async updateModule(id: string, updates: Partial<any>) {
        console.log('ElearningService.updateModule:', id, updates);
        const supabase = createClient();
        const { error } = await supabase
            .from('course_curriculums')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Failed to update module:', error);
            throw error;
        }
    },


    // 3. Admin: Get All Content (Flat list for content library)
    async getAllContent(page: number = 1, limit: number = 50, curriculumId?: string): Promise<{ data: ContentItem[], count: number }> {
        const supabase = createClient();

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from('course_lessons')
            .select(`
                *,
                curriculum: course_curriculums(title)
            `, { count: 'exact' });

        // Apply filters
        if (curriculumId) {
            if (curriculumId === 'unassigned') {
                query = query.is('curriculum_id', null);
            } else {
                query = query.eq('curriculum_id', curriculumId);
            }
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        const mappedData = data.map((l: any) => ({
            id: l.id,
            title: l.title,
            type: l.youtube_url ? 'video' : 'document',
            url: l.youtube_url,
            duration: l.duration,
            category: l.curriculum?.title || 'Uncategorized',
            createdAt: l.created_at,
            quiz: l.quiz,
            material_url: l.material_url
        }));

        return { data: mappedData, count: count || 0 };
    },

    // 4. Admin: Create Content
    async createContent(item: Omit<ContentItem, 'id' | 'createdAt'>, curriculumId: string) {
        console.log('ElearningService.createContent: sending to API...', item);

        const response = await fetch('/api/elearning/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item) // Note: API expects 'category' to find curriculum
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create content');
        }

        return await response.json();
    },

    // 5. Admin: Update Content
    async updateContent(id: string, updates: Partial<ContentItem>) {
        console.log('ElearningService.updateContent: sending to API...', id, updates);

        const response = await fetch(`/api/elearning/content/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update content');
        }
    },

    // 6. Admin: Delete Content
    async deleteContent(id: string) {
        console.log('ElearningService.deleteContent: sending to API...', id);

        const response = await fetch(`/api/elearning/content/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete content');
        }
    }
};
