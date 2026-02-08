"use client";

import React, { useState, useEffect } from 'react';
import { Save, Sparkles, Globe, RefreshCcw, Zap, Building2, Phone, MapPin, Briefcase, FileText, Upload, Image as ImageIcon, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/lib/appStore';

export default function CompanyProfileEditor() {
    const { currentCompanyId } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [url, setUrl] = useState('');

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        location: '',
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
        is_public: false,
    });

    // Fetch Data
    useEffect(() => {
        const fetchCompanyData = async () => {
            if (!currentCompanyId) return;

            setIsFetching(true);
            const supabase = createClient();

            try {
                const { data, error } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', currentCompanyId)
                    .single();

                if (error) throw error;
                if (data) {
                    setFormData({
                        name: data.name || '',
                        industry: data.industry || '',
                        location: data.location || '',
                        description: data.description || '',
                        url: '', // input用なので空でもOKだが、websiteがあればそれを入れてもいい
                        foundingYear: data.founding_year,
                        capital: data.capital || '',
                        employeeCount: data.employee_count || '',
                        representative: data.representative || '',
                        address: data.address || '',
                        phone: data.phone || '',
                        website: data.website || '',
                        businessDetails: data.business_details || '',
                        philosophy: data.philosophy || '',
                        benefits: data.benefits || '',
                        rjpNegatives: data.rjp_negatives || '',
                        rjpPositives: data.rjp_positives || '',
                        logo_url: data.logo_url || data.image || '', // Fallback to image if logo_url is missing
                        cover_image_url: data.cover_image_url || '',
                        is_public: data.is_public || false,
                    });
                    if (data.website) setUrl(data.website);
                }
            } catch (error) {
                console.error('Failed to fetch company data:', error);
                toast.error('企業情報の取得に失敗しました');
            } finally {
                setIsFetching(false);
            }
        };

        fetchCompanyData();
    }, [currentCompanyId]);

    const handleSave = async (asPublic: boolean | undefined = undefined) => {
        if (!currentCompanyId) return;

        const toastId = toast.loading('保存中...');
        const supabase = createClient();

        try {
            const updates: any = {
                name: formData.name,
                industry: formData.industry,
                location: formData.location,
                description: formData.description,
                founding_year: formData.foundingYear,
                capital: formData.capital,
                employee_count: formData.employeeCount,
                representative: formData.representative,
                address: formData.address,
                phone: formData.phone,
                website: formData.website,
                business_details: formData.businessDetails,
                philosophy: formData.philosophy,
                benefits: formData.benefits,
                rjp_negatives: formData.rjpNegatives,
                rjp_positives: formData.rjpPositives,
                logo_url: formData.logo_url,
                image: formData.logo_url, // Sync image for compatibility
                cover_image_url: formData.cover_image_url,
                updated_at: new Date().toISOString(),
            };

            if (asPublic !== undefined) {
                updates.is_public = asPublic;
                // Update local state to reflect the change immediately
                setFormData(prev => ({ ...prev, is_public: asPublic }));
            } else {
                updates.is_public = formData.is_public;
            }

            const { error } = await supabase
                .from('organizations')
                .update(updates)
                .eq('id', currentCompanyId);

            if (error) throw error;

            toast.dismiss(toastId);
            toast.success(asPublic !== undefined
                ? (asPublic ? '公開しました' : '非公開に設定しました')
                : '保存しました');

        } catch (error) {
            console.error('Save error:', error);
            toast.dismiss(toastId);
            toast.error('保存に失敗しました');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'cover_image_url') => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentCompanyId || 'unknown'}/${field}-${Date.now()}.${fileExt}`;

        setUploading(true);
        const toastId = toast.loading('画像をアップロード中...');

        try {
            const supabase = createClient();
            // Ensure bucket exists or handle error - assuming 'company-assets' exists as per previous code
            const { error: uploadError } = await supabase.storage
                .from('company-assets')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('company-assets')
                .getPublicUrl(fileName);

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

    if (isFetching) {
        return <div className="flex h-screen items-center justify-center text-slate-400">読み込み中...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">企業情報編集</h2>
                    <p className="text-slate-500 text-sm mt-1">AIを活用して、入力コストを最小限に抑えましょう</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleSave()}
                        className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-50 flex items-center gap-2"
                        disabled={uploading}
                    >
                        <FileText size={18} />
                        下書き保存
                    </button>
                    <button
                        onClick={() => handleSave(!formData.is_public)}
                        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 border ${formData.is_public ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                        disabled={uploading}
                    >
                        <Eye size={18} />
                        {formData.is_public ? '公開中' : '非公開'}
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 flex items-center gap-2"
                        disabled={uploading}
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
                    <h3>AI 自動入力アシスタント (Gemini 2.5 Flash Lite)</h3>
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
