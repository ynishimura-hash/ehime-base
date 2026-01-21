import { UserAnalysis } from './types/analysis';

export const DEMO_DIAGNOSIS_RESULT: Partial<UserAnalysis> = {
    diagnosisScores: {
        1: 5, 2: 4, 3: 5, 4: 5, 5: 3,
        6: 5, 7: 4, 8: 5, 9: 4, 10: 5
    },
    selectedValues: [1, 5, 8], // Assuming these IDs correspond to valid Value Cards (e.g. 'Challenge', 'Creativity', 'Community')
    publicValues: [1, 5, 8],
    isFortuneIntegrated: true,
    fortune: {
        dayMaster: '甲',
        traits: ['開拓者', 'リーダーシップ', '直感']
    }
};
