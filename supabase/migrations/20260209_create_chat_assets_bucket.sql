-- Create a new bucket called 'chat-assets' for storing chat attachments
insert into storage.buckets (id, name, public)
values ('chat-assets', 'chat-assets', true)
on conflict (id) do nothing;

-- Set up access policies for the 'chat-assets' bucket

-- Public Access for Select (so images can be viewed via public URL)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'chat-assets' );

-- Authenticated users can upload files
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( 
    bucket_id = 'chat-assets' 
    and auth.role() = 'authenticated'
  );

-- Authenticated users can update their own files (optional depending on needs)
create policy "Authenticated Update"
  on storage.objects for update
  using ( 
    bucket_id = 'chat-assets' 
    and auth.uid() = owner
  );

-- Authenticated users can delete their own files
create policy "Authenticated Delete"
  on storage.objects for delete
  using ( 
    bucket_id = 'chat-assets' 
    and auth.uid() = owner
  );
