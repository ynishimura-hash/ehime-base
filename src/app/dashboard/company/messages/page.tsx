"use client";

import React from 'react';
import UnifiedChatInterface from '@/components/chat/UnifiedChatInterface';

export default function CompanyMessagesPage() {
    return (
        <div className="h-full">
            <UnifiedChatInterface mode="embedded" />
        </div>
    );
}
