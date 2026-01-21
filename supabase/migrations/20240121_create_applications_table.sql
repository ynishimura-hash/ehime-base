-- Create applications table for ATS
create table applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null, -- Applicant
  organization_id uuid references organizations(id) on delete cascade not null, -- Company (redundant but efficient)
  status text check (status in ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected')) default 'applied',
  message text, -- Cover letter or simple note
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(job_id, user_id) -- One application per job per user
);

alter table applications enable row level security;

-- Policies

-- 1. Applicant can view their own application
create policy "Applicants can view own applications"
on applications for select
using ((select auth.uid()) = user_id);

-- 2. Applicant can create (apply)
create policy "Applicants can create applications"
on applications for insert
with check ((select auth.uid()) = user_id);

-- 3. Company Members (Admins/Members) can view applications for their organization
create policy "Company members can view applications"
on applications for select
using (
  exists (
    select 1 from organization_members
    where organization_members.organization_id = applications.organization_id
    and organization_members.user_id = (select auth.uid())
  )
);

-- 4. Company Admins/Members can update status
create policy "Company members can update applications"
on applications for update
using (
  exists (
    select 1 from organization_members
    where organization_members.organization_id = applications.organization_id
    and organization_members.user_id = (select auth.uid())
  )
);
