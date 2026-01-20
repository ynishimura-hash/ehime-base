import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Attachment {
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: string;
}

export interface Message {
    id: string;
    sender: 'user' | 'company';
    text: string;
    timestamp: number;
    attachment?: Attachment;
}

export interface Chat {
    id: string;
    companyId: string;
    companyName: string;
    companyImage: string;
    messages: Message[];
    lastMessageAt: number;
    unreadCount: number;
}

export interface UserProfile {
    name: string;
    age: number;
    location: string;
    university?: string;
    faculty?: string;
    department?: string;
    graduationYear?: string;
    tags: string[];
    avatar: string;
    bio?: string;
    // New fields matching appStore User
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
}

interface UserState {
    likedJobIds: string[];
    likedCompanyIds: string[]; // Added
    appliedJobIds: string[];
    chats: Chat[];
    userProfile: UserProfile;

    // Actions
    updateUserProfile: (profile: Partial<UserProfile>) => void; // Added
    toggleLikeJob: (jobId: string) => void;
    toggleLikeCompany: (companyId: string) => void; // Added
    applyToJob: (jobId: string) => void;
    startChat: (companyId: string, companyName: string, companyImage: string, initialMessage?: string) => string; // returns chatId
    sendMessage: (chatId: string, text: string) => void;
    markChatRead: (chatId: string) => void;

    // Selectors helpers
    isJobLiked: (jobId: string) => boolean;
    isCompanyLiked: (companyId: string) => boolean; // Added
    isJobApplied: (jobId: string) => boolean;
    getUnreadCount: () => number;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            likedJobIds: [],
            likedCompanyIds: [], // Added
            appliedJobIds: [],
            chats: [],
            userProfile: {
                name: '西村 裕二',
                age: 29,
                location: '愛媛県松山市',
                tags: ['営業経験あり', 'リーダー経験あり'],
                avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=128&auto=format&fit=crop',
                bio: '「愛媛を面白くする」ために活動中。営業、企画、コミュニティ運営など幅広く経験。次はIT×教育の領域で、若者の可能性を広げる事業に挑戦したいと考えています。', // Added initial bio
            },

            updateUserProfile: (profile) => set((state) => ({
                userProfile: { ...state.userProfile, ...profile }
            })),

            toggleLikeJob: (jobId) => set((state) => {
                const isLiked = state.likedJobIds.includes(jobId);
                return {
                    likedJobIds: isLiked
                        ? state.likedJobIds.filter(id => id !== jobId)
                        : [...state.likedJobIds, jobId]
                };
            }),

            toggleLikeCompany: (companyId) => set((state) => { // Added
                const isLiked = state.likedCompanyIds.includes(companyId);
                return {
                    likedCompanyIds: isLiked
                        ? state.likedCompanyIds.filter(id => id !== companyId)
                        : [...state.likedCompanyIds, companyId]
                };
            }),

            applyToJob: (jobId) => set((state) => {
                if (state.appliedJobIds.includes(jobId)) return state;
                return { appliedJobIds: [...state.appliedJobIds, jobId] };
            }),

            startChat: (companyId, companyName, companyImage, initialMessage) => {
                const state = get();
                // Check if chat already exists
                const existingChat = state.chats.find(c => c.companyId === companyId);
                if (existingChat) {
                    if (initialMessage) {
                        // Append message if reopening with a new context, optional logic
                    }
                    return existingChat.id;
                }

                const newChatId = `chat_${Date.now()}`;
                const newChat: Chat = {
                    id: newChatId,
                    companyId,
                    companyName,
                    companyImage,
                    messages: initialMessage ? [{
                        id: `msg_${Date.now()}`,
                        sender: 'user',
                        text: initialMessage,
                        timestamp: Date.now()
                    }] : [],
                    lastMessageAt: Date.now(),
                    unreadCount: 0 // User initiated, so 0 unread from company
                };

                set((state) => ({
                    chats: [newChat, ...state.chats]
                }));

                return newChatId;
            },

            sendMessage: (chatId, text) => set((state) => ({
                chats: state.chats.map(chat => {
                    if (chat.id !== chatId) return chat;
                    return {
                        ...chat,
                        messages: [...chat.messages, {
                            id: `msg_${Date.now()}`,
                            sender: 'user',
                            text,
                            timestamp: Date.now()
                        }],
                        lastMessageAt: Date.now()
                    };
                })
            })),

            markChatRead: (chatId) => set((state) => ({
                chats: state.chats.map(chat => {
                    if (chat.id !== chatId) return chat;
                    return { ...chat, unreadCount: 0 };
                })
            })),

            isJobLiked: (jobId) => get().likedJobIds.includes(jobId),
            isCompanyLiked: (companyId) => get().likedCompanyIds.includes(companyId), // Added
            isJobApplied: (jobId) => get().appliedJobIds.includes(jobId),
            getUnreadCount: () => get().chats.reduce((acc, chat) => acc + chat.unreadCount, 0),
        }),
        {
            name: 'ehime-base-storage', // unique name
            version: 1, // Bump version to force reset/migration if potential hydration mismatch
        }
    )
);
