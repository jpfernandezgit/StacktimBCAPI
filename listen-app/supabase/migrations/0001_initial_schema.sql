-- LISTEN — initial schema.
-- Tables support: user identity, packet distribution, analysis result
-- aggregation, anomaly confirmation, and live global/country stats.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users — one row per installed device (auth user).
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  device_model text,
  country_code text,
  city text,
  total_packets_processed integer not null default 0,
  total_hours numeric not null default 0,
  streak_days integer not null default 0,
  last_active_at timestamptz
);

create index if not exists users_country_idx on public.users (country_code);
create index if not exists users_last_active_idx on public.users (last_active_at desc);

-- ---------------------------------------------------------------------------
-- data_packets — work queue. Each row is one small packet derived from a
-- public radio-telescope spectrogram.
-- ---------------------------------------------------------------------------
create type packet_status as enum ('pending', 'assigned', 'completed', 'failed');

create table if not exists public.data_packets (
  id uuid primary key default gen_random_uuid(),
  sky_sector text not null,
  ra numeric not null,
  dec_coord numeric not null,
  data_url text not null,
  status packet_status not null default 'pending',
  assigned_to uuid references public.users(id) on delete set null,
  assigned_at timestamptz,
  has_injected_signal boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists data_packets_status_idx on public.data_packets (status);
create index if not exists data_packets_assigned_to_idx on public.data_packets (assigned_to);
create index if not exists data_packets_sector_idx on public.data_packets (sky_sector);

-- ---------------------------------------------------------------------------
-- analysis_results — one row per processed packet per user.
-- ---------------------------------------------------------------------------
create table if not exists public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid not null references public.data_packets(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  anomaly_score numeric not null check (anomaly_score between 0 and 100),
  peak_frequencies jsonb not null default '[]'::jsonb,
  processing_time_ms integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists analysis_results_packet_idx on public.analysis_results (packet_id);
create index if not exists analysis_results_user_idx on public.analysis_results (user_id);
create index if not exists analysis_results_score_idx on public.analysis_results (anomaly_score desc);

-- ---------------------------------------------------------------------------
-- anomalies — confirmed-by-multiple-phones candidate events.
-- ---------------------------------------------------------------------------
create type anomaly_status as enum ('verifying', 'confirmed', 'resolved', 'contact');

create table if not exists public.anomalies (
  id uuid primary key default gen_random_uuid(),
  sky_sector text not null,
  ra numeric not null,
  dec_coord numeric not null,
  avg_score numeric not null,
  detected_by_count integer not null,
  status anomaly_status not null default 'verifying',
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists anomalies_status_idx on public.anomalies (status);
create index if not exists anomalies_created_idx on public.anomalies (created_at desc);

-- ---------------------------------------------------------------------------
-- global_stats — a single-row materialised summary refreshed by cron.
-- ---------------------------------------------------------------------------
create table if not exists public.global_stats (
  id integer primary key default 1,
  active_phones integer not null default 0,
  total_countries integer not null default 0,
  total_packets_processed bigint not null default 0,
  total_petaflops numeric not null default 0,
  sky_sectors_scanned integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint global_stats_singleton check (id = 1)
);

insert into public.global_stats (id)
values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- country_rankings — one row per ISO country code.
-- ---------------------------------------------------------------------------
create table if not exists public.country_rankings (
  country_code text primary key,
  country_name text not null,
  active_phones integer not null default 0,
  total_packets bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security — safe defaults.
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.analysis_results enable row level security;
alter table public.anomalies enable row level security;
alter table public.data_packets enable row level security;
alter table public.global_stats enable row level security;
alter table public.country_rankings enable row level security;

-- Every authenticated user can read public dashboards.
create policy "read_anomalies" on public.anomalies
  for select using (true);
create policy "read_global_stats" on public.global_stats
  for select using (true);
create policy "read_country_rankings" on public.country_rankings
  for select using (true);

-- Users can only read / update their own row.
create policy "user_owns_self" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Users can insert only their own analysis results.
create policy "user_inserts_own_results" on public.analysis_results
  for insert with check (auth.uid() = user_id);
create policy "user_reads_own_results" on public.analysis_results
  for select using (auth.uid() = user_id);

-- Packet queue is read-only for clients; assignment goes through an RPC.
create policy "read_assigned_packets" on public.data_packets
  for select using (assigned_to = auth.uid());
