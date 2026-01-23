import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company, Job, COMPANIES, JOBS } from './dummyData';
import { Course } from './dummyData';
import { UserAnalysis } from './types/analysis';
import { LifePlanInput } from './money-simulation/types';
import { MomProfile, ChildProfile, Specialist, BabyBaseEvent, LearningArticle, SpecialistPost } from './types/babybase';
import { BB_SPECIALISTS, BB_EVENTS, BB_ARTICLES, BB_POSTS } from './babybaseData';
import { useGameStore } from './gameStore';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

// --- Types ---

export interface User {
    id: string;
    name: string;
    age: number;
    university?: string;
    faculty?: string;
    bio: string;
    tags: string[];
    image: string;
    isOnline: boolean;
    // New fields
    department?: string;
    graduationYear?: string;
    workHistory?: { company: string, role: string, duration: string, description: string }[];
    qualifications?: string[];
    skills?: { name: string, level: 'beginner' | 'intermediate' | 'advanced' }[];
    portfolioUrl?: string;
    desiredConditions?: {
        salary?: string;
        location?: string[];
        industry?: string[];
        employmentType?: string[];
    };
    birthDate?: string;
    publicValues?: number[]; // 公開設定にされたValueCardのID
}

export interface Attachment {
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: string;
}

export interface Message {
    id: string;
    senderId: string; // 'u_yuji' or 'c_eis' etc.
    text: string;
    timestamp: number;
    isRead: boolean;
    attachment?: Attachment;
    replyToId?: string;
}

export interface ChatThread {
    id: string;
    companyId: string;
    userId: string;
    messages: Message[];
    updatedAt: number;
}

export interface Interaction {
    type: 'like_company' | 'like_job' | 'like_user' | 'apply' | 'scout';
    fromId: string; // userId or companyId
    toId: string; // companyId, jobId, or userId
    timestamp: number;
    metadata?: any; // e.g., scout message
}

export interface ChatSettings {
    ownerId: string; // userId or companyId
    chatId: string;
    isPinned: boolean;
    isBlocked: boolean;
    isUnreadManual: boolean;
    priority: 'high' | 'medium' | 'low' | null;
    memo: string;
    alias: string;
}

interface AppState {
    // Current Session Mode
    authStatus: 'guest' | 'authenticated' | 'unauthenticated';
    activeRole: 'seeker' | 'company' | 'admin';
    personaMode: 'seeker' | 'reskill';
    currentUserId: string;
    currentCompanyId: string;

    // Data Registry
    users: User[];
    companies: Company[];
    jobs: Job[];
    courses: Course[];

    // Self-Analysis results
    userAnalysis: UserAnalysis;
    chats: ChatThread[];
    interactions: Interaction[];
    chatSettings: ChatSettings[];
    completedLessonIds: string[];
    lastViewedLessonIds: string[];

    // Chat Preferences
    chatSortBy: 'date' | 'priority';
    chatFilterPriority: ('high' | 'medium' | 'low')[];
    isCompactMode: boolean;
    isLessonSidebarOpen: boolean;
    lastMoneySimulationInput: LifePlanInput | null;

    // Baby Base Data
    momProfile: MomProfile | null;
    bbSpecialists: Specialist[];
    bbEvents: BabyBaseEvent[];
    bbArticles: LearningArticle[];
    bbPosts: SpecialistPost[];

    // Actions
    loginAs: (role: 'seeker' | 'company' | 'admin', userId?: string, companyId?: string) => void;
    logout: () => Promise<void>;
    switchRole: (role: 'seeker' | 'company' | 'admin') => void;
    setPersonaMode: (mode: 'seeker' | 'reskill') => void;
    updateUser: (userId: string, updates: Partial<User>) => void;
    addUser: (user: User) => void;
    toggleInteraction: (type: Interaction['type'], fromId: string, toId: string, metadata?: any) => void;

