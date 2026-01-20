export type ValueCategory = 'A' | 'B' | 'C' | 'D' | 'E';

export interface ValueCard {
    id: number;
    category: ValueCategory;
    name: string;
    isPositive: boolean;
    description: string;
    example: string;
    pairId: number; // 対になるキーワードのID
}

export interface DiagnosisQuestion {
    id: number;
    category: ValueCategory;
    text: string;
    positiveValueId: number; // 4,5の時に紐付くキーワードID
    negativeValueId: number; // 1,2の時に紐付くキーワードID
}

export interface UserAnalysis {
    // 既存のフィールド（外部互換性のため保持）
    strengths?: Record<string, number>;
    fortune?: {
        dayMaster: string;
        traits: string[];
    };
    // 新規フィールド（サクセスモード用）
    diagnosisScores?: Record<number, number>; // questionId -> score(1-5)
    selectedValues?: number[]; // アンロックされたValueCardのID
    publicValues?: number[]; // 公開設定にされたValueCardのID (最大3つ)
    isFortuneIntegrated?: boolean; // 占い結果を統合するかどうかのフラグ
}
