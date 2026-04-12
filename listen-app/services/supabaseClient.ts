import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Config } from '../constants/config';

/**
 * Singleton Supabase client. In development we accept empty credentials and
 * return a client that will simply fail gracefully — the app falls back to
 * mock data in that case.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  client = createClient(
    Config.supabaseUrl || 'http://localhost:54321',
    Config.supabaseAnonKey || 'anon-dev-key',
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    },
  );
  return client;
}