    // Chat Actions
    sendMessage: (threadId: string, senderId: string, text: string, attachment?: Attachment, replyToId?: string) => void;
    deleteMessage: (threadId: string, messageId: string) => void;
    createChat: (companyId: string, userId: string, initialMessage?: string) => string; // returns threadId
    markAsRead: (threadId: string, readerId: string) => void;

    // Interaction Actions
    addInteraction: (interaction: Omit<Interaction, 'timestamp'>) => void;
    removeInteraction: (type: Interaction['type'], fromId: string, toId: string) => void;
    // Job Actions
    addJob: (job: Job) => void;
    updateJob: (jobId: string, updates: Partial<Job>) => void;
    deleteJob: (jobId: string) => void;

    // Settings Actions
    updateChatSettings: (ownerId: string, chatId: string, settings: Partial<ChatSettings>) => void;

    // Chat Preference Actions
    setChatSortBy: (sortBy: 'date' | 'priority') => void;
    toggleChatFilterPriority: (priority: 'high' | 'medium' | 'low') => void;
    setCompactMode: (isCompact: boolean) => void;
    setLessonSidebarOpen: (isOpen: boolean) => void;

    // e-Learning Actions
    completeLesson: (lessonId: string) => void;
    updateLastViewedLesson: (lessonId: string) => void;
    fetchCourses: () => Promise<void>;
    addCourses: (newCourses: Partial<Course>[]) => Promise<void>;
    updateCourse: (course: Partial<Course> & { id: string }) => Promise<void>;
    deleteCourse: (id: string) => Promise<void>;

    // Data Sync Actions
    upsertCompany: (company: Company) => void;
    upsertUser: (user: User) => void;

    // Analysis Actions
    setAnalysisResults: (results: Partial<UserAnalysis>) => void;
    setDiagnosisScore: (questionId: number, score: number) => void;
    toggleFortuneIntegration: () => void;
    togglePublicValue: (valueId: number) => void;
    setMoneySimulationInput: (input: LifePlanInput) => void;

    // Baby Base Actions
    updateMomProfile: (updates: Partial<MomProfile>) => void;
    addChild: (child: ChildProfile) => void;
    removeChild: (childId: string) => void;
    getChat: (threadId: string) => ChatThread | undefined;
    getUserChats: (userId: string) => ChatThread[];
    getCompanyChats: (companyId: string) => ChatThread[];
    hasInteraction: (type: Interaction['type'], fromId: string, toId: string) => boolean;
    getChatSettingsHelper: (ownerId: string, chatId: string) => ChatSettings | undefined;
    isLessonCompleted: (lessonId: string) => boolean;
    getLastViewedLesson: () => string | undefined;


    // User Analysis Persistence
    fetchUserAnalysis: (userId: string) => Promise<void>;
    saveUserAnalysis: (userId: string, data?: Partial<UserAnalysis>) => Promise<void>;

    // Invitation Actions
    invitations: Invitation[];
    createInvitation: (orgId: string, role?: 'admin' | 'member') => Promise<string | null>; // Returns token
    consumeInvitation: (token: string, userId: string) => Promise<boolean>;
}

export interface Invitation {
    id: string;
    organizationId: string;
    token: string;
    role: 'admin' | 'member';
    expiresAt: number;
    isUsed: boolean;
}

