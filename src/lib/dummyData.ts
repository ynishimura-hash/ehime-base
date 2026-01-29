export interface Job {
    id: string;
    companyId: string;
    title: string;
    type: 'quest' | 'job'; // Added type distinction
    category: '新卒' | '中途' | 'アルバイト' | '体験JOB' | 'インターンシップ' | '会社説明会';
    reward?: string;
    description: string;
    isExperience: boolean;
    // New fields
    requirements?: string;
    salary?: string;
    workingHours?: string;
    holidays?: string;
    welfare?: string;
    selectionProcess?: string;
    // Added for UI
    tags: string[];
    location?: string;
    reels?: Reel[];
}

export interface Reel {
    id: string;
    url: string; // Path to file or YouTube URL
    type: 'file' | 'youtube';
    thumbnail?: string;
    title: string;
    caption?: string; // New
    description?: string;
    link_url?: string; // New
    link_text?: string; // New
    likes: number;
    entityType?: 'company' | 'job' | 'quest' | 'other';
}

// --- e-Learning (Reskill University) Data Structures ---

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
}

export interface Lesson {
    id: string;
    curriculumId: string;
    title: string;
    description: string;
    youtubeUrl: string;
    duration: string;
    attachments?: { name: string; url: string; size: string }[];
    quiz?: QuizQuestion[];
    order: number;
}

export interface Curriculum {
    id: string;
    courseId: string;
    title: string;
    description: string;
    lessons: Lesson[];
    order: number;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructor: {
        name: string;
        role: string;
        image: string;
    };
    category: string;
    level: '初級' | '中級' | '上級';
    duration: string; // Total duration
    image: string;
    curriculums: Curriculum[];
    isFeatured?: boolean;
}

export interface Company {
    id: string;
    name: string;
    industry: string;
    location: string;
    description: string;
    rjpNegatives: string;
    isPremium: boolean;
    image: string;
    logoColor: string;
    // New fields
    foundingYear?: number;
    capital?: string;
    employeeCount?: string;
    representative?: string;
    address?: string;
    phone?: string;
    website?: string;
    businessDetails?: string;
    philosophy?: string;
    benefits?: string;
    rjpPositives?: string;
    images?: string[]; // Added for gallery
    reels?: Reel[];
    videos?: string[];
}

