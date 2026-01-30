'use server';

import { getGeminiModel } from "@/lib/ai-client";
import { createClient } from "@/utils/supabase/server";

interface AnalysisInput {
    userId: string;
    userName: string;
    courseId: string;
    courseTitle: string;
    courseDescription: string;
    courseCategory: string;
    userStrengths?: string[];
    userValues?: string[];
    userInterests?: string[];
}

export interface AffinityResult {
    score: number;
    title: string;
    reason: string;
    careerBenefit: string;
    matchDetails?: {
        strength: string;
        courseFeature: string;
        explanation: string;
    }[];
}

export async function analyzeCourseAffinity(input: AnalysisInput): Promise<AffinityResult> {
    const supabase = await createClient();

    // 1. Check Cache
    try {
        const { data: cached } = await supabase
            .from('user_course_affinity')
            .select('*')
            .eq('user_id', input.userId)
            .eq('course_id', input.courseId)
            .single();

        if (cached) {
            //   console.log('Affinity Cache Hit:', input.courseId);
            return {
                score: cached.score,
                title: cached.title,
                reason: cached.reason,
                careerBenefit: cached.career_benefit,
                matchDetails: cached.match_details
            };
        }
    } catch (e) {
        console.warn('Cache check failed, proceeding to generation:', e);
    }

    // 2. Generate with AI
    try {
        const model = getGeminiModel();

        const prompt = `
    あなたは熟練のキャリアアドバイザーAIです。
    ユーザーの特性（強み・興味）と、eラーニング講座の内容を照らし合わせ、その親和性を分析してください。
    特に「ユーザーのどの強みが、講座のどの部分で活きるか」を具体的に結びつけて解説してください。

    【ユーザー情報】
    名前: ${input.userName}
    強み: ${input.userStrengths?.join(', ') || '特になし'}
    価値観: ${input.userValues?.join(', ') || '特になし'}
    興味: ${input.userInterests?.join(', ') || '特になし'}

    【講座情報】
    タイトル: ${input.courseTitle}
    カテゴリ: ${input.courseCategory}
    説明: ${input.courseDescription}

    以下のJSON形式のみを出力してください（Markdownのバッククォートは不要）。
    {
      "score": 0〜100の整数（親和性スコア）,
      "title": "キャッチーな短い見出し（例: 〇〇なあなたに最適！）",
      "reason": "全体的な推奨理由（100文字程度）",
      "careerBenefit": "このスキル習得によるキャリア上のメリット（50文字程度）",
      "matchDetails": [
        {
          "strength": "関連するユーザーの強みや興味",
          "courseFeature": "それに対応する講座の特徴や学習内容",
          "explanation": "なぜ相性が良いかの具体的な解説（30文字程度）"
        },
        { ... もう1〜2件 ... }
      ]
    }
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonString);

        const affinityResult: AffinityResult = {
            score: data.score || 70,
            title: data.title || "学習のチャンス",
            reason: data.reason || "あなたの関心分野に適しています。",
            careerBenefit: data.careerBenefit || "スキルアップに繋がります。",
            matchDetails: data.matchDetails || []
        };

        // 3. Save to Cache
        try {
            await supabase.from('user_course_affinity').upsert({
                user_id: input.userId,
                course_id: input.courseId,
                score: affinityResult.score,
                title: affinityResult.title,
                reason: affinityResult.reason,
                career_benefit: affinityResult.careerBenefit,
                match_details: affinityResult.matchDetails,
                analyzed_at: new Date().toISOString()
            }, { onConflict: 'user_id, course_id' });
        } catch (dbError) {
            console.error('Failed to cache affinity result:', dbError);
        }

        return affinityResult;

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return {
            score: 60,
            title: "興味があれば挑戦を",
            reason: "分析を実行できませんでしたが、新しい学びは常に価値があります。",
            careerBenefit: "知識の幅を広げることができます。",
            matchDetails: []
        };
    }
}
