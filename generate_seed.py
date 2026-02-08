
import re
import json
import uuid

# Mappings for IDs
company_id_map = {}
job_id_map = {}

# Current UUID counters
org_uuid_counter = 1
job_uuid_counter = 1

def get_org_uuid(original_id):
    global org_uuid_counter
    if original_id not in company_id_map:
        # Generate deterministic UUID like a0ee0000-0000-0000-0000-000000000001
        company_id_map[original_id] = f"a0ee0000-0000-0000-0000-00000000{org_uuid_counter:04d}"
        org_uuid_counter += 1
    return company_id_map[original_id]

def get_job_uuid(original_id):
    global job_uuid_counter
    if original_id not in job_id_map:
        job_id_map[original_id] = f"b0ee0000-0000-0000-0000-00000000{job_uuid_counter:04d}"
        job_uuid_counter += 1
    return job_id_map[original_id]

# Minimal dummy data replica for script (pasted from viewed file)
# I will use a simplified structure based on what I read to avoid parsing complex TS
companies = [
    {"id": "c_eis", "name": "合同会社EIS", "industry": "サービス・観光・飲食店", "location": "松山市", "description": "「非対称なマッチング」で地域の歪みをエネルギーに変える。EISは単なる採用支援ではなく、企業と個人の本質的な成長に伴走する教育機関です。", "isPremium": True, "image": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800", "representative": "代表社員 鈴木 杏奈", "foundingYear": 2020, "employeeCount": "5名", "capital": "300万円", "website": "https://eis.example.com"},
    {"id": "c_toyota_lf", "name": "トヨタL＆F西四国株式会社", "industry": "物流・運送", "location": "松山市大可賀", "description": "トヨタグループの一員として、物流現場の課題を解決する「物流ドクター」。", "isPremium": True, "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800", "representative": "代表取締役 高橋 健一", "foundingYear": 1985, "employeeCount": "120名", "capital": "5,000万円", "website": "https://toyota-lf-west-shikoku.example.com"},
    {"id": "c1", "name": "松山テクノサービス", "industry": "IT・システム開発", "location": "松山市千舟町", "description": "愛媛のDXを支える老舗ITエンジニア集団。", "isPremium": True, "image": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800", "representative": "代表取締役 佐藤 誠", "foundingYear": 1990, "employeeCount": "45名", "capital": "2,000万円", "website": "https://matsuyama-tech.example.com"},
    {"id": "c2", "name": "道後おもてなし庵", "industry": "サービス・観光・飲食店", "location": "松山市道後", "description": "100年続く伝統と、最新の宿泊体験を融合させる老舗旅館。", "isPremium": True, "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800", "representative": "女将 伊藤 優子", "foundingYear": 1920, "employeeCount": "80名", "capital": "1,000万円", "website": "https://dogo-omotenashi.example.com"},
    {"id": "c3", "name": "瀬戸内マニュファクチャリング", "industry": "製造業・エンジニアリング", "location": "今治市", "description": "世界シェアトップクラスの船舶部品を製造。", "isPremium": False, "image": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", "representative": "代表取締役 渡辺 剛", "foundingYear": 1975, "employeeCount": "200名", "capital": "8,000万円", "website": "https://setouchi-mfg.example.com"},
    {"id": "c4", "name": "愛媛スマートアグリ", "industry": "農業・一次産業", "location": "西条市", "description": "AIとIoTを活用した次世代のみかん栽培と流通改革。", "isPremium": True, "image": "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800", "representative": "代表 吉田 健太", "foundingYear": 2018, "employeeCount": "15名", "capital": "500万円", "website": "https://ehime-smart-agri.example.com"},
    {"id": "c5", "name": "伊予デザインラボ", "industry": "その他", "location": "松山市大街道", "description": "愛媛発のブランドを世界へ。デザインの力で地域を元気に。", "isPremium": False, "image": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800", "representative": "代表 藤田 さくら", "foundingYear": 2010, "employeeCount": "10名", "capital": "300万円", "website": "https://iyo-design.example.com"},
    {"id": "c6", "name": "宇和島シーフードエキスパート", "industry": "製造・エンジニアリング", "location": "宇和島市", "description": "宇和海で育ったブランド魚を、独自の鮮度管理で全国へ。", "isPremium": True, "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800", "representative": "代表取締役 山本 洋", "foundingYear": 2005, "employeeCount": "30名", "capital": "1,500万円", "website": "https://uwajima-seafood.example.com"},
    {"id": "c7", "name": "四国ロジスティクスパートナー", "industry": "物流・運送", "location": "東温市", "description": "四国全域を繋ぐ、物流の心臓部となるセンター。", "isPremium": False, "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800", "representative": "センター長 村上 龍", "foundingYear": 2000, "employeeCount": "150名", "capital": "4,000万円", "website": "https://shikoku-logi.example.com"},
    {"id": "c8", "name": "内子クラフトワークス", "industry": "その他", "location": "内子町", "description": "伝統的な町並みで、若手作家の作品をプロデュース。", "isPremium": True, "image": "https://images.unsplash.com/photo-1513519245088-0e12902e15ca?auto=format&fit=crop&q=80&w=800", "representative": "代表 中川 こずえ", "foundingYear": 2015, "employeeCount": "3名", "capital": "100万円", "website": "https://uchiko-craft.example.com"},
    {"id": "c9", "name": "新居浜トータルサポート", "industry": "製造・エンジニアリング", "location": "新居浜市", "description": "工場地帯の設備保守を一手に引き受ける。", "isPremium": False, "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800", "representative": "代表取締役 小野 晋平", "foundingYear": 1980, "employeeCount": "70名", "capital": "3,000万円", "website": "https://niihama-total.example.com"},
    {"id": "c10", "name": "愛媛ライフケア協会", "industry": "医療・福祉", "location": "松山市富久", "description": "ICTを活用した、スタッフに負担をかけない新型介護施設。", "isPremium": True, "image": "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800", "representative": "理事長 木村 春香", "foundingYear": 2012, "employeeCount": "40名", "capital": "N/A", "website": "https://ehime-lifecare.example.com"},
    {"id": "c_agusasu", "name": "株式会社アグサス", "industry": "IT・システム開発", "location": "松山市", "description": "オフィスのDX化から環境構築まで、働く場所の「快適」を提案します。", "isPremium": True, "image": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-blue-500"},
    {"id": "c_daiki_axis", "name": "ダイキアクシス", "industry": "製造・エンジニアリング", "location": "松山市", "description": "環境を守る、水を守る。持続可能な社会基盤を支える企業です。", "isPremium": True, "image": "https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-cyan-600"},
    {"id": "c_benefit_one", "name": "株式会社ベネフィット・ワン", "industry": "サービス・観光・飲食店", "location": "松山市", "description": "サービスの流通創造。働く人の「幸せ」をデザインする。", "isPremium": True, "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-red-500"},
    {"id": "c_lady_drug", "name": "株式会社レデイ薬局", "industry": "その他", "location": "松山市", "description": "地域の健康ステーション。お客様の美と健康をサポートします。", "isPremium": True, "image": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-rose-500"},
    {"id": "c_chuon", "name": "中温", "industry": "物流・運送", "location": "東温市", "description": "確実な配送で地域経済を支える物流パートナー。", "isPremium": False, "image": "https://images.unsplash.com/photo-1605218427368-35b849e54d58?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-slate-600"},
    {"id": "c_kyoritsu", "name": "共立電気計器株式会社", "industry": "製造・エンジニアリング", "location": "八幡浜市", "description": "電気計測器のパイオニア。世界の現場を支える技術力。", "isPremium": True, "image": "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-green-700"},
    {"id": "c_ehime_med", "name": "愛媛医療生活協同組合", "industry": "医療・福祉", "location": "松山市", "description": "地域の人々の健康と暮らしを守る、医療生協です。", "isPremium": True, "image": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-teal-600"},
    {"id": "c_nihon_agent", "name": "株式会社日本エイジェント", "industry": "その他", "location": "松山市", "description": "お部屋探しから、入居後の暮らしまでトータルサポート。", "isPremium": True, "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-yellow-500"},
    {"id": "c_murakami", "name": "村上工業株式会社", "industry": "製造・エンジニアリング", "location": "今治市", "description": "地域のインフラを支える、信頼と実績の建設会社。", "isPremium": False, "image": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-orange-700"},
    {"id": "c_kaneshiro", "name": "株式会社カネシロ", "industry": "製造・エンジニアリング", "location": "松山市", "description": "古紙リサイクルを通じて、循環型社会の実現に貢献します。", "isPremium": False, "image": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-green-800"},
    {"id": "c_engarden", "name": "縁ガーデン", "industry": "農業・一次産業", "location": "伊予市", "description": "植物を通じて、心安らぐ空間と「縁」を紡ぎます。", "isPremium": False, "image": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-lime-600"},
    {"id": "c_nishio", "name": "西尾レントオール", "industry": "物流・運送", "location": "新居浜市", "description": "建設機械からイベント用品まで、あらゆるものをレンタルで提供。", "isPremium": True, "image": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-red-600"},
    {"id": "c_nagahama", "name": "長浜機設", "industry": "製造・エンジニアリング", "location": "大洲市", "description": "確かな技術力で、プラント設備の設計・施工を行います。", "isPremium": False, "image": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-slate-700"},
    {"id": "c_fudo", "name": "株式会社風土", "industry": "サービス・観光・飲食店", "location": "松山市", "description": "愛媛の食材を使った飲食店を展開。食の感動を届けます。", "isPremium": True, "image": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800", "logoColor": "bg-orange-500"}
]

jobs = [
    {"id": "j1", "companyId": "c1", "title": "地方自治体のDX推進エンジニア", "type": "job", "category": "中途", "description": "愛媛の自治体とともに、市民サービスのデジタル化を推進します。", "isExperience": False, "salary": "月給 30万円 ~ 50万円", "workingHours": "9:00 - 18:00 (フレックスあり)", "holidays": "土日祝 (年間休日125日)", "selectionProcess": "書類選考 -> 一次面接 -> 最終面接", "welfare": "リモートワーク可, PC支給", "location": "松山市"},
    {"id": "j2", "companyId": "c2", "title": "伝統を繋ぐ、フロントサービススタッフ", "type": "job", "category": "新卒", "description": "道後温泉の歴史を学び、お客様に最高の「思い出」を提供します。", "isExperience": False, "salary": "月給 20万円 ~", "workingHours": "シフト制 (実働8時間)", "holidays": "月8~9日 (シフト制)", "selectionProcess": "説明会 -> 面接", "welfare": "寮完備", "location": "松山市道後"},
    {"id": "j3", "companyId": "c1", "title": "1日体験：レガシーシステム改修ワーク", "type": "quest", "category": "体験JOB", "reward": "¥10,000", "description": "古いプログラムを読み解き、現代的にリファクタリングする体験。", "isExperience": True, "salary": "日給 10,000円", "workingHours": "10:00 - 18:00", "holidays": "規定なし", "selectionProcess": "書類選考のみ", "location": "松山市（オンライン可）"},
    {"id": "j4", "companyId": "c4", "title": "スマートアグリ・インターンシップ", "type": "quest", "category": "インターンシップ", "description": "データに基づいた柑橘栽培の現場を1週間体験。", "isExperience": False, "salary": "無給 (交通費支給)", "workingHours": "9:00 - 17:00", "holidays": "日曜", "selectionProcess": "面談", "location": "西条市"},
    {"id": "j5", "companyId": "c5", "title": "SNSマーケティング・アシスタント", "type": "quest", "category": "アルバイト", "description": "愛媛の特産品をInstagramで世界に広めるお手伝い。", "isExperience": False, "salary": "時給 1,000円 ~", "workingHours": "週2~3日, 1日4時間~", "holidays": "シフト制", "selectionProcess": "ポートフォリオ審査 -> 面接", "location": "松山市"},
    {"id": "j6", "companyId": "c6", "title": "水産加工の工程改善リーダー", "type": "job", "category": "中途", "description": "現場のロスを減らし、品質を向上させるための仕組み作り。", "isExperience": False, "salary": "月給 25万円 ~ 35万円", "workingHours": "8:00 - 17:00 (早番あり)", "holidays": "日曜祝日 + その他", "selectionProcess": "書類選考 -> 面接", "location": "宇和島市"},
    {"id": "j7", "companyId": "c8", "title": "伝統工芸セレクトショップの店長候補", "type": "job", "category": "中途", "description": "内子の魅力を国内外の観光客へ伝える拠点運営。", "isExperience": False, "salary": "月給 22万円 ~", "workingHours": "9:30 - 18:30", "holidays": "火曜定休 + 他1日", "selectionProcess": "面接 -> 実技試験(接客)", "location": "内子町"},
    {"id": "j8", "companyId": "c10", "title": "介護×Techの実践介護スタッフ", "type": "job", "category": "新卒", "description": "最新のセンサーやロボットを使い、新しい介護の形を創ります。", "isExperience": False, "salary": "月給 21万円 ~ (夜勤手当別途)", "workingHours": "シフト制 (夜勤あり)", "holidays": "4週8休", "selectionProcess": "見学会 -> 面接", "location": "松山市"},
    {"id": "j9", "companyId": "c4", "title": "週末限定：みかん収穫クエスト", "type": "quest", "category": "体験JOB", "reward": "¥8,000", "description": "最高のみかんを見分けるスキルを磨きながら、収穫を手伝う実戦。", "isExperience": True, "salary": "日給 8,000円 + みかん", "workingHours": "8:00 - 16:00", "holidays": "雨天中止", "selectionProcess": "先着順", "location": "西条市"},
    {"id": "j10", "companyId": "c3", "title": "CADオペレーター", "type": "job", "category": "中途", "description": "CADを用いた図面作成のサポート。専門技術を磨きたい方。", "isExperience": False, "salary": "時給 1,500円", "workingHours": "9:00 - 18:00", "holidays": "土日祝", "selectionProcess": "スキルチェック -> 面接", "location": "今治市"},
    {"id": "j_test_eis", "companyId": "c_eis", "title": "【テスト用】新規事業立ち上げブレスト", "type": "quest", "category": "体験JOB", "reward": "¥5,000", "description": "EISの新規事業に関するディスカッションパートナーを募集。", "isExperience": True, "salary": "時給 2,500円", "workingHours": "2時間", "holidays": "調整により決定", "selectionProcess": "プロフィール審査", "location": "オンライン"},
    {"id": "j_murakami_1", "companyId": "c_murakami", "title": "インフラ設備メンテナンス・施工管理", "type": "job", "category": "中途", "description": "今治の街を支える、やりがいのある仕事です。地域のインフラ。", "isExperience": False, "salary": "月給 25万円 ~ 45万円", "workingHours": "8:00 - 17:00", "holidays": "土日祝 (企業カレンダーによる)", "selectionProcess": "面接のみ", "welfare": "社会保険完備, 住宅手当", "location": "今治市"},
    {"id": "j_niihama_1", "companyId": "c9", "title": "プラント設備メンテナンススタッフ", "type": "job", "category": "中途", "description": "新居浜の工場地帯を支える、専門技術を磨ける職場です。", "isExperience": False, "salary": "月給 23万円 ~ 40万円", "workingHours": "8:00 - 17:00", "holidays": "シフト制", "selectionProcess": "面談", "welfare": "資格取得支援, 寮完備", "location": "新居浜市"}
]


# Generate SQL
print("-- Organizations")
print("INSERT INTO organizations (id, name, industry, location, description, is_premium, logo_url, cover_image_url, representative_name, established_date, employee_count, capital, website_url, type)")
print("VALUES")

org_values = []
for c in companies:
    uuid_str = get_org_uuid(c["id"])
    name = c["name"]
    industry = c["industry"]
    location = c["location"]
    description = c.get("description", "")
    is_premium = str(c.get("isPremium", False)).lower()
    logo_url = c.get("image", "")
    cover_image_url = c.get("image", "")
    representative_name = c.get("representative", "")
    established_date = str(c.get("foundingYear", ""))
    employee_count = c.get("employeeCount", "")
    capital = c.get("capital", "")
    website_url = c.get("website", "")
    
    # Escape single quotes
    description = description.replace("'", "''")
    
    val = f"('{uuid_str}', '{name}', '{industry}', '{location}', '{description}', {is_premium}, '{logo_url}', '{cover_image_url}', '{representative_name}', '{established_date}', '{employee_count}', '{capital}', '{website_url}', 'company')"
    org_values.append(val)

print(",\n".join(org_values) + ";")

print("\n-- Jobs")
print("INSERT INTO jobs (id, organization_id, title, type, category, description, is_active, salary, working_hours, holidays, selection_process, welfare, location, reward)")
print("VALUES")

job_values = []
for j in jobs:
    uuid_str = get_job_uuid(j["id"])
    company_uuid = get_org_uuid(j["companyId"])
    title = j["title"]
    type_ = j["type"]
    category = j["category"]
    description = j["description"]
    is_active = "true"
    salary = j.get("salary", "NULL")
    working_hours = j.get("workingHours", "NULL")
    holidays = j.get("holidays", "NULL")
    selection_process = j.get("selectionProcess", "NULL")
    welfare = j.get("welfare", "NULL")
    location = j.get("location", "NULL")
    reward = j.get("reward", "NULL")
    
    # Escape quotes
    description = description.replace("'", "''")
    if salary != "NULL": salary = f"'{salary}'"
    if working_hours != "NULL": working_hours = f"'{working_hours}'"
    if holidays != "NULL": holidays = f"'{holidays}'"
    if selection_process != "NULL": selection_process = f"'{selection_process}'"
    if welfare != "NULL": welfare = f"'{welfare}'"
    if location != "NULL": location = f"'{location}'"
    if reward != "NULL": reward = f"'{reward}'"

    val = f"('{uuid_str}', '{company_uuid}', '{title}', '{type_}', '{category}', '{description}', {is_active}, {salary}, {working_hours}, {holidays}, {selection_process}, {welfare}, {location}, {reward})"
    job_values.append(val)

print(",\n".join(job_values) + ";")
