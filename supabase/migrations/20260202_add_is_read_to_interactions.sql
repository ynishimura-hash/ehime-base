-- Add is_read column to interactions table
alter table interactions 
add column if not exists is_read boolean default false;

-- Index for filtering unread interactions
create index if not exists interactions_user_id_is_read_idx on interactions(user_id, is_read);
