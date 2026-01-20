import { Specialist, BabyBaseEvent, LearningArticle, SpecialistPost } from './types/babybase';

export const BB_SPECIALISTS: Specialist[] = [
    {
        id: 'spec_1',
        name: '佐藤 まなみ',
        category: '妊娠・出産',
        title: '産後ケア・母乳相談の専門家',
        description: '病院勤務15年の経験を活かし、自宅でリラックスできる訪問ケアを提供しています。不安な夜も一人で悩まないでくださいね。',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
        location: '松山市・東温市',
        tags: ['母乳外来', '乳房マッサージ', 'メンタルケア'],
        isVerified: true,
        snsLinks: { instagram: '#' }
    },
    {
        id: 'spec_2',
        name: '高橋 佳代子',
        category: '赤ちゃん・育児',
        title: '親子の絆を深めるタッチケア講師',
        description: 'マッサージを通じて赤ちゃんの情緒を安定させ、ママの癒やしタイムも作ります。少人数制のアットホームな教室です。',
        image: 'https://images.unsplash.com/photo-1544126591-90415744ad9b?q=80&w=400&auto=format&fit=crop',
        location: '伊予市・松前町',
        tags: ['ベビーマッサージ', 'ふれあい遊び', 'ワークショップ'],
        isVerified: true
    },
    {
        id: 'spec_3',
        name: '村上 瑠美',
        category: '離乳食・健康',
        title: '離乳食・偏食相談アドバイザー',
        description: '「食べない」悩み、一緒に解決しましょう。地元の旬な食材を使った、無理のない離乳食レシピを提案します。',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=400&auto=format&fit=crop',
        location: '今治市・西条市',
        tags: ['離乳食', '大人ごはん', 'アレルギー相談'],
        isVerified: true
    },
    {
        id: 'spec_4',
        name: '田中 絵理',
        category: '赤ちゃん・育児',
        title: '睡眠改善で家族全員ハッピーに',
        description: '科学的な根拠に基づいたセルフねんねの習慣化をサポート。夜泣きや寝かしつけの負担を軽くします。',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop',
        location: 'オンライン対応',
        tags: ['夜泣き', '生活リズム', '寝かしつけ'],
        isVerified: true
    },
    {
        id: 'spec_5',
        name: '伊藤 幸子',
        category: 'リラックス',
        title: '産後の体を整えるボディメンテナンス',
        description: '産後の歪みを整え、育児に必要な筋力をサポート。痛みや不調を我慢しない毎日を目指しましょう。',
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format&fit=crop',
        location: '松山市中心部',
        tags: ['産後整体', '骨盤矯正', '体幹トレーニング'],
        isVerified: true
    }
];

export const BB_EVENTS: BabyBaseEvent[] = [
    {
        id: 'ev_1',
        specialistId: 'spec_2',
        title: '初めてのベビーマッサージ体験会',
        date: '2026-02-10 10:30',
        location: '愛媛県松山市・子育て支援センター',
        type: 'offline',
        // Valid baby massage/mother baby image
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop',
        price: '1,500円'
    },
    {
        id: 'ev_2',
        specialistId: 'spec_1',
        title: 'プレママ・新米ママの座談会',
        date: '2026-02-15 14:00',
        location: 'オンライン (Zoom)',
        type: 'online',
        image: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?q=80&w=600&auto=format&fit=crop',
        price: '無料'
    }
];

export const BB_ARTICLES: LearningArticle[] = [
    {
        id: 'art_1',
        title: '生後3ヶ月からのリズム作り。夜泣きを減らす3つのコツ',
        category: '赤ちゃん・育児',
        authorId: 'spec_4',
        content: '規則的な生活リズムを整えることが、良質な睡眠への第一歩です。まずは朝の光を浴びることから始めましょう。カーテンを開けて太陽の光を入れることで、セロトニンが分泌され...',
        image: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=600&auto=format&fit=crop',
        publishedAt: '2026-01-15'
    },
    {
        id: 'art_2',
        title: '離乳食初期にオススメ！地元の野菜を使ったピューレ',
        category: '離乳食・健康',
        authorId: 'spec_3',
        content: '愛媛の甘いミカンだけじゃない！今治の野菜を使った離乳食は、甘みが強くて赤ちゃんも大喜びです。今日は特に旬の人参を使った簡単レシピをご紹介します。',
        // Valid vegetables/baby food image
        image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=600&auto=format&fit=crop',
        publishedAt: '2026-01-18'
    }
];

export const BB_POSTS: SpecialistPost[] = [
    {
        id: 'post_1',
        specialistId: 'spec_1',
        content: '今日のお昼は離乳食の進め方についてインスタライブを行います！ぜひ遊びに来てくださいね✨',
        image: 'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?q=80&w=400&auto=format&fit=crop',
        likes: 24,
        createdAt: '2026-01-20 09:00'
    },
    {
        id: 'post_2',
        specialistId: 'spec_4',
        content: '夜泣き対策の第一歩は「朝の光」です。今朝はどんより曇り空ですが、窓際で少し過ごすだけでも効果がありますよ。',
        image: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?q=80&w=400&auto=format&fit=crop',
        likes: 15,
        createdAt: '2026-01-20 10:30'
    },
    {
        id: 'post_3',
        specialistId: 'spec_2',
        content: '明日のベビーマッサージ教室、キャンセル枠が1件出ました！気になっていた方はDMください。',
        // Valid baby feet/massage image
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=400&auto=format&fit=crop',
        likes: 8,
        createdAt: '2026-01-19 18:00'
    }
];
