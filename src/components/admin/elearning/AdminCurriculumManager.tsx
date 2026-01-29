'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Video, FileText, ChevronDown, ChevronRight, PlayCircle, PauseCircle, Maximize2, Pencil, Clock } from 'lucide-react';

// ...


import { getYoutubeId } from '@/utils/youtube';
// --- Types ---
// Assuming Course structure matches appStore but locally simplified for DND
export interface LessonItem {
    id: string;
    title: string;
    duration: string;
    type: 'video' | 'quiz' | 'document';
    thumbnail?: string;
    videoUrl?: string;
    hasQuiz?: boolean;
    hasDocument?: boolean;
}

export interface CurriculumColumn {
    id: string;
    title: string;
    lessons: LessonItem[];
}

interface AdminCurriculumManagerProps {
    initialCurriculums: CurriculumColumn[];
    onSave: (curriculums: CurriculumColumn[]) => void;
    onEditLesson?: (lesson: LessonItem) => void;
    onPlayVideo?: (lesson: LessonItem) => void;
}

// --- Sortable Items ---

function SortableLesson({ lesson, onEdit, onPlay }: { lesson: LessonItem, onEdit?: (lesson: LessonItem) => void, onPlay?: (lesson: LessonItem) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: lesson.id, data: { type: 'Lesson', lesson } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [isHovering, setIsHovering] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayPopup = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onPlay) {
            onPlay(lesson);
        } else if (lesson.videoUrl) {
            window.open(lesson.videoUrl, '_blank', 'width=800,height=600');
        }
    };

    const handleThumbnailClick = () => {
        if (lesson.type === 'video' && lesson.videoUrl) {
            setIsPlaying(!isPlaying);
        }
    };



    return (
        <div
            ref={setNodeRef}
            style={style}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4 mb-2 group hover:border-blue-300 transition-colors relative"
        >
            <div {...attributes} {...listeners} className="text-slate-400 cursor-grab active:cursor-grabbing p-1">
                <GripVertical size={16} />
            </div>

            {/* Thumbnail / Video Preview Area */}
            {/* Click to Toggle Inline Play */}
            <div
                className="w-32 aspect-video bg-slate-900 rounded-md overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 relative cursor-pointer group/thumb"
                onClick={handleThumbnailClick}
            >
                {lesson.type === 'video' && lesson.videoUrl ? (
                    isPlaying ? (
                        getYoutubeId(lesson.videoUrl) ? (
                            <div className="w-full h-full relative">
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYoutubeId(lesson.videoUrl)}?autoplay=1&controls=0&modestbranding=1`}
                                    className="w-full h-full pointer-events-none"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen={false}
                                />
                                {/* Overlay to capture click for stop */}
                                <div className="absolute inset-0 z-10" />
                            </div>
                        ) : (
                            <video
                                src={lesson.videoUrl}
                                autoPlay
                                muted={false}
                                className="w-full h-full object-cover pointer-events-none"
                            />
                        )
                    ) : (
                        <>
                            {lesson.thumbnail || (lesson.videoUrl && getYoutubeId(lesson.videoUrl) ? `https://img.youtube.com/vi/${getYoutubeId(lesson.videoUrl)}/mqdefault.jpg` : null) ? (
                                <img src={lesson.thumbnail || `https://img.youtube.com/vi/${getYoutubeId(lesson.videoUrl)}/mqdefault.jpg`} alt="" className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-60 transition-opacity" />
                            ) : (
                                <div className="text-slate-600">
                                    <Video size={24} />
                                </div>
                            )}

                            {/* Overlay Play Button on Hover */}
                            <div className={`absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity bg-black/20`}>
                                <PlayCircle size={32} fill="rgba(0,0,0,0.5)" />
                            </div>
                        </>
                    )
                ) : (
                    <div className="text-emerald-400">
                        <FileText size={24} />
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-1 right-1 bg-black/60 text-white rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">
                    {lesson.type}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-700 truncate">{lesson.title}</p>
                    <button
                        onClick={() => onEdit?.(lesson)}
                        className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Details"
                    >
                        <Pencil size={14} />
                    </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                        <Clock size={10} />
                        <Clock size={10} />
                        {lesson.duration}
                    </span>
                    {lesson.hasQuiz && (
                        <span className="font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[10px] border border-orange-200">
                            小テストあり
                        </span>
                    )}
                    {lesson.hasDocument && (
                        <span className="font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[10px] border border-indigo-200">
                            資料あり
                        </span>
                    )}
                    {lesson.videoUrl && (
                        <button
                            onClick={handlePlayPopup}
                            className="flex items-center gap-1 text-blue-500 hover:underline font-bold text-[10px] hover:bg-blue-50 px-1.5 py-0.5 rounded"
                        >
                            <Maximize2 size={10} />
                            POPUP PLAY
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Actions (Right Side) */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Add delete or other actions here if needed */}
            </div>
        </div>
    );
}

