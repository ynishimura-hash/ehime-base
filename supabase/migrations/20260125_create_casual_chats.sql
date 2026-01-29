-- カジュアル面談（チャット）テーブル
create table if not exists casual_chats (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null, -- 求職者
  status text check (status in ('active', 'archived', 'blocked')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(company_id, user_id) -- 同じ企業とユーザーのチャットは1つのみ
);

alter table casual_chats enable row level security;

-- メッセージテーブル
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references casual_chats(id) on delete cascade not null,
  sender_id uuid not null, -- 送信者ID（ユーザーまたは企業メンバーID）
  content text,
  attachment_url text, -- 添付ファイルURL
  attachment_type text, -- 'image' or 'file'
  attachment_name text, -- ファイル名
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table messages enable row level security;

-- ポリシー設定
-- 1. ユーザー（求職者）は自分のチャットのみアクセス可能
create policy "Users can view own chats" on casual_chats
  for select using ((select auth.uid()) = user_id);

create policy "Users can create chats" on casual_chats
  for insert with check ((select auth.uid()) = user_id);

-- 2. 企業のメンバーは自社のチャットにアクセス可能
create policy "Company members can view own chats" on casual_chats
  for select using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = casual_chats.company_id
      and organization_members.user_id = (select auth.uid())
    )
  );

-- 3. メッセージの閲覧・送信（参加者のみ）
create policy "Participants can view messages" on messages
  for select using (
    exists (
      select 1 from casual_chats
      where casual_chats.id = messages.chat_id
      and (
        casual_chats.user_id = (select auth.uid())
        or exists (
          select 1 from organization_members
          where organization_members.organization_id = casual_chats.company_id
          and organization_members.user_id = (select auth.uid())
        )
      )
    )
  );

create policy "Participants can send messages" on messages
  for insert with check (
    exists (
      select 1 from casual_chats
      where casual_chats.id = messages.chat_id
      and (
        casual_chats.user_id = (select auth.uid())
        or exists (
          select 1 from organization_members
          where organization_members.organization_id = casual_chats.company_id
          and organization_members.user_id = (select auth.uid())
        )
      )
    )
  );
