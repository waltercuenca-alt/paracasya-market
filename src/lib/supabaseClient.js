import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function isValidUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const hasValidUrl = typeof supabaseUrl === "string" && isValidUrl(supabaseUrl.trim());
const hasAnonKey = typeof supabaseAnonKey === "string" && supabaseAnonKey.trim().length > 0;

export const isSupabaseConfigured = hasValidUrl && hasAnonKey;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl.trim(), supabaseAnonKey.trim())
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      "Supabase no está configurado correctamente. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}
