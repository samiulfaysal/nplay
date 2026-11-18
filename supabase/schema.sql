-- ==============================================================================
-- CINEMATIC STREAMING PLATFORM: SUPABASE POSTGRESQL SCHEMA
-- Scalable schema with Row Level Security (RLS), Auth Triggers, and Indexes
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USER PROFILES TABLE
-- Extends Supabase auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  is_admin boolean default false not null,
  preferred_quality text default '1080p' check (preferred_quality in ('480p', '720p', '1080p', '4k')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure is_admin column exists if table was already created
alter table if exists public.profiles add column if not exists is_admin boolean default false not null;

-- Helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- 2. WATCH HISTORY TABLE
-- Tracks user playback progress for resumes & continue watching
create table if not exists public.watch_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_id text not null, -- TMDB ID or custom provider ID
  content_type text not null check (content_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  season_number integer default null,
  episode_number integer default null,
  progress_seconds integer default 0 not null,
  duration_seconds integer default 0 not null,
  completed boolean default false not null,
  last_watched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, content_id, season_number, episode_number)
);

-- 3. WATCHLIST / BOOKMARKS TABLE
-- Saved movies and shows
create table if not exists public.watchlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_id text not null,
  content_type text not null check (content_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  rating numeric(3, 1),
  release_year text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, content_id)
);

-- 4. STREAM CACHE TABLE
create table if not exists public.stream_cache (
  id text primary key, -- Hash of provider + content_id + season + episode
  content_id text not null,
  content_type text not null,
  provider_name text not null,
  stream_data jsonb not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. SITE SETTINGS TABLE (Admin runtime credentials override)
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. CUSTOM STREAMS TABLE (Admin manual stream overrides)
create table if not exists public.custom_streams (
  id uuid default uuid_generate_v4() primary key,
  tmdb_id text not null,
  title text not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  season integer default null,
  episode integer default null,
  stream_url text not null,
  stream_type text not null default 'hls' check (stream_type in ('hls', 'mp4', 'embed')),
  quality text not null default '1080p' check (quality in ('480p', '720p', '1080p', '4k')),
  provider_name text not null default 'Custom Direct',
  poster_path text,
  backdrop_path text,
  overview text,
  rating numeric(3, 1),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- INDEXES FOR FAST QUERYING
-- ==============================================================================
create index if not exists idx_watch_history_user on public.watch_history(user_id, last_watched_at desc);
create index if not exists idx_watchlist_user on public.watchlist(user_id, created_at desc);
create index if not exists idx_stream_cache_expiry on public.stream_cache(expires_at);
create index if not exists idx_custom_streams_lookup on public.custom_streams(tmdb_id, media_type, season, episode);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.watch_history enable row level security;
alter table public.watchlist enable row level security;
alter table public.stream_cache enable row level security;
alter table public.site_settings enable row level security;
alter table public.custom_streams enable row level security;

-- Profiles: Public read, self write, admin manage
create policy "Public profiles are viewable by everyone."
  on public.profiles for select using (true);

create policy "Users can update their own profile."
  on public.profiles for update using (auth.uid() = id);

-- Watch History
create policy "Users can view their own watch history"
  on public.watch_history for select using (auth.uid() = user_id);

create policy "Users can insert their own watch history"
  on public.watch_history for insert with check (auth.uid() = user_id);

create policy "Users can update their own watch history"
  on public.watch_history for update using (auth.uid() = user_id);

create policy "Users can delete their own watch history"
  on public.watch_history for delete using (auth.uid() = user_id);

-- Watchlist
create policy "Users can view their own watchlist"
  on public.watchlist for select using (auth.uid() = user_id);

create policy "Users can insert into their own watchlist"
  on public.watchlist for insert with check (auth.uid() = user_id);

create policy "Users can delete from their own watchlist"
  on public.watchlist for delete using (auth.uid() = user_id);

-- Stream Cache: Read allowed by everyone, write by service role or admin
create policy "Stream cache viewable by everyone"
  on public.stream_cache for select using (true);

create policy "Service role and admins manage stream cache"
  on public.stream_cache for all using (auth.role() = 'service_role' or public.is_admin());

-- Site Settings: Viewable and manageable by admins or service_role
create policy "Settings viewable by admins"
  on public.site_settings for select using (auth.role() = 'service_role' or public.is_admin());

create policy "Settings manageable by admins"
  on public.site_settings for all using (auth.role() = 'service_role' or public.is_admin());

-- Custom Streams: Viewable by everyone (for player streaming), editable by admins
create policy "Custom streams viewable by everyone"
  on public.custom_streams for select using (true);

create policy "Custom streams manageable by admins"
  on public.custom_streams for all using (auth.role() = 'service_role' or public.is_admin());

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url, is_admin)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    false
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
