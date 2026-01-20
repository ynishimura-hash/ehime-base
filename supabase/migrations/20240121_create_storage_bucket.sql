-- Create a new bucket calling 'videos' for storing video files
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

-- Set up access policies for the 'videos' bucket

-- ALLOW ALL for now to avoid permission issues during development
-- In production, strict policies should be applied
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'videos' );

create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'videos' );

create policy "Authenticated Update"
  on storage.objects for update
  using ( bucket_id = 'videos' );

create policy "Authenticated Delete"
  on storage.objects for delete
  using ( bucket_id = 'videos' );
