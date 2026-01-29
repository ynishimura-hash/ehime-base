-- Create interactions table for likes/favorites
create table if not exists interactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    type text not null, -- 'like_job', 'like_company', etc.
    target_id text not null, -- ID of the job/company/quest
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    
    -- Ensure unique interaction per user/type/target
    unique(user_id, type, target_id)
);

-- Enable RLS
alter table interactions enable row level security;

-- Policies (Safe execution)
do $$ 
begin
    if not exists (select 1 from pg_policies where policyname = 'Users can view their own interactions' and tablename = 'interactions') then
        create policy "Users can view their own interactions"
            on interactions for select
            using (auth.uid() = user_id);
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Users can insert their own interactions' and tablename = 'interactions') then
        create policy "Users can insert their own interactions"
            on interactions for insert
            with check (auth.uid() = user_id);
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Users can delete their own interactions' and tablename = 'interactions') then
        create policy "Users can delete their own interactions"
            on interactions for delete
            using (auth.uid() = user_id);
    end if;
end $$;

-- Indexes for performance (Idempotent)
create index if not exists interactions_user_id_idx on interactions(user_id);
create index if not exists interactions_target_id_idx on interactions(target_id);
