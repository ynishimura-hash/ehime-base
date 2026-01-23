"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/appStore';
import { Map, Building2, Film, Play, LogIn, ArrowRight, Sparkles, Search, MapPin, Briefcase, ChevronRight, Heart, Wallet, Clock, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { authStatus, activeRole, jobs, companies, users, currentUserId, fetchJobs } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const currentUser = users.find(u => u.id === currentUserId);

  // Initial Fetches
  useEffect(() => {
    fetchJobs();
  }, []);

  // Redirect Company to Dashboard immediately
  useEffect(() => {
    if (authStatus === 'authenticated' && activeRole === 'company') {
      router.push('/dashboard/company');
    }
  }, [authStatus, activeRole, router]);

  // Featured Data
  const featuredQuests = jobs.filter(j => j.type === 'quest').slice(0, 4);
  const hotCompanies = companies.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedArea && selectedArea !== 'all') params.set('area', selectedArea);
    if (selectedIndustry && selectedIndustry !== 'all') params.set('industry', selectedIndustry);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Global Header (Transparent Overlay) */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/eis_logo_mark.png" alt="EIS" className="h-8 w-auto drop-shadow-lg" />
          <span className="font-black text-xl tracking-tighter text-white drop-shadow-lg">Ehime Base</span>
        </Link>
        <div className="flex items-center gap-4">
          {authStatus !== 'authenticated' ? (
            <button
              onClick={() => router.push('/welcome')}
              className="bg-white text-blue-600 px-5 py-2 rounded-full font-black text-xs hover:bg-blue-50 transition-all shadow-lg active:scale-95"
            >
              ログイン / 登録
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-5 py-2 rounded-full font-black text-xs hover:bg-white/30 transition-all hidden md:block"
              >
                Dashboard
              </Link>
              <button
                onClick={() => router.push('/mypage')}
                className="w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden active:scale-95 transition-transform"
              >
                <img src={currentUser?.image || 'https://via.placeholder.com/40'} className="w-full h-full object-cover" alt="Profile" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* 2. Hero Slider Style Area */}
      <section className="relative overflow-hidden">
        {/* Background Image / Slider Background */}
        <div className="h-[500px] md:h-[600px] relative bg-slate-900">
          <img
            src="/hero_bg_new.png"
            alt="Banner"
            className="w-full h-full object-cover opacity-80"
          />
          {/* Visual Flare */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center px-4 md:px-6 z-10 pt-20 md:pt-0">
          <div className="w-full text-center mb-6 md:mb-8 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 md:mb-6 animate-bounce">
              <Sparkles size={12} />
              New Experience in Ehime
            </div>
            <h1 className="text-2xl md:text-[3.2rem] lg:text-6xl xl:text-7xl font-black text-white mb-2 md:mb-4 tracking-tight leading-tight drop-shadow-2xl">
              愛媛で、<span className="text-blue-400">「働く」の枠</span>を<br className="block md:hidden" />超えていく。
            </h1>
            <p className="text-slate-200 text-sm md:text-xl font-bold drop-shadow-lg leading-relaxed">
              非対称なマッチングが、<br className="md:hidden" />あなたの新しいキャリアを拓く
            </p>
          </div>

          {/* Main Search Panel (Mynavi-style) */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-4xl bg-white p-2 md:p-3 rounded-2xl md:rounded-[32px] shadow-2xl flex flex-col md:flex-row items-stretch gap-2"
          >
            <div className="flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-4 border-b md:border-b-0 md:border-r border-slate-100 py-2 md:py-0">
              <Search className="text-blue-500 flex-shrink-0" size={20} />
              <input
                type="text"
                placeholder="フリーワード検索"
                className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700 placeholder:text-slate-400 text-sm md:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-4 border-b md:border-b-0 md:border-r border-slate-100 py-2 md:py-0">
              <MapPin className="text-slate-400 flex-shrink-0" size={20} />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none font-bold text-slate-700 appearance-none text-sm md:text-base pr-8"
              >
                <option value="all">すべてのエリア</option>
                <option value="chuyo">中予（松山市・伊予市など）</option>
                <option value="toyo">東予（今治市・西条市など）</option>
                <option value="nanyo">南予（宇和島市・八幡浜市など）</option>
              </select>
              <ChevronRight className="text-slate-400 absolute right-3 pointer-events-none" size={16} style={{ transform: 'rotate(90deg)' }} />
            </div>
            <div className="relative flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-4 border-b md:border-b-0 md:border-r border-slate-100 py-2 md:py-0">
              <Briefcase className="text-slate-400 flex-shrink-0" size={20} />
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none font-bold text-slate-700 appearance-none text-sm md:text-base pr-8"
              >
                <option value="all">すべての業種</option>
                <option value="IT・システム開発">IT・システム開発</option>
                <option value="製造・エンジニアリング">製造・エンジニアリング</option>
                <option value="サービス・観光・飲食店">サービス・観光・飲食店</option>
                <option value="農業・一次産業">農業・一次産業</option>
                <option value="物流・運送">物流・運送</option>
                <option value="医療・福祉">医療・福祉</option>
                <option value="その他">その他</option>
              </select>
              <ChevronRight className="text-slate-400 absolute right-3 pointer-events-none" size={16} style={{ transform: 'rotate(90deg)' }} />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-2.5 md:py-0 rounded-xl md:rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20 active:scale-95 text-sm md:text-base shrink-0"
            >
              検索
              <ChevronRight size={18} />
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center items-center gap-3 text-white/80 text-xs font-bold">
            <span>人気のキーワード:</span>
            <span
              onClick={() => { setSearchQuery('短期体験'); router.push('/quests?q=短期体験'); }}
              className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full hover:bg-white/20 cursor-pointer transition-colors border border-white/10"
            >
              #短期体験
            </span>
            <span
              onClick={() => { setSearchQuery('農業'); router.push('/quests?q=農業'); }}
              className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full hover:bg-white/20 cursor-pointer transition-colors border border-white/10"
            >
              #農業DX
            </span>
            <span
              onClick={() => { setSearchQuery('未経験'); router.push('/quests?q=未経験'); }}
              className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full hover:bg-white/20 cursor-pointer transition-colors border border-white/10"
            >
              #未経験OK
            </span>
          </div>
        </div>
      </section>

      {/* 3. Icon Menu (Quick Navigation) */}
      <section className="max-w-7xl mx-auto px-6 mt-8 md:-mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'クエスト', icon: Map, color: 'bg-blue-500', href: '/quests', desc: '体験から始める', illustration: '/illustrations/quest_card.png' },
            { label: '動画リール', icon: Film, color: 'bg-pink-500', href: '/reels', desc: '会社の空気を知る', illustration: '/illustrations/reels_card.png' },
            { label: '求人一覧', icon: Briefcase, color: 'bg-indigo-500', href: '/jobs', desc: 'じっくり探す', illustration: '/illustrations/job_search.png' },
            { label: 'eラーニング', icon: Zap, color: 'bg-amber-500', href: '/elearning', desc: 'スキルを磨く', illustration: '/illustrations/learning_growth.png' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all group border border-slate-100/50 overflow-hidden min-h-[160px] md:min-h-0 flex flex-col justify-between"
            >
              {/* Background illustration */}
              <div className="absolute -bottom-2 -right-2 md:top-1/2 md:-translate-y-1/2 md:right-4 w-24 h-24 md:w-40 md:h-40 opacity-80 md:opacity-100 transition-opacity">
                <img src={item.illustration} alt="" className="w-full h-full object-contain" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className={`${item.color} w-10 h-10 md:w-12 md:h-12 rounded-2xl text-white flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <item.icon size={22} className="md:w-6 md:h-6" />
                </div>
                <div className="font-black text-slate-800 text-base md:text-lg mb-0.5 md:mb-1">{item.label}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Pick Up Quests */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3 tracking-tighter drop-shadow-sm">
              <Sparkles className="text-amber-500" size={28} />
              注目のクエスト
            </h2>
            <p className="text-slate-600 font-bold">1日から体験できる、新しい出会いの形。</p>
          </div>
          <Link href="/quests" className="flex items-center gap-2 text-blue-600 font-black text-sm hover:gap-4 transition-all">
            すべてのクエストを見る
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredQuests.map((quest) => {
            const company = companies.find(c => c.id === quest.companyId);
            return (
              <Link
                key={quest.id}
                href={`/jobs/${quest.id}`}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  {company?.image || company?.images?.[0] ? (
                    <img
                      src={company.image || company.images![0]}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className={`absolute inset-0 ${company?.logoColor || 'bg-slate-200'} opacity-10`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Map className="text-slate-200" size={48} />
                      </div>
                    </>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-md text-blue-600 px-3 py-1 rounded-full text-[10px] font-black shadow-sm">
                      {quest.category}
                    </span>
                  </div>
                  {/* Video Reel Icon - Large, centered on right */}
                  {((company as any)?.videos?.length > 0 || (company?.reels && company.reels.length > 0)) && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <div className="relative group/reel">
                        <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-[4px] shadow-2xl transform group-hover/reel:scale-110 transition-all overflow-hidden bg-black">
                          <div className="w-full h-full rounded-[20px] overflow-hidden relative">
                            {company?.reels?.[0]?.type === 'file' ? (
                              <video
                                src={`${company.reels[0].url}#t=0.01`}
                                className="w-full h-full object-cover opacity-80"
                                muted
                                playsInline
                              />
                            ) : company?.image ? (
                              <img src={company.image} alt="Reel" className="w-full h-full object-cover opacity-60" />
                            ) : (
                              <div className="w-full h-full bg-slate-800" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/reel:bg-black/10 transition-opacity group-hover/reel:opacity-0">
                              <Play className="text-white fill-white ml-2 drop-shadow-2xl" size={56} />
                            </div>
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg border border-white/20">
                          REEL
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-100 flex-shrink-0">
                      {company?.image ? (
                        <img src={company.image} alt={company.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full ${company?.logoColor || 'bg-slate-400'} flex items-center justify-center text-[8px] text-white font-black`}>
                          {company?.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-wider">{company?.name}</span>
                  </div>
                  <h3 className="font-black text-slate-800 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
                    {quest.title}
                  </h3>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs">
                      <span className="text-amber-500"><Wallet size={14} /></span>
                      {quest.reward}
                    </div>
                    <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Ehime Base Brand Story */}
      <section className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[150px] opacity-20 animate-pulse" style={{ animationDelay: '700ms' }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-white font-bold text-xs tracking-widest uppercase">
                Our Vision
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                「非対称」が、<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic">新しい風</span>を吹き込む。
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                従来の「履歴書と条件」だけでのマッチングはもう古い。<br />
                企業が持つ「本音」と、あなたが隠している「情熱」がぶつかったとき、
                愛媛の新しい未来が動き出します。
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="text-blue-400 font-black text-3xl mb-2">1,200+</div>
                  <div className="text-sm font-bold text-slate-300">Ehime Spirits</div>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="text-indigo-400 font-black text-3xl mb-2">350+</div>
                  <div className="text-sm font-bold text-slate-300">Active Quests</div>
                </div>
              </div>
            </div>
            <div className="relative aspect-auto md:aspect-square">
              <div className="absolute inset-0 bg-blue-500/10 rounded-[60px] transform rotate-6 scale-95" />
              <div className="absolute inset-0 bg-white shadow-2xl rounded-[60px] overflow-hidden flex flex-col p-8 group hover:-rotate-1 transition-all duration-500">
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[32px] flex items-center justify-center mb-8 shadow-inner transform group-hover:rotate-12 transition-transform">
                    <Users size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tighter">まずはカジュアルに<br />「体験」から始めよう</h3>
                  <p className="text-slate-500 font-bold mb-8">
                    本採用の前に、1日だけ働いてみる。<br />
                    会社の「中の人」とランチを食べてみる。<br />
                    そんな小さな仕掛けをたくさん用意しています。
                  </p>
                  <button className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                    詳細ガイドをチェック
                    <ArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Featured Companies - Full Width Auto-Scrolling Carousel */}
      <section className="w-full py-24 bg-white overflow-hidden">
        <div className="text-center mb-16 max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight drop-shadow-sm">参加している魅力的な企業</h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
        </div>

        {/* Auto-scrolling container */}
        <div className="relative">
          <div className="flex gap-8 animate-scroll">
            {/* Duplicate companies for seamless loop */}
            {[...hotCompanies, ...hotCompanies, ...hotCompanies].map((c, idx) => (
              <Link
                key={`${c.id}-${idx}`}
                href={`/companies/${c.id}`}
                className="flex-shrink-0 w-64 opacity-90 hover:opacity-100 transition-all transform hover:scale-105 group"
              >
                {c.image ? (
                  <div className="w-full aspect-[3/2] rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200 group-hover:border-blue-400 group-hover:shadow-2xl transition-all">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`${c.logoColor} aspect-[3/2] rounded-2xl text-white font-black text-2xl shadow-lg group-hover:shadow-2xl transition-all flex items-center justify-center`}>
                    {c.name.slice(0, 3)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-256px * ${hotCompanies.length} - 2rem * ${hotCompanies.length}));
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* 7. Footer */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <img src="/eis_logo_mark.png" alt="EIS" className="h-8 w-auto" />
              <span className="font-black text-xl tracking-tighter text-slate-800">Ehime Base</span>
            </Link>
            <p className="text-slate-400 text-sm font-bold leading-relaxed">
              愛媛の求職者と企業の「非対称性」をエネルギーに変え、新しい時代を創造するマッチングプラットフォーム。
            </p>
          </div>
          <div>
            <h4 className="font-black text-slate-800 mb-6 uppercase text-xs tracking-widest">探す</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><Link href="/quests" className="hover:text-blue-600 transition-colors">クエストを探す</Link></li>
              <li><Link href="/jobs" className="hover:text-blue-600 transition-colors">求人を探す</Link></li>
              <li><Link href="/reels" className="hover:text-blue-600 transition-colors">動画一覧</Link></li>
              <li><Link href="/companies" className="hover:text-blue-600 transition-colors">企業一覧</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-800 mb-6 uppercase text-xs tracking-widest">Ehime Baseについて</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">サービス概要</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">運営会社</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">利用規約</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">プライバシーポリシー</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-800 mb-6 uppercase text-xs tracking-widest">企業の方へ</h4>
            <p className="text-slate-400 text-xs font-bold leading-relaxed mb-4">
              採用課題の解決や魅力発信、教育プログラムの導入についてはこちらから。
            </p>
            <Link href="/login/company" className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-slate-700 transition-colors">
              法人向けページ
            </Link>
          </div>
        </div>
        <div className="text-center pt-10 border-t border-slate-50">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
            © 2026 EHIME BASE Project by EIS LLC. / Empowering Regional Energy
          </p>
        </div>
      </footer>
    </div>
  );
}
