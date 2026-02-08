
-- Users & Profiles
-- Note: We rely on the user manually creating an account or using an existing one.
-- But we can insert a profile for a known test ID to make the 'bypass' work if the auth user exists.
-- However, since auth.users is in a separate schema (auth), we usually don't seed it directly in normal SQL editors without proper permissions.
-- But for a 'db reset' seed, we can often write to auth.users if we are superuser.
-- Let's try to insert a dummy user if it doesn't exist, using a fake hash (login might fail, but profile existence helps).

INSERT INTO profiles (
    id, full_name, user_type, email, avatar_url,
    university, department, graduation_year,
    bio, gender, birth_date
)
VALUES (
    '061fbf87-f36e-4612-80b4-dedc77b55d5e',
    '西村 雄二',
    'seeker',
    'test@example.com',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuji',
    '愛媛大学',
    '工学部',
    '2025',
    '愛媛県松山市出身。大学では情報工学を専攻。趣味は道後温泉巡りとプログラミング。',
    'male',
    '2003-05-15'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type,
    birth_date = EXCLUDED.birth_date;

-- Organizations
INSERT INTO organizations (id, name, industry, location, description, is_premium, logo_url, cover_image_url, representative_name, established_date, employee_count, capital, website_url, type)
VALUES
('a0ee0000-0000-0000-0000-000000000001', '合同会社EIS', 'サービス・観光・飲食店', '松山市', '「非対称なマッチング」で地域の歪みをエネルギーに変える。EISは単なる採用支援ではなく、企業と個人の本質的な成長に伴走する教育機関です。', true, 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800', '代表社員 鈴木 杏奈', '2020', '5名', '300万円', 'https://eis.example.com', 'company'),
('a0ee0000-0000-0000-0000-000000000002', 'トヨタL＆F西四国株式会社', '物流・運送', '松山市大可賀', 'トヨタグループの一員として、物流現場の課題を解決する「物流ドクター」。', true, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800', '代表取締役 高橋 健一', '1985', '120名', '5,000万円', 'https://toyota-lf-west-shikoku.example.com', 'company'),
('a0ee0000-0000-0000-0000-000000000003', '松山テクノサービス', 'IT・システム開発', '松山市千舟町', '愛媛のDXを支える老舗ITエンジニア集団。', true, 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800', '代表取締役 佐藤 誠', '1990', '45名', '2,000万円', 'https://matsuyama-tech.example.com', 'company'),
('a0ee0000-0000-0000-0000-000000000004', '道後おもてなし庵', 'サービス・観光・飲食店', '松山市道後', '100年続く伝統と、最新の宿泊体験を融合させる老舗旅館。', true, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800', '女将 伊藤 優子', '1920', '80名', '1,000万円', 'https://dogo-omotenashi.example.com', 'company'),
('a0ee0000-0000-0000-0000-000000000005', '瀬戸内マニュファクチャリング', '製造業・エンジニアリング', '今治市', '世界シェアトップクラスの船舶部品を製造。', false, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800', '代表取締役 渡辺 剛', '1975', '200名', '8,000万円', 'https://setouchi-mfg.example.com', 'company'),
('a0ee0000-0000-0000-0000-000000000006', '愛媛スマートアグリ', '農業・一次産業', '西条市', 'AIとIoTを活用した次世代のみかん栽培と流通改革。', true, 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800', '代表 吉田 健太', '2018', '15名', '500万円', 'https://ehime-smart-agri.example.com', 'company'),
('a0ee0000-0000-0000-0000-000000000007', '伊予デザインラボ', 'その他', '松山市大街道', '愛媛発のブランドを世界へ。デザインの力で地域を元気に。', false, 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800', '代表 藤田 さくら', '2010', '10名', '300万円', 'https://iyo-design.example.com', 'company'),
('a0ee0000-0000-0000-0000-000000000008', '宇和島シーフードエキスパート', '製造・エンジニアリング', '宇和島市', '宇和海で育ったブランド魚を、独自の鮮度管理で全国へ。', true, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800', '代表取締役 山本 洋', '2005', '30名', '1,500万円', 'https://uwajima-seafood.example.com', 'company'),
('a0ee0000-0000-0000-0000-000000000009', '四国ロジスティクスパートナー', '物流・運送', '東温市', '四国全域を繋ぐ、物流の心臓部となるセンター。', false, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800', 'センター長 村上 龍', '2000', '150名', '4,000万円', 'https://shikoku-logi.example.com', 'company'),
('a0ee0000-0000-0000-0000-000000000010', '内子クラフトワークス', 'その他', '内子町', '伝統的な町並みで、若手作家の作品をプロデュース。', true, 'https://images.unsplash.com/photo-1513519245088-0e12902e15ca?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1513519245088-0e12902e15ca?auto=format&fit=crop&q=80&w=800', '代表 中川 こずえ', '2015', '3名', '100万円', 'https://uchiko-craft.example.com', 'company'),
('a0ee0000-0000-0000-0000-000000000011', '新居浜トータルサポート', '製造・エンジニアリング', '新居浜市', '工場地帯の設備保守を一手に引き受ける。', false, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800', '代表取締役 小野 晋平', '1980', '70名', '3,000万円', 'https://niihama-total.example.com', 'company'),
('a0ee0000-0000-0000-0000-000000000012', '愛媛ライフケア協会', '医療・福祉', '松山市富久', 'ICTを活用した、スタッフに負担をかけない新型介護施設。', true, 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800', '理事長 木村 春香', '2012', '40名', 'N/A', 'https://ehime-lifecare.example.com', 'company'),
('a0ee0000-0000-0000-0000-000000000013', '株式会社アグサス', 'IT・システム開発', '松山市', 'オフィスのDX化から環境構築まで、働く場所の「快適」を提案します。', true, 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000014', 'ダイキアクシス', '製造・エンジニアリング', '松山市', '環境を守る、水を守る。持続可能な社会基盤を支える企業です。', true, 'https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000015', '株式会社ベネフィット・ワン', 'サービス・観光・飲食店', '松山市', 'サービスの流通創造。働く人の「幸せ」をデザインする。', true, 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000016', '株式会社レデイ薬局', 'その他', '松山市', '地域の健康ステーション。お客様の美と健康をサポートします。', true, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000017', '中温', '物流・運送', '東温市', '確実な配送で地域経済を支える物流パートナー。', false, 'https://images.unsplash.com/photo-1605218427368-35b849e54d58?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1605218427368-35b849e54d58?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000018', '共立電気計器株式会社', '製造・エンジニアリング', '八幡浜市', '電気計測器のパイオニア。世界の現場を支える技術力。', true, 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000019', '愛媛医療生活協同組合', '医療・福祉', '松山市', '地域の人々の健康と暮らしを守る、医療生協です。', true, 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000020', '株式会社日本エイジェント', 'その他', '松山市', 'お部屋探しから、入居後の暮らしまでトータルサポート。', true, 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000021', '村上工業株式会社', '製造・エンジニアリング', '今治市', '地域のインフラを支える、信頼と実績の建設会社。', false, 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000022', '株式会社カネシロ', '製造・エンジニアリング', '松山市', '古紙リサイクルを通じて、循環型社会の実現に貢献します。', false, 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000023', '縁ガーデン', '農業・一次産業', '伊予市', '植物を通じて、心安らぐ空間と「縁」を紡ぎます。', false, 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000024', '西尾レントオール', '物流・運送', '新居浜市', '建設機械からイベント用品まで、あらゆるものをレンタルで提供。', true, 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000025', '長浜機設', '製造・エンジニアリング', '大洲市', '確かな技術力で、プラント設備の設計・施工を行います。', false, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company'),
('a0ee0000-0000-0000-0000-000000000026', '株式会社風土', 'サービス・観光・飲食店', '松山市', '愛媛の食材を使った飲食店を展開。食の感動を届けます。', true, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800', '', '', '', '', '', 'company')
ON CONFLICT (id) DO NOTHING;

-- Jobs
INSERT INTO jobs (id, organization_id, title, type, category, description, is_active, salary, working_hours, holidays, selection_process, welfare, location, reward)
VALUES
('b0ee0000-0000-0000-0000-000000000001', 'a0ee0000-0000-0000-0000-000000000003', '地方自治体のDX推進エンジニア', 'job', '中途', '愛媛の自治体とともに、市民サービスのデジタル化を推進します。', true, '月給 30万円 ~ 50万円', '9:00 - 18:00 (フレックスあり)', '土日祝 (年間休日125日)', '書類選考 -> 一次面接 -> 最終面接', 'リモートワーク可, PC支給', '松山市', NULL),
('b0ee0000-0000-0000-0000-000000000002', 'a0ee0000-0000-0000-0000-000000000004', '伝統を繋ぐ、フロントサービススタッフ', 'job', '新卒', '道後温泉の歴史を学び、お客様に最高の「思い出」を提供します。', true, '月給 20万円 ~', 'シフト制 (実働8時間)', '月8~9日 (シフト制)', '説明会 -> 面接', '寮完備', '松山市道後', NULL),
('b0ee0000-0000-0000-0000-000000000003', 'a0ee0000-0000-0000-0000-000000000003', '1日体験：レガシーシステム改修ワーク', 'quest', '体験JOB', '古いプログラムを読み解き、現代的にリファクタリングする体験。', true, '日給 10,000円', '10:00 - 18:00', '規定なし', '書類選考のみ', NULL, '松山市（オンライン可）', '¥10,000'),
('b0ee0000-0000-0000-0000-000000000004', 'a0ee0000-0000-0000-0000-000000000006', 'スマートアグリ・インターンシップ', 'quest', 'インターンシップ', 'データに基づいた柑橘栽培の現場を1週間体験。', true, '無給 (交通費支給)', '9:00 - 17:00', '日曜', '面談', NULL, '西条市', NULL),
('b0ee0000-0000-0000-0000-000000000005', 'a0ee0000-0000-0000-0000-000000000007', 'SNSマーケティング・アシスタント', 'quest', 'アルバイト', '愛媛の特産品をInstagramで世界に広めるお手伝い。', true, '時給 1,000円 ~', '週2~3日, 1日4時間~', 'シフト制', 'ポートフォリオ審査 -> 面接', NULL, '松山市', NULL),
('b0ee0000-0000-0000-0000-000000000006', 'a0ee0000-0000-0000-0000-000000000008', '水産加工の工程改善リーダー', 'job', '中途', '現場のロスを減らし、品質を向上させるための仕組み作り。', true, '月給 25万円 ~ 35万円', '8:00 - 17:00 (早番あり)', '日曜祝日 + その他', '書類選考 -> 面接', NULL, '宇和島市', NULL),
('b0ee0000-0000-0000-0000-000000000007', 'a0ee0000-0000-0000-0000-000000000010', '伝統工芸セレクトショップの店長候補', 'job', '中途', '内子の魅力を国内外の観光客へ伝える拠点運営。', true, '月給 22万円 ~', '9:30 - 18:30', '火曜定休 + 他1日', '面接 -> 実技試験(接客)', NULL, '内子町', NULL),
('b0ee0000-0000-0000-0000-000000000008', 'a0ee0000-0000-0000-0000-000000000012', '介護×Techの実践介護スタッフ', 'job', '新卒', '最新のセンサーやロボットを使い、新しい介護の形を創ります。', true, '月給 21万円 ~ (夜勤手当別途)', 'シフト制 (夜勤あり)', '4週8休', '見学会 -> 面接', NULL, '松山市', NULL),
('b0ee0000-0000-0000-0000-000000000009', 'a0ee0000-0000-0000-0000-000000000006', '週末限定：みかん収穫クエスト', 'quest', '体験JOB', '最高のみかんを見分けるスキルを磨きながら、収穫を手伝う実戦。', true, '日給 8,000円 + みかん', '8:00 - 16:00', '雨天中止', '先着順', NULL, '西条市', '¥8,000'),
('b0ee0000-0000-0000-0000-000000000010', 'a0ee0000-0000-0000-0000-000000000005', 'CADオペレーター', 'job', '中途', 'CADを用いた図面作成のサポート。専門技術を磨きたい方。', true, '時給 1,500円', '9:00 - 18:00', '土日祝', 'スキルチェック -> 面接', NULL, '今治市', NULL),
('b0ee0000-0000-0000-0000-000000000011', 'a0ee0000-0000-0000-0000-000000000001', '【テスト用】新規事業立ち上げブレスト', 'quest', '体験JOB', 'EISの新規事業に関するディスカッションパートナーを募集。', true, '時給 2,500円', '2時間', '調整により決定', 'プロフィール審査', NULL, 'オンライン', '¥5,000'),
('b0ee0000-0000-0000-0000-000000000012', 'a0ee0000-0000-0000-0000-000000000021', 'インフラ設備メンテナンス・施工管理', 'job', '中途', '今治の街を支える、やりがいのある仕事です。地域のインフラ。', true, '月給 25万円 ~ 45万円', '8:00 - 17:00', '土日祝 (企業カレンダーによる)', '面接のみ', '社会保険完備, 住宅手当', '今治市', NULL),
('b0ee0000-0000-0000-0000-000000000013', 'a0ee0000-0000-0000-0000-000000000011', 'プラント設備メンテナンススタッフ', 'job', '中途', '新居浜の工場地帯を支える、専門技術を磨ける職場です。', true, '月給 23万円 ~ 40万円', '8:00 - 17:00', 'シフト制', '面談', '資格取得支援, 寮完備', '新居浜市', NULL)
ON CONFLICT (id) DO NOTHING;

-- User Analysis (Assuming user 061fbf87-f36e-4612-80b4-dedc77b55d5e)
-- Note: 'fortune_day_master' is NOT in the DB schema, so we omit it.
-- Based on code, selected_values should be IDs. diagnosis_scores is JSONB.
INSERT INTO user_analysis (
    user_id,
    diagnosis_scores,
    selected_values,
    public_values,
    is_fortune_integrated,
    fortune_traits,
    updated_at
)
VALUES (
    '061fbf87-f36e-4612-80b4-dedc77b55d5e',
    '{"q1": 5, "q2": 4, "q3": 5, "q4": 3, "q5": 5}'::jsonb,
    ARRAY['value_id_1', 'value_id_2', 'value_id_3'],
    ARRAY['value_id_1'],
    true,
    ARRAY['creative', 'leader']::text[],
    now()
)
ON CONFLICT (user_id) DO UPDATE SET
    updated_at = EXCLUDED.updated_at;

-- Courses
-- Insert "Reskilling" Course (ID 16 -> UUID)
-- We need valid UUIDs. I will generate deterministic UUIDs for them.
-- Course 16: c0000000-0000-0000-0000-000000000016
INSERT INTO courses (id, title, description, instructor, category, level, duration, image, is_published, order_index)
VALUES (
    'c0000000-0000-0000-0000-000000000016',
    'リスキル大学講座アーカイブ',
    'リスキル大学の講座のアーカイブになります。',
    '{"name": "リスキル講師", "role": "Expert Advisor", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}'::jsonb,
    'ビジネス',
    '初級',
    '不明',
    'https://images.unsplash.com/photo-1454165833767-02486835bcd4?auto=format&fit=crop&q=80&w=800',
    true,
    0
) ON CONFLICT (id) DO NOTHING;

-- Curriculum for Course 16
INSERT INTO course_curriculums (id, course_id, title, description, order_index)
VALUES (
    'cc000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000016',
    '講座アーカイブ',
    '',
    1
) ON CONFLICT (id) DO NOTHING;

-- Lessons for Course 16
INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index)
VALUES
(
    'cl000000-0000-0000-0000-000000000001',
    'cc000000-0000-0000-0000-000000000001',
    '2025/10/15リスキル大学開講記念「リスキル大学」について',
    '',
    'https://www.youtube.com/embed/EPrvQQ5_m6M',
    '10:00',
    1
),
(
    'cl000000-0000-0000-0000-000000000002',
    'cc000000-0000-0000-0000-000000000001',
    '2025/10/23最新AI活用戦略',
    '',
    'https://www.youtube.com/embed/srzfgDRG4Ew',
    '10:00',
    2
)
ON CONFLICT (id) DO NOTHING;

-- Insert "IT Passport" Course (ID 15 -> UUID)
-- Course 15: c0000000-0000-0000-0000-000000000015
INSERT INTO courses (id, title, description, instructor, category, level, duration, image, is_published, order_index)
VALUES (
    'c0000000-0000-0000-0000-000000000015',
    'ITパスポート',
    'ITパスポート試験の資格取得支援動画です。',
    '{"name": "リスキル講師", "role": "Expert Advisor", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}'::jsonb,
    '資格試験',
    '初級',
    '1ヶ月以上',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    true,
    1
) ON CONFLICT (id) DO NOTHING;

-- Curriculum for Course 15
INSERT INTO course_curriculums (id, course_id, title, description, order_index)
VALUES (
    'cc000000-0000-0000-0000-000000000015',
    'c0000000-0000-0000-0000-000000000015',
    '企業活動',
    '',
    1
) ON CONFLICT (id) DO NOTHING;

-- Lessons for Course 15
INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, quiz, order_index)
VALUES
(
    'cl000000-0000-0000-0000-000000000015',
    'cc000000-0000-0000-0000-000000000015',
    '企業活動：経営・組織論①',
    '',
    'https://www.youtube.com/embed/yFJNZ-0CG5U',
    '10:00',
    '[{"id": "q_1068", "question": "企業が活動を行う上で主要な経営資源とされるものは何でしょうか？", "options": ["ヒト、モノ、カネ、情報", "ヒト、モノ、カネ、信用", "モノ、カネ、情報、組織", "ヒト、モノ、時間、空間"], "correctAnswerIndex": 0, "explanation": "正解： １．ヒト、モノ、カネ、情報。"}]'::jsonb,
    1
)
ON CONFLICT (id) DO NOTHING;
