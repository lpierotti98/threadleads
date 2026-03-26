-- ThreadLeads Database Schema
-- Run this in Supabase SQL Editor

-- Keywords / settings per user
create table if not exists users_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  keywords jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Scored threads
create table if not exists threads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  source text not null check (source in ('reddit', 'hn')),
  title text not null,
  url text not null,
  content_preview text,
  subreddit text,
  score integer not null default 0,
  urgency text not null default 'low' check (urgency in ('low', 'medium', 'high')),
  score_reason text,
  reply_generated boolean default false,
  marked_done boolean default false,
  marked_contacted boolean default false,
  created_at timestamptz default now()
);

-- Usage tracking
create table if not exists usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  scans_today integer default 0,
  replies_this_month integer default 0,
  last_scan_at timestamptz
);

-- Subscriptions
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan text check (plan in ('starter', 'pro')),
  status text default 'active' check (status in ('active', 'canceled', 'past_due')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_threads_user_id on threads(user_id);
create index if not exists idx_threads_url on threads(url);
create index if not exists idx_threads_created_at on threads(created_at desc);

-- Row Level Security
alter table users_settings enable row level security;
alter table threads enable row level security;
alter table usage enable row level security;
alter table subscriptions enable row level security;

-- Policies: users can only access their own data
create policy "Users can read own settings"
  on users_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings"
  on users_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings"
  on users_settings for update using (auth.uid() = user_id);

create policy "Users can read own threads"
  on threads for select using (auth.uid() = user_id);
create policy "Users can update own threads"
  on threads for update using (auth.uid() = user_id);

create policy "Users can read own usage"
  on usage for select using (auth.uid() = user_id);

create policy "Users can read own subscription"
  on subscriptions for select using (auth.uid() = user_id);
