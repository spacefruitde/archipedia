-- ArchiPedia Datenbank-Schema v1 (Projekt-Arbeitsname, wird umbenannt)
-- Für ein dediziertes Supabase-Projekt; Tabelle im public-Schema.

create table if not exists public.nodes (
  id          text primary key,
  perspective text not null check (perspective in ('k','e','x','p')),  -- Konstruktion, Entwurf, Kontext, Prozess
  level       int  not null check (level between 1 and 7),
  parent_id   text references public.nodes(id) on delete restrict,
  title       text not null check (char_length(title) <= 60),
  t1          text not null,          -- Überblick (Pflicht)
  t2          text,                   -- Vertiefung
  t3          text,                   -- Spezifikation (reviewpflichtig)
  links       text[] not null default '{}',   -- Querverweis-IDs
  sources     jsonb  not null default '[]',   -- [{t, u, stand, geprueft}]
  dach        jsonb,                  -- {de, at, ch}
  images      jsonb  not null default '[]',   -- [{path, caption, credit, lizenz}]
  status      text not null default 'generiert'
              check (status in ('generiert','strukturgeprüft','fachgeprüft')),
  reviewed_by text,
  reviewed_at date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists nodes_parent_idx on public.nodes (parent_id);
create index if not exists nodes_persp_idx  on public.nodes (perspective, level);
create index if not exists nodes_status_idx on public.nodes (status);

-- updated_at automatisch pflegen
create or replace function public.touch_updated_at()
returns trigger language plpgsql security definer set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists nodes_touch on public.nodes;
create trigger nodes_touch before update on public.nodes
  for each row execute function public.touch_updated_at();

-- RLS: anonym lesen (Prototyp/Site), schreiben nur mit Service-Key (Pipeline)
alter table public.nodes enable row level security;
drop policy if exists nodes_read on public.nodes;
create policy nodes_read on public.nodes for select to anon, authenticated using (true);
