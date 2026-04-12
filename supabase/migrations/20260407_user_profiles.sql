create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  nickname text,
  goal text,
  target_role text,
  age int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_plan on public.user_profiles(plan);

alter table public.user_profiles enable row level security;

create policy if not exists "profiles_select_own"
on public.user_profiles for select
using (auth.uid() = user_id);

create policy if not exists "profiles_upsert_own"
on public.user_profiles for insert
with check (auth.uid() = user_id);

create policy if not exists "profiles_update_own"
on public.user_profiles for update
using (auth.uid() = user_id);
