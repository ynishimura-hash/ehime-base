
// 10 Heavenly Stems (Day Masters)
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 5 Elements relationships (Simplification for simulation)
// Wood (甲, 乙) generates Fire -> Output
// Wood controls Earth -> Wealth
// Metal controls Wood -> Officer
// Water generates Wood -> Resource
// Wood matches Wood -> Friend

type Relationship = 'Friend' | 'Output' | 'Wealth' | 'Officer' | 'Resource';

const ELEMENT_MAP: Record<string, string> = {
    '甲': 'Wood', '乙': 'Wood',
    '丙': 'Fire', '丁': 'Fire',
    '戊': 'Earth', '己': 'Earth',
    '庚': 'Metal', '辛': 'Metal',
    '壬': 'Water', '癸': 'Water'
};

const RELATIONSHIP_MATRIX: Record<string, Record<string, Relationship>> = {
    'Wood': { 'Wood': 'Friend', 'Fire': 'Output', 'Earth': 'Wealth', 'Metal': 'Officer', 'Water': 'Resource' },
    'Fire': { 'Wood': 'Resource', 'Fire': 'Friend', 'Earth': 'Output', 'Metal': 'Wealth', 'Water': 'Officer' },
    'Earth': { 'Wood': 'Officer', 'Fire': 'Resource', 'Earth': 'Friend', 'Metal': 'Output', 'Water': 'Wealth' },
    'Metal': { 'Wood': 'Wealth', 'Fire': 'Officer', 'Earth': 'Resource', 'Metal': 'Friend', 'Water': 'Output' },
    'Water': { 'Wood': 'Output', 'Fire': 'Wealth', 'Earth': 'Officer', 'Metal': 'Resource', 'Water': 'Friend' }
};

const TEXT_TEMPLATES: Record<Relationship, { opening: string[], advice: string[], closing: string[] }> = {
    'Friend': {
        opening: [
            "今日は「自立」と「決断」のエネルギーが強く巡っています。自分の信じた道を突き進む強さがある日です。",
            "周囲に流されず、あなたのペースで物事を進められる一日です。新しい目標を立てるのに最適ですね。",
            "仲間との協力よりも、まずは個人のスキルや意志を磨くことに適した日です。自分自身の成長を感じられるでしょう。"
        ],
        advice: [
            "ただ、自己主張が強くなりすぎると、周囲との摩擦を生む可能性があります。一歩引いて相手の話を聞く余裕を持ちましょう。",
            "自信過剰になりやすい日でもあります。独りよがりな判断をしていないか、立ち止まって確認することも大切です。",
            "頑固になりやすいので注意が必要です。柔軟な姿勢を意識することで、よりスムーズに物事が運びます。"
        ],
        closing: [
            "夜は一人の時間を大切にし、自分自身と向き合う静かなひとときを過ごしてください。",
            "成功の鍵は「謙虚さ」にあります。周囲への感謝を忘れずに過ごせば、運気はさらに上昇します。",
            "今日の頑張りが、未来のあなたの自信となります。迷わず進んでください。"
        ]
    },
    'Output': {
        opening: [
            "創造力と表現力が高まる一日です。あなたのアイデアが周囲に良い影響を与えるでしょう。",
            "感性が研ぎ澄まされ、クリエイティブな活動に最適な日です。思いついたことはメモに残しておきましょう。",
            "積極的に自己表現することで、運気が開ける日です。あなたの言葉が人の心を動かすかもしれません。"
        ],
        advice: [
            "しかし、言葉が鋭くなりすぎて、知らず知らずのうちに誰かを傷つけてしまうかもしれません。発言には少しの優しさを。",
            "感情の起伏が激しくなりがちです。イライラした時は深呼吸をして、冷静さを取り戻しましょう。",
            "あれこれ手を出しすぎて、中途半端にならないように注意が必要です。優先順位を決めて集中しましょう。"
        ],
        closing: [
            "好きな音楽を聴いたり、美しいものに触れることで、さらに感性が磨かれます。",
            "アウトプットした後は、しっかりと休息をとってエネルギーをチャージしましょう。",
            "あなたの才能が輝く日です。自信を持って表現してください。"
        ]
    },
    'Wealth': {
        opening: [
            "努力が目に見える「成果」となって表れやすい日です。仕事や勉強で手応えを感じられるでしょう。",
            "今日は「収穫」の時です。これまで積み重ねてきたことが評価されたり、具体的な結果につながります。",
            "社交運が高まり、人との繋がりからチャンスが舞い込む一日です。積極的に人と関わってみましょう。"
        ],
        advice: [
            "結果を急ぎすぎて、プロセスをおろそかにしないよう注意してください。誠実な対応が信頼を築きます。",
            "利益や損得勘定ばかりが先行すると、大切なものを見失うかもしれません。心の豊かさも大切に。",
            "忙しくなりすぎて、体調管理がおろそかになりがちです。適度な休憩を忘れないようにしましょう。"
        ],
        closing: [
            "夜は自分へのご褒美を用意して、今日一日の頑張りをねぎらってください。",
            "得られた成果を周囲と分かち合うことで、さらに運気がアップします。",
            "今日は充実した一日になるでしょう。感謝の気持ちを持って締めくくってください。"
        ]
    },
    'Officer': {
        opening: [
            "責任感と規律が求められる一日です。社会的な役割を果たすことで、信頼が大きく高まります。",
            "今日は「正義」や「ルール」を意識すると良い日です。誠実な行動が評価されるでしょう。",
            "リーダーシップを発揮する場面があるかもしれません。周囲を導くことで、あなた自身も成長できます。"
        ],
        advice: [
            "自分にも他人にも厳しくなりすぎて、息苦しさを感じさせてしまうかもしれません。少しの遊び心や許容さを持ちましょう。",
            "プレッシャーを感じやすい日です。すべてを一人で背負い込まず、時には誰かを頼ることも重要です。",
            "型にはまりすぎて、柔軟な発想ができなくなる恐れがあります。時にはルールを疑ってみる視点も大切です。"
        ],
        closing: [
            "お風呂にゆっくり浸かって、張り詰めた神経をリラックスさせてあげましょう。",
            "今日果たした責任は、必ず誰かが見てくれています。自信を持ってください。",
            "明日への活力を養うため、早めの就寝を心がけてください。"
        ]
    },
    'Resource': {
        opening: [
            "知的好奇心が高まり、学びや研究に最適な一日です。静かな環境で知識を吸収すると良いでしょう。",
            "今日は「インプット」の日です。本を読んだり、専門家の話を聞いたりすることで、新しい発見があります。",
            "精神的な安定が得られる穏やかな日です。過去を振り返り、未来の計画を立てるのに適しています。"
        ],
        advice: [
            "考えすぎて行動が止まってしまうかもしれません。「まずはやってみる」という軽やかさも忘れずに。",
            "自分の殻に閉じこもりやすくなります。悩みがあるなら、信頼できる人に相談してみましょう。",
            "理屈っぽくなり、感情を無視してしまう傾向があります。相手の気持ちに寄り添うことを意識してください。"
        ],
        closing: [
            "寝る前の読書が、さらなる運気アップにつながります。良い夢が見られるでしょう。",
            "得た知識は、誰かのために使うことで初めて活きます。アウトプットも意識してみてください。",
            "心静かな夜を過ごし、明日への英気を養いましょう。"
        ]
    }
};

