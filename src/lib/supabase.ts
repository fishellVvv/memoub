import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { appConfig } from "./config";
import { isTauriDesktop } from "./desktop";
import { desktopAuthStorage } from "./desktop-auth-storage";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!appConfig.isSupabaseConfigured) {
    return null;
  }

  if (!client) {
    client = createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
      auth: {
        storage: isTauriDesktop() ? desktopAuthStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  return client;
}
