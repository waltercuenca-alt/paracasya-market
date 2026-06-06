import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL cargada:", Boolean(import.meta.env.VITE_SUPABASE_URL));
console.log("Supabase KEY cargada:", Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY));

function getSupabaseProjectUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.origin : "";
  } catch {
    return "";
  }
}

const supabaseProjectUrl =
  typeof supabaseUrl === "string" ? getSupabaseProjectUrl(supabaseUrl.trim()) : "";
const hasValidUrl = supabaseProjectUrl.length > 0;
const hasAnonKey = typeof supabaseAnonKey === "string" && supabaseAnonKey.trim().length > 0;

export const isSupabaseConfigured = hasValidUrl && hasAnonKey;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseProjectUrl, supabaseAnonKey.trim())
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      "Supabase no está configurado en este entorno. Revisa variables de Vercel y redeploy.",
    );
  }

  return supabase;
}
