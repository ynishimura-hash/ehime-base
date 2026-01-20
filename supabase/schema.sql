-- AIマッチング（ベクトル検索）に使用する拡張機能を有効化
create extension if not exists vector;

-- 公開プロフィール用テーブルを作成（Supabaseの認証ユーザーと連動）
create table profiles (
  id uuid references auth.users on delete cascade not null primary key, -- AuthユーザーIDと紐付け
  email text,
  full_name text,
  avatar_url text,
  user_type text check (user_type in ('student', 'company', 'specialist', 'admin')), -- ユーザータイプ（学生、企業、専門家、管理者）
  diagnosis_result jsonb, -- Big5診断や価値観分析の結果をJSONで保存
  embedding vector(1536), -- AIマッチング用のベクトルデータ
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 行レベルセキュリティ（RLS）の設定（データのアクセス権限）
alter table profiles enable row level security;

-- プロフィールは誰でも閲覧可能
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

-- 自分のプロフィールは自分で作成可能
create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

-- 自分のプロフィールのみ更新可能
create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- 管理者は全てのプロフィールを更新可能
create policy "Admins can update any profile." on profiles
  for update using (
    exists (select 1 from profiles where id = (select auth.uid()) and user_type = 'admin')
  );


-- 組織・団体テーブル（旧: 企業テーブル）
-- 企業だけでなく、学校、コミュニティも含む
create table organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- 組織名
  type text check (type in ('company', 'school', 'community')) default 'company', -- 組織タイプ
  description text, -- 紹介文
  description_ai_analysis text, -- AI要約
  website_url text,
  location text, -- 所在地
  culture_tags jsonb, -- AI抽出タグ
  culture_vector vector(1536), -- AI性格ベクトル
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table organizations enable row level security;

-- 組織情報は誰でも閲覧可能
create policy "Organizations are viewable by everyone." on organizations
  for select using (true);

-- 管理者は全ての組織を更新・削除可能
create policy "Admins can update any organization." on organizations
  for all using (
    exists (select 1 from profiles where id = (select auth.uid()) and user_type = 'admin')
  );


-- 組織メンバー管理テーブル（新規）
create table organization_members (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('admin', 'member', 'student')) default 'member', -- 役割
  status text check (status in ('active', 'invited', 'inactive')) default 'active', -- ステータス
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (organization_id, user_id)
);

alter table organization_members enable row level security;

-- 所属メンバーは自分の所属情報を見れる
create policy "Members can view own membership." on organization_members
  for select using ((select auth.uid()) = user_id);

-- 管理者は全てのメンバーシップを操作可能
create policy "Admins can manage all memberships." on organization_members
  for all using (
    exists (select 1 from profiles where id = (select auth.uid()) and user_type = 'admin')
  );


-- 求人・クエストテーブル
create table jobs (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade not null, -- 紐付け先変更
  title text not null, -- タイトル
  content text not null, -- 内容詳細
  value_tags_ai jsonb, -- AI抽出された「価値観」タグ
  matching_vector vector(1536), -- AIマッチング用のベクトルデータ（求人側）
  is_active boolean default true, -- 募集中かどうか
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table jobs enable row level security;

-- 求人情報は誰でも閲覧可能
create policy "Jobs are viewable by everyone." on jobs
  for select using (true);

-- 管理者は全ての求人を操作可能
create policy "Admins can manage all jobs." on jobs
  for all using (
    exists (select 1 from profiles where id = (select auth.uid()) and user_type = 'admin')
  );


-- 動画・メディア一括管理用テーブル（新規）
create table media_library (
  id uuid default gen_random_uuid() primary key,
  filename text not null, -- 元のファイル名
  storage_path text not null, -- Supabase Storage内のパス
  public_url text not null, -- 公開URL
  
  -- 紐付け情報（後から設定可能）
  organization_id uuid references organizations(id),
  job_id uuid references jobs(id),
  
  description text, -- 動画の説明メモ
  
  uploaded_by uuid references profiles(id), -- アップロード者
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table media_library enable row level security;

-- 全員閲覧可能（動画自体は公開前提）
create policy "Media is viewable by everyone." on media_library
  for select using (true);

-- 管理者は自由に操作可能
create policy "Admins can manage media." on media_library
  for all using (
    exists (select 1 from profiles where id = (select auth.uid()) and user_type = 'admin')
  );


-- お気に入り（ブックマーク）テーブル
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null, -- 保存したユーザー
  item_id uuid not null, -- 対象のID（求人ID、記事IDなど）
  item_type text not null check (item_type in ('job', 'organization', 'article', 'course')), -- 対象の種類
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, item_id, item_type) -- 同じものを二重に登録できないようにする
);

alter table bookmarks enable row level security;

-- 自分のブックマークのみ閲覧・操作可能
create policy "Users can manage own bookmarks." on bookmarks
  for all using ((select auth.uid()) = user_id);

-- 閲覧履歴（足跡）テーブル
create table view_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade, -- 閲覧したユーザー（ログイン時のみ）
  item_id uuid not null, -- 見たアイテムのID
  item_type text not null, -- 見たアイテムの種類
  duration_seconds int default 0, -- 滞在時間（秒）
  viewed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table view_logs enable row level security;

-- 自分の履歴は閲覧可能
create policy "Users can view own logs." on view_logs
  for select using ((select auth.uid()) = user_id);

-- ログの追加は誰でも（システム側で）可能
create policy "Insert logs." on view_logs
  for insert with check (true);


-- 学習進捗管理テーブル（e-ラーニング用）
create table course_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null, -- 受講生
  course_id uuid not null, -- コースID
  lesson_id uuid not null, -- レッスンID
  status text check (status in ('not_started', 'in_progress', 'completed')) default 'not_started', -- ステータス
  progress_percent int default 0, -- 進捗率（0-100）
  quiz_score int, -- クイズ/テストのスコア
  last_accessed_at timestamp with time zone default timezone('utc'::text, now()), -- 最後に学習した時間
  completed_at timestamp with time zone, -- 完了日時
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, lesson_id) -- 1つのレッスンに複数の進捗レコードを作らない
);

alter table course_progress enable row level security;

-- 自分の進捗のみ閲覧・更新可能
create policy "Users can manage own progress." on course_progress
  for all using ((select auth.uid()) = user_id);

-- ユーザー登録時に自動でプロフィール行を作成するトリガー（推奨設定）
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, user_type)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'user_type');
  return new;
end;
$$ language plpgsql security definer;

-- トリガーの再作成（エラー防止のためDropしてから）
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 組織への招待（リンク発行）テーブル
create table organization_invitations (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  token text not null unique,
  email text, -- 特定のメールアドレス向けの場合
  role text check (role in ('admin', 'member')) default 'member',
  expires_at timestamp with time zone not null,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_used boolean default false
);

alter table organization_invitations enable row level security;

-- 同じ組織のメンバーは招待情報を確認できる
create policy "Members can view invitations." on organization_invitations
  for select using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organization_invitations.organization_id
      and organization_members.user_id = (select auth.uid())
    )
  );

-- 管理者または組織メンバーは招待を作成可能
create policy "Members can create invitations." on organization_invitations
  for insert with check (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organization_invitations.organization_id
      and organization_members.user_id = (select auth.uid())
      and organization_members.role = 'admin'
    )
  );

