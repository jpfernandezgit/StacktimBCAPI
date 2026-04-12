-- RPCs and triggers used by the LISTEN client and cron.

-- ---------------------------------------------------------------------------
-- claim_packet — atomically assign one pending packet to the caller.
-- Returns a single row ready for the client to download and process.
-- ---------------------------------------------------------------------------
create or replace function public.claim_packet(p_user_id uuid)
returns setof public.data_packets
language plpgsql
security definer
as $$
declare
  v_packet public.data_packets;
begin
  update public.data_packets
     set status = 'assigned',
         assigned_to = p_user_id,
         assigned_at = now()
   where id = (
     select id
       from public.data_packets
      where status = 'pending'
      order by created_at
      for update skip locked
      limit 1
   )
  returning * into v_packet;

  if v_packet.id is not null then
    return next v_packet;
  end if;
  return;
end;
$$;

-- ---------------------------------------------------------------------------
-- on_result_inserted — as soon as a new analysis_result comes in:
--   1. mark the packet completed
--   2. bump user counters
--   3. if three or more phones score the same packet above threshold, promote
--      to a candidate anomaly
-- ---------------------------------------------------------------------------
create or replace function public.on_result_inserted()
returns trigger
language plpgsql
as $$
declare
  v_packet public.data_packets;
  v_avg numeric;
  v_count integer;
begin
  update public.data_packets
     set status = 'completed'
   where id = new.packet_id
   returning * into v_packet;

  update public.users
     set total_packets_processed = total_packets_processed + 1,
         last_active_at = now()
   where id = new.user_id;

  select avg(anomaly_score), count(*)
    into v_avg, v_count
    from public.analysis_results
   where packet_id = new.packet_id;

  if v_avg >= 70 and v_count >= 3 then
    insert into public.anomalies
      (sky_sector, ra, dec_coord, avg_score, detected_by_count, status)
    values
      (v_packet.sky_sector, v_packet.ra, v_packet.dec_coord,
       v_avg, v_count, 'verifying')
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_result_inserted on public.analysis_results;
create trigger trg_result_inserted
  after insert on public.analysis_results
  for each row execute function public.on_result_inserted();

-- ---------------------------------------------------------------------------
-- refresh_global_stats — cheap summary run by pg_cron every minute.
-- ---------------------------------------------------------------------------
create or replace function public.refresh_global_stats()
returns void
language plpgsql
as $$
begin
  update public.global_stats
     set active_phones = (
           select count(*) from public.users
            where last_active_at > now() - interval '10 minutes'
         ),
         total_countries = (
           select count(distinct country_code) from public.users
            where country_code is not null
         ),
         total_packets_processed = (
           select coalesce(sum(total_packets_processed), 0) from public.users
         ),
         sky_sectors_scanned = (
           select count(distinct sky_sector) from public.data_packets
            where status = 'completed'
         ),
         updated_at = now()
   where id = 1;
end;
$$;
