-- Add update policy for messages to allow marking as read
create policy "Participants can update messages" on messages
  for update using (
    exists (
      select 1 from casual_chats
      where casual_chats.id = messages.chat_id
      and (
        casual_chats.user_id = auth.uid()
        or exists (
          select 1 from organization_members
          where organization_members.organization_id = casual_chats.company_id
          and organization_members.user_id = auth.uid()
        )
      )
    )
  ) with check (
    exists (
      select 1 from casual_chats
      where casual_chats.id = messages.chat_id
      and (
        casual_chats.user_id = auth.uid()
        or exists (
          select 1 from organization_members
          where organization_members.organization_id = casual_chats.company_id
          and organization_members.user_id = auth.uid()
        )
      )
    )
  );