// ... imports
import ContentPicker from './ContentPicker';
import { ContentItem } from '@/data/mock_elearning_data';

// ... Types

// Update Props to include onAddContent callback for the child component
// Actually since everything is inside the same file (based on previous view), I can just pass it down.

// ... SortableLesson ...

function SortableCurriculum({ curriculum, children, onAddContent, onEditLesson, onPlayVideo }: { curriculum: CurriculumColumn, children: React.ReactNode, onAddContent: () => void, onEditLesson?: (lesson: LessonItem) => void, onPlayVideo?: (lesson: LessonItem) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: curriculum.id, data: { type: 'Curriculum', curriculum } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div ref={setNodeRef} style={style} className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div {...attributes} {...listeners} className="text-slate-400 cursor-grab p-1 hover:bg-slate-200 rounded">
                        <GripVertical size={20} />
                    </div>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="font-black text-slate-700 text-lg flex items-center gap-2 hover:text-blue-600">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        {curriculum.title}
                    </button>
                    <span className="bg-slate-200 text-slate-500 text-xs px-2 py-0.5 rounded-full font-bold">
                        {React.Children.count(children)}
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="min-h-[50px] space-y-2">
                    <div className="p-2 bg-slate-100/50 rounded-lg border-2 border-dashed border-slate-200">
                        {children}
                    </div>
                    <button
                        onClick={onAddContent}
                        className="w-full py-2 flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-slate-300 hover:border-blue-300 transition-colors font-bold text-sm"
                    >
                        <Plus size={16} /> Add Content from Library
                    </button>
                </div>
            )}
        </div>
    );
}

// --- Main Component ---

