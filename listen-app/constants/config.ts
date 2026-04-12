/**
 * LISTEN runtime configuration.
 * Values can be overridden via environment / EAS secrets.
 */

export const Config = {
  // Supabase
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',

  // Signal processing
  packetSampleCount: 1024,            // samples per packet
  anomalyScoreThreshold: 70,          // score to report as suspicious
  peakStdDevThreshold: 4,             // sigma for peak detection

  // Background task
  backgroundTaskName: 'listen.signal-processing',
  minPacketIntervalMs: 60_000,        // min time between packet pulls
  maxPacketsPerNight: 200,
  maxBytesPerNight: 50 * 1024 * 1024, // 50 MB

  // UX
  defaultQuietStartHour: 23,          // 23:00 local
  defaultQuietEndHour: 7,             // 07:00 local

  // Network / API
  apiTimeoutMs: 15_000,
} as const;
