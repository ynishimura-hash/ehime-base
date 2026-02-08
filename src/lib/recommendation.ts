import { Job, Company, Course } from '@/types/shared';
import { UserAnalysis } from './types/analysis';
import { getPublicValueCards } from './analysisUtils';

/**
 * 自己分析の結果に基づいておすすめの求人とコースを抽出する
 */
export interface RecommendationResult {
    jobs: Job[];
    courses: Course[];
}

export function getRecommendations(
    analysis: UserAnalysis,
    jobs: Job[],
    courses: Course[],
    companies: Company[]
): { jobs: Job[], courses: Course[] } {
    const matchedJobs: Job[] = [];
    const matchedCourses: Course[] = [];

    // 公開設定（コアバリュー）として選択された項目名を取得
    const coreTraitNames = getPublicValueCards(analysis).map(c => c.name);

    // --- 精密診断ベースのマッチング（コアバリュー優先） ---
    if (analysis.diagnosisScores) {
        // 全体のカテゴリ傾向算出
        const categories = {
            A: 0, B: 0, C: 0, D: 0, E: 0
        };
        Object.entries(analysis.diagnosisScores).forEach(([qId, score]) => {
            const id = Number(qId);
            if (id <= 10) categories.A += score;
            else if (id <= 20) categories.B += score;
            else if (id <= 30) categories.C += score;
            else if (id <= 40) categories.D += score;
            else categories.E += score;
        });

        const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
        const topCategory = sortedCategories[0][0];

        // 仕事をスコアリング
        const jobPool = jobs.map(job => {
            let score = 0;
            const tags = job.tags || [];
            const title = (job.title || '').toLowerCase();

            // 1. コアバリューとの一致（最優先: 50点/件）
            if (Array.isArray(tags)) {
                coreTraitNames.forEach(trait => {
                    if (tags.includes(trait)) score += 50;
                });
            }

            // 2. カテゴリ適性（20点）
            if (topCategory === 'A' && (title.includes('dx') || title.includes('企画') || title.includes('クリエイティブ'))) score += 20;
            if (topCategory === 'B' && (title.includes('営業') || title.includes('マネジメント'))) score += 20;
            if (topCategory === 'C' && (title.includes('エンジニア') || title.includes('製造'))) score += 20;
            if (topCategory === 'D' && (title.includes('サービス') || title.includes('医療') || title.includes('福祉'))) score += 20;

            return { job, score };
        });

        const sortedJobs = jobPool
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.job);

        matchedJobs.push(...sortedJobs);
    }

    // --- Fortune-based matching (Day Master) ---
    if (analysis.isFortuneIntegrated && analysis.fortune?.dayMaster) {
        const dm = analysis.fortune.dayMaster;
        const fortuneTags: Record<string, string> = {
            '甲': '成長', '乙': '柔軟', '丙': '情熱', '丁': '緻密',
            '戊': '安定', '己': '育成', '庚': '決断', '辛': '洗練',
            '壬': '挑戦', '癸': '共感'
        };
        const targetTag = fortuneTags[dm];

        if (targetTag) {
            jobs.forEach(job => {
                const tags = job.tags || [];
                if (Array.isArray(tags) && tags.includes(targetTag) && !matchedJobs.find(mj => mj.id === job.id)) {
                    matchedJobs.push(job);
                }
            });
        }
    }

    // --- 最終結果の調整 ---
    const finalJobs = Array.from(new Set(matchedJobs)).slice(0, 20);
    const finalCourses = courses.slice(0, 2);

    return {
        jobs: finalJobs.length > 0 ? finalJobs : jobs.slice(0, 20),
        courses: finalCourses
    };
}
