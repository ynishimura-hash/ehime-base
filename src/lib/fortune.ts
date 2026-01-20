/**
 * 四柱推命（十干）に基づいた占いロジック
 */

export const JIKKAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const JIKKAN_READING: Record<string, string> = {
    '甲': 'きのえ', '乙': 'きのと', '丙': 'ひのえ', '丁': 'ひのと', '戊': 'つちのえ',
    '己': 'つちのと', '庚': 'かのえ', '辛': 'かのと', '壬': 'みずのえ', '癸': 'みずのと'
};

export const JIKKAN_ELEMENTS: Record<string, string> = {
    '甲': '大樹', '乙': '草花', '丙': '太陽', '丁': '灯火', '戊': '山',
    '己': '大地', '庚': '鋼鉄', '辛': '宝石', '壬': '大河', '癸': '雨露'
};

/**
 * 生年月日から日干（十干）のインデックスを算出する
 * ※簡易的な計算式（プロトタイプ用）。
 * 実際には節入り日や基準日からの経過日数を用いる必要があります。
 */
export function calculateDayMasterIndex(birthDateStr: string): number {
    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) return 0;

    // 1900年1月31日（甲辰の日と仮定した基準）からの経過日数で算出する簡易ロジック
    const baseDate = new Date('1900-01-31');
    const diffTime = birthDate.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 十干は10日周期
    let index = diffDays % 10;
    if (index < 0) index += 10;

    return index;
}

/**
 * 本日の運勢アドバイスを取得する（日干に基づく）
 */
export function getDailyFortune(dayMaster: string) {
    const today = new Date();
    const luckyColors = ['ブルー', 'イエロー', 'ホワイト', 'ゴールド', 'レッド', 'グリーン'];
    const colorIndex = (today.getDate() + dayMaster.charCodeAt(0)) % luckyColors.length;

    const advices: Record<string, string[]> = {
        '甲': [
            '真っ直ぐな姿勢が評価されます。新しい挑戦に最適な日。',
            '周囲の意見を聞き入れる柔軟性が幸運の鍵です。',
            '自分の信念を貫きましょう。大きな成果が期待できます。'
        ],
        '乙': [
            '調整役に徹するとスムーズに進みます。',
            '感性が研ぎ澄まされる日。美しいものに触れて。',
            '粘り強い努力が実を結びます。一歩ずつ前へ。'
        ],
        '丙': [
            '周囲を明るく照らすリーダーシップが発揮されます。',
            '情熱が空回りしやすいので、一呼吸おいて冷静に。',
            '注目の的になる日。自信を持って発言しましょう。'
        ],
        '丁': [
            '内面の情熱を静かに燃やしましょう。分析に良い日。',
            '直感が冴えています。ふと思いついたアイデアを大切に。',
            '丁寧な配慮が人との絆を深めます。'
        ],
        '戊': [
            '安定感が武器になります。長期的な計画を立てて。',
            '包容力を活かして、困っている人を助けてあげましょう。',
            'どっしりと構えて吉。焦りは禁物です。'
        ],
        '己': [
            '多才さを活かせる場面があります。',
            '自己投資に良い日。新しいスキルを学び始めては？',
            '人との交流で豊かな実りがある日です。'
        ],
        '庚': [
            '決断力が試されます。スピード感を持って行動して。',
            '変化を恐れず、改善が必要なことに着手しましょう。',
            '鋭い洞察力が冴えます。問題の本質を見抜けるはず。'
        ],
        '辛': [
            '美意識を形にするチャンスです。細部にこだわって。',
            '試練もありますが、磨かれることで輝きが増します。',
            '自分自身を大切にする時間を持ちましょう。'
        ],
        '壬': [
            'スケールの大きな発想が未来を切り開きます。',
            '状況に合わせた柔軟な対応が成功を導きます。',
            '知的な活動にツキがあります。読書や調査がおすすめ。'
        ],
        '癸': [
            '慈愛の心が幸運を呼びます。癒やしの存在に。',
            '思慮深さがトラブルを回避します。慎重に動いて。',
            '心穏やかに過ごしましょう。直感が冴える日です。'
        ]
    };

    const adviceList = advices[dayMaster] || ['穏やかな心で過ごしましょう。'];
    const adviceIndex = (today.getDate() + today.getMonth()) % adviceList.length;

    return {
        advice: adviceList[adviceIndex],
        luckyColor: luckyColors[colorIndex],
        luckyNumber: (today.getDate() % 9) + 1
    };
}
