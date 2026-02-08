-- 企業側からチャットを開始（作成）できるようにRLSポリシーを追加
-- 以前の migration ではユーザー（求職者）からの作成のみ許可されていました

create policy "Company members can create chats" on casual_chats
  for insert with check (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = casual_chats.company_id
      and organization_members.user_id = auth.uid()
    )
  );
