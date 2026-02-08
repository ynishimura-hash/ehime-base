import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';

interface ItemSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (items: string[]) => void;
    title: string;
    items: string[];
}

export default function ItemSelectionModal({ isOpen, onClose, onSelect, title, items }: ItemSelectionModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [customItem, setCustomItem] = useState('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items;
        return items.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [items, searchQuery]);

    if (!isOpen) return null;

    const handleToggle = (item: string) => {
        if (selectedItems.includes(item)) {
            setSelectedItems(selectedItems.filter(i => i !== item));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleCustomAdd = () => {
        if (customItem.trim()) {
            const newItem = customItem.trim();
            if (!selectedItems.includes(newItem)) {
                setSelectedItems([...selectedItems, newItem]);
            }
            setCustomItem('');
        }
    };

    const handleConfirm = () => {
        onSelect(selectedItems);
        setSelectedItems([]);
        setSearchQuery('');
        onClose();
    };

    const handleClose = () => {
        setSelectedItems([]);
        setSearchQuery('');
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col h-[85vh] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800">{title}を選択</h3>
                    <button onClick={handleClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                        <X size={18} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="キーワードで検索..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {/* Selected Tags Preview (if any) */}
                    {selectedItems.length > 0 && (
                        <div className="px-2 pb-2 flex flex-wrap gap-2 border-b border-slate-100 mb-2">
                            {selectedItems.map(item => (
                                <span key={item} className="px-3 py-1 bg-blue-600 text-white font-bold rounded-full text-sm flex items-center gap-1 animate-in zoom-in duration-150">
                                    {item}
                                    <button onClick={(e) => { e.stopPropagation(); handleToggle(item); }} className="hover:text-blue-200">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1">
                            {filteredItems.map((item) => {
                                const isSelected = selectedItems.includes(item);
                                return (
                                    <button
                                        key={item}
                                        onClick={() => handleToggle(item)}
                                        className={`text-left px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-between ${isSelected
                                                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span>{item}</span>
                                        {isSelected && <Check size={18} className="text-blue-600" />}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400 font-bold">
                            <p>候補が見つかりませんでした</p>
                            <p className="text-xs mt-1">下のフォームから追加できます</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl space-y-4">
                    {/* Manual Add */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="リストにない項目を入力..."
                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                            value={customItem}
                            onChange={(e) => setCustomItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
                        />
                        <button
                            onClick={handleCustomAdd}
                            disabled={!customItem.trim()}
                            className={`px-4 rounded-xl font-bold text-sm flex items-center justify-center transition-colors ${customItem.trim() ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-400'}`}
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <span>{selectedItems.length}件を選択して追加</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
