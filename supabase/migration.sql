-- WatchBed Stage 2. Paste into Supabase: SQL Editor > New query > Run.
create table public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  watchlist_id uuid not null references public.watchlists(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('movie','tv')),
  tmdb_id integer not null,
  title text not null,
  poster_path text,
  created_at timestamptz not null default now(),
  unique (watchlist_id, media_type, tmdb_id)
);
-- One row per user per title: watched flag + rating (1-5). Different signals stay separate columns.
create table public.title_status (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('movie','tv')),
  tmdb_id integer not null,
  title text not null,
  poster_path text,
  watched boolean not null default false,
  rating smallint check (rating between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, media_type, tmdb_id)
);
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.title_status enable row level security;
create policy "own lists" on public.watchlists for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own items" on public.watchlist_items for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists (select 1 from public.watchlists w where w.id = watchlist_id and w.user_id = auth.uid()));
create policy "own status" on public.title_status for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
