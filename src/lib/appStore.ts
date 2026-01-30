import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company, Job, Course } from '@/types/shared';
import { UserAnalysis } from './types/analysis';
import { LifePlanInput } from './money-simulation/types';
import { MomProfile, ChildProfile, Specialist, BabyBaseEvent, LearningArticle, SpecialistPost } from './types/babybase';
import { BB_SPECIALISTS, BB_EVENTS, BB_ARTICLES, BB_POSTS } from './babybaseData';
import { useGameStore } from './gameStore';
import { toast } from 'sonner';
import { getFallbackAvatarUrl } from './avatarUtils';
import { createClient } from '@/utils/supabase/client';
import { fetchAdminStats, fetchQuestsAction, fetchJobsAction, fetchPublicCompaniesAction } from '@/app/admin/actions';
import { fetchUserAnalysisAction, saveUserAnalysisAction } from '@/app/analysis/actions';
import { toggleInteractionAction, resetInteractionsAction, fetchUserInteractionsAction } from '@/app/actions/interactions';
import { VALUE_CARDS, DIAGNOSIS_QUESTIONS } from './constants/analysisData';

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
    lastName?: string;
    firstName?: string;
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
    gender?: string;
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
    isSystem?: boolean;
}

export interface ChatThread {
    id: string;
    companyId: string;
    userId: string;
    messages: Message[];
    updatedAt: number;
}

export interface Interaction {
    type: 'like_company' | 'like_job' | 'like_user' | 'apply' | 'scout' | 'like_quest' | 'like_reel';
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
    userRecommendations: any[]; // UserCourseRecommendation[]

    // Chat Preferences
    chatSortBy: 'date' | 'priority';
    chatFilterPriority: ('high' | 'medium' | 'low')[];
    isCompactMode: boolean;
    isLessonSidebarOpen: boolean;
    isFetching: boolean; // General/Global loading (deprecated for specific guards)
    isFetchingJobs: boolean;
    isFetchingCompanies: boolean;
    isFetchingUsers: boolean;
    isFetchingChats: boolean;
    isFetchingCourses: boolean;
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
    resetState: () => void;
    switchRole: (role: 'seeker' | 'company' | 'admin') => void;
    setPersonaMode: (mode: 'seeker' | 'reskill') => void;
    updateUser: (userId: string, updates: Partial<User>) => void;
    addUser: (user: User) => void;
    toggleInteraction: (type: Interaction['type'], fromId: string, toId: string, metadata?: any) => void;
    resetInteractions: (targetType?: 'quest' | 'job' | 'company' | 'reel') => Promise<void>;
    fetchInteractions: () => Promise<void>;

    // Chat Actions
    sendMessage: (threadId: string, senderId: string, text: string, attachment?: Attachment, replyToId?: string) => Promise<void>;
    deleteMessage: (threadId: string, messageId: string) => void;
    createChat: (companyId: string, userId: string, initialMessage?: string, systemMessage?: string) => Promise<string>; // returns threadId
    fetchChats: () => Promise<void>;
    markAsRead: (threadId: string, readerId: string) => void;

    // Interaction Actions
    addInteraction: (interaction: Omit<Interaction, 'timestamp'>) => void;
    removeInteraction: (type: Interaction['type'], fromId: string, toId: string) => void;
    // Job Actions
    addJob: (job: Job) => void;
    updateJob: (jobId: string, updates: Partial<Job>) => void;
    deleteJob: (jobId: string) => void;
    fetchJobs: () => Promise<void>;

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
    fetchUserRecommendations: (userId: string) => Promise<void>;
    generateRecommendations: (userId: string, selectedValues: number[]) => Promise<void>;
    resetRecommendations: (userId: string) => Promise<void>;

    // Data Sync Actions
    upsertCompany: (company: Company) => void;
    upsertUser: (user: User) => void;
    fetchUsers: () => Promise<void>;
    fetchCompanies: () => Promise<void>;