export const COMPANIES: Company[] = [
    {
        id: 'c_eis',
        name: '合同会社EIS',
        industry: 'サービス・観光・飲食店',
        location: '松山市',
        description: '「非対称なマッチング」で地域の歪みをエネルギーに変える。EISは単なる採用支援ではなく、企業と個人の本質的な成長に伴走する教育機関です。',
        rjpNegatives: '「正解」のない問いに向き合い続ける仕事です。指示待ちの姿勢では何も進められず、常に自ら考え行動する泥臭さが求められます。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
        ],
        logoColor: 'bg-indigo-900',
        foundingYear: 2020,
        capital: '300万円',
        employeeCount: '5名',
        representative: '代表社員 鈴木 杏奈',
        address: '愛媛県松山市千舟町4-3-7',
        website: 'https://eis.example.com',
        benefits: 'リモートワーク可 / 書籍購入補助 / スキルアップ研修',
        reels: [
            {
                id: 'r_eis_1',
                url: '/videos/sample_reel.mp4',
                type: 'file',
                title: '2050年カーボンニュートラルへの挑戦',
                description: '私たちが目指す持続可能な未来についてのショートムービーです。',
                likes: 120
            },
            {
                id: 'r_eis_v4',
                url: '/videos/reels/eis_v4.mp4',
                type: 'file',
                title: 'EIS V4 Introduction',
                likes: 90
            }
        ]
    },
    {
        id: 'c_toyota_lf',
        name: 'トヨタL＆F西四国株式会社',
        industry: '物流・運送',
        location: '松山市大可賀',
        description: 'トヨタグループの一員として、物流現場の課題を解決する「物流ドクター」。フォークリフト販売だけでなく、物流システム全体の最適化を提案します。',
        rjpNegatives: 'お客様の現場は倉庫や工場が多く、夏は暑く冬は寒い場所での作業や提案活動もあります。快適なオフィスワークだけではありません。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-orange-600',
        images: [
            'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1565514020176-892eb1036662?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800'
        ],
        foundingYear: 1985,
        capital: '5,000万円',
        employeeCount: '120名',
        representative: '代表取締役 高橋 健一',
        address: '愛媛県松山市大可賀3-1-1',
        website: 'https://toyota-lf-west-shikoku.example.com',
        benefits: '各種社会保険完備 / トヨタグループ保養所利用可 / 退職金制度',
        reels: [
            {
                id: 'r_toyota_1',
                url: 'https://www.youtube.com/embed/PdCr4k0c2X8',
                type: 'youtube',
                title: '物流現場の1日',
                description: '普段は見られない物流センターの裏側をお見せします！',
                likes: 85
            },
            {
                id: 'r_toyota_2',
                url: '/videos/reels/toyota_lf_jun.mp4',
                type: 'file',
                title: '先輩社員インタビュー：じゅんころ編',
                likes: 45
            },
            {
                id: 'r_toyota_3',
                url: '/videos/reels/toyota_lf_1.mov',
                type: 'file',
                title: 'EISナビ掲載動画',
                likes: 32
            }
        ]
    },
    {
        id: 'c1',
        name: '松山テクノサービス',
        industry: 'IT・システム開発',
        location: '松山市千舟町',
        description: '愛媛のDXを支える老舗ITエンジニア集団。',
        rjpNegatives: '正直、ドキュメント化が追いついておらず、口頭での技術伝承が多い現場です。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-blue-600',
        images: [
            'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1504384308090-c54be3852f33?auto=format&fit=crop&q=80&w=800'
        ],
        foundingYear: 1990,
        capital: '2,000万円',
        employeeCount: '45名',
        representative: '代表取締役 佐藤 誠',
        address: '愛媛県松山市千舟町2-2-2',
        website: 'https://matsuyama-tech.example.com',
        benefits: '資格取得支援制度 / フレックスタイム制',
    },
    {
        id: 'c2',
        name: '道後おもてなし庵',
        industry: 'サービス・観光・飲食店',
        location: '松山市道後',
        description: '100年続く伝統と、最新の宿泊体験を融合させる老舗旅館。',
        rjpNegatives: '繁忙期は非常に体力を使い、シフトも不規則になりがちです。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-orange-600',
        images: [
            'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'
        ],
        foundingYear: 1920,
        capital: '1,000万円',
        employeeCount: '80名',
        representative: '女将 伊藤 優子',
        address: '愛媛県松山市道後湯之町1-1',
        website: 'https://dogo-omotenashi.example.com',
        benefits: '賄いあり / 制服貸与 / 温泉入浴可',
    },
    {
        id: 'c3',
        name: '瀬戸内マニュファクチャリング',
        industry: '製造業・エンジニアリング',
        location: '今治市',
        description: '世界シェアトップクラスの船舶部品を製造。',
        rjpNegatives: '職人気質が強く、最初は厳しい指導を受けることが覚悟されます。',
        isPremium: false,
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-zinc-700',
        foundingYear: 1975,
        capital: '8,000万円',
        employeeCount: '200名',
        representative: '代表取締役 渡辺 剛',
        address: '愛媛県今治市大正町5-5',
        website: 'https://setouchi-mfg.example.com',
        benefits: '社員寮完備 / 家族手当 / 昼食補助',
    },
    {
        id: 'c4',
        name: '愛媛スマートアグリ',
        industry: '農業・一次産業',
        location: '西条市',
        description: 'AIとIoTを活用した次世代のみかん栽培と流通改革。',
        rjpNegatives: '自然相手のため、収穫期は休日が不定期になることがあります。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-green-600',
        foundingYear: 2018,
        capital: '500万円',
        employeeCount: '15名',
        representative: '代表 吉田 健太',
        address: '愛媛県西条市小松町',
        website: 'https://ehime-smart-agri.example.com',
        benefits: '収穫物支給 / 服装自由 / 車通勤可',
    },
    {
        id: 'c5',
        name: '伊予デザインラボ',
        industry: 'その他',
        location: '松山市大街道',
        description: '愛媛発のブランドを世界へ。デザインの力で地域を元気に。',
        rjpNegatives: '納期直前は深夜作業が発生することもあり、ワークライフバランスは波があります。',
        isPremium: false,
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-pink-600',
        foundingYear: 2010,
        capital: '300万円',
        employeeCount: '10名',
        representative: '代表 藤田 さくら',
        address: '愛媛県松山市大街道3-2',
        website: 'https://iyo-design.example.com',
        benefits: '最新Mac支給 / リモートワーク推奨',
    },
    {
        id: 'c6',
        name: '宇和島シーフードエキスパート',
        industry: '製造・エンジニアリング',
        location: '宇和島市',
        description: '宇和海で育ったブランド魚を、独自の鮮度管理で全国へ。',
        rjpNegatives: '作業場は寒く、体力的にハードな立ち仕事がメインです。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-cyan-600',
        foundingYear: 2005,
        capital: '1,500万円',
        employeeCount: '30名',
        representative: '代表取締役 山本 洋',
        address: '愛媛県宇和島市築地町1-1',
        website: 'https://uwajima-seafood.example.com',
        benefits: '社割あり / 制服貸与',
    },
    {
        id: 'c7',
        name: '四国ロジスティクスパートナー',
        industry: '物流・運送',
        location: '東温市',
        description: '四国全域を繋ぐ、物流の心臓部となるセンター。',
        rjpNegatives: 'ミスの許されない正確性が求められ、緊張感の高い職場です。',
        isPremium: false,
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-indigo-600',
        foundingYear: 2000,
        capital: '4,000万円',
        employeeCount: '150名',
        representative: 'センター長 村上 龍',
        address: '愛媛県東温市田窪',
        website: 'https://shikoku-logi.example.com',
        benefits: 'シフト制 / 車通勤可 / 資格取得支援',
    },
    {
        id: 'c8',
        name: '内子クラフトワークス',
        industry: 'その他',
        location: '内子町',
        description: '伝統的な町並みで、若手作家の作品をプロデュース。',
        rjpNegatives: '地域住民との深い交流が必須であり、コミュ力が試されます。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e15ca?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-amber-800',
        foundingYear: 2015,
        capital: '100万円',
        employeeCount: '3名',
        representative: '代表 中川 こずえ',
        address: '愛媛県喜多郡内子町',
        website: 'https://uchiko-craft.example.com',
        benefits: '移住支援あり / 工房利用可',
    },
    {
        id: 'c9',
        name: '新居浜トータルサポート',
        industry: '製造・エンジニアリング',
        location: '新居浜市',
        description: '工場地帯の設備保守を一手に引き受ける。',
        rjpNegatives: '現場は危険が伴う場所もあり、厳格なルール遵守が絶対です。',
        isPremium: false,
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-red-800',
        foundingYear: 1980,
        capital: '3,000万円',
        employeeCount: '70名',
        representative: '代表取締役 小野 晋平',
        address: '愛媛県新居浜市',
        website: 'https://niihama-total.example.com',
        benefits: '危険手当あり / 資格手当充実',
    },
    {
        id: 'c10',
        name: '愛媛ライフケア協会',
        industry: '医療・福祉',
        location: '松山市富久',
        description: 'ICTを活用した、スタッフに負担をかけない新型介護施設。',
        rjpNegatives: '最新ツールを使いこなす必要があり、学習意欲がないとしんどいです。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-emerald-600',
        foundingYear: 2012,
        capital: 'N/A',
        employeeCount: '40名',
        representative: '理事長 木村 春香',
        address: '愛媛県松山市富久町',
        website: 'https://ehime-lifecare.example.com',
        benefits: '週休3日制導入中 / 託児所あり',
    },
    // New Companies from Video Import
    {
        id: 'c_agusasu',
        name: '株式会社アグサス',
        industry: 'IT・システム開発',
        location: '松山市',
        description: 'オフィスのDX化から環境構築まで、働く場所の「快適」を提案します。',
        rjpNegatives: '変化の激しい業界のため、常に新しい知識の習得が求められます。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-blue-500',
        reels: [
            { id: 'r_agusasu_1', url: '/videos/reels/agusasu_1.mp4', type: 'file', title: 'アグサス紹介①', likes: 20 },
            { id: 'r_agusasu_2', url: '/videos/reels/agusasu_2.mp4', type: 'file', title: 'アグサス紹介②', likes: 15 },
            { id: 'r_agusasu_3', url: '/videos/reels/agusasu_signage.mp4', type: 'file', title: 'サイネージ広告', likes: 10 },
            { id: 'r_agusasu_4', url: '/videos/reels/agusasu_reel_1.mp4', type: 'file', title: 'リール動画①', likes: 25 },
            { id: 'r_agusasu_5', url: '/videos/reels/agusasu_reel_2.mp4', type: 'file', title: 'リール動画②', likes: 18 },
        ]
    },
    {
        id: 'c_daiki_axis',
        name: 'ダイキアクシス',
        industry: '製造・エンジニアリング',
        location: '松山市',
        description: '環境を守る、水を守る。持続可能な社会基盤を支える企業です。',
        rjpNegatives: '全国転勤の可能性があります。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-cyan-600',
        reels: [
            { id: 'r_daiki_1', url: '/videos/reels/daiki_axis_1.mp4', type: 'file', title: '会社紹介ムービー', likes: 30 }
        ]
    },
    {
        id: 'c_benefit_one',
        name: '株式会社ベネフィット・ワン',
        industry: 'サービス・観光・飲食店',
        location: '松山市',
        description: 'サービスの流通創造。働く人の「幸せ」をデザインする。',
        rjpNegatives: 'スピード感が非常に早く、変化に対応する柔軟性が必須です。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-red-500',
        reels: [
            { id: 'r_benefit_1', url: '/videos/reels/benefit_one_1.mp4', type: 'file', title: '113けちやか', likes: 40 },
            { id: 'r_benefit_2', url: '/videos/reels/benefit_one_2.mp4', type: 'file', title: 'けちやか Ver.2', likes: 35 }
        ]
    },
    {
        id: 'c_lady_drug',
        name: '株式会社レデイ薬局',
        industry: 'その他',
        location: '松山市',
        description: '地域の健康ステーション。お客様の美と健康をサポートします。',
        rjpNegatives: '立ち仕事が多く、体力が必要です。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-rose-500',
        reels: [
            { id: 'r_lady_1', url: '/videos/reels/lady_drug_1.mp4', type: 'file', title: 'レデイ薬局の魅力①', likes: 50 },
            { id: 'r_lady_2', url: '/videos/reels/lady_drug_2.mp4', type: 'file', title: 'レデイ薬局の魅力②', likes: 45 },
            { id: 'r_lady_3', url: '/videos/reels/lady_drug_3.mov', type: 'file', title: 'レデイ薬局の魅力③', likes: 42 },
            { id: 'r_lady_4', url: '/videos/reels/lady_drug_megu.mp4', type: 'file', title: '先輩社員：めぐさん', likes: 60 }
        ]
    },
    {
        id: 'c_chuon',
        name: '中温',
        industry: '物流・運送',
        location: '東温市',
        description: '確実な配送で地域経済を支える物流パートナー。',
        rjpNegatives: '早朝・深夜の勤務が発生する場合があります。',
        isPremium: false,
        image: 'https://images.unsplash.com/photo-1605218427368-35b849e54d58?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-slate-600',
        reels: [
            { id: 'r_chuon_1', url: '/videos/reels/chuon_1.mp4', type: 'file', title: '会社紹介', likes: 12 }
        ]
    },
    {
        id: 'c_kyoritsu',
        name: '共立電気計器株式会社',
        industry: '製造・エンジニアリング',
        location: '八幡浜市',
        description: '電気計測器のパイオニア。世界の現場を支える技術力。',
        rjpNegatives: '細かい作業が多く、集中力と根気が必要です。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-green-700',
        reels: [
            { id: 'r_kyoritsu_1', url: '/videos/reels/kyoritsu_1.mov', type: 'file', title: '社員インタビュー：みなみ', likes: 28 }
        ]
    },
    {
        id: 'c_ehime_med',
        name: '愛媛医療生活協同組合',
        industry: '医療・福祉',
        location: '松山市',
        description: '地域の人々の健康と暮らしを守る、医療生協です。',
        rjpNegatives: '人の命を預かる現場であり、責任の重さを感じる場面があります。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-teal-600',
        reels: [
            { id: 'r_ehime_med_1', url: '/videos/reels/ehime_med_1.mp4', type: 'file', title: '医療生協の紹介', likes: 35 }
        ]
    },
    {
        id: 'c_nihon_agent',
        name: '株式会社日本エイジェント',
        industry: 'その他',
        location: '松山市',
        description: 'お部屋探しから、入居後の暮らしまでトータルサポート。',
        rjpNegatives: '繁忙期（春）は非常に忙しくなります。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-yellow-500',
        reels: [
            { id: 'r_agent_1', url: '/videos/reels/nihon_agent_1.mp4', type: 'file', title: '会社紹介', likes: 48 }
        ]
    },
    {
        id: 'c_murakami',
        name: '村上工業株式会社',
        industry: '製造・エンジニアリング',
        location: '今治市',
        description: '地域のインフラを支える、信頼と実績の建設会社。',
        rjpNegatives: '現場作業は天候に左右され、夏場の作業は過酷です。',
        isPremium: false,
        image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-orange-700',
        reels: [
            { id: 'r_murakami_1', url: '/videos/reels/murakami_1.mp4', type: 'file', title: '村上工業PR', likes: 15 },
            { id: 'r_murakami_2', url: '/videos/reels/murakami_2.mp4', type: 'file', title: 'EISナビ紹介', likes: 12 }
        ]
    },
    {
        id: 'c_kaneshiro',
        name: '株式会社カネシロ',
        industry: '製造・エンジニアリング',
        location: '松山市',
        description: '古紙リサイクルを通じて、循環型社会の実現に貢献します。',
        rjpNegatives: '廃棄物を扱うため、汚れや臭いがある現場もあります。',
        isPremium: false,
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-green-800',
        reels: [
            { id: 'r_kaneshiro_1', url: '/videos/reels/kaneshiro_1.mp4', type: 'file', title: 'カネシロ企業紹介', likes: 22 }
        ]
    },
    {
        id: 'c_engarden',
        name: '縁ガーデン',
        industry: '農業・一次産業',
        location: '伊予市',
        description: '植物を通じて、心安らぐ空間と「縁」を紡ぎます。',
        rjpNegatives: '自然相手の仕事であり、体力勝負の側面が強いです。',
        isPremium: false,
        image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-lime-600',
        reels: [
            { id: 'r_engarden_1', url: '/videos/reels/engarden_1.mp4', type: 'file', title: '縁ガーデン紹介', likes: 18 }
        ]
    },
    {
        id: 'c_nishio',
        name: '西尾レントオール',
        industry: '物流・運送',
        location: '新居浜市',
        description: '建設機械からイベント用品まで、あらゆるものをレンタルで提供。',
        rjpNegatives: '機械のメンテナンスなど、油汚れのつく作業もあります。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-red-600',
        reels: [
            { id: 'r_nishio_1', url: '/videos/reels/nishio_rent_1.mp4', type: 'file', title: '会社紹介', likes: 26 }
        ]
    },
    {
        id: 'c_nagahama',
        name: '長浜機設',
        industry: '製造・エンジニアリング',
        location: '大洲市',
        description: '確かな技術力で、プラント設備の設計・施工を行います。',
        rjpNegatives: '出張工事が多く、長期間家を空けることもあります。',
        isPremium: false,
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-slate-700',
        reels: [
            { id: 'r_nagahama_1', url: '/videos/reels/nagahama_1.mp4', type: 'file', title: '社員紹介：あっつう', likes: 30 }
        ]
    },
    {
        id: 'c_fudo',
        name: '株式会社風土',
        industry: 'サービス・観光・飲食店',
        location: '松山市',
        description: '愛媛の食材を使った飲食店を展開。食の感動を届けます。',
        rjpNegatives: '週末は非常に忙しく、立ちっぱなしの時間が長いです。',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800',
        logoColor: 'bg-orange-500',
        reels: [
            { id: 'r_fudo_1', url: '/videos/reels/fudo_1.mp4', type: 'file', title: '店長インタビュー：なかっち', likes: 55 }
        ]
    }
];

