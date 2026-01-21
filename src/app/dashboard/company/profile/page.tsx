"use client";

import React, { useState } from 'react';
import { Save, Sparkles, Globe, RefreshCcw, Zap, Building2, Phone, MapPin, Briefcase, FileText, Upload, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

export default function CompanyProfileEditor() {
    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [url, setUrl] = useState('');

    // Form States
    const [formData, setFormData] = useState({
        name: '株式会社サンプル',
        industry: 'IT・通信',
        location: '愛媛県松山市',
        description: '',
        url: '',
        // Expanded Fields
        foundingYear: undefined as number | undefined,
        capital: '',
        employeeCount: '',
        representative: '',
        address: '',
        phone: '',
        website: '',
        businessDetails: '',
        philosophy: '',
        benefits: '',
        // RJP
        rjpNegatives: '',
        rjpPositives: '',
        logo_url: '',
        cover_image_url: '',
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'cover_image_url') => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${field}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);
        const toastId = toast.loading('画像をアップロード中...');

        try {
            const supabase = createClient();
            const { error: uploadError } = await supabase.storage
                .from('company-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('company-assets')
                .getPublicUrl(filePath);

            handleChange(field, publicUrl);
            toast.dismiss(toastId);
            toast.success('画像をアップロードしました');
        } catch (error) {
            console.error(error);
            toast.dismiss(toastId);
            toast.error('画像のアップロードに失敗しました');
        } finally {
            setUploading(false);
        }
    };

    // AI Auto-fill Handler
    const handleAutoFill = async () => {
        if (!url && !formData.description) {
            toast.error('URLまたは説明文を入力してください');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/ai/company-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: url || formData.description })
            });

            if (!response.ok) throw new Error('Generation failed');

            const profile = await response.json();

            // Merge with existing data
            setFormData(prev => ({
                ...prev,
                ...profile,
                name: profile.name || prev.name,
                industry: profile.industry || prev.industry,
                location: profile.location || prev.location,
                website: url || profile.website || prev.website,
            }));

            toast.success('AIが企業情報を自動生成しました！');
        } catch (error) {
            console.error(error);
            toast.error('情報の生成に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">企業情報編集</h2>
                    <p className="text-slate-500 text-sm mt-1">AIを活用して、入力コストを最小限に抑えましょう</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => toast.success('下書きを保存しました')}
                        className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-50 flex items-center gap-2"
                    >
                        <FileText size={18} />
                        下書き保存
                    </button>
                    <button
                        onClick={() => toast.success('公開しました')}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 flex items-center gap-2"
                    >
                        <Save size={18} />
                        公開する
                    </button>
                </div>
            </div>

            {/* AI Auto-fill Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-blue-700 font-black">
                    <Sparkles size={20} />
                    <h3>AI 自動入力アシスタント (Gemini 2.0 Flash)</h3>
                </div>
                <p className="text-sm text-blue-600/80 font-bold">
                    URLや会社の特徴を入力するだけで、基本情報から「魅力・RJP」まで一括生成します。
                </p>
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={18} />
                        <input
                            type="url"
                            placeholder="https://company-site.com (URLまたは会社名・特徴を入力)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                    <button
                        onClick={handleAutoFill}
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center shadow-lg shadow-blue-200"
                    >
                        {isLoading ? <RefreshCcw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {isLoading ? '解析中...' : 'AI自動生成'}
                    </button>
                </div>
            </div>

            {/* Branding Images */}
            <section className="space-y-6">
                <div className="relative group">
                    <div className={`w-full h-48 md:h-64 rounded-3xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-100 flex items-center justify-center relative transition-all ${formData.cover_image_url ? 'border-transparent' : 'hover:border-blue-400 hover:bg-blue-50'}`}>
                        {formData.cover_image_url ? (
                            <img src={formData.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-slate-400">
                                <ImageIcon className="mx-auto mb-2" size={32} />
                                <span className="font-bold text-sm">カバー画像を設定</span>
                            </div>
                        )}

                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white font-bold">
                            <Upload className="mr-2" size={20} /> 画像を変更
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_image_url')} />
                        </label>
                    </div>

                    {/* Logo - Overlapping */}
                    <div className="absolute -bottom-10 left-8 md:left-12">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white bg-white shadow-xl overflow-hidden relative group/logo">
                            {formData.logo_url ? (
                                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                    <Building2 size={32} />
                                </div>
                            )}
                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity bg-black/40 text-white font-bold text-xs text-center p-2">
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo_url')} />
                                ロゴ<br />変更
                            </label>
                        </div>
                    </div>
                </div>
                <div className="h-4 md:h-6"></div> {/* Spacer for Logo overlap */}
            </section>

            <div className="space-y-6">
                {/* Basic Info */}
                <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Building2 className="text-slate-400" /> 基本情報
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">企業名</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">代表者名</label>
                            <input
                                type="text"
                                value={formData.representative}
                                onChange={(e) => handleChange('representative', e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                                placeholder="代表取締役..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">設立年</label>
                            <input
                                type="number"
                                value={formData.foundingYear || ''}
                                onChange={(e) => handleChange('foundingYear', Number(e.target.value))}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                                placeholder="西暦"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">資本金</label>
                            <input
                                type="text"
                                value={formData.capital}
                                onChange={(e) => handleChange('capital', e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                                placeholder="1,000万円"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">従業員数</label>
                            <input
                                type="text"
                                value={formData.employeeCount}
                                onChange={(e) => handleChange('employeeCount', e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                                placeholder="50名"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">電話番号</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">所在地</label>
                            <input
                                type="text"
                                value={formData.address || formData.location}
                                onChange={(e) => handleChange('address', e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                                placeholder="詳細な住所"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Webサイト</label>
                            <input
                                type="text"
                                value={formData.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </section>

                {/* Business Info */}
                <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Briefcase className="text-slate-400" /> 事業・理念
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">企業理念・ビジョン</label>
                            <textarea
                                rows={3}
                                value={formData.philosophy}
                                onChange={(e) => handleChange('philosophy', e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                                placeholder="私たちは..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">事業詳細</label>
                            <textarea
                                rows={4}
                                value={formData.businessDetails}
                                onChange={(e) => handleChange('businessDetails', e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                                placeholder="具体的な事業内容..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">キャッチコピー・概要</label>
                            <textarea
                                rows={2}
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                                placeholder="一言で言うと..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">福利厚生</label>
                            <textarea
                                rows={3}
                                value={formData.benefits}
                                onChange={(e) => handleChange('benefits', e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                                placeholder="各種保険、手当など..."
                            />
                        </div>
                    </div>
                </section>

                {/* RJP Section */}
                <section className="bg-orange-50 p-6 rounded-3xl border border-orange-100 shadow-sm space-y-6">
                    <h3 className="font-black text-orange-900 flex items-center gap-2 border-b border-orange-200/50 pb-3">
                        <Zap className="text-orange-500" /> RJP (Realistic Job Preview)
                    </h3>
                    <p className="text-xs text-orange-800/70 font-bold">
                        AIが業界特性から推測した内容が入力されます。実態に合わせて修正してください。正直な開示がミスマッチを防ぎます。
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-orange-800 mb-1">ポジティブな側面・やりがい</label>
                            <textarea
                                rows={3}
                                value={formData.rjpPositives}
                                onChange={(e) => handleChange('rjpPositives', e.target.value)}
                                className="w-full p-3 rounded-xl border border-orange-200 bg-white font-medium focus:ring-2 focus:ring-orange-200 text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-orange-800 mb-1">ネガティブな側面・覚悟が必要な点</label>
                            <textarea
                                rows={3}
                                value={formData.rjpNegatives}
                                onChange={(e) => handleChange('rjpNegatives', e.target.value)}
                                className="w-full p-3 rounded-xl border border-orange-200 bg-white font-medium focus:ring-2 focus:ring-orange-200 text-slate-900"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
