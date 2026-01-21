-- Seed Data for Organizations, Jobs, and Media
-- This script migrates the hardcoded dummy data into the database

-- Constants for IDs
-- c_eis -> a0ee0000-0000-0000-0000-000000000001
-- c_toyota_lf -> a0ee0000-0000-0000-0000-000000000002
-- ...

INSERT INTO organizations (id, name, industry, location, description, is_premium, logo_url, cover_image_url, representative_name, established_date, employee_count, capital, website_url, type)
VALUES
('a0ee0000-0000-0000-0000-000000000001', '合同会社EIS', 'サービス・観光・飲食店', '松山市', '「非対称なマッチング」で地域の歪みをエネルギーに変える。EISは単なる採用支援ではなく、企業と個人の本質的な成長に伴走する教育機関です。', true, 
 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800', 
 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800', 
 '代表社員 鈴木 杏奈', '2020', '5名', '300万円', 'https://eis.example.com', 'company'),

('a0ee0000-0000-0000-0000-000000000002', 'トヨタL＆F西四国株式会社', '物流・運送', '松山市大可賀', 'トヨタグループの一員として、物流現場の課題を解決する「物流ドクター」。フォークリフト販売だけでなく、物流システム全体の最適化を提案します。', true,
 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
 '代表取締役 高橋 健一', '1985', '120名', '5,000万円', 'https://toyota-lf-west-shikoku.example.com', 'company'),

('a0ee0000-0000-0000-0000-000000000003', '松山テクノサービス', 'IT・システム開発', '松山市千舟町', '愛媛のDXを支える老舗ITエンジニア集団。', true,
 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800',
 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800', 
 '代表取締役 佐藤 誠', '1990', '45名', '2,000万円', 'https://matsuyama-tech.example.com', 'company'),

('a0ee0000-0000-0000-0000-000000000004', '道後おもてなし庵', 'サービス・観光・飲食店', '松山市道後', '100年続く伝統と、最新の宿泊体験を融合させる老舗旅館。', true,
 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800',
 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800',
 '女将 伊藤 優子', '1920', '80名', '1,000万円', 'https://dogo-omotenashi.example.com', 'company'),

('a0ee0000-0000-0000-0000-000000000005', '瀬戸内マニュファクチャリング', '製造業・エンジニアリング', '今治市', '世界シェアトップクラスの船舶部品を製造。', false,
 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
 '代表取締役 渡辺 剛', '1975', '200名', '8,000万円', 'https://setouchi-mfg.example.com', 'company'),

('a0ee0000-0000-0000-0000-000000000006', '愛媛スマートアグリ', '農業・一次産業', '西条市', 'AIとIoTを活用した次世代のみかん栽培と流通改革。', true,
 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800',
 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800',
 '代表 吉田 健太', '2018', '15名', '500万円', 'https://ehime-smart-agri.example.com', 'company'),

('a0ee0000-0000-0000-0000-000000000007', '伊予デザインラボ', 'その他', '松山市大街道', '愛媛発のブランドを世界へ。デザインの力で地域を元気に。', false,
 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
 '代表 藤田 さくら', '2010', '10名', '300万円', 'https://iyo-design.example.com', 'company'),

