/**
 * Supabase Edge Function — aggregate-results
 *
 * Called on a schedule. Recomputes the global_stats singleton and decides
 * whether any "verifying" anomaly should be promoted to "confirmed". In the
 * MVP we use a simple rule: if avg_score >= 85 and at least 10 independent
 * phones have flagged it, it becomes a confirmed anomaly and a push
 * notification is queued for subscribed users.
 */

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

Deno.serve(async () => {
  await sb.rpc('refresh_global_stats');

  const { data: candidates } = await sb
    .from('anomalies')
    .select('*')
    .eq('status', 'verifying');

  const promotions: string[] = [];
  for (const a of (candidates as any[]) ?? []) {
    if (a.avg_score >= 85 && a.detected_by_count >= 10) {
      await sb
        .from('anomalies')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', a.id);
      promotions.push(a.id);
    }
  }

  return Response.json({ promoted: promotions.length });
});
