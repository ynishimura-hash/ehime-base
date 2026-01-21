
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const COMPANIES = [
    {
        id: 'a0ee0000-0000-0000-0000-000000000001',
        name: '合同会社EIS',
        industry: 'サービス・観光・飲食店',
        location: '松山市',
        description: '「非対称なマッチング」で地域の歪みをエネルギーに変える。EISは単なる採用支援ではなく、企業と個人の本質的な成長に伴走する教育機関です。',
        is_premium: true,
        // logo_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
        // cover_image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
        representative_name: '代表社員 鈴木 杏奈',
        established_date: '2020',
        employee_count: '5名',
        capital: '300万円',
        website_url: 'https://eis.example.com',
        type: 'company',
        status: 'approved'
    },
    {
        id: 'a0ee0000-0000-0000-0000-000000000002',
        name: 'トヨタL＆F西四国株式会社',
        industry: '物流・運送',
        location: '松山市大可賀',
        description: 'トヨタグループの一員として、物流現場の課題を解決する「物流ドクター」。フォークリフト販売だけでなく、物流システム全体の最適化を提案します。',
        is_premium: true,
        // logo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
        // cover_image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
        representative_name: '代表取締役 高橋 健一',
        established_date: '1985',
        employee_count: '120名',
        capital: '5,000万円',
        website_url: 'https://toyota-lf-west-shikoku.example.com',
        type: 'company',
        status: 'approved'
    },
    {
        id: 'a0ee0000-0000-0000-0000-000000000003',
        name: '松山テクノサービス',
        industry: 'IT・システム開発',
        location: '松山市千舟町',
        description: '愛媛のDXを支える老舗ITエンジニア集団。',
        is_premium: true,
        // logo_url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800',
        // cover_image_url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800',
        representative_name: '代表取締役 佐藤 誠',
        established_date: '1990',
        employee_count: '45名',
        capital: '2,000万円',
        website_url: 'https://matsuyama-tech.example.com',
        type: 'company',
        status: 'approved'
    },
    {
        id: 'a0ee0000-0000-0000-0000-000000000004',
        name: '道後おもてなし庵',
        industry: 'サービス・観光・飲食店',
        location: '松山市道後',
        description: '100年続く伝統と、最新の宿泊体験を融合させる老舗旅館。',
        is_premium: true,
        // logo_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800',
        // cover_image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800',
        representative_name: '女将 伊藤 優子',
        established_date: '1920',
        employee_count: '80名',
        capital: '1,000万円',
        website_url: 'https://dogo-omotenashi.example.com',
        type: 'company',
        status: 'approved'
    },
    {
        id: 'a0ee0000-0000-0000-0000-000000000005',
        name: '瀬戸内マニュファクチャリング',
        industry: '製造業・エンジニアリング',
        location: '今治市',
        description: '世界シェアトップクラスの船舶部品を製造。',
        is_premium: false,
        // logo_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
        // cover_image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
        representative_name: '代表取締役 渡辺 剛',
        established_date: '1975',
        employee_count: '200名',
        capital: '8,000万円',
        website_url: 'https://setouchi-mfg.example.com',
        type: 'company',
        status: 'approved'
    },
    {
        id: 'a0ee0000-0000-0000-0000-000000000006',
        name: '愛媛スマートアグリ',
        industry: '農業・一次産業',
        location: '西条市',
        description: 'AIとIoTを活用した次世代のみかん栽培と流通改革。',
        is_premium: true,
        // logo_url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800',
        // cover_image_url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800',
        representative_name: '代表 吉田 健太',
        established_date: '2018',
        employee_count: '15名',
        capital: '500万円',
        website_url: 'https://ehime-smart-agri.example.com',
        type: 'company',
        status: 'approved'
    },
    {
        id: 'a0ee0000-0000-0000-0000-000000000007',
        name: '伊予デザインラボ',
        industry: 'その他',
        location: '松山市大街道',
        description: '愛媛発のブランドを世界へ。デザインの力で地域を元気に。',
        is_premium: false,
        // logo_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
        // cover_image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
        representative_name: '代表 藤田 さくら',
        established_date: '2010',
        employee_count: '10名',
        capital: '300万円',
        website_url: 'https://iyo-design.example.com',
        type: 'company',
        status: 'approved'
    },
    {
        id: 'a0ee0000-0000-0000-0000-000000000020',
        name: '株式会社アグサス',
        industry: 'IT・システム開発',
        location: '松山市',
        description: 'オフィスのDX化から環境構築まで、働く場所の「快適」を提案します。',
        is_premium: true,
        // logo_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800',
        // cover_image_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800',
        type: 'company',
        status: 'approved'
    },
    {
        id: 'a0ee0000-0000-0000-0000-000000000021',
        name: 'ダイキアクシス',
        industry: '製造・エンジニアリング',
        location: '松山市',
        description: '環境を守る、水を守る。持続可能な社会基盤を支える企業です。',
        is_premium: true,
        // logo_url: 'https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&q=80&w=800',
        // cover_image_url: 'https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&q=80&w=800',
        type: 'company',
        status: 'approved'
    }
];

