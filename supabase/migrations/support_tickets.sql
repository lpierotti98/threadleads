CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  user_id uuid references auth.users(id) on delete set null,
  status text default 'open',
  created_at timestamptz default now()
);