export const JOBS: Job[] = [
    {
        id: 'j1',
        companyId: 'c1',
        title: '地方自治体のDX推進エンジニア',
        type: 'job',
        category: '中途',
        description: '愛媛の自治体とともに、市民サービスのデジタル化を推進します。',
        isExperience: false,
        salary: '月給 30万円 ~ 50万円',
        workingHours: '9:00 - 18:00 (フレックスあり)',
        holidays: '土日祝 (年間休日125日)',
        selectionProcess: '書類選考 -> 一次面接 -> 最終面接',
        welfare: 'リモートワーク可, PC支給',
        tags: ['土日祝休み', 'リモート', '社会貢献'],
        location: '松山市'
    },
    {
        id: 'j2',
        companyId: 'c2',
        title: '伝統を繋ぐ、フロントサービススタッフ',
        type: 'job',
        category: '新卒',
        description: '道後温泉の歴史を学び、お客様に最高の「思い出」を提供します。',
        isExperience: false,
        salary: '月給 20万円 ~',
        workingHours: 'シフト制 (実働8時間)',
        holidays: '月8~9日 (シフト制)',
        selectionProcess: '説明会 -> 面接',
        welfare: '寮完備',
        tags: ['未経験OK', '寮完備', '語学活用'],
        location: '松山市道後'
    },
    {
        id: 'j3',
        companyId: 'c1',
        title: '1日体験：レガシーシステム改修ワーク',
        type: 'quest',
        category: '体験JOB',
        reward: '¥10,000',
        description: '古いプログラムを読み解き、現代的にリファクタリングする体験。',
        isExperience: true,
        salary: '日給 10,000円',
        workingHours: '10:00 - 18:00',
        holidays: '規定なし',
        selectionProcess: '書類選考のみ',
        tags: ['短期', '実践型', '要経験'],
        location: '松山市（オンライン可）'
    },
    {
        id: 'j4',
        companyId: 'c4',
        title: 'スマートアグリ・インターンシップ',
        type: 'quest',
        category: 'インターンシップ',
        description: 'データに基づいた柑橘栽培の現場を1週間体験。',
        isExperience: false,
        salary: '無給 (交通費支給)',
        workingHours: '9:00 - 17:00',
        holidays: '日曜',
        selectionProcess: '面談',
        tags: ['未経験OK', '自然', '最新技術'],
        location: '西条市'
    },
    {
        id: 'j5',
        companyId: 'c5',
        title: 'SNSマーケティング・アシスタント',
        type: 'quest',
        category: 'アルバイト',
        description: '愛媛の特産品をInstagramで世界に広めるお手伝い。',
        isExperience: false,
        salary: '時給 1,000円 ~',
        workingHours: '週2~3日, 1日4時間~',
        holidays: 'シフト制',
        selectionProcess: 'ポートフォリオ審査 -> 面接',
        tags: ['服装自由', '学生歓迎', '週2〜OK'],
        location: '松山市'
    },
    {
        id: 'j6',
        companyId: 'c6',
        title: '水産加工の工程改善リーダー',
        type: 'job',
        category: '中途',
        description: '現場のロスを減らし、品質を向上させるための仕組み作り。',
        isExperience: false,
        salary: '月給 25万円 ~ 35万円',
        workingHours: '8:00 - 17:00 (早番あり)',
        holidays: '日曜祝日 + その他',
        selectionProcess: '書類選考 -> 面接',
        tags: ['リーダー候補', '食に関わる', 'Uターン歓迎'],
        location: '宇和島市'
    },
    {
        id: 'j7',
        companyId: 'c8',
        title: '伝統工芸セレクトショップの店長候補',
        type: 'job',
        category: '中途',
        description: '内子の魅力を国内外の観光客へ伝える拠点運営。',
        isExperience: false,
        salary: '月給 22万円 ~',
        workingHours: '9:30 - 18:30',
        holidays: '火曜定休 + 他1日',
        selectionProcess: '面接 -> 実技試験(接客)',
        tags: ['店長候補', '英語活用', '移住歓迎'],
        location: '内子町'
    },
    {
        id: 'j8',
        companyId: 'c10',
        title: '介護×Techの実践介護スタッフ',
        type: 'job',
        category: '新卒',
        description: '最新のセンサーやロボットを使い、新しい介護の形を創ります。',
        isExperience: false,
        salary: '月給 21万円 ~ (夜勤手当別途)',
        workingHours: 'シフト制 (夜勤あり)',
        holidays: '4週8休',
        selectionProcess: '見学会 -> 面接',
        tags: ['資格取得支援', '最新設備', '新卒歓迎'],
        location: '松山市'
    },
    {
        id: 'j9',
        companyId: 'c4',
        title: '週末限定：みかん収穫クエスト',
        type: 'quest',
        category: '体験JOB',
        reward: '¥8,000',
        description: '最高のみかんを見分けるスキルを磨きながら、収穫を手伝う実戦。',
        isExperience: true,
        salary: '日給 8,000円 + みかん',
        workingHours: '8:00 - 16:00',
        holidays: '雨天中止',
        selectionProcess: '先着順',
        tags: ['単発', '体力づくり', 'お土産あり'],
        location: '西条市'
    },
    {
        id: 'j10',
        companyId: 'c3',
        title: 'CADオペレーター',
        type: 'job',
        category: '中途',
        description: 'CADを用いた図面作成のサポート。専門技術を磨きたい方。',
        isExperience: false,
        salary: '時給 1,500円',
        workingHours: '9:00 - 18:00',
        holidays: '土日祝',
        selectionProcess: 'スキルチェック -> 面接',
        tags: ['土日祝休み', 'スキルアップ', '経験者優遇'],
        location: '今治市'
    },
    {
        id: 'j_test_eis',
        companyId: 'c_eis',
        title: '【テスト用】新規事業立ち上げブレスト',
        type: 'quest',
        category: '体験JOB',
        reward: '¥5,000',
        description: 'EISの新規事業に関するディスカッションパートナーを募集。',
        isExperience: true,
        salary: '時給 2,500円',
        workingHours: '2時間',
        holidays: '調整により決定',
        selectionProcess: 'プロフィール審査',
        tags: ['オンライン', '短期', '高時給'],
        location: 'オンライン'
    },
    {
        id: 'j_murakami_1',
        companyId: 'c_murakami',
        title: 'インフラ設備メンテナンス・施工管理',
        type: 'job',
        category: '中途',
        description: '今治の街を支える、やりがいのある仕事です。地域のインフラ。',
        isExperience: false,
        salary: '月給 25万円 ~ 45万円',
        workingHours: '8:00 - 17:00',
        holidays: '土日祝 (企業カレンダーによる)',
        selectionProcess: '面接のみ',
        welfare: '社会保険完備, 住宅手当',
        tags: ['地域貢献', '未経験歓迎'],
        location: '今治市'
    },
    {
        id: 'j_niihama_1',
        companyId: 'c9',
        title: 'プラント設備メンテナンススタッフ',
        type: 'job',
        category: '中途',
        description: '新居浜の工場地帯を支える、専門技術を磨ける職場です。',
        isExperience: false,
        salary: '月給 23万円 ~ 40万円',
        workingHours: '8:00 - 17:00',
        holidays: 'シフト制',
        selectionProcess: '面談',
        welfare: '資格取得支援, 寮完備',
        tags: ['スキルアップ', '安定収入'],
        location: '新居浜市'
    },
    {
        id: 'q_murakami_1',
        companyId: 'c_murakami',
        title: '建設現場1日体験：インフラ工事の裏側',
        type: 'quest',
        category: '体験JOB',
        reward: '¥10,000',
        description: '今治の現場で、プロの仕事を間近で体験しよう。',
        isExperience: false,
        salary: '日給 10,000円',
        workingHours: '9:00 - 16:00',
        holidays: 'なし',
        selectionProcess: '先着順',
        tags: ['短期', '現場体験'],
        location: '今治市'
    },
];
