"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/appStore';
import { Search, Filter, Download, Plus, BookOpen } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type MemberProgress = {
    id: string; // user_id
    name: string;
    image: string;
    department: string; // from fallback or profile
    status: 'Active' | 'Inactive';
    totalLessons: number;
    completedLessons: number;
    lastActive: string;
};

type ViewType = 'members' | 'courses';

export default function OrganizationProgressPage() {
    const { courses, currentCompanyId } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [members, setMembers] = useState<MemberProgress[]>([]);
    const [activeView, setActiveView] = useState<ViewType>('members');
    const [isLoading, setIsLoading] = useState(true);

    // Calculate total available lessons in the system
    const totalSystemLessons = courses.reduce((acc, course) => {
        return acc + (course.curriculums?.reduce((cAcc, curr) => cAcc + (curr.lessons?.length || 0), 0) || 0);
    }, 0) || 20; // Default to 20 if 0

    useEffect(() => {
        const fetchProgressData = async () => {
            setIsLoading(true);
            const supabase = createClient();

            try {
                // 1. Get organization members
                const { data: memberData, error: memberError } = await supabase
                    .from('organization_members')
                    .select(`
                        user_id,
                        role,
                        status,
                        profiles:user_id (
                            id,
                            full_name,
                            avatar_url,
                            user_type
                        )
                    `)
                    .eq('organization_id', currentCompanyId);

                if (memberError) throw memberError;
                if (!memberData) return;

                const userIds = memberData.map((m: any) => m.user_id);
                if (userIds.length === 0) {
                    setMembers([]);
                    setIsLoading(false);
                    return;
                }

                const { data: progressData, error: progressError } = await supabase
                    .from('course_progress')
                    .select('*')
                    .in('user_id', userIds);

                if (progressError) throw progressError;

                const processedMembers: MemberProgress[] = memberData.map((m: any) => {
                    const profile = m.profiles;
                    const userProgress = progressData?.filter((p: any) => p.user_id === m.user_id) || [];
                    const completedCount = userProgress.filter((p: any) => p.status === 'completed').length;

                    let lastActiveDate = '-';
                    let isActive = false;

                    if (userProgress.length > 0) {
                        const sorted = [...userProgress].sort((a, b) =>
                            new Date(b.last_accessed_at || 0).getTime() - new Date(a.last_accessed_at || 0).getTime()
                        );
                        const lastAccess = sorted[0].last_accessed_at;
                        if (lastAccess) {
                            lastActiveDate = new Date(lastAccess).toLocaleDateString();
                            const diff = Date.now() - new Date(lastAccess).getTime();
                            isActive = diff < 30 * 24 * 60 * 60 * 1000;
                        }
                    }

                    return {
                        id: profile.id,
                        name: profile.full_name || 'Unknown User',
                        image: profile.avatar_url || 'https://via.placeholder.com/150',
                        department: m.role === 'admin' ? '管理者' : '一般社員',
                        status: isActive ? 'Active' : 'Inactive',
                        totalLessons: totalSystemLessons,
                        completedLessons: completedCount,
                        lastActive: lastActiveDate
                    };
                });

                setMembers(processedMembers);
            } catch (err) {
                console.error('Failed to fetch progress data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentCompanyId) {
            fetchProgressData();
        }
    }, [currentCompanyId, totalSystemLessons]);

    const filteredEmployees = members.filter(e =>
        e.name.includes(searchQuery) || e.department.includes(searchQuery)
    );

    const totalMembersCount = members.length;
    const activeLearners = members.filter(e => e.status === 'Active').length;
    const avgProgress = totalMembersCount > 0
        ? Math.round(members.reduce((acc, curr) => acc + (curr.completedLessons / curr.totalLessons) * 100, 0) / totalMembersCount)
        : 0;

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 font-bold">読み込み中...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-slate-800">学習・教育管理</h1>
                <p className="text-slate-500 text-sm mt-1">社員のリスキリング状況や、自社独自の教育コンテンツを管理できます</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
                <button
                    onClick={() => setActiveView('members')}
                    className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeView === 'members'
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    メンバー進捗
                </button>
                <button
                    onClick={() => setActiveView('courses')}
                    className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeView === 'courses'
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    自社講座管理
                </button>
            </div>

            {activeView === 'members' ? (
                <>
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">チーム全体の学習率</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-black text-blue-600">{avgProgress}%</span>
                                <span className="text-sm font-bold text-slate-500 mb-1">平均進捗</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${avgProgress}%` }} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">アクティブな学習者</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-black text-emerald-500">{activeLearners}</span>
                                <span className="text-sm font-bold text-slate-500 mb-1">/ {totalMembersCount} 人中</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">直近30日以内に学習履歴あり</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">総完了レッスン数</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-black text-amber-500">{members.reduce((a, b) => a + b.completedLessons, 0)}</span>
                                <span className="text-sm font-bold text-slate-500 mb-1">Lessons</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">全期間の合計</p>
                        </div>
                    </div>

                    {/* Employee Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-bold text-slate-800">メンバー別の進捗</h2>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="名前や部署で検索..."
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                                    <Filter size={18} />
                                </button>
                                <button className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">メンバー</th>
                                        <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">部署</th>
                                        <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">学習状況</th>
                                        <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">進捗率</th>
                                        <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">最終アクセス</th>
                                        <th className="text-right py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">アクション</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">メンバーが見つかりません</td>
                                        </tr>
                                    ) : filteredEmployees.map((employee) => {
                                        const progress = Math.round((employee.completedLessons / employee.totalLessons) * 100);
                                        return (
                                            <tr key={employee.id} className="group hover:bg-blue-50/30 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <img src={employee.image} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-sm">{employee.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold">{employee.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm font-bold text-slate-600">{employee.department}</td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${employee.status === 'Active'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : 'bg-slate-50 text-slate-400 border-slate-100'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${employee.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                        {employee.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="w-32">
                                                        <div className="flex justify-between text-xs font-bold mb-1">
                                                            <span className="text-slate-600">{progress}%</span>
                                                            <span className="text-slate-400">{employee.completedLessons}/{employee.totalLessons}</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${progress >= 80 ? 'bg-emerald-500' : progress >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-xs font-bold text-slate-500">
                                                    {employee.lastActive}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button className="text-slate-400 hover:text-blue-600 font-bold text-xs">
                                                        詳細
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-800">公開中の自社講座</h2>
                        <button
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5"
                            onClick={() => window.location.href = '/admin/elearning/courses/new'}
                        >
                            <Plus size={18} />
                            新規講座を作成
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.filter((c: any) => c.companyId === currentCompanyId).length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold">まだ自社講座が登録されていません</p>
                                <p className="text-xs text-slate-300 mt-1">「新規講座を作成」から、学生向けの教育コンテンツを追加しましょう</p>
                            </div>
                        ) : (
                            courses.filter((c: any) => c.companyId === currentCompanyId).map((course: any) => (
                                <div key={course.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
                                    <div className="aspect-video bg-slate-100 relative">
                                        {course.image && <img src={course.image} alt="" className="w-full h-full object-cover" />}
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black text-slate-600 shadow-sm">
                                            {course.category}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-black text-slate-800 mb-2 truncate group-hover:text-blue-600 transition-colors">{course.title}</h3>
                                        <p className="text-xs text-slate-400 font-bold mb-4">全 {course.lessons?.length || 0} レッスン</p>
                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-[11px] font-bold hover:bg-slate-200 transition-colors">
                                                編集
                                            </button>
                                            <button className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-[11px] font-bold hover:bg-slate-200 transition-colors">
                                                受講データ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
