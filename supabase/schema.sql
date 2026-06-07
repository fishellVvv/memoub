create extension if not exists pgcrypto;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_note_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_note_updated_at on public.notes;

create trigger set_note_updated_at
before insert or update on public.notes
for each row
execute function public.set_note_updated_at();

alter table public.notes enable row level security;

drop policy if exists "users_can_select_own_note" on public.notes;
drop policy if exists "users_can_insert_own_note" on public.notes;
drop policy if exists "users_can_update_own_note" on public.notes;

create policy "users_can_select_own_note"
on public.notes
for select
using (auth.uid() = user_id);

create policy "users_can_insert_own_note"
on public.notes
for insert
with check (auth.uid() = user_id);

create policy "users_can_update_own_note"
on public.notes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
