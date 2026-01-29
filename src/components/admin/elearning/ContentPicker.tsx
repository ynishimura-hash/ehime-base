'use client';

import React, { useState } from 'react';
import { Search, X, Check, Video, FileText } from 'lucide-react';
import { ContentItem } from '@/data/mock_elearning_data';

// Mock Data duplicate (Ideally this comes from a shared source/hook)
const MOCK_CONTENT_DB: ContentItem[] = [
    {
        id: 'c1',
        title: 'サラリーマンから独立する技術',
        type: 'video',
        url: 'https://youtu.be/W2dqWtRtVMg',
        duration: '60:00',
        category: 'Business',
        createdAt: '2026-01-17',
    },
    {
        id: 'c2',
        title: '年収1,000万円を超えるクリエイターになるために (仕事とは)',
        type: 'video',
        url: 'https://youtu.be/M86ArrVSSFE',
        duration: '45:00',
        category: 'Business',
        createdAt: '2026-01-13',
    },
    {
        id: 'c3',
        title: 'マネーリテラシー',
        type: 'video',
        url: 'https://youtu.be/Y3ZNnYNtaIo',
        duration: '50:00',
        category: 'Finance',
        createdAt: '2026-01-10',
    },
    {
        id: 'c4',
        title: '経営者になるということ',
        type: 'video',
        url: 'https://youtu.be/hrAOXCuaMOg',
        duration: '55:00',
        category: 'Business',
        createdAt: '2026-01-03',
    },
    {
        id: 'c5',
        title: '副業で活躍！AIバックオフィス実践セミナー',
        type: 'video',
        url: 'https://youtu.be/HgFP79PRPVQ',
        duration: '90:00',
        category: 'DX',
        createdAt: '2025-12-29',
    },
    {
        id: 'c6',
        title: '学んで損なし！Webライター入門編',
        type: 'video',
        url: 'https://youtu.be/bvxgjw1xg14',
        duration: '40:00',
        category: 'Skills',
        createdAt: '2025-12-24',
    },
    {
        id: 'c7',
        title: '年収1000万円を超えるクリエイターになるために (事業を興す)',
        type: 'video',
        url: 'https://youtu.be/Y3609WHXFGM',
        duration: '55:00',
        category: 'Business',
        createdAt: '2025-12-24',
    }
];

interface ContentPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (selectedItems: ContentItem[]) => void;
}

export default function ContentPicker({ isOpen, onClose, onSelect }: ContentPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    if (!isOpen) return null;

    const filteredContent = MOCK_CONTENT_DB.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleConfirm = () => {
        const items = MOCK_CONTENT_DB.filter(item => selectedIds.includes(item.id));
        onSelect(items);
        onClose();
        setSelectedIds([]); // Reset
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-900">Select Content from Library</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search video title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm font-bold border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredContent.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-bold">No content found</div>
                    ) : (
                        <div className="space-y-1">
                            {filteredContent.map(item => {
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleSelection(item.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border-2
                                            ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100'}
                                        `}
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                                            ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 bg-white'}
                                        `}>
                                            {isSelected && <Check size={14} strokeWidth={4} />}
                                        </div>

                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                                            ${item.type === 'video' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'}
                                        `}>
                                            {item.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-sm truncate ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                                {item.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span>{item.category}</span>
                                                <span>•</span>
                                                <span>{item.duration}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
                    <span className="text-sm font-bold text-slate-500">
                        {selectedIds.length} item{selectedIds.length !== 1 && 's'} selected
                    </span>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedIds.length === 0}
                            className={`px-6 py-2 rounded-lg font-bold transition-all shadow-lg
                                ${selectedIds.length > 0
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
                            `}
                        >
                            Add to Course
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
