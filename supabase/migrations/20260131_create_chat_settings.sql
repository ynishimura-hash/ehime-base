-- チャット設定（ピン留め、優先度、ブロック、メモなど）を保存するテーブル
create table if not exists chat_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null, -- 設定の持ち主
  chat_id uuid references casual_chats(id) on delete cascade not null, -- 対象のチャット
  is_pinned boolean default false,
  is_blocked boolean default false,
  is_unread_manual boolean default false,
  priority text check (priority in ('high', 'medium', 'low')),
  alias text,
  memo text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, chat_id) -- 1ユーザーにつき1チャットの設定は1つ
);

alter table chat_settings enable row level security;

-- ポリシー設定
-- 自分の設定のみ参照・作成・更新・削除可能
create policy "Users can view own chat settings" on chat_settings
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert own chat settings" on chat_settings
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update own chat settings" on chat_settings
  for update using ((select auth.uid()) = user_id);

create policy "Users can delete own chat settings" on chat_settings
  for delete using ((select auth.uid()) = user_id);