// --- Initial Data ---
const INITIAL_USERS: User[] = [
    {
        id: 'u_yuji',
        name: '西村 裕二',
        age: 29,
        university: '愛媛大学',
        faculty: '法文学部（既卒）',
        bio: '「愛媛を面白くする」ために活動中。営業、企画、コミュニティ運営など幅広く経験。次はIT×教育の領域で、若者の可能性を広げる事業に挑戦したいと考えています。',
        tags: ['事業開発', 'コミュニティマネジメント', '営業'],
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
        isOnline: true,
        birthDate: '1995-05-15'
    },
    {
        id: 'u_hanako',
        name: '松山 花子',
        age: 24,
        university: '東京の某IT企業',
        faculty: '営業部',
        bio: '東京でSaaS営業を経験。愛媛へのUターンを検討中。',
        tags: ['法人営業', 'SaaS', 'カスタマーサクセス'],
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        isOnline: false,
    },
    {
        id: 'u4',
        name: '田中 健太',
        age: 21,
        university: '愛媛大学',
        faculty: '法文学部',
        bio: '【Uターン希望】東京のベンチャー企業での長期インターン経験あり。地元愛媛の企業で、営業としてバリバリ働きたいです。フットワークの軽さには自信があります！',
        tags: ['営業志望', 'Uターン', '体育会系'],
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200',
        isOnline: false,
    },
    {
        id: 'u5',
        name: '鈴木 明日香',
        age: 22,
        university: '松山大学',
        faculty: '経営学部',
        bio: 'デザイン思考を用いた課題解決に興味があります。サークルでは広報を担当し、SNS運用でフォロワーを2000人増やしました。クリエイティブな仕事に挑戦したいです。',
        tags: ['デザイン', 'SNS運用', '広報'],
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        isOnline: true,
    },
    {
        id: 'u6',
        name: '佐藤 翔太',
        age: 23,
        university: '愛媛大学',
        faculty: '工学部 情報工学科',
        bio: 'AI・機械学習を研究中。Python/TensolFlow触れます。地元の製造業のDX化に技術で貢献したいと考えています。ハッカソン優勝経験あり。',
        tags: ['エンジニア', 'Python', 'AI'],
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
        isOnline: false,
    },
    {
        id: 'u7',
        name: '高橋 美咲',
        age: 21,
        university: '聖カタリナ大学',
        faculty: '人間健康福祉学部',
        bio: '人と話すことが大好きで、接客アルバイトを3年間続けています。福祉業界だけでなく、サービス業全般に興味があります。明るさと笑顔は誰にも負けません！',
        tags: ['接客', 'コミュニケーション', '福祉'],
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
        isOnline: true,
    },
    {
        id: 'u8',
        name: '伊藤 拓也',
        age: 20,
        university: '愛媛大学',
        faculty: '社会共創学部',
        bio: '地域活性化ボランティアに参加し、多世代の方と協働する楽しさを知りました。まだやりたいことは明確ではありませんが、色々な企業の話を聞いてみたいです。',
        tags: ['地域活性化', 'ボランティア', '好奇心旺盛'],
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        isOnline: false,
    },
    {
        id: 'u9',
        name: '渡辺 結衣',
        age: 22,
        university: '松山東雲女子大学',
        faculty: '人文科学部',
        bio: '英語の教員免許取得見込みです。教育業界だけでなく、グローバルに展開する愛媛の企業で、語学力を活かした仕事がしたいです。',
        tags: ['英語', 'グローバル', '教職'],
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
        isOnline: false,
    }
];


