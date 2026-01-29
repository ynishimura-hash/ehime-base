'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, BookOpen } from 'lucide-react';
import AdminSortableList from '@/components/admin/common/AdminSortableList';

// Mock Data
const MOCK_COURSES = [
    { id: 'c1', title: 'デジタル活用の基礎', description: 'PC操作からSaaS活用まで', duration: '90min' },
    { id: 'c2', title: '業務自動化入門', description: 'ノーコードツールの活用', duration: '120min' },
    { id: 'c3', title: 'データ分析基礎', description: 'SpreadsheetとGAS', duration: '60min' },
];

export default function AdminCurriculumDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [courses, setCourses] = useState(MOCK_COURSES);
    const [title, setTitle] = useState('DX推進担当者育成カリキュラム');

    const handleSave = () => {
        console.log('Saving curriculum:', { id: params.id, title, courses });
        // Call API
        alert('保存しました (Mock)');
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/elearning" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Curriculum</h1>
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

            {/* Metadata Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">カリキュラム名</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-lg font-bold border-b-2 border-slate-100 py-2 focus:border-blue-500 outline-none transition-colors"
                        placeholder="Ex. 新入社員研修コース"
                    />
                </div>
            </div>

            {/* Course Builder */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <BookOpen className="text-blue-600" />
                        Courses ({courses.length})
                    </h2>
                    <button className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        <Plus size={16} /> コースを追加
                    </button>
                </div>

                <p className="text-sm text-slate-500 font-medium mb-6">
                    ドラッグアンドドロップでコースの順序を入れ替えることができます。
                </p>

                <AdminSortableList
                    items={courses}
                    keyExtractor={(item) => item.id}
                    onReorder={setCourses}
                    renderItem={(course) => (
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <h3 className="font-bold text-slate-800">{course.title}</h3>
                                <p className="text-xs text-slate-400 font-bold">{course.description}</p>
                            </div>
                            <div className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                {course.duration}
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