    // Analysis Actions
    setAnalysisResults: (results: Partial<UserAnalysis>) => void;
    setDiagnosisScore: (questionId: number, score: number) => void;
    setAllDiagnosisScores: (scores: Record<number, number>) => void;
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
const INITIAL_USERS: User[] = [];


export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            authStatus: 'unauthenticated',
            activeRole: 'seeker', // Default role but not logged in
            personaMode: 'seeker',
            currentUserId: '',
            currentCompanyId: '',

            users: INITIAL_USERS,
            companies: [],
            jobs: [],
            courses: [], // Will be fetched via API

            userAnalysis: {
                isFortuneIntegrated: false,
                fortune: undefined,
                diagnosisScores: {},
                selectedValues: [],
                publicValues: [],
                strengths: {}
            },

            chats: [],
            interactions: [],
            chatSettings: [],
            isFetching: false,
            isFetchingJobs: false,
            isFetchingCompanies: false,
            isFetchingUsers: false,
            isFetchingChats: false,
            isFetchingCourses: false,

            // Chat Preferences Defaults
            chatSortBy: 'date',
            chatFilterPriority: ['high', 'medium', 'low'],
            isCompactMode: false,
            completedLessonIds: [],
            lastViewedLessonIds: [],
            userRecommendations: [],
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
                // Auto-fill ID for admin if missing
                if (role === 'admin' && !userId) {
                    userId = 'admin_sys';
                }

                if (!userId) {
                    console.error('loginAs called without userId!');
                    return;
                }

                console.log('Logging in as:', { role, userId, companyId });

                set({
                    authStatus: 'authenticated',
                    activeRole: role,
                    currentUserId: userId,
                    currentCompanyId: companyId || 'c_eis',
                });

