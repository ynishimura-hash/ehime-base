'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Layout, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/admin/common/AdminSortableList';
import { ElearningService } from '@/services/elearning';
import { toast } from 'sonner';

export default function AdminCurriculumDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // コースの状態管理（ローカル編集用）
    const [courses, setCourses] = useState<any[]>([]);
    const [originalCourses, setOriginalCourses] = useState<any[]>([]); // 保存時比較用
    const [removedCourseIds, setRemovedCourseIds] = useState<string[]>([]); // リンク解除予定のコースID
    const [addedCourses, setAddedCourses] = useState<any[]>([]); // 新規追加予定のコース

    const [showAddModal, setShowAddModal] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');

    // 変更があるかどうか
    const hasChanges = removedCourseIds.length > 0 || addedCourses.length > 0;

    useEffect(() => {
        const load = async () => {
            if (!params.id) return;
            try {
                const track = await ElearningService.getTrack(params.id as string);
                if (track) {
                    setTitle(track.title);
                    setDescription(track.description);
                    setThumbnail(track.image);
                    setIsPublished(track.is_published);
                    setCourses(track.courses || []);
                    setOriginalCourses(track.courses || []);
                }
            } catch (e) {
                console.error(e);
                toast.error('カリキュラムの読み込みに失敗しました');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [params.id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. トラック基本情報を保存
            await ElearningService.updateTrack(params.id as string, {
                title,
                description,
                image: thumbnail,
                is_published: isPublished
            });

            // 2. リンク解除されたコースを処理（course_idをnullに）
            for (const courseId of removedCourseIds) {
                await ElearningService.updateModule(courseId, { course_id: null });
            }

            // 3. 新規追加されたコースを作成
            for (const course of addedCourses) {
                await ElearningService.createModule({
                    title: course.title,
                    course_id: params.id as string,
                    order_index: courses.length
                });
            }

            // 状態をリセット
            setRemovedCourseIds([]);
            setAddedCourses([]);

            // 最新データを再取得
            const track = await ElearningService.getTrack(params.id as string);
            if (track) {
                setCourses(track.courses || []);
                setOriginalCourses(track.courses || []);
            }

            toast.success('保存しました');
        } catch (e) {
            console.error(e);
            toast.error('保存に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePublish = async () => {
        try {
            const newStatus = !isPublished;
            await ElearningService.updateTrack(params.id as string, { is_published: newStatus });
            setIsPublished(newStatus);
            toast.success(newStatus ? '公開しました' : '非公開にしました');
        } catch (e) {
            console.error(e);
            toast.error('更新に失敗しました');
        }
    };

    const handleDelete = async () => {
        if (!confirm('このカリキュラムを削除してもよろしいですか？\n紐づいているコース設定も解除される可能性があります。')) return;
        try {
            await ElearningService.deleteTrack(params.id as string);
            toast.success('削除しました');
            router.push('/admin/elearning');
        } catch (e) {
            console.error(e);
            toast.error('削除に失敗しました');
        }
    };

    // コースを新規追加（保存時に反映）
    const handleAddCourse = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCourseTitle.trim()) return;

        const tempCourse = {
            id: `temp_${Date.now()}`,
            title: newCourseTitle,
            isNew: true
        };

        setCourses([...courses, tempCourse]);
        setAddedCourses([...addedCourses, tempCourse]);
        setShowAddModal(false);
        setNewCourseTitle('');
        toast.info('コースを追加しました（保存ボタンで確定）');
    };

    // コースをリンク解除（保存時に反映）
    const handleRemoveCourse = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        // 新規追加されたコースの場合は、ローカルから削除
        if (course.isNew) {
            setCourses(courses.filter(c => c.id !== courseId));
            setAddedCourses(addedCourses.filter(c => c.id !== courseId));
            return;
        }

        // 既存コースの場合は、リンク解除予定に追加
        setCourses(courses.filter(c => c.id !== courseId));
        setRemovedCourseIds([...removedCourseIds, courseId]);
        toast.info('コースをリンク解除しました（保存ボタンで確定）');
    };

    // 変更を取り消し
    const handleResetChanges = () => {
        setCourses(originalCourses);
        setRemovedCourseIds([]);
        setAddedCourses([]);
        toast.info('変更を取り消しました');
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setCourses((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/elearning" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Curriculum (Track)</h1>
                        <p className="text-xs font-bold text-slate-400">ID: {params.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDelete}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="削除する"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button
                        onClick={handleTogglePublish}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-colors ${isPublished
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                    >
                        {isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                        {isPublished ? '公開中' : '非公開'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg ${hasChanges
                                ? 'bg-blue-600 text-white hover:bg-blue-700 animate-pulse'
                                : 'bg-slate-900 text-white hover:bg-slate-700'
                            } disabled:opacity-50`}
                    >
                        <Save size={18} /> {saving ? '保存中...' : '保存する'}
                    </button>
                </div>
            </div>

            {/* 未保存の変更がある場合の通知 */}
            {hasChanges && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-amber-700 font-bold text-sm">
                        未保存の変更があります（追加: {addedCourses.length}, リンク解除: {removedCourseIds.length}）
                    </span>
                    <button
                        onClick={handleResetChanges}
                        className="text-amber-600 hover:text-amber-800 font-bold text-sm hover:underline"
                    >
                        取り消す
                    </button>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h2 className="font-black text-slate-900 flex items-center gap-2">
                    <Layout size={18} className="text-slate-400" /> 基本情報
                </h2>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">カリキュラム名</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-colors text-slate-900"
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">説明</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-colors min-h-[100px] text-slate-900"
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Thumbnail URL</label>
                    <input
                        type="text"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        className="w-full font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-colors text-slate-900"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-black text-slate-900 flex items-center gap-2">
                        Included Courses ({courses.length})
                    </h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 text-blue-600 font-bold hover:underline"
                    >
                        <Plus size={18} /> Add Course
                    </button>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={courses.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {courses.map((course, index) => (
                            <SortableItem key={course.id} id={course.id} index={index}>
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-700">{course.title}</span>
                                        {course.isNew && (
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-bold rounded">New</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {!course.isNew && (
                                            <Link href={`/admin/elearning/courses/${course.id}`} className="text-xs font-bold text-blue-600 hover:underline">
                                                Edit
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => handleRemoveCourse(course.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                            title="リンク解除（コース自体は削除されません）"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </SortableItem>
                        ))}
                    </SortableContext>
                </DndContext>

                {courses.length === 0 && (
                    <div className="p-10 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
                        No courses included in this curriculum.
                    </div>
                )}
            </div>

            {/* Add Course Modal */}
            {showAddModal && (
                <>
                    <div className="fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-xl z-50 w-full max-w-md">
                        <h3 className="text-lg font-black text-slate-900 mb-4">Add New Course</h3>
                        <form onSubmit={handleAddCourse}>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 mb-2">Course Title</label>
                                <input
                                    type="text"
                                    value={newCourseTitle}
                                    onChange={(e) => setNewCourseTitle(e.target.value)}
                                    className="w-full font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Enter course title..."
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    disabled={!newCourseTitle.trim()}
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
