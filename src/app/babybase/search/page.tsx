"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/appStore';
import {
    Users, BookOpen, MessageSquare, ChevronRight,
    Calendar, Heart, Star, Baby, Search as SearchIcon,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const category = searchParams.get('cat') || '';

    const { bbSpecialists, bbArticles, bbPosts } = useAppStore();

    // Filtering logic
    const filteredSpecialists = bbSpecialists.filter(s =>
        (category ? s.category === category : true) &&
        (query ? s.name.includes(query) || s.description.includes(query) : true)
    );

    const filteredArticles = bbArticles.filter(a =>
        (category ? a.category === category : true) &&
        (query ? a.title.includes(query) || a.content.includes(query) : true)
    );

    const filteredPosts = bbPosts.filter(p => {
        const spec = bbSpecialists.find(s => s.id === p.specialistId);
        return (category ? spec?.category === category : true) &&
            (query ? p.content.includes(query) : true);
    });

    return (
        <div className="min-h-screen bg-[#FFFBF0] pb-20">
            {/* Header */}
            <header className="bg-white px-6 py-6 border-b border-pink-100 flex items-center gap-4 sticky top-0 z-50">
                <Link href="/babybase" className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">
                        {category || query ? `「${category || query}」の検索結果` : 'すべてのコンテンツ'}
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Search Results</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-12">
                {/* Section 1: Specialists */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b-2 border-pink-100 pb-2">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Users className="text-pink-500" size={24} />
                            専門家情報 ({filteredSpecialists.length})
                        </h2>
                    </div>
                    {filteredSpecialists.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredSpecialists.map(spec => (
                                <Link key={spec.id} href={`/babybase/specialists/${spec.id}`} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4 hover:shadow-md transition-shadow group">
                                    <img src={spec.image} className="w-16 h-16 rounded-2xl object-cover shrink-0" alt="" />
                                    <div>
                                        <div className="bg-pink-50 text-pink-500 text-[10px] font-black px-2 py-0.5 rounded-lg inline-block mb-1">{spec.category}</div>
                                        <h3 className="font-black text-slate-800 group-hover:text-pink-500 transition-colors">{spec.name} 先生</h3>
                                        <p className="text-[11px] font-medium text-slate-400 line-clamp-2 mt-1">{spec.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm font-bold text-slate-400 py-4 text-center">該当する専門家が見つかりませんでした。</p>
                    )}
                </section>

                {/* Section 2: Articles / Know-how */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b-2 border-blue-100 pb-2">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <BookOpen className="text-blue-500" size={24} />
                            コンテンツ・知恵袋 ({filteredArticles.length})
                        </h2>
                    </div>
                    {filteredArticles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {filteredArticles.map(article => (
                                <Link key={article.id} href={`/babybase/learning/${article.id}`} className="group">
                                    <div className="h-40 rounded-3xl overflow-hidden shadow-sm relative mb-3">
                                        <img src={article.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[9px] font-black text-blue-500 px-2 py-1 rounded-lg">
                                            {article.category}
                                        </div>
                                    </div>
                                    <h3 className="font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-500 transition-colors">{article.title}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-2">{article.publishedAt}</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm font-bold text-slate-400 py-4 text-center">該当する記事が見つかりませんでした。</p>
                    )}
                </section>

                {/* Section 3: Latest SNS Posts / Updates */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b-2 border-indigo-100 pb-2">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <MessageSquare className="text-indigo-500" size={24} />
                            最新の投稿・SNS ({filteredPosts.length})
                        </h2>
                    </div>
                    {filteredPosts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredPosts.map(post => {
                                const spec = bbSpecialists.find(s => s.id === post.specialistId);
                                return (
                                    <div key={post.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <img src={spec?.image} className="w-8 h-8 rounded-full object-cover" alt="" />
                                            <div>
                                                <p className="text-[11px] font-black text-slate-800 leading-none">{spec?.name} 先生</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{post.createdAt}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-slate-600 leading-relaxed line-clamp-3">{post.content}</p>
                                        {post.image && (
                                            <div className="rounded-2xl overflow-hidden h-32">
                                                <img src={post.image} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm font-bold text-slate-400 py-4 text-center">最近の投稿はありません。</p>
                    )}
                </section>
            </main>
        </div>
    );
}

export default function SearchResultsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-pink-500">Loading...</div>}>
            <SearchResultsContent />
        </Suspense>
    );
}