('a0ee0000-0000-0000-0000-000000000020', '株式会社アグサス', 'IT・システム開発', '松山市', 'オフィスのDX化から環境構築まで、働く場所の「快適」を提案します。', true,
 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800',
 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800', '代表', NULL, NULL, NULL, NULL, 'company'),

('a0ee0000-0000-0000-0000-000000000021', 'ダイキアクシス', '製造・エンジニアリング', '松山市', '環境を守る、水を守る。持続可能な社会基盤を支える企業です。', true,
 'https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&q=80&w=800',
 'https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&q=80&w=800', '代表', NULL, NULL, NULL, NULL, 'company')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  industry = EXCLUDED.industry,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  is_premium = EXCLUDED.is_premium,
  logo_url = EXCLUDED.logo_url,
  cover_image_url = EXCLUDED.cover_image_url,
  representative_name = EXCLUDED.representative_name,
  established_date = EXCLUDED.established_date,
  employee_count = EXCLUDED.employee_count,
  capital = EXCLUDED.capital,
  website_url = EXCLUDED.website_url;


-- Jobs & Quests
INSERT INTO jobs (organization_id, title, type, category, description, is_active, salary, working_hours, holidays, selection_process, welfare, matching_vector, location, reward)
VALUES
-- j1
('a0ee0000-0000-0000-0000-000000000003', '地方自治体のDX推進エンジニア', 'job', '中途', '愛媛の自治体とともに、市民サービスのデジタル化を推進します。', true, '月給 30万円 ~ 50万円', '9:00 - 18:00 (フレックスあり)', '土日祝 (年間休日125日)', '書類選考 -> 一次面接 -> 最終面接', 'リモートワーク可, PC支給', NULL, '松山市', NULL),
-- j2
('a0ee0000-0000-0000-0000-000000000004', '伝統を繋ぐ、フロントサービススタッフ', 'job', '新卒', '道後温泉の歴史を学び、お客様に最高の「思い出」を提供します。', true, '月給 20万円 ~', 'シフト制 (実働8時間)', '月8~9日 (シフト制)', '説明会 -> 面接', '寮完備', NULL, '松山市道後', NULL),
-- j3 (Quest)
('a0ee0000-0000-0000-0000-000000000003', '1日体験：レガシーシステム改修ワーク', 'quest', '体験JOB', '古いプログラムを読み解き、現代的にリファクタリングする体験。', true, '日給 10,000円', '10:00 - 18:00', '規定なし', '書類選考のみ', NULL, NULL, '松山市（オンライン可）', '¥10,000'),
-- j4 (Quest)
('a0ee0000-0000-0000-0000-000000000006', 'スマートアグリ・インターンシップ', 'quest', 'インターンシップ', 'データに基づいた柑橘栽培の現場を1週間体験。', true, '無給 (交通費支給)', '9:00 - 17:00', '日曜', '面談', NULL, NULL, '西条市', NULL),
-- j5 (Quest)
('a0ee0000-0000-0000-0000-000000000007', 'SNSマーケティング・アシスタント', 'quest', 'アルバイト', '愛媛の特産品をInstagramで世界に広めるお手伝い。', true, '時給 1,000円 ~', '週2~3日, 1日4時間~', 'シフト制', 'ポートフォリオ審査 -> 面接', '服装自由', NULL, '松山市', NULL),
-- j9 (Quest)
('a0ee0000-0000-0000-0000-000000000006', '週末限定：みかん収穫クエスト', 'quest', '体験JOB', '最高のみかんを見分けるスキルを磨きながら、収穫を手伝う実戦。', true, '日給 8,000円 + みかん', '8:00 - 16:00', '雨天中止', '先着順', 'お土産あり', NULL, '西条市', '¥8,000'),
-- j_test_eis (Quest)
('a0ee0000-0000-0000-0000-000000000001', '【テスト用】新規事業立ち上げブレスト', 'quest', '体験JOB', 'EISの新規事業に関するディスカッションパートナーを募集。', true, '時給 2,500円', '2時間', '調整により決定', 'プロフィール審査', 'オンライン', NULL, 'オンライン', '¥5,000')
ON CONFLICT DO NOTHING; -- Assuming IDs are autogenerated, duplicates will just add new rows if I don't set IDs. 
-- Schema for jobs has 'id uuid default gen_random_uuid() primary key'.
-- I am NOT inserting IDs for jobs here to let them auto-generate. 
-- BUT if I want to link Media Library to Jobs, I need their IDs.
-- However, effectively linking media to organization is more common for now in the seed.
-- I will let Job IDs be auto-generated for simplicity, as media linkage in dummy data is mostly to Companies (Reels). 
-- Wait, dummy data has reels in Job too.
-- To properly link, I should also set IDs for Jobs.

DELETE FROM jobs WHERE organization_id IN (
    'a0ee0000-0000-0000-0000-000000000001',
    'a0ee0000-0000-0000-0000-000000000002',
    'a0ee0000-0000-0000-0000-000000000003',
    'a0ee0000-0000-0000-0000-000000000004',
    'a0ee0000-0000-0000-0000-000000000005',
    'a0ee0000-0000-0000-0000-000000000006',
    'a0ee0000-0000-0000-0000-000000000007',
    'a0ee0000-0000-0000-0000-000000000020',
    'a0ee0000-0000-0000-0000-000000000021'
);

INSERT INTO jobs (id, organization_id, title, type, category, description, is_active, salary, working_hours, holidays, selection_process, welfare, location, reward)
VALUES
('b0ee0000-0000-0000-0000-000000000001', 'a0ee0000-0000-0000-0000-000000000003', '地方自治体のDX推進エンジニア', 'job', '中途', '愛媛の自治体とともに、市民サービスのデジタル化を推進します。', true, '月給 30万円 ~ 50万円', '9:00 - 18:00 (フレックスあり)', '土日祝 (年間休日125日)', '書類選考 -> 一次面接 -> 最終面接', 'リモートワーク可, PC支給', '松山市', NULL),
('b0ee0000-0000-0000-0000-000000000002', 'a0ee0000-0000-0000-0000-000000000004', '伝統を繋ぐ、フロントサービススタッフ', 'job', '新卒', '道後温泉の歴史を学び、お客様に最高の「思い出」を提供します。', true, '月給 20万円 ~', 'シフト制 (実働8時間)', '月8~9日 (シフト制)', '説明会 -> 面接', '寮完備', '松山市道後', NULL),
('b0ee0000-0000-0000-0000-000000000003', 'a0ee0000-0000-0000-0000-000000000003', '1日体験：レガシーシステム改修ワーク', 'quest', '体験JOB', '古いプログラムを読み解き、現代的にリファクタリングする体験。', true, '日給 10,000円', '10:00 - 18:00', '規定なし', '書類選考のみ', NULL, '松山市（オンライン可）', '¥10,000'),
('b0ee0000-0000-0000-0000-000000000004', 'a0ee0000-0000-0000-0000-000000000006', 'スマートアグリ・インターンシップ', 'quest', 'インターンシップ', 'データに基づいた柑橘栽培の現場を1週間体験。', true, '無給 (交通費支給)', '9:00 - 17:00', '日曜', '面談', NULL, '西条市', NULL),
('b0ee0000-0000-0000-0000-000000000005', 'a0ee0000-0000-0000-0000-000000000007', 'SNSマーケティング・アシスタント', 'quest', 'アルバイト', '愛媛の特産品をInstagramで世界に広めるお手伝い。', true, '時給 1,000円 ~', '週2~3日, 1日4時間~', 'シフト制', 'ポートフォリオ審査 -> 面接', '服装自由', '松山市', NULL),
('b0ee0000-0000-0000-0000-000000000009', 'a0ee0000-0000-0000-0000-000000000006', '週末限定：みかん収穫クエスト', 'quest', '体験JOB', '最高のみかんを見分けるスキルを磨きながら、収穫を手伝う実戦。', true, '日給 8,000円 + みかん', '8:00 - 16:00', '雨天中止', '先着順', 'お土産あり', '西条市', '¥8,000'),
('b0ee0000-0000-0000-0000-000000000010', 'a0ee0000-0000-0000-0000-000000000001', '【テスト用】新規事業立ち上げブレスト', 'quest', '体験JOB', 'EISの新規事業に関するディスカッションパートナーを募集。', true, '時給 2,500円', '2時間', '調整により決定', 'プロフィール審査', 'オンライン', 'オンライン', '¥5,000')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  salary = EXCLUDED.salary,
  working_hours = EXCLUDED.working_hours,
  holidays = EXCLUDED.holidays,
  welfare = EXCLUDED.welfare,
  location = EXCLUDED.location,
  reward = EXCLUDED.reward;

-- Media Library (Videos/Reels)
-- Insert standard media items
INSERT INTO media_library (organization_id, filename, storage_path, public_url, description)
VALUES
('a0ee0000-0000-0000-0000-000000000001', 'sample_reel.mp4', 'placeholder/sample_reel.mp4', '/videos/sample_reel.mp4', '2050年カーボンニュートラルへの挑戦'),
('a0ee0000-0000-0000-0000-000000000001', 'eis_v4.mp4', 'placeholder/eis_v4.mp4', '/videos/reels/eis_v4.mp4', 'EIS V4 Introduction'),
('a0ee0000-0000-0000-0000-000000000002', 'toyota_lf_jun.mp4', 'placeholder/toyota_lf_jun.mp4', '/videos/reels/toyota_lf_jun.mp4', '先輩社員インタビュー：じゅんころ編'),
('a0ee0000-0000-0000-0000-000000000002', 'toyota_lf_1.mov', 'placeholder/toyota_lf_1.mov', '/videos/reels/toyota_lf_1.mov', 'EISナビ掲載動画'),
('a0ee0000-0000-0000-0000-000000000020', 'agusasu_1.mp4', 'placeholder/agusasu_1.mp4', '/videos/reels/agusasu_1.mp4', 'アグサス紹介①'),
('a0ee0000-0000-0000-0000-000000000020', 'agusasu_2.mp4', 'placeholder/agusasu_2.mp4', '/videos/reels/agusasu_2.mp4', 'アグサス紹介②'),
('a0ee0000-0000-0000-0000-000000000020', 'agusasu_signage.mp4', 'placeholder/agusasu_signage.mp4', '/videos/reels/agusasu_signage.mp4', 'サイネージ広告'),
('a0ee0000-0000-0000-0000-000000000021', 'daiki_axis_1.mp4', 'placeholder/daiki_axis_1.mp4', '/videos/reels/daiki_axis_1.mp4', '会社紹介ムービー')
ON CONFLICT DO NOTHING;
