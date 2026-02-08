
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MessageCircle, Loader2, Building2, User, Ban, Trash2, Calendar } from 'lucide-react';

interface AdminUserMessagesTabProps {
    userId: string;
}

interface Chat {
    id: string;
    company_id: string;
    updated_at: string;
    company: {
        name: string;
        logo_url: string | null;
    } | null;
    messages: Message[];
}

interface Message {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    is_read: boolean;
    metadata: {
        deleted?: boolean;
        original_content?: string;
        is_system?: boolean;
        original_sender?: string;
    } | null;
    attachment_url: string | null;
    attachment_type: string | null;
    attachment_name: string | null;
}

export function AdminUserMessagesTab({ userId }: AdminUserMessagesTabProps) {
    const supabase = createClient();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                // Fetch chats with company info
                const { data: chatsData, error: chatsError } = await supabase
                    .from('casual_chats')
                    .select(`
                        id,
                        company_id,
                        updated_at,
                        organizations (
                            name,
                            logo_url
                        )
                    `)
                    .eq('user_id', userId)
                    .order('updated_at', { ascending: false });

                if (chatsError) throw chatsError;

                if (!chatsData || chatsData.length === 0) {
                    setChats([]);
                    setLoading(false);
                    return;
                }

                // Fetch messages for all these chats
                const chatIds = chatsData.map((c: any) => c.id);
                const { data: messagesData, error: messagesError } = await supabase
                    .from('messages')
                    .select('*')
                    .in('chat_id', chatIds)
                    .order('created_at', { ascending: true });

                if (messagesError) throw messagesError;

                // Group messages by chat
                const formattedChats: Chat[] = chatsData.map((c: any) => ({
                    id: c.id,
                    company_id: c.company_id,
                    updated_at: c.updated_at,
                    company: {
                        name: c.organizations?.name || '不明な企業',
                        logo_url: c.organizations?.logo_url
                    },
                    messages: (messagesData || []).filter((m: any) => m.chat_id === c.id)
                }));

                setChats(formattedChats);
                if (formattedChats.length > 0) {
                    setSelectedChatId(formattedChats[0].id);
                }

            } catch (err) {
                console.error('Failed to fetch messages:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [userId]);

    const selectedChat = chats.find(c => c.id === selectedChatId);

    if (loading) {
        return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>;
    }

    if (chats.length === 0) {
        return <div className="py-20 text-center text-slate-400 font-bold bg-white rounded-2xl border border-dashed border-slate-200">メッセージ履歴がありません</div>;
    }

    return (
        <div className="flex bg-white rounded-2xl border border-slate-200 overflow-hidden h-[600px]">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-slate-100 bg-slate-50 flex flex-col">
                <div className="p-3 border-b border-slate-100 bg-white">
                    <h3 className="text-xs font-bold text-slate-400 uppercase">チャット一覧 ({chats.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => {
                        const lastMsg = chat.messages[chat.messages.length - 1];
                        return (
                            <button
                                key={chat.id}
                                onClick={() => setSelectedChatId(chat.id)}
                                className={`w-full text-left p-3 border-b border-slate-100 hover:bg-white transition-colors flex items-center gap-3 ${selectedChatId === chat.id ? 'bg-white shadow-[inset_3px_0_0_0_#3b82f6]' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                                    {chat.company?.logo_url ? (
                                        <img src={chat.company.logo_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={18} className="text-slate-400" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 text-sm truncate">{chat.company?.name}</p>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                        {lastMsg?.metadata?.deleted ? 'メッセージが取り消されました' : lastMsg?.content || 'メッセージなし'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {new Date(chat.updated_at).toLocaleDateString('ja-JP')}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedChat ? (
                    <>
                        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700">{selectedChat.company?.name}</span>
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">ID: {selectedChat.id.slice(0, 8)}</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {selectedChat.messages.map(msg => {
                                const isUser = msg.sender_id === userId;
                                const isDeleted = msg.metadata?.deleted;

                                return (
                                    <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                        {!isUser && (
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                                                <Building2 size={14} className="text-slate-400" />
                                            </div>
                                        )}

                                        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                            <div className={`p-3 rounded-2xl relative group ${isUser
                                                ? 'bg-blue-50 text-slate-800 rounded-tr-none'
                                                : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                                                } ${isDeleted ? 'border-2 border-red-100 bg-red-50/30' : ''}`}>

                                                {/* Deleted Indicator */}
                                                {isDeleted && (
                                                    <div className="text-[10px] font-bold text-red-500 flex items-center gap-1 mb-1 border-b border-red-100 pb-1">
                                                        <Trash2 size={10} />
                                                        送信取り消し済み
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <p className={`text-sm whitespace-pre-wrap ${isDeleted ? 'text-slate-500 line-through decoration-slate-300' : ''}`}>
                                                    {isDeleted ? msg.metadata?.original_content : msg.content}
                                                </p>

                                                {/* Attachment */}
                                                {(msg.attachment_url || msg.metadata?.original_content?.includes('[Attachment]')) && !isDeleted && (
                                                    <div className="mt-2 text-xs bg-black/5 p-2 rounded flex items-center gap-2">
                                                        <span className="font-bold">📎 {msg.attachment_name || '添付ファイル'}</span>
                                                    </div>
                                                )}

                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 font-medium px-1 flex items-center gap-2">
                                                {isUser ? 'ユーザー' : '企業'}
                                                <span>•</span>
                                                {new Date(msg.created_at).toLocaleString('ja-JP')}
                                            </p>
                                        </div>

                                        {isUser && (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
                                                <User size={14} className="text-blue-600" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <MessageCircle size={48} className="opacity-20" />
                    </div>
                )}
            </div>
        </div>
    );
}
