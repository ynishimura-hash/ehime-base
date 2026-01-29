-- Create table for storing AI-generated course recommendations
create table if not exists user_course_recommendations (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) on delete cascade not null,
    course_id text not null, -- Manual reference to courses (managed in JSON/AppStore currently)
    value_id integer not null, -- ID of the value card this is based on
    reason_message text not null, -- The AI generated message
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_course_recommendations enable row level security;

-- Policies
create policy "Users can view their own recommendations"
    on user_course_recommendations for select
    using (auth.uid() = user_id);

create policy "Users (or Service Role) can insert their own recommendations"
    on user_course_recommendations for insert
    with check (auth.uid() = user_id);

-- Optional: Index for faster lookup
create index idx_user_course_recommendations_user_id on user_course_recommendations(user_id);
create index idx_user_course_recommendations_value_id on user_course_recommendations(value_id);
