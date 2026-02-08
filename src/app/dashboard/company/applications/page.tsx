"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/lib/appStore';
import { toast } from 'sonner';
import { User, MessageSquare, Calendar, ChevronRight, MoreHorizontal, LayoutList, LayoutGrid, Star, Info } from 'lucide-react';
import Link from 'next/link';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';
import { fetchCompanyApplicationsAction, updateApplicationStatusAction } from '@/app/admin/actions';
import { ApplicationDetailModal } from '@/components/dashboard/ApplicationDetailModal';
import { JobDetailModal } from '@/components/dashboard/JobDetailModal';
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
    DropAnimation,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    SortableContext,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Types
type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

interface Application {
    id: string;
    job_id: string;
    user_id: string;
    status: ApplicationStatus;
    created_at: string;
    is_favorite: boolean;
    internal_memo: string;
    jobs: {
        title: string;
        organization_id: string;
        type?: string;
        content?: string;
        salary?: string;
        working_hours?: string;
        holidays?: string;
        location?: string;
        welfare?: string;
        selection_process?: string;
    };
    profiles: {
        full_name: string;
        email: string;
        avatar_url: string;
        user_type: string;
        gender?: string;
        university?: string;
        faculty?: string;
        bio?: string;
        skills?: string[];
        qualifications?: string[];
        desired_conditions?: {
            salary?: string;
            location?: string[];
            industry?: string[];
            employmentType?: string[];
        };
        work_history?: { company: string; role: string; duration: string; description: string }[];
        graduation_year?: string;
    };
}

const STATUS_COLUMNS: { id: ApplicationStatus; label: string; color: string }[] = [
    { id: 'applied', label: '新規応募', color: 'bg-blue-100 text-blue-700' },
    { id: 'screening', label: '書類選考中', color: 'bg-orange-100 text-orange-700' },
    { id: 'interview', label: '面接', color: 'bg-purple-100 text-purple-700' },
    { id: 'offer', label: '内定・オファー', color: 'bg-pink-100 text-pink-700' },
    { id: 'hired', label: '採用決定', color: 'bg-green-100 text-green-700' },
    { id: 'rejected', label: '不採用', color: 'bg-slate-100 text-slate-700' },
];

