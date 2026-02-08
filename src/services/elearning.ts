
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
    is_public: boolean;
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
    async getTracks(includeUnpublished: boolean = false): Promise<LearningTrack[]> {
        console.log('ElearningService.getTracks: Fetching from API...', { includeUnpublished });

        const url = includeUnpublished
            ? '/api/elearning/tracks?showAll=true'
            : '/api/elearning/tracks';

        const response = await fetch(url, {
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

    // 1.5 Get Single Track (Curriculum) by ID
    async getTrack(id: string): Promise<any | null> {
        console.log('ElearningService.getTrack: Fetching track', id);
        try {
            const response = await fetch(`/api/elearning/tracks/${id}`, {
                method: 'GET',
                cache: 'no-store'
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                const errorData = await response.json().catch(() => ({}));
                console.error('ElearningService.getTrack: API error:', errorData);
                return null;
            }

            return await response.json();
        } catch (e) {
            console.error('ElearningService.getTrack exception:', e);
            return null;
        }
    },

    // 1.6 Update Track (Curriculum)
    async updateTrack(id: string, updates: any) {
        console.log('ElearningService.updateTrack:', id, updates);

        const response = await fetch(`/api/elearning/tracks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update track');
        }
    },

    // 1.7 Delete Track (Curriculum)
    async deleteTrack(id: string) {
        console.log('ElearningService.deleteTrack:', id);

        const response = await fetch(`/api/elearning/tracks/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete track');
        }
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

    // 2.5a Get Modules Filtered by User (Company or Instructor)
    async getModulesByUser(userId: string): Promise<CurriculumDef[]> {
        console.log(`ElearningService.getModulesByUser: Fetching for user ${userId}...`);
        // 実装メモ: 現時点ではDBにowner_idがないため、全件取得してフロントエンドでフィルタリングするか、
        // サーバーサイドAPIを拡張してタグ等で管理することを検討。
        // ここではAPI経由で全件取得し、将来的にクエリパラメータでフィルタリングできるようにする土台を作る。
        try {
            const response = await fetch(`/api/elearning/modules?userId=${userId}`, {
                method: 'GET',
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('ElearningService.getModulesByUser: API error:', errorData);
                throw new Error(errorData.error || 'Failed to fetch user modules');
            }

            const modules = await response.json();
            // TODO: サーバーサイドでフィルタリングされていない場合、ここでuserIdに紐づくもののみを抽出する
            // 現在はモック的に全件返すが、将来的に tags や metadata に userId を含める運用を想定
            return modules;
        } catch (e) {
            console.error('ElearningService.getModulesByUser: Caught error:', e);
            throw e;
        }
    },

    // 2.6 Get Single Module (Course) by ID
    async getModule(id: string): Promise<CurriculumDef | null> {
        // console.log('ElearningService.getModule: Fetching module', id);
        try {
            const response = await fetch(`/api/elearning/modules/${id}`, {
                method: 'GET',
                cache: 'no-store'
            });

            if (!response.ok) {
                // 404の場合はnullを返すだけでエラーにはしない
                if (response.status === 404) return null;

                const errorData = await response.json().catch(() => ({}));
                console.error('ElearningService.getModule: API error:', errorData);
                return null;
            }

            const module = await response.json();
            return module;
        } catch (e) {
            console.error('ElearningService.getModule exception:', e);
            return null;
        }
    },

    // 2.7 Update Module (Admin)
    async updateModule(id: string, updates: Partial<any>) {
        console.log('ElearningService.updateModule: sending to API...', id, updates);

        const response = await fetch(`/api/elearning/modules/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update module');
        }
    },

    // 2.7.5 Delete Module (Admin)
    async deleteModule(id: string) {
        console.log('ElearningService.deleteModule:', id);

        // Note: API route handles deletion of related lessons if implemented there, 
        // or we call API. 
        // Logic: Call API /api/elearning/modules/[id] with DELETE method.

        const response = await fetch(`/api/elearning/modules/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete module');
        }
    },

    // 2.8 Get Single Lesson with its Course Info - 直接API経由で取得
    async getLesson(id: string): Promise<any | null> {
        console.log(`ElearningService.getLesson: Fetching lesson ${id} from API...`);

        try {
            const response = await fetch(`/api/elearning/content/${id}`, {
                method: 'GET',
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('ElearningService.getLesson: API error:', errorData);
                return null;
            }

            const lesson = await response.json();
            console.log(`ElearningService.getLesson: Success, found lesson "${lesson.title}"`);
            return lesson;
        } catch (e) {
            console.error('ElearningService.getLesson: Caught error:', e);
            return null;
        }
    },


    // 3. Admin: Get All Content (Flat list for content library)
    async getAllContent(page: number = 1, limit: number = 50, curriculumId?: string): Promise<{ data: ContentItem[], count: number }> {
        console.log('ElearningService.getAllContent: Fetching from API...');

        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        if (curriculumId) {
            params.set('curriculumId', curriculumId);
        }

        const response = await fetch(`/api/elearning/content?${params.toString()}`, {
            method: 'GET',
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('ElearningService.getAllContent: API error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch content');
        }

        const result = await response.json();
        console.log(`ElearningService.getAllContent: Success, found ${result.data?.length || 0} items`);
        return { data: result.data || [], count: result.count || 0 };
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

    // 4.5. Admin: Create Module (Course) linked to a Track
    async createModule(module: { title: string, course_id: string, description?: string, order_index?: number }) {
        console.log('ElearningService.createModule: sending to API...', module);

        const response = await fetch('/api/elearning/modules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(module)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create module');
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
