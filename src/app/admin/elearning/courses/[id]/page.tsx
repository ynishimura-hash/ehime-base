'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, BookOpen, Clock, Tag, Image as ImageIcon, CheckCircle2, X } from 'lucide-react';
import AdminCurriculumManager, { CurriculumColumn, LessonItem } from '@/components/admin/elearning/AdminCurriculumManager';
import { ImageUpload } from '@/components/ImageUpload';
import ContentFormModal from '@/components/admin/elearning/ContentFormModal';
import VideoPlayerModal from '@/components/admin/elearning/VideoPlayerModal';
import { ContentItem } from '@/data/mock_elearning_data';

// Mock Data
const MOCK_CHAPTERS: CurriculumColumn[] = [
    {
        id: 'chap1',
        title: '第1章: デジタルリテラシー',
        lessons: [
            {
                id: 'l1',
                title: 'PCの基本操作',
                duration: '10:00',
                type: 'video',
                thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
                videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm' // Sample video
            },
            {
                id: 'l2',
                title: 'セキュリティの基礎',
                duration: '15:00',
                type: 'video',
                // No videoUrl to test fallback
            },
        ]
    },
    {
        id: 'chap2',
        title: '第2章: クラウドツールの活用',
        lessons: [
            {
                id: 'l3',
                title: 'Google Driveの使い方',
                duration: '12:00',
                type: 'video',
                thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
                videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
            },
            {
                id: 'l4',
                title: '理解度確認テスト',
                duration: '5:00',
                type: 'quiz'
            },
        ]
    }
];

import { ElearningService } from '@/services/elearning';

