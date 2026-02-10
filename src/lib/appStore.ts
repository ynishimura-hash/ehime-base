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
import { fetchAdminStats, fetchQuestsAction, fetchJobsAction, fetchPublicCompaniesAction, fetchSystemSettingsAction, updateSystemSettingAction } from '@/app/admin/actions';
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
    skills?: string[];
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
    userType?: 'student' | 'worker' | 'company' | 'specialist' | 'admin' | 'instructor' | 'partner';
    occupationStatus?: 'student' | 'worker' | null;
    schoolType?: 'junior_high' | 'high_school' | 'university' | 'graduate' | 'junior_college' | 'vocational' | 'technical_college' | 'other' | null;
}

export interface Attachment {
    id: string;
    type: 'image' | 'file' | 'job' | 'quest' | 'company' | 'reel' | 'course';
    url: string;
    name: string;
    size?: string;
    itemId?: string; // ID of the referenced content
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
    id?: string;
    type: 'like_company' | 'like_job' | 'like_user' | 'apply' | 'scout' | 'like_quest' | 'like_reel';
    fromId: string; // userId or companyId
    toId: string; // companyId, jobId, or userId
    timestamp: number;
    metadata?: any; // e.g., scout message
    isRead?: boolean;
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
    activeRole: 'seeker' | 'company' | 'admin' | 'instructor';
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
    isFetchingSystemSettings: boolean;
    lastMoneySimulationInput: LifePlanInput | null;

    // Baby Base Data
    momProfile: MomProfile | null;
    bbSpecialists: Specialist[];
    bbEvents: BabyBaseEvent[];
    bbArticles: LearningArticle[];
    bbPosts: SpecialistPost[];
    systemSettings: Record<string, any>;

    // Actions
    loginAs: (role: 'seeker' | 'company' | 'admin' | 'instructor', userId?: string, companyId?: string) => void;
    logout: () => Promise<void>;
    resetState: () => void;
    switchRole: (role: 'seeker' | 'company' | 'admin' | 'instructor') => void;
    setPersonaMode: (mode: 'seeker' | 'reskill') => void;
    updateUser: (userId: string, updates: Partial<User>) => void;
    fetchSystemSettings: () => Promise<void>;
    updateSystemSetting: (key: string, value: any) => Promise<void>;
    addUser: (user: User) => void;
    toggleInteraction: (type: Interaction['type'], fromId: string, toId: string, metadata?: any) => void;
    resetInteractions: (targetType?: 'quest' | 'job' | 'company' | 'reel' | 'approach') => Promise<void>;
    markInteractionAsRead: (interactionId: string) => Promise<void>;
    fetchInteractions: () => Promise<void>;

    // Chat Actions
    sendMessage: (threadId: string, senderId: string, text: string, attachment?: Attachment, replyToId?: string, fileToUpload?: File) => Promise<void>;
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
    // Scout limit helpers
    getMonthlyScoutCount: (companyId: string) => number;
    canSendScout: (companyId: string) => boolean;
    // Search Presets
    searchPresets: SearchPreset[];
    addSearchPreset: (preset: Omit<SearchPreset, 'id' | 'timestamp'>) => void;
    deleteSearchPreset: (id: string) => void;
}

export interface SearchPreset {
    id: string;
    companyId: string;
    name: string;
    query: string;
    timestamp: number;
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
            isFetchingSystemSettings: false,
            systemSettings: {},

            // Chat Preferences Defaults
            chatSortBy: 'date',
            chatFilterPriority: ['high', 'medium', 'low'],
            isCompactMode: false,
            completedLessonIds: [],
            lastViewedLessonIds: [],
            userRecommendations: [],
            searchPresets: [],
            isLessonSidebarOpen: true,
            lastMoneySimulationInput: null,

