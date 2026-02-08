'use client';

import React, { useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    GraduationCap,
    Plus,
    Video,
    Users,
    Settings,
    LogOut,
    Trash2,
    ChevronRight,
    Search,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { softDeleteAction } from '@/app/actions/audit';

export default function InstructorDashboard() {
    const {
        courses,
        currentUserId,
        authStatus,
        activeRole,
        fetchCourses,
        logout
    } = useAppStore();

    useEffect(() => {
        if (authStatus === 'authenticated' && activeRole === 'instructor') {
            fetchCourses();
        } else if (authStatus === 'unauthenticated') {
            window.location.href = '/inst-login';
        }
    }, [authStatus, activeRole]);

    // 自分に関連するコースのみフィルタリング
    const myCourses = useMemo(() => {
        return courses.filter(c => c.created_by === currentUserId || c.instructor_id === currentUserId);
    }, [courses, currentUserId]);

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('このコースを削除しますか？（データは削除ログとして保存されます）')) return;

        try {
            const result = await softDeleteAction('course_curriculums', courseId, currentUserId);
            if (result.success) {
                toast.success('コースを論理削除しました');
                fetchCourses(); // 再取得
            } else {
                toast.error('削除に失敗しました: ' + result.error);
            }
        } catch (error) {
            toast.error('エラーが発生しました');
        }
    };

    if (activeRole !== 'instructor' && activeRole !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h1 className="text-xl font-bold text-slate-800">アクセス権限がありません</h1>
                    <button
                        onClick={() => window.location.href = '/inst-login'}
                        className="mt-4 text-blue-600 hover:underline font-bold"
                    >
                        ログイン画面へ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col hidden lg:flex">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl">
                            <GraduationCap size={24} />
                        </div>
                        <span className="font-black text-lg tracking-tight">Instructor</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-sm font-bold text-white transition-all">
                        <GraduationCap size={18} />
                        コース管理
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 rounded-xl text-sm font-bold transition-all">
                        <Video size={18} />
                        動画ライブラリ
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 rounded-xl text-sm font-bold transition-all">
                        <Users size={18} />
                        受講生リスト
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl text-sm font-bold transition-all"
                    >
                        <LogOut size={18} />
                        ログアウト
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">コース管理</h1>
                        <p className="text-slate-500 font-bold">作成したe-ラーニングコースの管理ができます</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-500 transition-all">
                        <Plus size={20} />
                        新規コース作成
                    </button>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Courses</p>
                            <p className="text-2xl font-black text-slate-800">{myCourses.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</p>
                            <p className="text-2xl font-black text-slate-800">
                                {myCourses.filter(c => c.is_official).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Course List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="font-black text-slate-800 text-lg">コース一覧</h2>
                        <div className="relative w-64">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="コースを検索..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {myCourses.length > 0 ? myCourses.map(course => (
                            <div key={course.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center gap-4 group">
                                <div className="w-20 h-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={course.thumbnail_url || '/images/defaults/default_course_thumb.png'}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-black text-slate-800 truncate">{course.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${course.is_official ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {course.is_official ? '公式 / 承認済み' : '下書き / 審査中'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            最終更新: {new Date(course.updated_at || Date.now()).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Video size={12} />
                                            {course.lessons?.length || 0} レッスン
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                        <Settings size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-all shadow-sm">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <GraduationCap className="text-slate-300" size={32} />
                                </div>
                                <p className="text-slate-500 font-bold">まだコースがありません</p>
                                <button className="mt-4 text-blue-600 font-black text-sm hover:underline">
                                    最初のコースを作成する
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