                // Fetch analysis if seeker login
                if (role === 'seeker') {
                    get().fetchUserAnalysis(userId);
                }
                // Always fetch interactions and users
                get().fetchInteractions();
                get().fetchUsers();
            },

            resetState: () => {
                console.log('AppStore: Resetting state');
                set({
                    authStatus: 'unauthenticated',
                    activeRole: 'seeker',
                    currentUserId: '',
                    currentCompanyId: ''
                });
                try {
                    localStorage.removeItem('eis-app-store-v3');
                    localStorage.removeItem('sb-wiq...-auth-token');
                } catch (e) {
                    console.error('LocalStorage clear failed', e);
                }
            },

            logout: async () => {
                console.log('AppStore: Logout called');

                // 1. Reset State
                get().resetState();

                // 2. Call Supabase SignOut
                const supabase = createClient();
                try {
                    await supabase.auth.signOut();
                } catch (e) {
                    console.error('Supabase SignOut failed', e);
                }
            },

            updateUser: async (userId: string, updates: Partial<User>) => {
                // 1. Update local state for immediate feedback
                set((state) => ({
                    users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
                }));

                // 2. Persist to Supabase
                const supabase = createClient();
                const dbUpdates: any = {};
                if (updates.name !== undefined) dbUpdates.full_name = updates.name;
                if (updates.university !== undefined) dbUpdates.school_name = updates.university;
                if (updates.faculty !== undefined) dbUpdates.department = updates.faculty;
                if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
                if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
                if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
                if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
                if (updates.birthDate !== undefined) dbUpdates.dob = updates.birthDate;
                if (updates.image !== undefined) dbUpdates.avatar_url = updates.image;

                if (Object.keys(dbUpdates).length > 0) {
                    const { error } = await supabase
                        .from('profiles')
                        .update(dbUpdates)
                        .eq('id', userId);

                    if (error) {
                        console.error('Failed to sync profile update to DB:', error);
                        toast.error('プロフィールの保存に失敗しました');
                    }
                }
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
            toggleInteraction: async (type, fromId, toId, metadata) => {
                const state = get();
                const exists = state.interactions.some(
                    i => i.type === type && i.fromId === fromId && i.toId === toId
                );

                // Optimistic Update
                if (exists) {
                    set({
                        interactions: state.interactions.filter(
                            i => !(i.type === type && i.fromId === fromId && i.toId === toId)
                        )
                    });
                    if (type.startsWith('like_')) {
                        toast.success('お気に入りから削除しました', { duration: 1500 });
                    }
                } else {
                    const newInteraction: Interaction = {
                        type, fromId, toId, metadata, timestamp: Date.now()
                    };
                    set({ interactions: [...state.interactions, newInteraction] });
                    if (type.startsWith('like_')) {
                        toast.success('お気に入りに保存しました！', { duration: 1500, icon: '❤️' });
                    }
                }

                // DB Sync
                try {
                    await toggleInteractionAction(type, fromId, toId, metadata);
                } catch (error: any) {
                    console.error('Interaction sync failed:', error);
                    toast.error(`保存に失敗しました: ${error.message || 'Unknown error'}`);
                }
            },

            fetchInteractions: async () => {
                const { currentUserId, isFetching } = get();
                if (!currentUserId || isFetching) return;
                set({ isFetching: true });

                try {
                    const supabase = createClient();
                    const { data, error } = await supabase
                        .from('interactions')
                        .select('*')
                        .eq('user_id', currentUserId);

                    if (error) {
                        console.error('Failed to fetch interactions:', error);
                        return;
                    }

                    if (data) {
                        const interactions: Interaction[] = data.map((i: any) => ({
                            type: i.type,
                            fromId: i.user_id,
                            toId: i.target_id,
                            metadata: i.metadata,
                            timestamp: new Date(i.created_at).getTime()
                        }));
                        set({ interactions });
                    }
                } finally {
                    set({ isFetching: false });
                }
            },

            sendMessage: async (threadId, senderId, text, attachment, replyToId) => {
                const supabase = createClient();
                const newMessage = {
                    chat_id: threadId,
                    sender_id: senderId,
                    content: text,
                    attachment_url: attachment?.url,
                    attachment_type: attachment?.type,
                    attachment_name: attachment?.name,
                    is_read: false
                };

                const { data, error } = await supabase.from('messages').insert(newMessage).select().single();

                if (error) {
                    console.error('Failed to send message:', error);
                    toast.error('メッセージの送信に失敗しました');
                    return;
                }

                // Optimistic update or fetch
                get().fetchChats();
            },

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

            createChat: async (companyId, userId, initialMessage, systemMessage) => {
                const state = get();
                const existing = state.chats.find(c => c.companyId === companyId && c.userId === userId);
                if (existing) return existing.id;

                const supabase = createClient();

                // 1. Create Chat Room
                const { data: chatData, error: chatError } = await supabase
                    .from('casual_chats')
                    .insert({ company_id: companyId, user_id: userId })
                    .select()
                    .single();

                if (chatError) {
                    // Check if it already exists (constraint violation)
                    if (chatError.code === '23505') { // unique_violation
                        const { data: existingChat } = await supabase
                            .from('casual_chats')
                            .select('id')
                            .eq('company_id', companyId)
                            .eq('user_id', userId)
                            .single();
                        if (existingChat) return existingChat.id;
                    }
                    console.error('Failed to create chat:', chatError);
                    toast.error('チャットの作成に失敗しました');
                    throw chatError;
                }

                const chatId = chatData.id;

                // 2. Add Initial Message
                if (initialMessage) {
                    const senderId = get().activeRole === 'company' ? companyId : userId;
                    await supabase.from('messages').insert({
                        chat_id: chatId,
                        sender_id: senderId,
                        content: initialMessage
                    });
                }

                // 3. Add System Message
                if (systemMessage) {
                    await supabase.from('messages').insert({
                        chat_id: chatId,
                        sender_id: 'SYSTEM', // Special sender or company as fallback
                        content: systemMessage,
                        metadata: { is_system: true }
                    });
                }

                await get().fetchChats();
                return chatId;
            },

            fetchChats: async () => {
                const { isFetchingChats } = get();
                if (isFetchingChats) return;
                set({ isFetchingChats: true });

                try {
                    const supabase = createClient();
                    const { activeRole, currentUserId, currentCompanyId } = get();

                    // Fetch Logic depending on role
                    // Since RLS policies handle visibility, we can just select all relevant chats
                    const { data: chatsData, error } = await supabase
                        .from('casual_chats')
                        .select(`
                            *,
                            messages (*)
                        `)
                        .order('updated_at', { ascending: false });

                    if (error) {
                        console.error('Failed to fetch chats:', error);
                        return;
                    }

                    if (chatsData) {
                        const mappedChats: ChatThread[] = chatsData.map((c: any) => ({
                            id: c.id,
                            companyId: c.company_id,
                            userId: c.user_id,
                            updatedAt: new Date(c.updated_at).getTime(),
                            messages: (c.messages || []).map((m: any) => ({
                                id: m.id,
                                senderId: m.sender_id,
                                text: m.content,
                                timestamp: new Date(m.created_at).getTime(),
                                isRead: m.is_read,
                                isSystem: m.metadata?.is_system || m.sender_id === 'SYSTEM',
                                attachment: m.attachment_url ? {
                                    id: m.id + '_att',
                                    type: m.attachment_type as 'image' | 'file',
                                    url: m.attachment_url,
                                    name: m.attachment_name || 'file',
                                } : undefined
                            })).sort((a: any, b: any) => a.timestamp - b.timestamp)
                        }));
                        set({ chats: mappedChats });
                    }
                } finally {
                    set({ isFetchingChats: false });
                }
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
                const { isFetchingCourses } = get();
                if (isFetchingCourses) return;
                set({ isFetchingCourses: true });

                try {
                    const response = await fetch('/api/elearning');
                    const data = await response.json();

                    if (Array.isArray(data)) {
                        set({ courses: data });
                    } else {
                        console.error('Invalid courses data:', data);
                        // If data has error property, log it
                        if (data?.error) {
                            console.error('API Error:', data.error);
                        }
                        set({ courses: [] });
                    }
                } catch (error) {
                    console.error('Failed to fetch courses:', error);
                    set({ courses: [] });
                } finally {
                    set({ isFetchingCourses: false });
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

            fetchUserRecommendations: async (userId) => {
                try {
                    const response = await fetch(`/api/analysis/recommendations?userId=${userId}`);
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        set({ userRecommendations: data });
                    }
                } catch (error) {
                    console.error('Failed to fetch recommendations:', error);
                }
            },

            generateRecommendations: async (userId, selectedValues) => {
                try {
                    const response = await fetch('/api/analysis/recommendations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, selectedValues })
                    });
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        set({ userRecommendations: data });
                    }
                } catch (error) {
                    console.error('Failed to generate recommendations:', error);
                }
            },

            resetRecommendations: async (userId) => {
                try {
                    await fetch(`/api/analysis/recommendations?userId=${userId}`, {
                        method: 'DELETE'
                    });
                    set({ userRecommendations: [] });
                } catch (error) {
                    console.error('Failed to reset recommendations:', error);
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

            fetchUsers: async () => {
                if (get().isFetchingUsers) return;
                set({ isFetchingUsers: true });

                try {
                    const supabase = createClient();
                    const { data, error } = await supabase.from('profiles').select('*');
                    if (error) {
                        console.error('Failed to fetch users:', error);
                        return;
                    }
                    if (data) {
                        // Map Supabase profiles to AppStore User objects
                        const mappedUsers: User[] = data.map((p: any) => ({
                            id: p.id,
                            name: p.full_name || 'Guest',
                            age: 21, // Default or calc from birthday
                            university: p.school_name || p.university || '未設定',
                            faculty: p.department || '',
                            bio: p.bio || '',
                            tags: [],
                            image: p.avatar_url || p.image || getFallbackAvatarUrl(p.id, p.gender),
                            isOnline: false,
                            lastName: p.last_name,
                            firstName: p.first_name,
                            birthDate: p.dob || p.birth_date,
                            gender: p.gender,
                            // Map other fields as necessary
                            qualifications: [],
                            skills: [],
                            workHistory: []
                        }));
                        set({ users: mappedUsers });
                    }
                } finally {
                    set({ isFetchingUsers: false });
                }
            },

            fetchCompanies: async () => {
                const { isFetchingCompanies } = get();
                if (isFetchingCompanies) return;
                set({ isFetchingCompanies: true });

                try {
                    console.log('AppStore: fetchCompanies called. Calling server action directly...');
                    // const { fetchPublicCompaniesAction } = await import('@/app/admin/actions');
                    const result = await fetchPublicCompaniesAction();
                    console.log('AppStore: fetchPublicCompaniesAction result:', result?.success, result?.data?.length);

                    if (result.success && result.data) {
                        set({ companies: result.data as any[] });
                    } else {
                        console.error('Failed to fetch companies:', result.error);
                    }
                } finally {
                    set({ isFetchingCompanies: false });
                }
            },


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
                // Note: We avoid auto-saving here for every single click as it's too frequent.
                // We'll rely on explicit save calls or batch save later.
            },
            setAllDiagnosisScores: (scores) => {
                set(state => ({
                    userAnalysis: { ...state.userAnalysis, diagnosisScores: scores }
                }));
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
                const valueCard = VALUE_CARDS.find((v: any) => v.id === valueId);
                // 影の側面（isPositive=false）は公開不可
                if (!valueCard || !valueCard.isPositive) return;

                set(state => {
                    const current = state.userAnalysis.publicValues || [];
                    const isRemoving = current.includes(valueId);

                    // すでに3つ選択されている場合は、解除のみ可能
                    if (!isRemoving && current.length >= 3) return state;

                    const updated = isRemoving
                        ? current.filter(id => id !== valueId)
                        : [...current, valueId];

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
                const legacyId = 'u_yuji';
                const newId = '061fbf87-f36e-4612-80b4-dedc77b55d5e';
                const targetId = userId === legacyId ? newId : userId;

                if (!targetId) return;

                // Use Server Action to fetch data securely
                const result = await fetchUserAnalysisAction(targetId);

                if (!result.success || !result.data) {
                    // If failed or no data, we keep current (likely dummy) data
                    return;
                }

                // --- DATA INTEGRITY FIX ---
                // For users migrated from older versions (like Test Seeker), negative values might be missing.
                // We auto-repair this by checking if positive values exist without their negative pairs.
                let repairedSelectedValues = result.data.selectedValues || [];
                const diagnosisScores = result.data.diagnosisScores || {};
                const originalLength = repairedSelectedValues.length;

                // Set of IDs for O(1) lookup
                const selectedSet = new Set(repairedSelectedValues);

                // 1. Repair missing pairs for existing values
                DIAGNOSIS_QUESTIONS.forEach(q => {
                    if (selectedSet.has(q.positiveValueId) && !selectedSet.has(q.negativeValueId)) {
                        repairedSelectedValues.push(q.negativeValueId);
                        selectedSet.add(q.negativeValueId);
                    }
                });

                // 2. If we still don't have 5 pairs (10 items), recalculate from scores if available
                if (repairedSelectedValues.length < 10 && Object.keys(diagnosisScores).length > 0) {
                    // Recalculate top 5 based on scores
                    const rankedQuestions = [...DIAGNOSIS_QUESTIONS]
                        .map(q => ({ ...q, score: diagnosisScores[q.id] || 0 }))
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 5);

                    // Reset and rebuild
                    repairedSelectedValues = [];
                    rankedQuestions.forEach(q => {
                        repairedSelectedValues.push(q.positiveValueId);
                        repairedSelectedValues.push(q.negativeValueId);
                    });
                    console.log('AppStore: Full recalculation of traits performed due to insufficient data.');
                }

                if (repairedSelectedValues.length !== originalLength) {
                    console.log('AppStore: Auto-repaired missing negative trait values.');
                }
                // --------------------------

                const data = result.data;
                set(state => ({
                    userAnalysis: {
                        ...state.userAnalysis,
                        diagnosisScores: data.diagnosisScores || state.userAnalysis.diagnosisScores,
                        selectedValues: repairedSelectedValues.length > 0 ? repairedSelectedValues : (state.userAnalysis.selectedValues || []),
                        publicValues: data.publicValues || state.userAnalysis.publicValues,
                        isFortuneIntegrated: data.isFortuneIntegrated ?? state.userAnalysis.isFortuneIntegrated,
                        fortune: {
                            dayMaster: state.userAnalysis.fortune?.dayMaster || '甲',
                            traits: data.fortune?.traits || state.userAnalysis.fortune?.traits || []
                        }
                    }
                }));
            },

            fetchJobs: async () => {
                const { isFetchingJobs } = get();
                if (isFetchingJobs) return;
                set({ isFetchingJobs: true });

                try {
                    const result = await fetchJobsAction();
                    if (result.success && result.data) {
                        set({ jobs: result.data });
                    }
                } catch (error) {
                    console.error('Error fetching jobs in store:', error);
                } finally {
                    set({ isFetchingJobs: false });
                }
            },

            saveUserAnalysis: async (userId, data) => {
                if (!userId) return;

                const currentState = get().userAnalysis;
                const mergedData = {
                    ...currentState,
                    ...(data || {})
                };

                // 1. Update local state immediately for snappy UI
                if (data) {
                    set({ userAnalysis: mergedData });
                }

                // 2. Persist to server via Server Action
                const result = await saveUserAnalysisAction(userId, mergedData);

                if (!result.success) {
                    console.error('Failed to save analysis:', result.error);
                    toast.error('分析データの保存に失敗しました');
                }
            },


            resetInteractions: async (targetType) => {
                const { currentUserId, interactions, jobs } = get();
                if (!currentUserId) return;

                let newInteractions = [...interactions];

                if (!targetType) {
                    newInteractions = newInteractions.filter(i =>
                        !(i.fromId === currentUserId && ['like_company', 'like_job', 'like_quest', 'like_reel'].includes(i.type))
                    );
                } else if (targetType === 'company') {
                    newInteractions = newInteractions.filter(i => !(i.fromId === currentUserId && i.type === 'like_company'));
                } else if (targetType === 'job' || targetType === 'quest') {
                    newInteractions = newInteractions.filter(i => {
                        if (i.fromId !== currentUserId) return true;
                        if (i.type !== 'like_job' && i.type !== 'like_quest') return true;
                        // Handle case where job might not be in store yet (fallback to optimistic removal based on logic?)
                        const job = jobs.find(j => j.id === i.toId);
                        if (!job) return true;
                        return job.type !== targetType;
                    });
                } else if (targetType === 'reel') {
                    newInteractions = newInteractions.filter(i => !(i.fromId === currentUserId && i.type === 'like_reel'));
                }

                set({ interactions: newInteractions });

                try {
                    await resetInteractionsAction(currentUserId, targetType);
                    toast.success('リセットしました');
                } catch (error) {
                    console.error('Failed to reset interactions:', error);
                    toast.error('リセットに失敗しました');
                }
            },


        }),
        {
            name: 'eis-app-store-v3',
            partialize: (state) => ({
                authStatus: state.authStatus,
                activeRole: state.activeRole,
                personaMode: state.personaMode,
                currentUserId: state.currentUserId,
                currentCompanyId: state.currentCompanyId,
                users: state.users,
                companies: state.companies,
                jobs: state.jobs,
                userAnalysis: state.userAnalysis,
                chats: state.chats,
                interactions: state.interactions,
                chatSettings: state.chatSettings,
                completedLessonIds: state.completedLessonIds,
                lastViewedLessonIds: state.lastViewedLessonIds,
                userRecommendations: state.userRecommendations,
                chatSortBy: state.chatSortBy,
                chatFilterPriority: state.chatFilterPriority,
                isCompactMode: state.isCompactMode,
                isLessonSidebarOpen: state.isLessonSidebarOpen,
                momProfile: state.momProfile,
                lastMoneySimulationInput: state.lastMoneySimulationInput,
                invitations: state.invitations
                // Exclude isFetching flags
            }),
            onRehydrateStorage: () => (state) => {
                // Ensure flags are false on load
                if (state) {
                    state.isFetching = false;
                    state.isFetchingJobs = false;
                    state.isFetchingCompanies = false;
                    state.isFetchingUsers = false;
                    state.isFetchingChats = false;
                    state.isFetchingCourses = false;
                }
            }
        }
    )
);