export default function AdminCourseDetailPage() {
    const params = useParams();
    const router = useRouter();

    // Course Metadata
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('DX'); // Default
    const [level, setLevel] = useState('初級'); // Default
    const [tags, setTags] = useState<string[]>([]);
    const [image, setImage] = useState<string>(''); // カバー画像URL
    const [chapters, setChapters] = useState<CurriculumColumn[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<ContentItem | null>(null);

    // Video Player State
    const [playingContent, setPlayingContent] = useState<ContentItem | null>(null);

    const handlePlayVideo = (lesson: LessonItem) => {
        setPlayingContent({
            id: lesson.id,
            title: lesson.title,
            url: lesson.videoUrl || '',
            category: 'Video',
            type: 'video',
            duration: lesson.duration
        } as ContentItem);
    };

    const handleEditLesson = (lesson: LessonItem) => {
        // Convert LessonItem to ContentItem for the modal
        const contentItem: ContentItem = {
            id: lesson.id,
            title: lesson.title,
            url: lesson.videoUrl || '',
            category: category, // Use course category or lesson specific if available
            type: lesson.type,
            duration: lesson.duration,
            createdAt: new Date().toISOString(),
            // @ts-ignore - quiz data might exist on lesson object from API
            quiz: lesson.quiz,
            // @ts-ignore
            material_url: lesson.materialUrl || lesson.videoUrl // Fallback logic or specific field
        };
        setEditingContent(contentItem);
        setIsEditModalOpen(true);
    };

    const handleSaveContent = async (item: ContentItem) => {
        try {
            await ElearningService.updateContent(item.id, {
                title: item.title,
                duration: item.duration,
                url: item.url, // API expects 'url' -> maps to youtube_url
                quiz: item.quiz, // Full quiz object
                material_url: item.material_url,
                hasQuiz: !!item.quiz,
                hasDocument: !!item.material_url
            } as any);

            // Update local state
            setChapters(prev => prev.map(c => ({
                ...c,
                lessons: c.lessons.map(l => l.id === item.id ? {
                    ...l,
                    title: item.title,
                    duration: item.duration || '',
                    videoUrl: item.url,
                    hasQuiz: !!item.quiz,
                    hasDocument: !!item.material_url,
                    // @ts-ignore
                    quiz: item.quiz,
                    // @ts-ignore
                    materialUrl: item.material_url
                } : l)
            })));

            setIsEditModalOpen(false);
            setEditingContent(null);
        } catch (e) {
            console.error('Failed to update content:', e);
            alert('変更の保存に失敗しました');
        }
    };

    // Load Data
    React.useEffect(() => {
        const load = async () => {
            if (!params.id) return;
            try {
                const mod = await ElearningService.getModule(params.id as string);
                if (mod) {
                    setTitle(mod.title);
                    setDescription(mod.description);
                    setTags(mod.tags || []);
                    setImage(mod.image || mod.thumbnail_url || '');

                    // Transform flat lessons to chapters (group by category if possible, or single chapter)
                    // Since DB doesn't have chapters, we put all in one for now
                    const mappedLessons = mod.lessons.map(l => ({
                        id: l.id,
                        title: l.title,
                        duration: l.duration || '0:00',
                        type: l.type as 'video' | 'quiz', // Cast
                        thumbnail: '',
                        videoUrl: l.url,
                        // @ts-ignore
                        quiz: l.quiz,
                        // @ts-ignore
                        materialUrl: l.material_url
                    }));

                    setChapters([{
                        id: 'main',
                        title: 'Lessons',
                        lessons: mappedLessons
                    }]);
                }
            } catch (e) {
                console.error('Failed to load module:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [params.id]);

    const handleSave = async () => {
        try {
            // DBにimageカラムがないため、tagsに画像情報を埋め込む
            const updatedTags = tags.filter(t => !t.startsWith('image:'));
            if (image) {
                updatedTags.push(`image:${image}`);
            }

            await ElearningService.updateModule(params.id as string, {
                title,
                description,
                tags: updatedTags,
                // image: image, // カラムが存在しないため送らない
                // Note: Updating lessons hierarchy is complex, skipping for this specific task
                // We focus on Tags and Image
            });
            alert('保存しました');
        } catch (e) {
            console.error(e);
            alert('保存に失敗しました');
        }
    };

    const toggleTag = (tag: string) => {
        if (tags.includes(tag)) {
            setTags(tags.filter(t => t !== tag));
        } else {
            setTags([...tags, tag]);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/elearning" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Module (Course)</h1>
                        <p className="text-xs font-bold text-slate-400">ID: {params.id}</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg"
                >
                    <Save size={18} /> 保存する
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Metadata */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h2 className="font-black text-slate-900 flex items-center gap-2">
                            <Tag size={18} className="text-slate-400" /> 基本情報
                        </h2>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">コースタイトル</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-colors text-slate-900"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">タグ設定</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => toggleTag('Recommended')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 ${tags.includes('Recommended')
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400'
                                        }`}
                                >
                                    {tags.includes('Recommended') && <CheckCircle2 size={12} />}
                                    おすすめ (Recommended)
                                </button>
                                {/* Add more tags here if needed */}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">説明</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-colors min-h-[100px] text-slate-900"
                            />
                        </div>

                        <ImageUpload
                            currentImageUrl={image}
                            onImageUploaded={setImage}
                            label="カバー画像"
                            bucketName="image"
                            folder="courses"
                        />

                        {/* Note: Category/Level fields hidden as they are on Track level usually, or mock only */}
                    </div>
                </div>

                {/* Right: Structure Builder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-black text-slate-900 flex items-center gap-2">
                            <BookOpen size={18} className="text-slate-400" /> レッスン一覧
                        </h2>
                        {/* Add Chapter button removed as DB is flat list currently */}
                    </div>

                    {chapters.length > 0 ? (
                        <AdminCurriculumManager
                            initialCurriculums={chapters}
                            onSave={setChapters}
                            onEditLesson={handleEditLesson}
                            onPlayVideo={handlePlayVideo}
                        />
                    ) : (
                        <div className="p-10 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
                            No lessons found.
                        </div>
                    )}
                </div>
            </div>
            {/* Edit Modal (Common Component) */}
            <ContentFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveContent}
                initialData={editingContent}
            />

            <VideoPlayerModal
                content={playingContent}
                onClose={() => setPlayingContent(null)}
            />
        </div>
    );
}