const JOBS = [
    {
        id: 'b0ee0000-0000-0000-0000-000000000001',
        organization_id: 'a0ee0000-0000-0000-0000-000000000003',
        title: '地方自治体のDX推進エンジニア',
        type: 'job',
        category: '中途',
        description: '愛媛の自治体とともに、市民サービスのデジタル化を推進します。',
        is_active: true,
        salary: '月給 30万円 ~ 50万円',
        working_hours: '9:00 - 18:00 (フレックスあり)',
        holidays: '土日祝 (年間休日125日)',
        selection_process: '書類選考 -> 一次面接 -> 最終面接',
        welfare: 'リモートワーク可, PC支給',
        location: '松山市',
        content: '愛媛の自治体とともに、市民サービスのデジタル化を推進します。' // Filling content for not null constraint if needed
    },
    {
        id: 'b0ee0000-0000-0000-0000-000000000002',
        organization_id: 'a0ee0000-0000-0000-0000-000000000004',
        title: '伝統を繋ぐ、フロントサービススタッフ',
        type: 'job',
        category: '新卒',
        description: '道後温泉の歴史を学び、お客様に最高の「思い出」を提供します。',
        is_active: true,
        salary: '月給 20万円 ~',
        working_hours: 'シフト制 (実働8時間)',
        holidays: '月8~9日 (シフト制)',
        selection_process: '説明会 -> 面接',
        welfare: '寮完備',
        location: '松山市道後',
        content: '道後温泉の歴史を学び、お客様に最高の「思い出」を提供します。'
    },
    {
        id: 'b0ee0000-0000-0000-0000-000000000003',
        organization_id: 'a0ee0000-0000-0000-0000-000000000003',
        title: '1日体験：レガシーシステム改修ワーク',
        type: 'quest',
        category: '体験JOB',
        description: '古いプログラムを読み解き、現代的にリファクタリングする体験。',
        is_active: true,
        salary: '日給 10,000円',
        working_hours: '10:00 - 18:00',
        holidays: '規定なし',
        selection_process: '書類選考のみ',
        location: '松山市（オンライン可）',
        reward: '¥10,000',
        content: '古いプログラムを読み解き、現代的にリファクタリングする体験。'
    },
    {
        id: 'b0ee0000-0000-0000-0000-000000000004',
        organization_id: 'a0ee0000-0000-0000-0000-000000000006',
        title: 'スマートアグリ・インターンシップ',
        type: 'quest',
        category: 'インターンシップ',
        description: 'データに基づいた柑橘栽培の現場を1週間体験。',
        is_active: true,
        salary: '無給 (交通費支給)',
        working_hours: '9:00 - 17:00',
        holidays: '日曜',
        selection_process: '面談',
        location: '西条市',
        content: 'データに基づいた柑橘栽培の現場を1週間体験。'
    },
    {
        id: 'b0ee0000-0000-0000-0000-000000000005',
        organization_id: 'a0ee0000-0000-0000-0000-000000000007',
        title: 'SNSマーケティング・アシスタント',
        type: 'quest',
        category: 'アルバイト',
        description: '愛媛の特産品をInstagramで世界に広めるお手伝い。',
        is_active: true,
        salary: '時給 1,000円 ~',
        working_hours: '週2~3日, 1日4時間~',
        holidays: 'シフト制',
        selection_process: 'ポートフォリオ審査 -> 面接',
        welfare: '服装自由',
        location: '松山市',
        content: '愛媛の特産品をInstagramで世界に広めるお手伝い。'
    },
    {
        id: 'b0ee0000-0000-0000-0000-000000000009',
        organization_id: 'a0ee0000-0000-0000-0000-000000000006',
        title: '週末限定：みかん収穫クエスト',
        type: 'quest',
        category: '体験JOB',
        description: '最高のみかんを見分けるスキルを磨きながら、収穫を手伝う実戦。',
        is_active: true,
        salary: '日給 8,000円 + みかん',
        working_hours: '8:00 - 16:00',
        holidays: '雨天中止',
        selection_process: '先着順',
        welfare: 'お土産あり',
        location: '西条市',
        reward: '¥8,000',
        content: '最高のみかんを見分けるスキルを磨きながら、収穫を手伝う実戦。'
    },
    {
        id: 'b0ee0000-0000-0000-0000-000000000010',
        organization_id: 'a0ee0000-0000-0000-0000-000000000001',
        title: '【テスト用】新規事業立ち上げブレスト',
        type: 'quest',
        category: '体験JOB',
        description: 'EISの新規事業に関するディスカッションパートナーを募集。',
        is_active: true,
        salary: '時給 2,500円',
        working_hours: '2時間',
        holidays: '調整により決定',
        selection_process: 'プロフィール審査',
        welfare: 'オンライン',
        location: 'オンライン',
        reward: '¥5,000',
        content: 'EISの新規事業に関するディスカッションパートナーを募集。'
    }
];

async function seed() {
    console.log('Seeding organizations...');
    for (const company of COMPANIES) {
        const { error } = await supabase
            .from('organizations')
            .upsert(company, { onConflict: 'id' });

        if (error) console.error('Error upserting company:', company.name, JSON.stringify(error, null, 2));
        else console.log('Upserted:', company.name);
    }

    console.log('Seeding jobs...');
    for (const job of JOBS) {
        // Map description to content as 'jobs' table uses 'content'
        const jobData = { ...job, content: job.description };
        delete jobData.description;

        const { error } = await supabase
            .from('jobs')
            .upsert(jobData, { onConflict: 'id' });

        if (error) console.error('Error upserting job:', job.title, error);
        else console.log('Upserted:', job.title);
    }
    console.log('Seeding completed.');
}

seed();