export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            authStatus: 'unauthenticated',
            activeRole: 'seeker', // Default role but not logged in
            personaMode: 'seeker',
            currentUserId: '',
            currentCompanyId: '',

            users: INITIAL_USERS,
            companies: COMPANIES,
            jobs: JOBS,
            courses: [], // Will be fetched via API

            userAnalysis: {
                isFortuneIntegrated: true,
                fortune: {
                    dayMaster: '甲',
                    traits: ['誠実', '向上心', '体系的思考']
                },
                diagnosisScores: {
                    // Category A: 構造力 (1-10)
                    1: 5, 2: 4, 3: 5, 4: 4, 5: 5, 6: 4, 7: 5, 8: 4, 9: 5, 10: 4,
                    // Category B: 創造力 (11-20)
                    11: 3, 12: 4, 13: 3, 14: 4, 15: 3, 16: 4, 17: 3, 18: 4, 19: 3, 20: 4,
                    // Category C: 共感力 (21-30)
                    21: 5, 22: 5, 23: 5, 24: 5, 25: 5, 26: 5, 27: 5, 28: 5, 29: 5, 30: 5,
                    // Category D: 行動力 (31-40)
                    31: 2, 32: 3, 33: 2, 34: 3, 35: 2, 36: 3, 37: 2, 38: 3, 39: 2, 40: 3,
                    // Category E: 受容力 (41-50)
                    41: 4, 42: 4, 43: 4, 44: 4, 45: 4, 46: 4, 47: 4, 48: 4, 49: 4, 50: 4
                },
                selectedValues: [1, 5, 12, 23, 45], // Assuming these are valid value card IDs
                publicValues: [1, 5, 23],
                strengths: { 'Comm': 80, 'Tech': 60, 'Mng': 70 }
            },

            chats: [],
            interactions: [],
            chatSettings: [],

            // Chat Preferences Defaults
            chatSortBy: 'date',
            chatFilterPriority: ['high', 'medium', 'low'],
            isCompactMode: false,
            completedLessonIds: [],
            lastViewedLessonIds: [],
            isLessonSidebarOpen: true,
            lastMoneySimulationInput: null,

            // Baby Base Init
            momProfile: null,
            bbSpecialists: BB_SPECIALISTS,
            bbEvents: BB_EVENTS,
            bbArticles: BB_ARTICLES,
            bbPosts: BB_POSTS,

            setChatSortBy: (sortBy) => set({ chatSortBy: sortBy }),
            toggleChatFilterPriority: (priority) => set((state) => {
                const current = state.chatFilterPriority;
                if (current.includes(priority)) {
                    return { chatFilterPriority: current.filter(p => p !== priority) };
                } else {
                    return { chatFilterPriority: [...current, priority] };
                }
            }),
            setCompactMode: (isCompact) => set({ isCompactMode: isCompact }),
            setLessonSidebarOpen: (isOpen) => set({ isLessonSidebarOpen: isOpen }),

            // Helper for invitations (Supabase Integration)
            invitations: [],
            createInvitation: async (orgId, role = 'member') => {
                const supabase = createClient();
                const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

                const { error } = await supabase.from('organization_invitations').insert({
                    organization_id: orgId,
                    token,
                    role,
                    expires_at: expiresAt
                });

                if (error) {
                    console.error('Failed to create invitation:', error);
                    toast.error('招待リンクの作成に失敗しました');
                    return null;
                }

                // Optimistic update for UI (optional, but good for feedback)
                // In a real app with real-time subscription, this might be redundant, but good for now.
                set(s => ({
                    invitations: [...s.invitations, {
                        id: 'temp_' + token,
                        organizationId: orgId,
                        token,
                        role,
                        expiresAt: Date.now() + 86400000,
                        isUsed: false
                    }]
                }));

                return token;
            },
            consumeInvitation: async (token, userId) => {
                const supabase = createClient();
                const { data, error } = await supabase.rpc('join_organization_via_token', { token_input: token });

                if (error) {
                    console.error('RPC Error:', error);
                    return false;
                }

                if (!data || data.success === false) {
                    console.error('Join failed:', data?.message);
                    return false;
                }

                toast.success('組織に参加しました！');
                return true;
            },

            // User Actions
            loginAs: (role, userId, companyId) => {
                set({
                    authStatus: 'authenticated',
                    activeRole: role,
                    // Use provided ID or fallback to demo ID if missing (for legacy calls)
                    currentUserId: userId || (role === 'admin' ? 'u_admin' : 'u_yuji'),
                    currentCompanyId: companyId || 'c_eis',
                });
                // Fetch analysis if seeker login
                if (role === 'seeker') {
                    const effectiveUserId = userId || 'u_yuji';
                    get().fetchUserAnalysis(effectiveUserId);
                }
            },

            logout: async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                // localStorage.removeItem('eis-app-store-v3'); // Removed to prevent conflict with Zustand persist
                set({
                    authStatus: 'unauthenticated',
                    activeRole: 'seeker',
                    currentUserId: '',
                    currentCompanyId: ''
                });
            },

            updateUser: (userId: string, updates: Partial<User>) => {
                set((state) => ({
                    users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
                }));
            },
            addUser: (user: User) => {
                set((state) => {
                    if (state.users.some(u => u.id === user.id)) return { users: state.users };
                    return { users: [...state.users, user] };
                });
            },
            switchRole: (role) => set({ activeRole: role }),
            setPersonaMode: (mode) => set({ personaMode: mode }),

            // Generic Interaction
            toggleInteraction: (type, fromId, toId, metadata) => {
                set((state) => {
                    const exists = state.interactions.find(
                        i => i.type === type && i.fromId === fromId && i.toId === toId
                    );
                    if (exists) {
                        return { interactions: state.interactions.filter(i => i !== exists) };
                    }
                    const newInteraction: Interaction = {
                        type, fromId, toId, metadata, timestamp: Date.now()
                    };
                    return { interactions: [...state.interactions, newInteraction] };
                });
            },

            sendMessage: (threadId, senderId, text, attachment, replyToId) => set((state) => ({
                chats: state.chats.map(chat => {
                    if (chat.id !== threadId) return chat;
                    return {
                        ...chat,
                        messages: [...chat.messages, {
                            id: `msg_${Date.now()} `,
                            senderId,
                            text,
                            timestamp: Date.now(),
                            isRead: false,
                            attachment,
                            replyToId
                        }],
                        updatedAt: Date.now()
                    };
                })
            })),

            deleteMessage: (threadId, messageId) => set((state) => ({
                chats: state.chats.map(chat => {
                    if (chat.id !== threadId) return chat;
                    return {
                        ...chat,
                        messages: chat.messages.filter(m => m.id !== messageId),
                        updatedAt: Date.now() // Optional: update timestamp on delete? Maybe not.
                    };
                })
            })),

            createChat: (companyId, userId, initialMessage) => {
                const state = get();
                const existing = state.chats.find(c => c.companyId === companyId && c.userId === userId);
                if (existing) return existing.id;

                const newId = `chat_${Date.now()} `;
                const newChat: ChatThread = {
                    id: newId,
                    companyId,
                    userId,
                    messages: initialMessage ? [{
                        id: `msg_${Date.now()} `,
                        senderId: get().activeRole === 'company' ? companyId : userId,
                        // simple heuristic: if created by company, sender is companyId
                        text: initialMessage,
                        timestamp: Date.now(),
                        isRead: false
                    }] : [],
                    updatedAt: Date.now()
                };

                set(s => ({ chats: [newChat, ...s.chats] }));
                return newId;
            },

            markAsRead: (threadId, readerId) => set(state => ({
                chats: state.chats.map(chat => {
                    if (chat.id !== threadId) return chat;
                    // Mark messages NOT sent by reader as read
                    const updatedMessages = chat.messages.map(m =>
                        m.senderId !== readerId ? { ...m, isRead: true } : m
                    );
                    return { ...chat, messages: updatedMessages };
                })
            })),

            addInteraction: (interaction) => set(state => ({
                interactions: [...state.interactions, { ...interaction, timestamp: Date.now() }]
            })),

            removeInteraction: (type, fromId, toId) => set(state => ({
                interactions: state.interactions.filter(i =>
                    !(i.type === type && i.fromId === fromId && i.toId === toId)
                )
            })),

            addJob: (job) => set((state) => ({
                jobs: [job, ...state.jobs]
            })),

            updateJob: (jobId, updates) => set((state) => ({
                jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, ...updates } : j))
            })),

            deleteJob: (jobId) => set((state) => ({
                jobs: state.jobs.filter((j) => j.id !== jobId)
            })),

            updateChatSettings: (ownerId, chatId, newSettings) => set(state => {
                const existingIndex = state.chatSettings.findIndex(cs => cs.ownerId === ownerId && cs.chatId === chatId);
                if (existingIndex > -1) {
                    const updated = [...state.chatSettings];
                    updated[existingIndex] = { ...updated[existingIndex], ...newSettings };
                    return { chatSettings: updated };
                } else {
                    const newItem: ChatSettings = {
                        ownerId, chatId, isPinned: false, isBlocked: false, isUnreadManual: false, priority: 'medium', memo: '', alias: '', ...newSettings
                    };
                    return { chatSettings: [...state.chatSettings, newItem] };
                }
            }),

            completeLesson: (lessonId) => {
                set(state => ({
                    completedLessonIds: state.completedLessonIds.includes(lessonId)
                        ? state.completedLessonIds
                        : [...state.completedLessonIds, lessonId]
                }));

                // Bridge to Game: Grant rewards if game is initialized
                const gameStore = useGameStore.getState();
                if (gameStore.isInitialized) {
                    gameStore.addExperience(50);
                    gameStore.updateStats({ skill: useGameStore.getState().stats.skill + 2 });
                    toast.success('e-ラーニング完了報酬！ゲームの経験値+50、技術+2を獲得しました。', {
                        icon: '🏆',
                        duration: 5000
                    });
                }
            },

            updateLastViewedLesson: (lessonId) => set(state => ({
                lastViewedLessonIds: [lessonId, ...state.lastViewedLessonIds.filter(id => id !== lessonId)].slice(0, 10)
            })),

            fetchCourses: async () => {
                try {
                    const response = await fetch('/api/elearning');
                    const data = await response.json();
                    set({ courses: data });
                } catch (error) {
                    console.error('Failed to fetch courses:', error);
                }
            },

            addCourses: async (newCourses) => {
                try {
                    const response = await fetch('/api/elearning', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newCourses)
                    });
                    const result = await response.json();
                    if (result.success) {
                        get().fetchCourses();
                    }
                } catch (error) {
                    console.error('Failed to add courses:', error);
                }
            },

            updateCourse: async (course) => {
                try {
                    const response = await fetch('/api/elearning', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(course)
                    });
                    const result = await response.json();
                    if (result.success) {
                        toast.success('コースを更新しました');
                        get().fetchCourses();
                    }
                } catch (error) {
                    console.error('Failed to update course:', error);
                    toast.error('更新に失敗しました');
                }
            },

            deleteCourse: async (id) => {
                try {
                    const response = await fetch(`/api/elearning?id=${id}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    if (result.success) {
                        toast.success('コースを削除しました');
                        get().fetchCourses();
                    }
                } catch (error) {
                    console.error('Failed to delete course:', error);
                    toast.error('削除に失敗しました');
                }
            },

            upsertCompany: (company) => set(state => {
                const exists = state.companies.some(c => c.id === company.id);
                if (exists) {
                    return { companies: state.companies.map(c => c.id === company.id ? { ...c, ...company } : c) };
                }
                return { companies: [...state.companies, company] };
            }),

            upsertUser: (user) => set(state => {
                const exists = state.users.some(u => u.id === user.id);
                if (exists) {
                    return { users: state.users.map(u => u.id === user.id ? { ...u, ...user } : u) };
                }
                return { users: [...state.users, user] };
            }),

            getChat: (threadId) => get().chats.find(c => c.id === threadId),
            getUserChats: (userId) => get().chats.filter(c => c.userId === userId).sort((a, b) => b.updatedAt - a.updatedAt),
            getCompanyChats: (companyId) => get().chats.filter(c => c.companyId === companyId).sort((a, b) => b.updatedAt - a.updatedAt),

            setAnalysisResults: (results) => {
                set(state => ({
                    userAnalysis: { ...state.userAnalysis, ...results }
                }));
                const state = get();
                if (state.authStatus === 'authenticated' && state.currentUserId) {
                    state.saveUserAnalysis(state.currentUserId);
                }
            },
            setDiagnosisScore: (questionId, score) => {
                set(state => {
                    const diagnosisScores = { ...state.userAnalysis.diagnosisScores, [questionId]: score };
                    return {
                        userAnalysis: { ...state.userAnalysis, diagnosisScores }
                    };
                });
                const state = get();
                if (state.authStatus === 'authenticated' && state.currentUserId) {
                    state.saveUserAnalysis(state.currentUserId);
                }
            },
            toggleFortuneIntegration: () => {
                set(state => ({
                    userAnalysis: { ...state.userAnalysis, isFortuneIntegrated: !state.userAnalysis.isFortuneIntegrated }
                }));
                const state = get();
                if (state.authStatus === 'authenticated' && state.currentUserId) {
                    state.saveUserAnalysis(state.currentUserId);
                }
            },
            togglePublicValue: (valueId) => {
                set(state => {
                    const current = state.userAnalysis.publicValues || [];
                    const updated = current.includes(valueId)
                        ? current.filter(id => id !== valueId)
                        : current.length < 5 ? [...current, valueId] : current;

                    // Sync with users array
                    const users = state.users.map(u =>
                        u.id === state.currentUserId ? { ...u, publicValues: updated } : u
                    );

                    return {
                        users,
                        userAnalysis: { ...state.userAnalysis, publicValues: updated }
                    };
                });
                const state = get();
                if (state.authStatus === 'authenticated' && state.currentUserId) {
                    state.saveUserAnalysis(state.currentUserId);
                }
            },
            setMoneySimulationInput: (input) => set({ lastMoneySimulationInput: input }),
            hasInteraction: (type, fromId, toId) => get().interactions.some(i =>
                i.type === type && i.fromId === fromId && i.toId === toId
            ),
            getChatSettingsHelper: (ownerId, chatId) => get().chatSettings.find(cs => cs.ownerId === ownerId && cs.chatId === chatId),
            isLessonCompleted: (lessonId) => get().completedLessonIds.includes(lessonId),
            getLastViewedLesson: () => get().lastViewedLessonIds[0],

            // Baby Base Action Implementations
            updateMomProfile: (updates) => set((state) => ({
                momProfile: state.momProfile ? { ...state.momProfile, ...updates } : { userId: state.currentUserId, children: [], location: '', interests: [], ...updates }
            })),
            addChild: (child) => set((state) => ({
                momProfile: state.momProfile
                    ? { ...state.momProfile, children: [...state.momProfile.children, child] }
                    : { userId: state.currentUserId, children: [child], location: '', interests: [] }
            })),
            removeChild: (childId) => set((state) => ({
                momProfile: state.momProfile
                    ? { ...state.momProfile, children: state.momProfile.children.filter(c => c.id !== childId) }
                    : null
            })),

            // User Analysis Persistence Implementation
            fetchUserAnalysis: async (userId) => {
                if (!userId) return;
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('user_analysis')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (error) {
                    console.log('No analysis data found or error:', error.message);
                    return;
                }

                if (data) {
                    set(state => ({
                        userAnalysis: {
                            ...state.userAnalysis,
                            diagnosisScores: data.diagnosis_scores || state.userAnalysis.diagnosisScores,
                            selectedValues: data.selected_values || state.userAnalysis.selectedValues,
                            publicValues: data.public_values || state.userAnalysis.publicValues,
                            isFortuneIntegrated: data.is_fortune_integrated ?? state.userAnalysis.isFortuneIntegrated,
                            fortune: {
                                dayMaster: state.userAnalysis.fortune?.dayMaster || '甲',
                                traits: data.fortune_traits || state.userAnalysis.fortune?.traits || []
                            }
                        }
                    }));
                }
            },

            saveUserAnalysis: async (userId, data) => {
                if (!userId) return;
                const currentState = get().userAnalysis; // Get latest state
                const payload = {
                    user_id: userId,
                    diagnosis_scores: currentState.diagnosisScores,
                    selected_values: currentState.selectedValues,
                    public_values: currentState.publicValues,
                    is_fortune_integrated: currentState.isFortuneIntegrated,
                    fortune_traits: currentState.fortune?.traits,
                    updated_at: new Date().toISOString(),
                    ...data // Allow overriding
                };

                const supabase = createClient();
                const { error } = await supabase
                    .from('user_analysis')
                    .upsert(payload);

                if (error) {
                    console.error('Failed to save analysis:', error);
                }
            },
        }),
        {
            name: 'eis-app-store-v3',
        }
    )
);
