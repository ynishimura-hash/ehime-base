import { LearningTrack } from '@/types/shared';

export const RECOMMENDED_TRACKS: LearningTrack[] = [
    {
        id: 'track_dx_model',
        title: 'DX推進担当者育成カリキュラム',
        description: 'デジタル技術の基礎から業務自動化、そして応用まで。実務で求められるDXスキルを段階的に習得し、組織の変革をリードする人材を目指します。',
        courseIds: [], // To be populated dynamically for now
        image: '/illustrations/dx_roadmap.png'
    },
    {
        id: 'track_web_dev',
        title: 'Webエンジニアリングマスター',
        description: 'フロントエンドからバックエンドまで、モダンなWeb開発技術を体系的に学び、フルスタックエンジニアとしてのキャリアを築きます。',
        courseIds: [],
        image: '/illustrations/web_dev.png'
    }
];
