const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

const localSupabaseUrl = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d{1,5})?\/?$/i;
const localDevelopment = process.env.NODE_ENV !== "production";

export function isSupabaseConfigured(): boolean {
  const urlAllowed =
    supabaseUrl.startsWith("https://") || (localDevelopment && localSupabaseUrl.test(supabaseUrl));

  return Boolean(supabaseUrl && supabaseAnonKey && urlAllowed && supabaseAnonKey.length > 20);
}

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  if (!isSupabaseConfigured()) return null;
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

export function assertSupabaseConfigured(): { url: string; anonKey: string } {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return config;
}
