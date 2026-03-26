CREATE TABLE IF NOT EXISTS api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null unique,
  name text not null default 'Default',
  last_used_at timestamptz,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS api_keys_key_idx ON api_keys(key);
CREATE INDEX IF NOT EXISTS api_keys_user_idx ON api_keys(user_id);

-- RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own api keys"
  ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own api keys"
  ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own api keys"
  ON api_keys FOR DELETE USING (auth.uid() = user_id);