export const generateFortuneMessage = (dayMasterInput: string | undefined, userName?: string): { message: string, advice: string, luckyColor: string, luckyItem: string } | null => {
    console.log('generateFortuneMessage called with:', { dayMasterInput, userName });
    if (!dayMasterInput) {
        console.warn('generateFortuneMessage: dayMasterInput is falsy');
        return null;
    }

    // Extract the first character as the stem (handles descriptive strings like "戊 (つちのえ) - 山")
    const dayMaster = dayMasterInput.trim().charAt(0);

    if (!STEMS.includes(dayMaster)) {
        console.warn(`generateFortuneMessage: normalized dayMaster "${dayMaster}" (from "${dayMasterInput}") is not in STEMS`, STEMS);
        return null;
    }

    // Simulate Daily Element Cycle based on Date
    // This is a pseudo-logic. In reality, we'd calculate the actual daily stem.
    // For this mock, we use a consistent hash of the date to pick a "Daily Element".
    const dateStr = new Date().toDateString(); // e.g. "Sun Feb 01 2026"
    const dateHash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Cycle through 5 elements based on date hash
    const dailyElements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
    const dailyElement = dailyElements[dateHash % 5];

    const myElement = ELEMENT_MAP[dayMaster];
    const relationship = RELATIONSHIP_MATRIX[myElement][dailyElement];
    const template = TEXT_TEMPLATES[relationship];

    // Pick a variation based on day of month to add variety
    const dayOfMonth = new Date().getDate();
    const opening = template.opening[dayOfMonth % template.opening.length];
    const adviceText = template.advice[(dayOfMonth + 1) % template.advice.length];
    const closing = template.closing[(dayOfMonth + 2) % template.closing.length];

    // Element Colors and Items Mapping
    const ELEMENT_DATA: Record<string, { colors: string[], items: string[] }> = {
        'Wood': {
            colors: ['グリーン', 'ライム', '深緑', 'オリーブ'],
            items: ['観葉植物', '木製の小物', '手帳', 'ハーブティー']
        },
        'Fire': {
            colors: ['レッド', 'ピンク', 'オレンジ', 'パープル'],
            items: ['アロマキャンドル', '照明器具', 'サングラス', '派手なアクセサリー']
        },
        'Earth': {
            colors: ['イエロー', 'ベージュ', 'ブラウン', 'テラコッタ'],
            items: ['陶器のマグ', 'クッション', 'ガーデニング用品', '甘いお菓子']
        },
        'Metal': {
            colors: ['ホワイト', 'ゴールド', 'シルバー', 'メタリック'],
            items: ['腕時計', '鏡', '金属製のペン', 'ミネラルウォーター']
        },
        'Water': {
            colors: ['ブラック', 'ネイビー', 'ブルー', '水色'],
            items: ['コーヒー', 'バスソルト', 'ガラス製品', '海の写真']
        }
    };

    // Determine Lucky Element based on Relationship
    // For simplicity, we choose the element that represents the "Day's Theme" to embrace the energy.
    // e.g. If today is Wealth (Earth), use Earth colors to attract wealth.
    // If today is Resource (Water), use Water colors to enhance wisdom.
    const luckyElementKey = dailyElement;
    const elementData = ELEMENT_DATA[luckyElementKey];

    const luckyColor = elementData.colors[dateHash % elementData.colors.length];
    const luckyItem = elementData.items[dateHash % elementData.items.length];

    const todayDate = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    const nameToUse = userName || dayMaster;

    const fullMessage = `${todayDate}、今日の${nameToUse}さんの運勢をお伝えします。\n\n${opening}\n${adviceText}\n${closing}`;

    return {
        message: fullMessage,
        advice: adviceText,
        luckyColor,
        luckyItem
    };
};
