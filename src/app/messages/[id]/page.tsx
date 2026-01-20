"use client";

import React, { use } from 'react';
import UnifiedChatInterface from '@/components/chat/UnifiedChatInterface';

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <UnifiedChatInterface mode="fullscreen" initialChatId={id} />;
}
