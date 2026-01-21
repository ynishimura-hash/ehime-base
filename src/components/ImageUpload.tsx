"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
    currentImageUrl?: string;
    onImageUploaded: (url: string) => void;
    label?: string;
    bucketName?: string;
    folder?: string;
}

export function ImageUpload({
    currentImageUrl,
    onImageUploaded,
    label = "画像をアップロード",
    bucketName = "image",
    folder = "uploads"
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const supabase = createClient();

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // ファイルサイズチェック（5MB以下）
        if (file.size > 5 * 1024 * 1024) {
            toast.error('ファイルサイズは5MB以下にしてください');
            return;
        }

        // ファイルタイプチェック
        if (!file.type.startsWith('image/')) {
            toast.error('画像ファイルを選択してください');
            return;
        }

        setUploading(true);

        try {
            // ファイル名を生成
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            // Supabase Storageにアップロード
            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                throw uploadError;
            }

            // Public URLを取得
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            setPreviewUrl(publicUrl);
            onImageUploaded(publicUrl);
            toast.success('画像をアップロードしました');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(`アップロードに失敗しました: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onImageUploaded('');
    };

    return (
        <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">
                {label}
            </label>

            <div className="relative">
                {previewUrl ? (
                    <div className="relative group">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-xl border-2 border-slate-200"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                disabled={uploading}
                                className="hidden"
                            />
                            <div className="text-white text-sm font-bold flex items-center gap-2">
                                <Upload size={20} />
                                画像を変更
                            </div>
                        </label>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <span className="text-sm font-bold">アップロード中...</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={32} />
                                    <span className="text-sm font-bold">クリックして画像を選択</span>
                                    <span className="text-xs">PNG, JPG, GIF (最大5MB)</span>
                                </>
                            )}
                        </div>
                    </label>
                )}
            </div>
        </div>
    );
}
