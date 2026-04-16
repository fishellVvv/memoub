const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";
const googleWebClientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID?.trim() ?? "";

export const appConfig = {
  supabaseUrl,
  supabaseAnonKey,
  googleWebClientId,
  isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey)
};
