
export interface Reel {
    id: string;
    url: string;
    type: 'file' | 'youtube';
    thumbnail?: string;
    title: string;
    caption?: string;
    description?: string;
    link_url?: string;
    link_text?: string;
    likes: number;
    entityType?: 'company' | 'job' | 'quest' | 'other';
}

export interface Job {
    id: string;
    companyId: string;
    title: string;
    type: 'quest' | 'job' | 'internship';
    category: string;
    reward?: string;
    description: string;
    isExperience: boolean;
    requirements?: string;
    salary?: string;
    workingHours?: string;
    holidays?: string;
    welfare?: string;
    selectionProcess?: string;
    tags: string[];
    location?: string;
    reels?: Reel[];
    organization?: Company; // For UI convenience
    cover_image_url?: string; // Supabase field
    value_tags_ai?: any; // AI field
}

export interface Company {
    id: string;
    name: string;
    industry: string;
    location: string;
    description: string;
    rjpNegatives: string;
    isPremium: boolean;
    is_premium?: boolean;
    image: string;
    logoColor: string;
    foundingYear?: number;
    capital?: string;
    employeeCount?: string;
    representative?: string;
    address?: string;
    phone?: string;
    website?: string;
    businessDetails?: string;
    philosophy?: string;
    benefits?: string;
    rjpPositives?: string;
    images?: string[];
    reels?: Reel[];
    videos?: string[];
    cover_image_url?: string; // Supabase field
    logo_url?: string; // Supabase field
    status?: string;
}

// E-Learning Types
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
}

export interface Lesson {
    id: string;
    curriculumId: string;
    title: string;
    description: string;
    youtubeUrl: string;
    duration: string;
    attachments?: { name: string; url: string; size: string }[];
    quiz?: QuizQuestion[];
    order: number;
    material_url?: string;
}

export interface Curriculum {
    id: string;
    courseId: string;
    title: string;
    description: string;
    lessons: Lesson[];
    order: number;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructor?: { // Made optional as Modules don't have it
        name: string;
        role: string;
        image: string;
    };
    category?: string; // Optional
    level?: '初級' | '中級' | '上級'; // Optional
    duration?: string; // Optional
    image?: string; // Optional
    curriculums?: Curriculum[]; // Make optional
    lessons?: Lesson[]; // Add direct lessons support
    isFeatured?: boolean;
}

export interface LearningTrack {
    id: string;
    title: string;
    description: string;
    courseIds: string[];
    image?: string;
    courses?: { id: string; title: string; }[]; // For UI display
}

export interface UserCourseRecommendation {
    id: string;
    user_id: string;
    course_id: string;
    value_id: number;
    reason_message: string;
    created_at: string;
}
