"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Search, MoreHorizontal, Send, Paperclip, Phone, ChevronLeft, MessageSquare, FileText, Download, X, Copy, Reply, Trash2, RotateCcw, Pin, Ban, ChevronDown } from 'lucide-react';
import { useAppStore, ChatThread, Attachment } from '@/lib/appStore';
import MobileBottomNav from '@/components/MobileBottomNav';
import ChatDetailModal from './ChatDetailModal';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';

interface UnifiedChatInterfaceProps {
    mode: 'fullscreen' | 'embedded'; // fullscreen for Seeker, embedded for Company Dashboard
    initialChatId?: string;
}

export default function UnifiedChatInterface({ mode, initialChatId }: UnifiedChatInterfaceProps) {
    const {
        getUserChats,
        getCompanyChats,
        currentUserId,
        currentCompanyId,
        activeRole,
        companies,
        users,
        sendMessage,
        markAsRead,
        deleteMessage,
        getChatSettingsHelper,
        chatSettings, // Subscribe to settings updates
        updateChatSettings,
        // Chat Preferences
        chatSortBy,
        chatFilterPriority,
        isCompactMode,
        setChatSortBy,
        toggleChatFilterPriority,
        setCompactMode,
        fetchChats
    } = useAppStore();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        fetchChats();
    }, []);

    // Determine which chats to show based on role
    const chats = activeRole === 'seeker'
        ? getUserChats(currentUserId)
        : getCompanyChats(currentCompanyId);

    const [selectedChatId, setSelectedChatId] = React.useState<string | null>(initialChatId || chats[0]?.id || null);

    // UI State
    const [inputText, setInputText] = React.useState('');
    const [attachment, setAttachment] = React.useState<Attachment | null>(null);
    const [replyToId, setReplyToId] = React.useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'blocked'>('all');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const myselfId = activeRole === 'seeker' ? currentUserId : currentCompanyId;

    // Helper to get settings
    const getSettings = (chatId: string) => getChatSettingsHelper(myselfId, chatId);

    // Filter & Sort Chats
    const processedChats = useMemo(() => {
        return chats.filter(chat => {
            const s = getSettings(chat.id);
            const isBlocked = s?.isBlocked;

            if (activeFilter === 'blocked') return isBlocked;
            if (isBlocked) return false; // Hide blocked in All/Unread

            // Priority Filter (Apply to All/Unread)
            const effectivePriority = s?.priority || 'medium';
            if (!chatFilterPriority.includes(effectivePriority)) return false;

            if (activeFilter === 'unread') {
                const unreadCount = chat.messages.filter(m => m.senderId !== myselfId && !m.isRead).length;
                return unreadCount > 0 || s?.isUnreadManual;
            }
            return true;
        }).sort((a, b) => {
            const sA = getSettings(a.id);
            const sB = getSettings(b.id);

            // 1. Pinned
            if (sA?.isPinned !== sB?.isPinned) return (sA?.isPinned ? -1 : 1);

            // 2. Priority Sort
            if (chatSortBy === 'priority') {
                const getPrioScore = (p: string | null | undefined) => {
                    if (p === 'high') return 3;
                    if (p === 'low') return 1;
                    return 2; // medium or undefined
                };
                const pA = getPrioScore(sA?.priority);
                const pB = getPrioScore(sB?.priority);
                if (pA !== pB) return pB - pA; // Descending
            }

            // 3. Updated
            return b.updatedAt - a.updatedAt;
        });
    }, [chats, activeFilter, chatSettings, myselfId, chatSortBy, chatFilterPriority]);

    const selectedChat = chats.find(c => c.id === selectedChatId);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, messageId: string, isMe: boolean } | null>(null);
    const [partialCopyText, setPartialCopyText] = useState<string | null>(null);
    const [unreadBoundaryMessageId, setUnreadBoundaryMessageId] = useState<string | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const prevChatIdRef = useRef<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedChat?.messages]);

    // Mark as read & Logic for Unread Separator
    useEffect(() => {
        if (selectedChatId && selectedChatId !== prevChatIdRef.current) {
            const chat = chats.find(c => c.id === selectedChatId);
            if (chat) {
                const unreadMsgs = chat.messages.filter(m => m.senderId !== myselfId && !m.isRead);
                if (unreadMsgs.length > 0) {
                    setUnreadBoundaryMessageId(unreadMsgs[0].id);
                } else {
                    setUnreadBoundaryMessageId(null);
                }

                markAsRead(selectedChatId, myselfId);
                updateChatSettings(myselfId, selectedChatId, { isUnreadManual: false });
            }
            prevChatIdRef.current = selectedChatId;
        }
    }, [selectedChatId, chats, markAsRead, myselfId, updateChatSettings]);

    // Close context menu on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
                setContextMenu(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);


    const handleSend = () => {
        if ((!inputText.trim() && !attachment) || !selectedChatId) return;
        sendMessage(selectedChatId, myselfId, inputText, attachment || undefined, replyToId || undefined);
        setInputText('');
        setAttachment(null);
        setReplyToId(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const isImage = file.type.startsWith('image/');
            const newAttachment: Attachment = {
                id: `att_${Date.now()}`,
                type: isImage ? 'image' : 'file',
                url: URL.createObjectURL(file),
                name: file.name,
                size: `${(file.size / 1024).toFixed(1)} KB`
            };
            setAttachment(newAttachment);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, messageId: string, senderId: string) => {
        e.preventDefault();

        // Prevent menu from going off-screen
        const menuWidth = 224;
        const maxX = window.innerWidth - menuWidth - 24;
        const x = Math.min(e.clientX, maxX);
        const y = e.clientY;

        setContextMenu({
            x,
            y,
            messageId,
            isMe: senderId === myselfId
        });
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setContextMenu(null);
    };

    const handleReply = (messageId: string) => {
        setReplyToId(messageId);
        setContextMenu(null);
    };

    const deleteMsg = (messageId: string) => {
        if (selectedChatId) {
            deleteMessage(selectedChatId, messageId);
        }
        setContextMenu(null);
    };

    const handlePartialCopy = () => {
        const msg = selectedChat?.messages.find(m => m.id === contextMenu?.messageId);
        if (msg?.text) {
            setPartialCopyText(msg.text);
        }
        setContextMenu(null);
    };


    const getChatPartner = (chat: ChatThread) => {
        let partner = { name: '', image: '', isImageColor: false };
        if (activeRole === 'seeker') {
            const c = companies.find(c => c.id === chat.companyId);
            // Fix: Prioritize image, then default image. Avoid forcing isImageColor.
            // User requested a default image if no image is present.
            const hasImage = !!c?.image;
            const defaultImage = '/images/defaults/default_company_icon.png';

            partner = {
                name: c?.name || 'Unknown Company',
                image: hasImage ? c.image : defaultImage,
                isImageColor: false // Always use image (real or default) to ensure icon visibility
            };
        } else {
            const u = users.find(u => u.id === chat.userId);
            partner = {
                name: u?.name || 'Unknown User',
                image: u?.image || '/images/defaults/default_user_icon.png', // Reasonable fallback if we had one, but stick to empty for now if not requested
                isImageColor: false
            };
        }

        // Apply Chat Settings Alias
        const s = getSettings(chat.id);
        if (s?.alias) {
            partner.name = s.alias;
        }
        return partner;
    };

    // --- Layout Classes ---
    // --- Layout Classes ---
    // User requested unified UI, so we remove the "card" styling from embedded mode
    const containerClasses = mode === 'fullscreen'
        ? "flex bg-slate-50 min-h-screen pb-20 md:pb-0"
        : "flex bg-slate-50 h-full relative";

    const sidebarClasses = mode === 'fullscreen'
        ? `w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-screen fixed md:relative z-20 transition-transform ${selectedChatId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`
        : "w-80 bg-white border-r border-slate-200 flex flex-col shrink-0";

    const chatAreaClasses = mode === 'fullscreen'
        ? `flex-1 flex flex-col h-screen fixed inset-0 z-30 bg-white md:relative md:bg-transparent transition-transform duration-300 ${selectedChatId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`
        : "flex-1 flex flex-col bg-slate-50 overflow-hidden";

    if (!mounted) return null;

    return (
        <div className={containerClasses}>
            {/* Sidebar (Chat List) */}
            <div className={sidebarClasses}>
                <div className="p-4 border-b border-slate-100 mt-14 md:mt-0">
                    <h1 className="text-xl md:text-2xl font-black text-slate-800 mb-4">
                        メッセージ
                    </h1>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={activeRole === 'seeker' ? "企業名で検索" : "求職者名で検索"}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm font-bold focus:outline-none placeholder:text-slate-400"
                        />
                    </div>
                    {/* Tabs & Toggle */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex p-1 bg-slate-100 rounded-lg">
                            {(['all', 'unread', 'blocked'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeFilter === f
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {f === 'all' && 'すべて'}
                                    {f === 'unread' && '未読'}
                                    {f === 'blocked' && 'ブロック'}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`p-2 rounded-lg transition-colors ${isSettingsOpen ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
                        >
                            <ChevronDown size={18} className={`transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Accordion Panel */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSettingsOpen ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-3">
                            {/* Sort */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">並び替え</span>
                                <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
                                    <button
                                        onClick={() => setChatSortBy('date')}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${chatSortBy === 'date' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        更新順
                                    </button>
                                    <button
                                        onClick={() => setChatSortBy('priority')}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${chatSortBy === 'priority' ? 'bg-red-50 text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        優先度順
                                    </button>
                                </div>
                            </div>

                            {/* Priority Filter */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">表示優先度</span>
                                <div className="flex gap-2">
                                    {(['high', 'medium', 'low'] as const).map(p => (
                                        <label key={p} className="flex items-center gap-1 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={chatFilterPriority.includes(p)}
                                                onChange={() => toggleChatFilterPriority(p)}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3 h-3"
                                            />
                                            <span className={`text-[10px] font-bold ${p === 'high' ? 'text-red-500' : p === 'medium' ? 'text-orange-500' : 'text-blue-500'}`}>
                                                {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Compact Mode */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">コンパクト表示</span>
                                <button
                                    onClick={() => setCompactMode(!isCompactMode)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isCompactMode ? 'bg-blue-500' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition transition-transform ${isCompactMode ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {processedChats.length > 0 ? (
                        processedChats.map(chat => {
                            const partner = getChatPartner(chat);
                            const lastMsg = chat.messages[chat.messages.length - 1];
                            const settings = getSettings(chat.id);

                            // Unread Logic
                            const sysUnread = chat.messages.filter(m => m.senderId !== myselfId && !m.isRead).length;
                            const isUnread = sysUnread > 0 || settings?.isUnreadManual;
                            const unreadCount = sysUnread;

                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => setSelectedChatId(chat.id)}
                                    className={`${isCompactMode ? 'p-2' : 'p-4'} flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 relative ${selectedChatId === chat.id ? 'bg-blue-50/50' : ''}`}
                                >
                                    {/* Icon with Badges */}
                                    <div
                                        className="relative cursor-pointer hover:scale-105 transition-transform shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedChatId(chat.id);
                                            setShowDetailModal(true);
                                        }}
                                    >
                                        {partner.isImageColor ? (
                                            <div className={`${isCompactMode ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-lg'} rounded-xl flex items-center justify-center text-white font-bold ${partner.image}`}>
                                                {partner.name.slice(0, 1)}
                                            </div>
                                        ) : (
                                            <img
                                                src={partner.image}
                                                alt={partner.name}
                                                className={`${isCompactMode ? 'w-10 h-10' : 'w-12 h-12'} rounded-full object-cover`}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.getAttribute('data-error-tried')) {
                                                        target.setAttribute('data-error-tried', 'true');
                                                        // Attempt fallback using avatarUtils if we have context
                                                        target.src = activeRole === 'seeker'
                                                            ? '/images/defaults/default_company_icon.png'
                                                            : getFallbackAvatarUrl(chat.userId, (users.find(u => u.id === chat.userId) as any)?.gender);
                                                    } else {
                                                        target.src = '/images/defaults/default_user_avatar.png';
                                                    }
                                                }}
                                            />
                                        )}

                                        {/* Priority Badge (Bottom-Left) */}
                                        {settings?.priority && (
                                            <div className={`absolute -bottom-1 -left-1 px-1 rounded-md border border-white text-[8px] font-bold text-white shadow-sm flex items-center justify-center z-10
                                                ${settings.priority === 'high' ? 'bg-red-500' : settings.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}
                                            `}>
                                                {settings.priority === 'high' ? '高' : settings.priority === 'medium' ? '中' : '低'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-black text-slate-800 text-sm truncate flex items-center gap-1">
                                                {settings?.isPinned && <Pin size={12} className="text-blue-500 fill-current" />}
                                                {partner.name}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                                                {lastMsg ? new Date(lastMsg.timestamp).getHours() + ':' + String(new Date(lastMsg.timestamp).getMinutes()).padStart(2, '0') : ''}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className={`text-xs text-slate-500 font-medium line-clamp-1 flex-1 ${isCompactMode ? 'text-[10px]' : ''}`}>
                                                {settings?.isBlocked ? (
                                                    <span className="text-red-500 flex items-center gap-1"><Ban size={12} /> ブロック中</span>
                                                ) : (
                                                    <>
                                                        {lastMsg?.senderId === myselfId ? 'あなた: ' : ''}
                                                        {lastMsg?.text || (lastMsg?.attachment ? (lastMsg.attachment.type === 'image' ? '画像が送信されました' : 'ファイルが送信されました') : 'メッセージなし')}
                                                    </>
                                                )}
                                            </p>

                                            {/* Unread Badge (Right Side) */}
                                            {isUnread && (
                                                <div className="ml-2 shrink-0">
                                                    <div className="min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1 shadow-sm">
                                                        {unreadCount > 0 ? unreadCount : '1'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
                            <MessageSquare className="w-12 h-12 opacity-20" />
                            <p className="text-xs font-bold">まだメッセージはありません</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={chatAreaClasses}>
                {selectedChat ? (
                    (() => {
                        const partner = getChatPartner(selectedChat);
                        return (
                            <>
                                {/* Header */}
                                <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 bg-white/90 backdrop-blur-md sticky top-0 z-10 transition-all duration-300">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity"
                                        onClick={() => setShowDetailModal(true)}
                                    >
                                        {mode === 'fullscreen' && (
                                            <button onClick={(e) => { e.stopPropagation(); setSelectedChatId(null); }} className="md:hidden text-slate-400 mr-2">
                                                <ChevronLeft size={24} />
                                            </button>
                                        )}
                                        {partner.isImageColor ? (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${partner.image}`}>
                                                {partner.name.slice(0, 1)}
                                            </div>
                                        ) : (
                                            <img
                                                src={partner.image}
                                                alt={partner.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.getAttribute('data-error-tried')) {
                                                        target.setAttribute('data-error-tried', 'true');
                                                        target.src = activeRole === 'seeker'
                                                            ? '/images/defaults/default_company_icon.png'
                                                            : getFallbackAvatarUrl(selectedChat.userId, (users.find(u => u.id === selectedChat.userId) as any)?.gender);
                                                    } else {
                                                        target.src = '/images/defaults/default_user_avatar.png';
                                                    }
                                                }}
                                            />
                                        )}
                                        <span className="font-black text-slate-800 truncate max-w-[200px]">{partner.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-400">
                                        <button className="hover:text-blue-600"><Phone size={20} /></button>
                                        <button className="hover:text-slate-600"><MoreHorizontal size={20} /></button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col-reverse gap-6 bg-slate-50/50 relative">
                                    {/* Bottom spacer */}
                                    <div ref={messagesEndRef} className="h-0" />

                                    {[...selectedChat.messages].reverse().map(msg => {
                                        const isMe = msg.senderId === myselfId;
                                        const replyToMsg = msg.replyToId ? selectedChat.messages.find(m => m.id === msg.replyToId) : null;

                                        return (
                                            <React.Fragment key={msg.id}>
                                                <div id={`msg-${msg.id}`} className={`flex gap-2 md:gap-3 ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                                    {!isMe && (
                                                        partner.isImageColor ? (
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs mt-1 shrink-0 ${partner.image}`}>
                                                                {partner.name.slice(0, 1)}
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={partner.image}
                                                                alt={partner.name}
                                                                className="w-8 h-8 rounded-full object-cover mt-1 shrink-0"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    if (!target.getAttribute('data-error-tried')) {
                                                                        target.setAttribute('data-error-tried', 'true');
                                                                        target.src = activeRole === 'seeker'
                                                                            ? '/images/defaults/default_company_icon.png'
                                                                            : getFallbackAvatarUrl(selectedChat.userId, (users.find(u => u.id === selectedChat.userId) as any)?.gender);
                                                                    } else {
                                                                        target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(partner.name || 'U') + '&background=random';
                                                                    }
                                                                }}
                                                            />
                                                        )
                                                    )}

                                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-sm`}>
                                                        {/* Reply Quote */}
                                                        {replyToMsg && (
                                                            <div
                                                                className={`text-[10px] text-slate-500 bg-black/5 px-2 py-1 rounded-t-lg mb-0.5 border-l-2 border-slate-300 w-full truncate cursor-pointer hover:bg-black/10 transition-colors`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    document.getElementById(`msg-${replyToMsg.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                }}
                                                            >
                                                                <span className="font-bold mr-1">Reply to:</span>
                                                                {replyToMsg.text || (replyToMsg.attachment ? `[${replyToMsg.attachment.type === 'image' ? '画像' : 'ファイル'}] ${replyToMsg.attachment.name}` : 'メッセージ')}
                                                            </div>
                                                        )}

                                                        <div className="flex items-end gap-2">
                                                            {/* Timestamp/Read (Left side for ME) */}
                                                            {isMe && (
                                                                <div className="flex flex-col items-end text-[10px] text-slate-400 font-bold leading-tight mb-1">
                                                                    {msg.isRead && <span className="text-slate-400">既読</span>}
                                                                    <span>{new Date(msg.timestamp).getHours()}:{String(new Date(msg.timestamp).getMinutes()).padStart(2, '0')}</span>
                                                                </div>
                                                            )}

                                                            {/* Message Bubble */}
                                                            <div
                                                                className={`p-3 md:p-4 rounded-2xl shadow-sm text-sm font-medium relative cursor-pointer select-text
                                                                ${isMe
                                                                        ? 'bg-gradient-to-tr from-blue-600 to-blue-500 text-white rounded-tr-none'
                                                                        : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'
                                                                    }`}
                                                                onContextMenu={(e) => handleContextMenu(e, msg.id, msg.senderId)}
                                                                onClick={(e) => {
                                                                    if (window.getSelection()?.toString()) return;
                                                                    handleReply(msg.id);
                                                                }}
                                                            >
                                                                {/* Attachment Display */}
                                                                {msg.attachment && (
                                                                    <div className="mb-2">
                                                                        {msg.attachment.type === 'image' ? (
                                                                            <div className="relative group inline-block">
                                                                                <a
                                                                                    href={msg.attachment.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="block cursor-zoom-in"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <img
                                                                                        src={msg.attachment.url}
                                                                                        alt="attachment"
                                                                                        className="rounded-lg max-h-48 object-cover border border-black/10"
                                                                                    />
                                                                                </a>
                                                                                <a
                                                                                    href={msg.attachment.url}
                                                                                    download={msg.attachment.name}
                                                                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm"
                                                                                    title="Download"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <Download size={16} />
                                                                                </a>
                                                                            </div>
                                                                        ) : (
                                                                            <div className={`flex items-center gap-3 p-3 rounded-xl ${isMe ? 'bg-white/20' : 'bg-slate-50'}`}>
                                                                                <a
                                                                                    href={msg.attachment.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity cursor-pointer"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm">
                                                                                        <FileText size={20} />
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0 text-left">
                                                                                        <p className="truncate font-bold text-xs">{msg.attachment.name}</p>
                                                                                        <p className="text-[10px] opacity-70">{msg.attachment.size}</p>
                                                                                    </div>
                                                                                </a>
                                                                                <a
                                                                                    href={msg.attachment.url}
                                                                                    download={msg.attachment.name}
                                                                                    className="p-2 hover:bg-black/10 rounded-full transition-colors shrink-0"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <Download size={16} />
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {msg.text}
                                                            </div>

                                                            {/* Timestamp (Right side for Other) */}
                                                            {!isMe && (
                                                                <div className="flex flex-col items-start text-[10px] text-slate-400 font-bold leading-tight mb-1">
                                                                    <span>{new Date(msg.timestamp).getHours()}:{String(new Date(msg.timestamp).getMinutes()).padStart(2, '0')}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Unread Separator */}
                                                {msg.id === unreadBoundaryMessageId && (
                                                    <div className="w-full flex items-center justify-center my-6 animate-in fade-in zoom-in duration-300">
                                                        <span className="bg-red-50 text-red-500 text-[10px] font-bold px-4 py-1 rounded-full border border-red-100 shadow-sm flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                            ここから未読メッセージ
                                                        </span>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>

                                {/* Context Menu Portal/Overlay */}


                                {/* Input */}
                                <div className={`p-4 bg-white border-t border-slate-100 ${mode === 'fullscreen' ? 'fixed bottom-0 w-full md:relative md:w-auto z-40 pb-safe md:pb-4' : 'sticky bottom-0 z-20'}`}>
                                    {/* Reply Preview */}
                                    {replyToId && (
                                        <div className="mb-2 flex items-center justify-between p-2 bg-slate-100 border-l-4 border-blue-500 rounded-r-lg">
                                            <div className="text-xs text-slate-600 truncate max-w-[80%]">
                                                <span className="font-bold block text-blue-600">Reply to:</span>
                                                {(() => {
                                                    const m = selectedChat.messages.find(msg => msg.id === replyToId);
                                                    if (!m) return '';
                                                    return m.text || (m.attachment ? `[${m.attachment.type === 'image' ? '画像' : 'ファイル'}] ${m.attachment.name}` : 'メッセージ');
                                                })()}
                                            </div>
                                            <button onClick={() => setReplyToId(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Attachment Preview Area */}
                                    {attachment && (
                                        <div className="mb-4 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                                            {attachment.type === 'image' ? (
                                                <img src={attachment.url} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-blue-500">
                                                    <FileText size={24} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate text-slate-700">{attachment.name}</p>
                                                <p className="text-xs text-slate-400">{attachment.size}</p>
                                            </div>
                                            <button onClick={() => setAttachment(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex gap-2 items-end max-w-4xl mx-auto">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            accept="image/*,.pdf,.doc,.docx"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors hidden md:block"
                                        >
                                            <Paperclip size={20} />
                                        </button>
                                        <div className="flex-1 bg-slate-100 rounded-2xl p-1 flex items-center">
                                            <textarea
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                        e.preventDefault();
                                                        handleSend();
                                                    }
                                                }}
                                                placeholder="メッセージを入力..."
                                                rows={1}
                                                className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm font-medium p-2 max-h-32 text-slate-800 placeholder:text-slate-400 outline-none leading-relaxed"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSend}
                                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        );
                    })()
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-400 space-y-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-bold">チャットを選択して会話を始めましょう</p>
                    </div>
                )}
            </div>

            {/* Context Menu Portal/Overlay */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-100 py-1 w-56 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    ref={contextMenuRef}
                >
                    <button
                        onClick={() => handleReply(contextMenu.messageId)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center gap-2"
                    >
                        <Reply size={16} /> 返信
                    </button>
                    <button
                        onClick={handlePartialCopy}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center gap-2"
                    >
                        <FileText size={16} /> 部分コピー
                    </button>
                    <button
                        onClick={() => handleCopy(selectedChat?.messages.find(m => m.id === contextMenu.messageId)?.text || '')}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center gap-2"
                    >
                        <Copy size={16} /> 全文コピー
                    </button>
                    <div className="h-px bg-slate-100 my-1"></div>
                    {contextMenu.isMe && (
                        <button
                            onClick={() => deleteMsg(contextMenu.messageId)}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-bold flex items-center gap-2"
                        >
                            <RotateCcw size={16} /> 送信取り消し
                        </button>
                    )}
                </div>
            )}

            {/* Partial Copy Overlay */}
            {partialCopyText && (
                <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setPartialCopyText(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h3 className="font-bold text-slate-800">テキスト選択</h3>
                            <button onClick={() => setPartialCopyText(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl text-slate-800 text-lg leading-relaxed select-text font-medium max-h-[60vh] overflow-y-auto">
                            {partialCopyText}
                        </div>
                        <div className="text-center text-xs text-slate-400 font-bold">
                            テキストを選択してコピーしてください
                        </div>
                    </div>
                </div>
            )}

            {selectedChat && (
                <ChatDetailModal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    chatId={selectedChat.id}
                    partnerName={getChatPartner(selectedChat).name}
                    partnerImage={getChatPartner(selectedChat).image}
                    partnerId={activeRole === 'seeker' ? selectedChat.companyId : selectedChat.userId}
                    isCompany={activeRole === 'seeker'}
                    partnerData={activeRole === 'seeker'
                        ? companies.find(c => c.id === selectedChat.companyId)
                        : users.find(u => u.id === selectedChat.userId)
                    }
                />
            )}

            {mode === 'fullscreen' && <MobileBottomNav />}
        </div>
    );
}
