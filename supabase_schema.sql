-- Create a table for bookmarks
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  paper_id text not null,
  analysis_data jsonb not null,
  notes text,
  -- Link to auth.users
  user_id uuid references auth.users(id),
  
  -- For anonymous users
  client_id text
);

-- Run this if you already created the table:
-- alter table bookmarks add column if not exists user_id uuid references auth.users(id);

-- Set up Row Level Security (RLS)
alter table bookmarks enable row level security;

-- Policy: Allow public access (since we don't have auth implemented in this step)
-- WARNING: This allows anyone to read/write/delete any bookmark.
-- For a production app, you MUST implement Authentication.

create policy "Enable read access for all users"
on bookmarks for select
using (true);

create policy "Enable insert access for all users"
on bookmarks for insert
with check (true);

create policy "Enable delete access for all users"
on bookmarks for delete
using (true);

create policy "Enable update access for all users"
on bookmarks for update
using (true);