            // Baby Base Init
            momProfile: null,
            bbSpecialists: BB_SPECIALISTS,
            bbEvents: BB_EVENTS,
            bbArticles: BB_ARTICLES,
            bbPosts: BB_POSTS,
            // systemSettings: {}, // Removing duplicate definition

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
                    currentCompanyId: companyId || (role === 'company' || role === 'instructor' ? 'c_eis' : ''),
                });

                // Fetch data based on role
                if (role === 'seeker') {
                    get().fetchUserAnalysis(userId);
                }

                // Instructor/Company/Admin specific data
                if (role === 'instructor' || role === 'company' || role === 'admin') {
                    get().fetchCourses();
                }

                // Always fetch interactions, users, and chats
                get().fetchInteractions();
                get().fetchUsers();
                get().fetchChats();
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

                // 2. Call Server Action to clear HttpOnly cookies
                // Dynamic import to avoid build issues if mixed envs
                try {
                    const { logoutAction } = await import('@/app/actions/auth');
                    await logoutAction();
                } catch (e) {
                    console.error('Server Action Logout failed:', e);
                }

                // 3. Call Client Supabase SignOut (Redundant but safe for local storage)
                const supabase = createClient();
                try {
                    await supabase.auth.signOut();
                } catch (e) {
                    console.warn('Client Supabase SignOut warning (might be already signed out):', e);
                }
            },

            updateUser: async (userId: string, updates: Partial<User>) => {
                // 1. Update local state for immediate feedback (Optimistic Update)
                set((state) => ({
                    users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
                }));

                // 2. Persist to Supabase
                const supabase = createClient();
                const dbUpdates: any = {};
                if (updates.name !== undefined) dbUpdates.full_name = updates.name;
                if (updates.university !== undefined) dbUpdates.school_name = updates.university;
                if (updates.faculty !== undefined) dbUpdates.department = updates.faculty;

                // New mappings
                // Note: using 'major' for department(学科) if exists.
                // Assuming 'department' column is occupied by faculty.
                if (updates.department !== undefined) dbUpdates.major = updates.department;
                if (updates.workHistory !== undefined) dbUpdates.work_history = updates.workHistory;

                if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
                if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
                if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
                if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
                // Empty string to null
                if (updates.birthDate !== undefined) dbUpdates.dob = updates.birthDate || null;
                if (updates.image !== undefined) dbUpdates.avatar_url = updates.image;
                if (updates.graduationYear !== undefined) dbUpdates.graduation_year = updates.graduationYear;
                if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
                if (updates.qualifications !== undefined) dbUpdates.qualifications = updates.qualifications;
                if (updates.portfolioUrl !== undefined) dbUpdates.portfolio_url = updates.portfolioUrl;
                if (updates.desiredConditions !== undefined) dbUpdates.desired_conditions = updates.desiredConditions;
                if (updates.schoolType !== undefined) dbUpdates.school_type = updates.schoolType;
                if (updates.occupationStatus !== undefined) dbUpdates.occupation_status = updates.occupationStatus;

                if (Object.keys(dbUpdates).length > 0) {
                    console.log('AppStore: Starting DB update...', dbUpdates);
                    try {
                        // Create a promise for the update
                        const updatePromise = supabase
                            .from('profiles')
                            .update(dbUpdates)
                            .eq('id', userId);

                        // Create a promise that rejects after 10 seconds
                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Update timeout')), 10000)
                        );

                        // Race them
                        const result: any = await Promise.race([updatePromise, timeoutPromise]);
                        const { error: updateError } = result;

                        if (updateError) {
                            console.error('AppStore: DB update failed:', updateError);
                            // Revert optimistic update
                            set((state) => ({
                                users: state.users.map((u) => {
                                    // ideally revert to original
                                    return u;
                                })
                            }));
                            get().fetchUsers();
                            throw new Error(updateError.message || 'Update failed');
                        }

                        console.log('AppStore: DB update completed successfully.');
                    } catch (e: any) {
                        console.error('AppStore: Unexpected error during DB update:', e);
                        // toast.error is handled by caller or here?
                        // Better to throw so caller handles UI state (loading)
                        throw e;
                    }

                    // 2. Fetch latest data explicitly
                    // ... (Fetch logic remains same, abstracted or kept)
                    // Ensuring we fetch latest is good practice.
                    try {
                        const { data, error: fetchError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', userId)
                            .single();

                        if (!fetchError && data) {
                            set((state) => ({
                                users: state.users.map((u) => {
                                    if (u.id === userId) {
                                        return {
                                            ...u,
                                            name: data.full_name || u.name,
                                            lastName: data.last_name || u.lastName,
                                            firstName: data.first_name || u.firstName,
                                            university: data.school_name || data.university || u.university,
                                            faculty: data.department || u.faculty, // Mapping back
                                            department: data.major || u.department, // Tentative mapping back
                                            bio: data.bio || u.bio,
                                            image: data.avatar_url || data.image || u.image,
                                            gender: data.gender || u.gender,
                                            birthDate: data.dob || data.birth_date || u.birthDate,
                                            graduationYear: data.graduation_year || u.graduationYear,
                                            qualifications: data.qualifications || u.qualifications,
                                            skills: data.skills || u.skills,
                                            workHistory: data.work_history || u.workHistory,
                                            portfolioUrl: data.portfolio_url || u.portfolioUrl,
                                            desiredConditions: data.desired_conditions || u.desiredConditions,
                                            userType: data.user_type || u.userType,
                                            occupationStatus: data.occupation_status || u.occupationStatus,
                                            schoolType: data.school_type || u.schoolType,
                                        };
                                    }
                                    return u;
                                }),
                            }));
                        }
                    } catch (e) {
                        console.warn('AppStore: Error during re-fetch:', e);
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

            getMonthlyScoutCount: (companyId) => {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

                return get().interactions.filter(i =>
                    i.type === 'scout' &&
                    i.fromId === companyId &&
                    i.timestamp >= startOfMonth
                ).length;
            },

            canSendScout: (companyId) => {
                return get().getMonthlyScoutCount(companyId) < 10;
            },

            addSearchPreset: (preset) => {
                const id = Math.random().toString(36).substring(2, 9);
                set((state) => ({
                    searchPresets: [
                        { ...preset, id, timestamp: Date.now() },
                        ...state.searchPresets.filter(p => p.companyId === preset.companyId).slice(0, 2),
                        ...state.searchPresets.filter(p => p.companyId !== preset.companyId)
                    ]
                }));
                toast.success('検索条件を保存しました (最大3件)');
            },

            deleteSearchPreset: (id) => set((state) => ({
                searchPresets: state.searchPresets.filter(p => p.id !== id)
            })),

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
                    const result = await toggleInteractionAction(type, fromId, toId, metadata);

                    if (!result || !result.success) {
                        const errorMessage = (result?.error as any)?.message || 'Server action failed';
                        throw new Error(errorMessage);
                    }
                } catch (error: any) {
                    console.error('Interaction sync failed:', error);
                    toast.error(`保存に失敗しました: ${error.message || 'Unknown error'}`);

                    // Revert Optimistic Update
                    const currentState = get(); // Re-fetch state
                    if (exists) {
                        // Was "removed" optimistically, so add it back
                        const restoredInteraction: Interaction = {
                            type, fromId, toId, metadata, timestamp: Date.now()
                        };
                        set({ interactions: [...currentState.interactions, restoredInteraction] });
                    } else {
                        // Was "added" optimistically, so remove it
                        set({
                            interactions: currentState.interactions.filter(
                                i => !(i.type === type && i.fromId === fromId && i.toId === toId)
                            )
                        });
                    }
                }
            },

            resetInteractions: async (targetType) => {
                const { currentUserId } = get();
                if (!currentUserId) return;
                try {
                    const { resetInteractionsAction } = await import('@/app/actions/interactions');
                    const result = await resetInteractionsAction(currentUserId, targetType);
                    if (!result.success) throw result.error;
                    await get().fetchInteractions();
                } catch (error) {
                    console.error('Failed to reset interactions:', error);
                }
            },

            fetchInteractions: async () => {
                const { currentUserId } = get();
                if (!currentUserId) return;

                try {
                    const supabase = createClient();
                    // Fetch both interactions FROM the user and TO the user
                    const { data, error } = await supabase
                        .from('interactions')
                        .select('*')
                        .or(`user_id.eq.${currentUserId},target_id.eq.${currentUserId}`);

                    if (error) {
                        console.error('Failed to fetch interactions:', error);
                        return;
                    }

                    if (data) {
                        const interactions: Interaction[] = data.map((i: any) => ({
                            id: i.id,
                            type: i.type,
                            fromId: i.user_id,
                            toId: i.target_id,
                            metadata: i.metadata,
                            isRead: i.is_read,
                            timestamp: new Date(i.created_at).getTime()
                        }));
                        set({ interactions });
                    }
                } catch (error) {
                    console.error('fetchInteractions error:', error);
                }
            },

            markInteractionAsRead: async (interactionId) => {
                const { interactions } = get();

                // Optimistic update
                set({
                    interactions: interactions.map(i =>
                        i.id === interactionId ? { ...i, isRead: true } : i
                    )
                });

                try {
                    const { markInteractionAsReadAction } = await import('@/app/actions/interactions');
                    const result = await markInteractionAsReadAction(interactionId);
                    if (!result.success) throw result.error;
                } catch (error) {
                    console.error('Failed to mark interaction as read:', error);
                    // Revert
                    set({
                        interactions: get().interactions.map(i =>
                            i.id === interactionId ? { ...i, isRead: false } : i
                        )
                    });
                }
            },

            sendMessage: async (threadId, senderId, text, attachment, replyToId, fileToUpload) => {
                const tempId = `temp-${Date.now()}`;
                console.log('Sending message:', { threadId, senderId, text, attachment: attachment ? 'present' : 'none', file: fileToUpload ? 'present' : 'none' });

                // 1. Optimistic Update
                const previewUrl = fileToUpload ? URL.createObjectURL(fileToUpload) : attachment?.url;

                const optimisticAttachment = fileToUpload ? {
                    id: `temp-att-${Date.now()}`,
                    type: fileToUpload.type.startsWith('image/') ? 'image' : 'file',
                    url: previewUrl || '',
                    name: fileToUpload.name,
                    size: `${(fileToUpload.size / 1024).toFixed(1)} KB`
                } : attachment;

                set(state => ({
                    chats: state.chats.map(chat => {
                        if (chat.id !== threadId) return chat;

                        const newMessage: any = {
                            id: tempId,
                            senderId: senderId,
                            text: text,
                            timestamp: Date.now(),
                            isRead: false,
                            isSystem: false,
                            attachment: optimisticAttachment
                        };

                        return {
                            ...chat,
                            messages: [...chat.messages, newMessage],
                            updatedAt: Date.now()
                        };
                    }).sort((a: any, b: any) => b.updatedAt - a.updatedAt)
                }));

                try {
                    const supabase = createClient();

                    let attachmentUrl = attachment?.url;
                    let attachmentName = attachment?.name;
                    let attachmentType = attachment?.type;

                    // 2. Upload File if present
                    if (fileToUpload) {
                        const formData = new FormData();
                        formData.append('file', fileToUpload);
                        formData.append('chatId', threadId);

                        const uploadRes = await fetch('/api/upload/messages', {
                            method: 'POST',
                            body: formData
                        });

                        if (!uploadRes.ok) {
                            const err = await uploadRes.json();
                            throw new Error(err.error || 'Upload failed');
                        }

                        const uploadData = await uploadRes.json();
                        attachmentUrl = uploadData.url;
                        attachmentName = uploadData.name;
                        // Map MIME type to Attachment type
                        attachmentType = fileToUpload.type.startsWith('image/') ? 'image' : 'file';
                    } else {
                        // If no file upload, perform blob URL check for safety
                        if (attachmentUrl?.startsWith('blob:')) {
                            console.warn('Cannot persist blob URL without file object');
                            attachmentUrl = undefined;
                        }
                    }

                    const newMessagePayload = {
                        chat_id: threadId,
                        sender_id: senderId,
                        content: text,
                        attachment_url: attachmentUrl,
                        attachment_type: attachmentType,
                        attachment_name: attachmentName,
                        is_read: false
                    };

                    const { error } = await supabase.from('messages').insert(newMessagePayload).select().single();

                    if (error) throw error;

                    // 3. Sync
                    await get().fetchChats();

                } catch (error: any) {
                    console.error('Failed to send message:', error);
                    toast.error(`メッセージ送信エラー: ${error.message || error.code}`);

                    // Revert Optimistic Update
                    set(state => ({
                        chats: state.chats.map(chat =>
                            chat.id === threadId
                                ? { ...chat, messages: chat.messages.filter(m => m.id !== tempId) }
                                : chat
                        )
                    }));
                }
            },

            deleteMessage: async (threadId, messageId) => {
                const state = get();
                const chat = state.chats.find(c => c.id === threadId);
                const message = chat?.messages.find(m => m.id === messageId);
                const originalContent = message?.text || '';

                // Optimistic Update
                set((state) => ({
                    chats: state.chats.map(chat => {
                        if (chat.id !== threadId) return chat;
                        return {
                            ...chat,
                            messages: chat.messages.map(m => {
                                if (m.id !== messageId) return m;
                                return {
                                    ...m,
                                    text: 'メッセージを取り消しました',
                                    attachment: undefined, // Remove attachment from view
                                    metadata: { deleted: true, original_content: originalContent }
                                };
                            }),
                            updatedAt: Date.now()
                        };
                    })
                }));

                try {
                    const supabase = createClient();
                    const { error } = await supabase
                        .from('messages')
                        .update({
                            content: 'メッセージを取り消しました',
                            attachment_url: null,
                            attachment_type: null,
                            attachment_name: null,
                            metadata: { deleted: true, original_content: originalContent }
                        })
                        .eq('id', messageId);

                    if (error) throw error;
                } catch (e) {
                    console.error('Failed to delete message:', e);
                    toast.error('メッセージの取り消しに失敗しました');
                    // Revert logic could be added here if strict consistency is needed
                }
            },

            createChat: async (companyId, userId, initialMessage, systemMessage) => {
                const state = get();
                const existing = state.chats.find(c => c.companyId === companyId && c.userId === userId);
                if (existing) return existing.id;

                const supabase = createClient();

                // 1. Check DB for existing chat (to avoid RLS error on insert if it exists but not in state)
                const { data: existingChatInDb } = await supabase
                    .from('casual_chats')
                    .select('id')
                    .eq('company_id', companyId)
                    .eq('user_id', userId)
                    .single();

                if (existingChatInDb) {
                    return existingChatInDb.id;
                }

                // 2. Create Chat Room
                const { data: chatData, error: chatError } = await supabase
                    .from('casual_chats')
                    .insert({ company_id: companyId, user_id: userId })
                    .select()
                    .single();

                if (chatError) {
                    // Check if it already exists (constraint violation) - Double check
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
                    toast.error(`チャット作成エラー: ${chatError.message || chatError.code}`);
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
                        sender_id: userId, // Use user_id as sender (since RLS restricts to participants)
                        content: systemMessage,
                        metadata: { is_system: true, original_sender: 'SYSTEM' }
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
                    const myselfId = activeRole === 'seeker' ? currentUserId : currentCompanyId;

                    // 1. Fetch Chats
                    let chatsData, error;
                    try {
                        const res = await supabase
                            .from('casual_chats')
                            .select(`
                                *,
                                messages (*)
                            `)
                            .order('updated_at', { ascending: false });
                        chatsData = res.data;
                        error = res.error;
                    } catch (e: any) {
                        if (e.name === 'AbortError' || e.message?.includes('aborted')) return;
                        throw e;
                    }

                    if (error) {
                        console.error('Failed to fetch chats:', error);
                        return;
                    }

                    // 2. Fetch Chat Settings (Persistence)
                    // Initialize with existing settings so we don't wipe local state on server failure
                    let fetchedSettings: ChatSettings[] | null = null;
                    const backupKey = `eis_chat_settings_backup_${myselfId}`;

                    if (myselfId) {
                        try {
                            const { fetchChatSettingsAction } = await import('@/app/actions/chat-settings');
                            const settingsResult = await fetchChatSettingsAction(myselfId);

                            if (settingsResult.success && settingsResult.data && settingsResult.data.length > 0) {
                                console.log('[AppStore] Loaded settings from server:', settingsResult.data.length);
                                fetchedSettings = settingsResult.data;
                                // Update local backup with fresh server data
                                if (typeof window !== 'undefined') {
                                    localStorage.setItem(backupKey, JSON.stringify(fetchedSettings));
                                }
                            } else {
                                console.log('[AppStore] Server settings empty/failed. Trying backup key:', backupKey);
                                // Server returned nothing (or failed silent), try loading from backup
                                if (typeof window !== 'undefined') {
                                    const backup = localStorage.getItem(backupKey);
                                    if (backup) {
                                        console.log('[AppStore] Loaded settings from local backup:', backup);
                                        fetchedSettings = JSON.parse(backup);
                                    } else {
                                        console.log('[AppStore] No local backup found for key:', backupKey);
                                    }
                                }
                            }
                        } catch (e) {
                            console.error('Failed to load chat settings:', e);
                            // Fallback to backup on error
                            if (typeof window !== 'undefined') {
                                const backup = localStorage.getItem(backupKey);
                                if (backup) {
                                    fetchedSettings = JSON.parse(backup);
                                }
                            }
                        }
                    } else {
                        console.warn('[AppStore] fetchChats called but myselfId is null/undefined. ActiveRole:', activeRole, 'UserId:', currentUserId, 'CompanyId:', currentCompanyId);
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

                        // Only update settings if we successfully fetched new ones from server
                        // Otherwise (migration failed/server down), keep existing local settings (optimistic/persisted)
                        set(state => ({
                            chats: mappedChats,
                            chatSettings: fetchedSettings || state.chatSettings
                        }));
                    }
                } finally {
                    set({ isFetchingChats: false });
                }
            },

            markAsRead: async (threadId, readerId) => {
                const supabase = createClient();

                // 1. Optimistic UI Update first
                set(state => ({
                    chats: state.chats.map(chat => {
                        if (chat.id !== threadId) return chat;
                        // Mark messages NOT sent by reader as read
                        const updatedMessages = chat.messages.map(m =>
                            m.senderId !== readerId ? { ...m, isRead: true } : m
                        );
                        return { ...chat, messages: updatedMessages };
                    })
                }));

                // 2. Database Update (Background)
                try {
                    // Use API route to bypass RLS issues (Service Role)
                    console.log('Calling markAsRead API:', { chatId: threadId, readerId });
                    const response = await fetch('/api/messages/mark-read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chatId: threadId, readerId })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('markAsRead API Error:', errorData);
                        // Optional: Revert UI if needed, but for read status it's usually fine to ignore
                    }
                } catch (err) {
                    console.error('markAsRead Exception:', err);
                }
            },

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

            updateChatSettings: async (ownerId, chatId, newSettings) => {
                // Optimistic Update
                set(state => {
                    const existingIndex = state.chatSettings.findIndex(cs => cs.ownerId === ownerId && cs.chatId === chatId);
                    let updatedSettings = [...state.chatSettings];

                    if (existingIndex > -1) {
                        updatedSettings[existingIndex] = { ...updatedSettings[existingIndex], ...newSettings };
                    } else {
                        const newItem: ChatSettings = {
                            ownerId, chatId, isPinned: false, isBlocked: false, isUnreadManual: false, priority: 'medium', memo: '', alias: '', ...newSettings
                        };
                        updatedSettings = [...updatedSettings, newItem];
                    }

                    // Save to local backup immediately
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(`eis_chat_settings_backup_${ownerId}`, JSON.stringify(updatedSettings));
                    }

                    return { chatSettings: updatedSettings };
                });

                // Persist to Server
                try {
                    const { updateChatSettingsAction } = await import('@/app/actions/chat-settings');
                    await updateChatSettingsAction(ownerId, chatId, newSettings);
                } catch (e) {
                    console.error('Failed to persist chat settings:', e);
                }
            },

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
                    // Use modules API to get course_curriculums (same as courses list page)
                    const response = await fetch('/api/elearning/modules', {
                        method: 'GET',
                        cache: 'no-store'
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch courses');
                    }

                    const data = await response.json();

                    // Filter to only public modules
                    const publishedCourses = (data || []).filter((c: any) => c.is_public !== false);
                    set({ courses: publishedCourses });
                } catch (error: any) {
                    if (error?.name === 'AbortError' || error?.message?.includes('aborted')) return;
                    console.error('Error fetching courses:', error);
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
                    const response = await fetch(`/api/analysis/recommendations_v2?userId=${userId}`);
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        set({ userRecommendations: data });

                        // If empty, try to generate
                        if (data.length === 0) {
                            const state = get();
                            const selectedValues = state.userAnalysis.selectedValues;
                            // Ensure we have enough values to generate meaningful recommendations
                            if (selectedValues && selectedValues.length > 0) {
                                console.log('AppStore: No existing recommendations. Auto-generating...');
                                await state.generateRecommendations(userId, selectedValues);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch recommendations:', error);
                }
            },

            generateRecommendations: async (userId, selectedValues) => {
                try {
                    const response = await fetch('/api/analysis/recommendations_v2', {
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
                    await fetch(`/api/analysis/recommendations_v2?userId=${userId}`, {
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
                    let data, error;
                    try {
                        const res = await supabase.from('profiles').select('*');
                        data = res.data;
                        error = res.error;
                    } catch (e: any) {
                        if (e.name === 'AbortError' || e.message?.includes('aborted')) return;
                        throw e;
                    }

                    if (error) {
                        // Suppress AbortError logs
                        if (error.message?.includes('Fetch is aborted') || error.message?.includes('aborted')) {
                            return;
                        }
                        console.error('Failed to fetch users:', error);
                        return;
                    }
                    if (data) {
                        console.log('AppStore: fetchUsers success', data.length, 'users found');
                        if (data.length > 0) {
                            console.log('AppStore: User 0 keys:', Object.keys(data[0]));
                        }
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
                            graduationYear: p.graduation_year || '',
                            // Map other fields as necessary
                            qualifications: p.qualifications || [],
                            skills: p.skills || [],
                            portfolioUrl: p.portfolio_url,
                            desiredConditions: p.desired_conditions || undefined,
                            userType: p.user_type,
                            occupationStatus: p.occupation_status,
                            schoolType: p.school_type,
                            workHistory: []
                        }));
                        set({ users: mappedUsers });
                    }
                } catch (err) {
                    console.error('Unexpected error in fetchUsers:', err);
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
                        // Suppress specific error if it's already logged or handled
                        console.warn('AppStore: fetchCompanies failed (likely schema missing):', result.error);
                    }
                } catch (e: any) {
                    if (e.name === 'AbortError' || e.message?.includes('aborted')) return;
                    console.error('AppStore: fetchCompanies exception:', e);
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

                if (!result.success) {
                    console.error('AppStore: fetchUserAnalysisAction failed:', result.error);
                    return;
                }

                if (!result.data) {
                    // This is expected for new users who haven't completed the analysis
                    console.log('AppStore: No previous analysis data found for user.');
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

                // Determine Day Master:
                // Since DB doesn't have the column yet, we MUST calculate it from profile birthDate
                let dayMaster = get().userAnalysis.fortune?.dayMaster; // Keep existing if any

                // Try to calculate from user profile
                const user = get().users.find(u => u.id === targetId);
                console.log('AppStore: resolving dayMaster. User:', user?.id, 'BirthDate:', user?.birthDate);

                if (user && user.birthDate) {
                    try {
                        // Dynamic import to avoid circular dependency issues if any, though standard import is better if possible
                        const { calculateDayMasterIndex, JIKKAN } = await import('./fortune');
                        const index = calculateDayMasterIndex(user.birthDate);
                        dayMaster = JIKKAN[index];
                        console.log('AppStore: Calculated DayMaster:', dayMaster);
                    } catch (e) {
                        console.error('AppStore: Failed to calculate dayMaster', e);
                    }
                }

                // Fallback
                if (!dayMaster) {
                    dayMaster = '甲';
                    console.log('AppStore: Used fallback DayMaster (甲)');
                }

                set(state => ({
                    userAnalysis: {
                        ...state.userAnalysis,
                        diagnosisScores: data.diagnosisScores || state.userAnalysis.diagnosisScores,
                        selectedValues: repairedSelectedValues.length > 0 ? repairedSelectedValues : (state.userAnalysis.selectedValues || []),
                        publicValues: data.publicValues || state.userAnalysis.publicValues,
                        isFortuneIntegrated: data.isFortuneIntegrated ?? state.userAnalysis.isFortuneIntegrated,
                        fortune: {
                            dayMaster: dayMaster,
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
                    } else {
                        console.warn('AppStore: fetchJobs failed (likely schema missing):', result.error);
                    }
                } catch (e: any) {
                    if (e.name === 'AbortError' || e.message?.includes('aborted')) return;
                    console.error('AppStore: fetchJobs exception:', e);
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

            fetchSystemSettings: async () => {
                const { isFetchingSystemSettings } = get();
                if (isFetchingSystemSettings) return;
                set({ isFetchingSystemSettings: true });

                try {
                    const result = await fetchSystemSettingsAction();
                    if (result.success && result.data) {
                        const settingsMap: Record<string, any> = {};
                        result.data.forEach((s: any) => {
                            settingsMap[s.key] = s.value;
                        });
                        set({ systemSettings: settingsMap });
                    }
                } catch (e) {
                    console.error('AppStore: fetchSystemSettings failed:', e);
                } finally {
                    set({ isFetchingSystemSettings: false });
                }
            },

            updateSystemSetting: async (key, value) => {
                // Optimistic update
                set((state) => ({
                    systemSettings: { ...state.systemSettings, [key]: value }
                }));

                try {
                    const result = await updateSystemSettingAction(key, value);
                    if (!result.success) {
                        toast.error(`設定の更新に失敗しました: ${result.error}`);
                        // Sync back on failure
                        get().fetchSystemSettings();
                    }
                } catch (e) {
                    console.error('AppStore: updateSystemSetting failed:', e);
                    get().fetchSystemSettings();
                }
            },

        }),

        {
            name: 'eis-app-store-v3',
            version: 1, // Clear old cache
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
                // userRecommendations: state.userRecommendations, // Do not persist recommendations to ensure freshness
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
                    state.isFetchingSystemSettings = false;
                }
            }
        }
    )
);
