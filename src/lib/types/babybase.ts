export type SpecialistCategory = '妊娠・出産' | '赤ちゃん・育児' | '離乳食・健康' | '夫婦・家庭' | '保活・自分' | 'おでかけ・お店' | 'リラックス';

export interface ChildProfile {
    id: string;
    name: string;
    birthDate: string; // YYYY-MM-DD
    gender: 'boy' | 'girl' | 'prefer-not-to-say';
    concerns: string[];
}

export interface MomProfile {
    userId: string;
    location: string;
    interests: string[];
    children: ChildProfile[];
}

export interface Specialist {
    id: string;
    name: string;
    category: SpecialistCategory;
    title: string;
    description: string;
    image: string;
    location: string;
    tags: string[];
    snsLinks?: {
        instagram?: string;
        twitter?: string;
        website?: string;
    };
    isVerified: boolean;
}

export interface BabyBaseEvent {
    id: string;
    specialistId: string;
    title: string;
    date: string;
    location: string;
    type: 'offline' | 'online';
    image: string;
    price: string;
}

export interface LearningArticle {
    id: string;
    title: string;
    category: SpecialistCategory;
    authorId: string;
    content: string;
    image: string;
    publishedAt: string;
}

export interface SpecialistPost {
    id: string;
    specialistId: string;
    content: string;
    image?: string;
    likes: number;
    createdAt: string;
}
