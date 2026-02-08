'use client';

import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// --- Sortable Item Component ---
interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    index: number;
}

export function SortableItem({ id, children, index }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        // Ensure earlier items are ON TOP of later items so dropdowns aren't hidden
        zIndex: isDragging ? 1000 : (500 - index),
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} className="touch-none">
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-3 group hover:border-blue-300 transition-colors">
                <div {...attributes} {...listeners} className="text-slate-300 cursor-grab hover:text-slate-600 p-1">
                    <GripVertical size={20} />
                </div>
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

// --- Main Container ---
interface AdminSortableListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    keyExtractor: (item: T) => string;
    onReorder: (newItems: T[]) => void;
}

export default function AdminSortableList<T>({ items, renderItem, keyExtractor, onReorder }: AdminSortableListProps<T>) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((item) => keyExtractor(item) === active.id);
            const newIndex = items.findIndex((item) => keyExtractor(item) === over?.id);
            onReorder(arrayMove(items, oldIndex, newIndex));
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map(keyExtractor)}
                strategy={verticalListSortingStrategy}
            >
                {items.map((item, index) => (
                    <SortableItem key={keyExtractor(item)} id={keyExtractor(item)} index={index}>
                        {renderItem(item)}
                    </SortableItem>
                ))}
            </SortableContext>
        </DndContext>
    );
}
