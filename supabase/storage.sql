-- Storage Bucket for Videos
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

-- RLS Policies for Storage
-- Allow public read access
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'videos' );

-- Allow authenticated users to upload (Company & Admin)
create policy "Authenticated Upload"
on storage.objects for insert
with check ( bucket_id = 'videos' and auth.role() = 'authenticated' );

-- Allow uploader to update their own files
create policy "Owner Update"
on storage.objects for update
using ( bucket_id = 'videos' and auth.uid() = owner );

-- Allow uploader to delete their own files
create policy "Owner Delete"
on storage.objects for delete
using ( bucket_id = 'videos' and auth.uid() = owner );
