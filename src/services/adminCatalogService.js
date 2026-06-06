import { getSupabaseClient } from "../lib/supabaseClient";

const ADMIN_CATALOG_TOKEN_KEY = "paracasya_admin_catalog_token";

export function getAdminCatalogToken() {
  if (typeof sessionStorage === "undefined") {
    return "";
  }

  return sessionStorage.getItem(ADMIN_CATALOG_TOKEN_KEY) ?? "";
}

export function saveAdminCatalogToken(token) {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(ADMIN_CATALOG_TOKEN_KEY, token.trim());
  }
}

export function clearAdminCatalogToken() {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(ADMIN_CATALOG_TOKEN_KEY);
  }
}

export async function invokeAdminCatalog(action, payload = {}) {
  const token = getAdminCatalogToken();

  if (!token) {
    throw new Error(
      "Admin seguro no está configurado en esta sesión. Ingresá el token de Edge Function para guardar cambios.",
    );
  }

  const client = getSupabaseClient();
  const { data, error } = await client.functions.invoke("admin-catalog", {
    body: { action, payload },
    headers: {
      "x-admin-token": token,
    },
  });

  if (error) {
    console.error("Error invocando Edge Function admin-catalog:", JSON.stringify(error, null, 2));
    throw new Error(
      "Admin seguro no está desplegado todavía o rechazó la solicitud. Desplegá la Edge Function y revisá el token.",
    );
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.data ?? data;
}