function SortableItem({
    id,
    application,
    onClick,
    onJobClick
}: {
    id: string;
    application: Application;
    onClick: () => void;
    onJobClick: (job: Application['jobs']) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const isQuest = application.jobs.type === 'quest' || application.jobs.type === 'internship';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="group relative bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing mb-3"
        >
            <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden mt-0.5">
                    <img
                        src={application.profiles.avatar_url || getFallbackAvatarUrl(application.user_id, application.profiles.gender)}
                        alt={application.profiles.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getFallbackAvatarUrl(application.user_id, application.profiles.gender);
                        }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                        <h4 className="font-black text-slate-800 truncate text-sm pr-1">{application.profiles.full_name}</h4>
                        {application.is_favorite && <Star size={12} className="text-yellow-400 fill-yellow-400 shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 mb-2 truncate">
                        {application.profiles.user_type === 'student' ? '学生' : '求職者'}
                    </p>

                    <div className="bg-slate-50 rounded-md p-2 mb-2 border border-slate-100 relative group/job">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isQuest ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                {isQuest ? 'クエスト' : '求人'}
                            </span>
                        </div>
                        <p
                            className="text-[11px] font-bold text-slate-700 line-clamp-2 leading-tight hover:text-blue-600 hover:underline cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onJobClick(application.jobs);
                            }}
                        >
                            {application.jobs.title}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-0.5">
                            <Calendar size={10} />
                            {new Date(application.created_at).toLocaleDateString()}
                        </span>
                        {application.internal_memo && (
                            <span className="flex items-center gap-0.5 text-yellow-600 bg-yellow-50 px-1 py-px rounded">
                                <span className="w-1 h-1 rounded-full bg-yellow-400"></span>
                                メモあり
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SortableColumn({
    column,
    items,
    onItemClick,
    onJobClick
}: {
    column: any;
    items: Application[];
    onItemClick: (app: Application) => void;
    onJobClick: (job: Application['jobs']) => void;
}) {
    const { setNodeRef } = useDroppable({ id: column.id });

    return (
        <div className="w-72 flex-shrink-0 flex flex-col bg-white rounded-xl border border-slate-100 shadow-sm h-full max-h-full">
            <div className={`p-3 border-b border-slate-100 font-black flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-xl`}>
                <span className="text-sm text-slate-700">{column.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${column.color}`}>
                    {items.length}
                </span>
            </div>

            <div ref={setNodeRef} className="p-2 space-y-2 overflow-y-auto flex-1 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {items.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-[10px] font-bold opacity-50 pointer-events-none">
                            なし
                        </div>
                    )}
                    {items.map(app => (
                        <SortableItem
                            key={app.id}
                            id={app.id}
                            application={app}
                            onClick={() => onItemClick(app)}
                            onJobClick={onJobClick}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}

// Main Page Component
export default function CompanyATSPage() {
    const { currentUserId, currentCompanyId } = useAppStore();

    // Use currentCompanyId directly. If not set, use fallback for dev.
    const targetOrgId = currentCompanyId || 'a0ee0000-0000-0000-0000-000000000003';

    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [selectedJob, setSelectedJob] = useState<Application['jobs'] | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null); // For drag overlay

    // Sensors for DnD
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchApplications = async () => {
        if (!currentUserId && !targetOrgId) return;

        setIsLoading(true);
        try {
            const result = await fetchCompanyApplicationsAction(targetOrgId);

            if (!result.success) {
                console.error(result.error);
                toast.error('応募データの取得に失敗しました');
                return;
            }
            // Ensure types match by casting.
            setApplications(result.data as any || []);
        } catch (e) {
            console.error(e);
            toast.error('予期せぬエラーが発生しました');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [currentUserId, targetOrgId]);

    // DnD Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        let newStatus: ApplicationStatus | null = null;

        if (STATUS_COLUMNS.some(c => c.id === overId)) {
            newStatus = overId as ApplicationStatus;
        } else {
            // Find the item we dropped over
            const overItem = applications.find(a => a.id === overId);
            if (overItem) {
                newStatus = overItem.status;
            }
        }

        if (newStatus) {
            // Optimistic Update
            const oldStatus = applications.find(a => a.id === activeId)?.status;
            if (oldStatus === newStatus) return; // No change

            setApplications(prev => prev.map(a =>
                a.id === activeId ? { ...a, status: newStatus! } : a
            ));

            // Server Update
            const result = await updateApplicationStatusAction(activeId, newStatus);
            if (!result.success) {
                // Revert
                setApplications(prev => prev.map(a =>
                    a.id === activeId ? { ...a, status: oldStatus! } : a
                ));
                toast.error('ステータスの更新に失敗しました');
            } else {
                toast.success('ステータスを更新しました');
            }
        }
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.4',
                },
            },
        }),
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white z-10">
                <div>
                    <h2 className="text-xl font-black text-slate-800">応募者管理 (ATS)</h2>
                    <p className="text-slate-500 text-xs font-bold mt-1">
                        現在の応募数: <span className="text-blue-600 text-base">{applications.length}</span> 名
                    </p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('board')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'board' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <LayoutGrid size={14} />
                        ボード
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <LayoutList size={14} />
                        リスト
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden bg-slate-50">
                {viewMode === 'board' ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex gap-3 h-full overflow-x-auto p-4 items-start">
                            {STATUS_COLUMNS.map(col => (
                                <SortableColumn
                                    key={col.id}
                                    column={col}
                                    items={applications.filter(a => a.status === col.id)}
                                    onItemClick={setSelectedApp}
                                    onJobClick={setSelectedJob}
                                />
                            ))}
                        </div>
                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeId ? (
                                <SortableItem
                                    id={activeId}
                                    application={applications.find(a => a.id === activeId)!}
                                    onClick={() => { }}
                                    onJobClick={() => { }}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                ) : (
                    <div className="bg-white m-4 rounded-xl border border-zinc-200 overflow-hidden shadow-sm h-[calc(100%-32px)] flex flex-col">
                        <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">応募者</th>
                                        <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">応募求人</th>
                                        <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">ステータス</th>
                                        <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">応募日</th>
                                        <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">メモ</th>
                                        <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">アクション</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {applications.map(app => (
                                        <tr
                                            key={app.id}
                                            onClick={() => setSelectedApp(app)}
                                            className="hover:bg-slate-50 cursor-pointer transition-colors group"
                                        >
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={app.profiles.avatar_url || getFallbackAvatarUrl(app.user_id, app.profiles.gender)}
                                                        className="w-8 h-8 rounded-full bg-slate-100 object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = getFallbackAvatarUrl(app.user_id, app.profiles.gender);
                                                        }}
                                                    />
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                                                            {app.profiles.full_name}
                                                            {app.is_favorite && <Star size={10} className="text-yellow-400 fill-yellow-400" />}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400">{app.profiles.user_type === 'student' ? '学生' : '求職者'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div
                                                    className="inline-block"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedJob(app.jobs); }}
                                                >
                                                    <div className="flex items-center gap-1 mb-0.5">
                                                        <span className={`text-[9px] px-1 rounded font-bold ${['quest', 'internship'].includes(app.jobs.type || '') ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {['quest', 'internship'].includes(app.jobs.type || '') ? 'クエスト' : '求人'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs font-bold text-slate-600 max-w-[200px] truncate hover:text-blue-600 hover:underline">
                                                        {app.jobs.title}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${STATUS_COLUMNS.find(c => c.id === app.status)?.color}`}>
                                                    {STATUS_COLUMNS.find(c => c.id === app.status)?.label}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs text-slate-500 font-medium">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-3">
                                                {app.internal_memo && (
                                                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" title="メモあり"></span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right">
                                                <ChevronRight size={14} className="text-slate-300 inline-block" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <ApplicationDetailModal
                isOpen={!!selectedApp}
                onClose={() => setSelectedApp(null)}
                application={selectedApp}
                onUpdate={fetchApplications}
            />

            <JobDetailModal
                isOpen={!!selectedJob}
                onClose={() => setSelectedJob(null)}
                job={selectedJob}
            />
        </div>
    );
}
