create table if not exists public.interview_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  mode text not null,
  track text not null,
  score int not null default 0,
  verdict text not null default 'In Progress',
  transcript jsonb not null default '[]'::jsonb,
  strengths text[] not null default '{}',
  improvements text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.question_library (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  topic text not null,
  difficulty text not null,
  content text not null,
  ai_generated boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.interview_sessions enable row level security;
alter table public.question_library enable row level security;

create policy if not exists "sessions_select_own" on public.interview_sessions for select using (auth.uid() = user_id);
create policy if not exists "sessions_insert_own" on public.interview_sessions for insert with check (auth.uid() = user_id);
create policy if not exists "sessions_update_own" on public.interview_sessions for update using (auth.uid() = user_id);

create policy if not exists "library_select_own" on public.question_library for select using (auth.uid() = user_id);
create policy if not exists "library_insert_own" on public.question_library for insert with check (auth.uid() = user_id);
create policy if not exists "library_delete_own" on public.question_library for delete using (auth.uid() = user_id);
