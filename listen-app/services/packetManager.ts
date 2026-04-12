/**
 * Packet lifecycle: pull pending packets from the backend, hand them to the
 * signal processor, upload the result, update local stats.
 */

import { Config } from '../constants/config';
import { useListenStore } from '../store/useListenStore';
import { ProcessedPacket, processPacket, RawPacket } from './signalProcessor';
import { getSupabase } from './supabaseClient';

interface PacketRow {
  id: string;
  sky_sector: string;
  ra: number;
  dec_coord: number;
  data_url: string;
}

/**
 * Fetch one pending packet assigned to the current user. Returns null if the
 * queue is empty.
 */
export async function fetchNextPacket(userId: string): Promise<RawPacket | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .rpc('claim_packet', { p_user_id: userId })
    .returns<PacketRow>();

  if (error || !data) return null;

  const res = await fetch(data.data_url);
  if (!res.ok) return null;
  const body = (await res.json()) as { samples: number[] };

  return {
    id: data.id,
    skySector: data.sky_sector,
    ra: data.ra,
    decCoord: data.dec_coord,
    samples: body.samples,
  };
}

/**
 * Upload a processed packet result to Supabase.
 */
export async function uploadResult(
  userId: string,
  result: ProcessedPacket,
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('analysis_results').insert({
    packet_id: result.packetId,
    user_id: userId,
    anomaly_score: result.result.score,
    peak_frequencies: result.result.peakFrequencies,
    processing_time_ms: result.result.processingTimeMs,
  });
  return !error;
}

/**
 * Process one packet end-to-end. Safe to call inside a background task —
 * it will silently no-op if any step fails.
 */
export async function processOnePacket(userId: string): Promise<boolean> {
  try {
    const raw = await fetchNextPacket(userId);
    if (!raw) return false;
    const processed = processPacket(raw);
    const isAnomaly = processed.result.score >= Config.anomalyScoreThreshold;
    useListenStore
      .getState()
      .recordPacketProcessed(raw.skySector, isAnomaly);
    useListenStore.getState().setCurrentSector(raw.skySector);
    await uploadResult(userId, processed);
    return true;
  } catch {
    return false;
  }
}