export default function AdminCurriculumManager({ initialCurriculums, onSave, onEditLesson, onPlayVideo }: AdminCurriculumManagerProps) {
    const [curriculums, setCurriculums] = useState<CurriculumColumn[]>(initialCurriculums);
    const [activeDragItem, setActiveDragItem] = useState<any>(null);

    // Picker State
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [targetCurriculumId, setTargetCurriculumId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleOpenPicker = (curriculumId: string) => {
        setTargetCurriculumId(curriculumId);
        setIsPickerOpen(true);
    };

    const handlePickerSelect = (selectedItems: ContentItem[]) => {
        if (!targetCurriculumId) return;

        setCurriculums(prev => prev.map(c => {
            if (c.id === targetCurriculumId) {
                const newLessons: LessonItem[] = selectedItems.map(item => ({
                    id: Math.random().toString(36).substr(2, 9), // Generate unique instance ID
                    title: item.title,
                    duration: item.duration || '00:00',
                    type: item.type as 'video' | 'quiz' | 'document',
                    videoUrl: item.url,
                    thumbnail: item.thumbnail
                }));
                return { ...c, lessons: [...c.lessons, ...newLessons] };
            }
            return c;
        }));
    };

    // ... drag handlers (keep existing) ...

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveDragItem(active.data.current);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find containers
        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId) || (curriculums.find(c => c.id === overId) ? overId : null);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        // Move Item Logic (Cross Container)
        setCurriculums(prev => {
            const activeItems = prev.find(c => c.id === activeContainer)?.lessons || [];
            const overItems = prev.find(c => c.id === overContainer)?.lessons || [];

            const activeIndex = activeItems.findIndex(i => i.id === activeId);
            const overIndex = overItems.findIndex(i => i.id === overId);

            let newIndex;
            if (overId in prev) { // We're over a container
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return prev.map(c => {
                if (c.id === activeContainer) {
                    return { ...c, lessons: c.lessons.filter(l => l.id !== activeId) };
                }
                if (c.id === overContainer) {
                    const newLessons = [...c.lessons];
                    // Warning: we need the item object. We can find it in active.data or search
                    const item = active.data.current?.lesson;
                    if (item) {
                        newLessons.splice(newIndex, 0, item);
                    }
                    return { ...c, lessons: newLessons };
                }
                return c;
            });
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveDragItem(null);
            return;
        }

        const activeType = active.data.current?.type;
        const overType = over.data.current?.type;

        // Reordering Curriculums
        if (activeType === 'Curriculum' && overType === 'Curriculum') {
            if (active.id !== over.id) {
                setCurriculums(items => {
                    const oldIndex = items.findIndex(i => i.id === active.id);
                    const newIndex = items.findIndex(i => i.id === over.id);
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
        }

        // Reordering Lessons within same container
        if (activeType === 'Lesson') {
            const activeContainer = findContainer(active.id);
            const overContainer = findContainer(over.id);

            if (activeContainer && overContainer && activeContainer === overContainer) {
                const containerIndex = curriculums.findIndex(c => c.id === activeContainer);
                const items = curriculums[containerIndex].lessons;
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);

                if (oldIndex !== newIndex) {
                    const newItems = arrayMove(items, oldIndex, newIndex);
                    const newCurriculums = [...curriculums];
                    newCurriculums[containerIndex] = { ...newCurriculums[containerIndex], lessons: newItems };
                    setCurriculums(newCurriculums);
                }
            }
        }

        setActiveDragItem(null);
        // Save trigger
        // onSave(curriculums); 
    };

    // Helper to find which Curriculum a Lesson belongs to
    const findContainer = (id: any) => {
        if (curriculums.find(c => c.id === id)) return id;
        return curriculums.find(c => c.lessons.some(l => l.id === id))?.id;
    };

    // Trigger onSave when curriculums change (debounced or explicit save button preferred usually, 
    // but for this demo I'll just expose the value via onSave call when needed or button)
    // Actually, let's provide a save button outside or just auto-callback
    useEffect(() => {
        onSave(curriculums);
    }, [curriculums, onSave]);

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };


    return (
        <div className="max-w-3xl mx-auto py-8">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={curriculums.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {curriculums.map(curriculum => (
                        <SortableCurriculum
                            key={curriculum.id}
                            curriculum={curriculum}
                            onAddContent={() => handleOpenPicker(curriculum.id)}

                            onEditLesson={onEditLesson}
                            onPlayVideo={onPlayVideo}
                        >
                            <SortableContext items={curriculum.lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                {curriculum.lessons.map(lesson => (
                                    <SortableLesson key={lesson.id} lesson={lesson} onEdit={onEditLesson} onPlay={onPlayVideo} />
                                ))}
                            </SortableContext>
                        </SortableCurriculum>
                    ))}
                </SortableContext>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeDragItem ? (
                        activeDragItem.type === 'Curriculum' ? (
                            <div className="bg-slate-50 p-4 rounded-xl border border-blue-500 shadow-xl opacity-90 w-[300px]">
                                <h3 className="font-black text-slate-800">{activeDragItem.curriculum.title}</h3>
                            </div>
                        ) : (
                            <div className="bg-white p-3 rounded-lg border border-blue-500 shadow-xl flex items-center gap-3 w-[280px]">
                                <GripVertical size={16} />
                                <div className="font-bold text-sm text-slate-700">{activeDragItem.lesson.title}</div>
                            </div>
                        )
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Content Picker Modal */}
            <ContentPicker
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handlePickerSelect}
            />
        </div>
    );
}
