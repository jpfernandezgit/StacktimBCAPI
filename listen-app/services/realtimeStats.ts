/**
 * Live global stats subscription.
 *
 * Subscribes to the `global_stats` table via Supabase Realtime. Every
 * `postgres_changes` event pushes a partial update into the Zustand store so
 * the Home counter, the Network dashboard, and any future consumer stay in
 * sync without polling.
 *
 * Returns an unsubscribe function. The hook version in `hooks/useRealtimeStats`
 * wraps this for component lifetimes.
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import { useListenStore } from '../store/useListenStore';
import { getSupabase } from './supabaseClient';

interface GlobalStatsRow {
  active_phones: number;
  total_countries: number;
  total_packets_processed: number;
  total_petaflops: number;
  sky_sectors_scanned: number;
}

function applyRow(row: GlobalStatsRow): void {
  useListenStore.getState().updateGlobalStats({
    activePhones: row.active_phones,
    countries: row.total_countries,
    petaFlops: row.total_petaflops,
    skySectorsScanned: row.sky_sectors_scanned,
  });
}

export function subscribeGlobalStats(): () => void {
  const supabase = getSupabase();

  // Prime the store with the current row — cheap, one-shot select.
  supabase
    .from('global_stats')
    .select('*')
    .eq('id', 1)
    .maybeSingle()
    .then(({ data }) => {
      if (data) applyRow(data as GlobalStatsRow);
    });

  const channel: RealtimeChannel = supabase
    .channel('global-stats')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'global_stats' },
      (payload) => {
        const row = (payload.new ?? payload.old) as GlobalStatsRow | null;
        if (row) applyRow(row);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
