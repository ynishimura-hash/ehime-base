-- Add cover_image_url to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Seed Dummy Data (Jobs/Quests)
INSERT INTO jobs (organization_id, title, content, type, salary, employment_type, working_hours, holidays, benefits, qualifications, access, cover_image_url, is_active)
SELECT 
    id as organization_id,
    '未来を拓くDXエンジニア募集' as title,
    '愛媛から世界へ。最先端の技術で地域課題を解決するエンジニアを募集します。' as content,
    'job' as type,
    '月給 30万円〜' as salary,
    '正社員' as employment_type,
    '9:00 - 18:00' as working_hours,
    '完全週休2日制' as holidays,
    '社会保険完備, リモート可' as benefits,
    '実務経験3年以上' as qualifications,
    '松山市駅 徒歩10分' as access,
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200' as cover_image_url,
    true
FROM organizations LIMIT 1;

INSERT INTO jobs (organization_id, title, content, type, salary, employment_type, working_hours, holidays, benefits, qualifications, access, cover_image_url, is_active)
SELECT 
    id as organization_id,
    '【1Day】地域創生マーケティング体験' as title,
    '実際の店舗データを使って、売上アップの施策を考える実践型インターンシップ。' as content,
    'quest' as type,
    '報酬なし (交通費支給)' as salary,
    'インターン' as employment_type,
    '10:00 - 17:00' as working_hours,
    '土日開催' as holidays,
    'ランチ付き' as benefits,
    '全学部全学科対象' as qualifications,
    '今治駅 車15分' as access,
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200' as cover_image_url,
    true
FROM organizations LIMIT 1;
