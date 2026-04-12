/**
 * Supabase Edge Function — distribute-packets
 *
 * Run on a schedule (e.g. every 5 minutes) to top up the packet queue from
 * the upstream source. For MVP it pulls pre-generated JSON payloads from a
 * Storage bucket and enqueues one row per payload.
 *
 * Expected env:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   PACKET_BUCKET           — defaults to "listen-packets"
 *   PACKETS_PER_TICK        — defaults to 100
 */

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BUCKET = Deno.env.get('PACKET_BUCKET') ?? 'listen-packets';
const BATCH = parseInt(Deno.env.get('PACKETS_PER_TICK') ?? '100', 10);

const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

function randomSector(): { sector: string; ra: number; dec: number } {
  const n = Math.floor(Math.random() * 99) + 1;
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return {
    sector: `${n}-${letter}`,
    ra: Math.random() * 24,
    dec: Math.random() * 180 - 90,
  };
}

Deno.serve(async () => {
  const inserts: any[] = [];
  for (let i = 0; i < BATCH; i++) {
    const s = randomSector();
    const fileName = `packet_${crypto.randomUUID()}.json`;
    const { data: signed } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(fileName, 60 * 60 * 24);
    if (!signed?.signedUrl) continue;
    inserts.push({
      sky_sector: s.sector,
      ra: s.ra,
      dec_coord: s.dec,
      data_url: signed.signedUrl,
      // 5% of packets carry a known injection for validation.
      has_injected_signal: Math.random() < 0.05,
    });
  }

  const { error } = await sb.from('data_packets').insert(inserts);
  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ enqueued: inserts.length });
});
