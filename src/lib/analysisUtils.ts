import { DiagnosisQuestion, ValueCard, UserAnalysis } from './types/analysis';
import { DIAGNOSIS_QUESTIONS, VALUE_CARDS } from './constants/analysisData';

/**
 * 診断結果（スコア）から、アンロックされる価値観IDのリストを算出する
 */
export function calculateSelectedValues(scores: Record<number, number>): number[] {
    // 3（中立）からの絶対乖離値でランキングを作成
    const rankedQuestions = DIAGNOSIS_QUESTIONS
        .map(q => ({
            id: q.id,
            diff: Math.abs((scores[q.id] || 3) - 3),
            score: scores[q.id] || 3
        }))
        .sort((a, b) => b.diff - a.diff)
        .slice(0, 5); // 上位5つに絞る

    const selectedIds: number[] = [];
    rankedQuestions.forEach(rq => {
        const q = DIAGNOSIS_QUESTIONS.find(dq => dq.id === rq.id);
        if (q) {
            // ペアで追加（正負両方の側面を見せるため）
            selectedIds.push(q.positiveValueId);
            selectedIds.push(q.negativeValueId);
        }
    });

    return selectedIds;
}

/**
 * カテゴリーごとの集計スコアを算出して、レーダーチャート用のデータを生成する
 */
export function calculateCategoryRadarData(scores: Record<number, number>) {
    const categories: Record<string, { total: number, count: number }> = {
        'A': { total: 0, count: 0 },
        'B': { total: 0, count: 0 },
        'C': { total: 0, count: 0 },
        'D': { total: 0, count: 0 },
        'E': { total: 0, count: 0 },
    };

    DIAGNOSIS_QUESTIONS.forEach(q => {
        const score = scores[q.id];
        if (score) {
            categories[q.category].total += score;
            categories[q.category].count += 1;
        }
    });

    return Object.entries(categories).map(([key, val]) => {
        // 平均スコアを1-5の範囲で算出
        const avg = val.count > 0 ? val.total / val.count : 3; // 回答がない場合は中立の3とする
        // 1(0%) 〜 5(100%) に正規化（(avg - 1) / 4 * 100）
        const normalized = ((avg - 1) / 4) * 100;

        return {
            subject: getCategoryName(key as any),
            A: Math.round(normalized),
            fullMark: 100
        };
    });
}

function getCategoryName(category: 'A' | 'B' | 'C' | 'D' | 'E'): string {
    switch (category) {
        case 'A': return '思考・創造';
        case 'B': return '行動・情熱';
        case 'C': return '誠実・完遂';
        case 'D': return '対人・共感';
        case 'E': return '安定・慎重';
    }
}

/**
 * 公開設定にされている価値観カードのオブジェクトリストを取得する
 */
export function getPublicValueCards(analysis: UserAnalysis): ValueCard[] {
    const publicIds = analysis.publicValues || [];
    return VALUE_CARDS.filter(card => publicIds.includes(card.id));
}
