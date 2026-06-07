import { getSupabaseClient } from "../lib/supabaseClient";
import { invokeAdminCatalog } from "./adminCatalogService";

const STORE_SETTINGS_STORAGE_KEY = "paracasya_store_settings_preview";

export const defaultStoreSettings = {
  id: "main",
  storeOpen: true,
  openingHours: "Atendemos de 10:00 a.m. a 10:00 p.m.",
  closedMessage: "Estamos cerrados por ahora. Volvemos a atender mañana desde las 10:00 a.m.",
};

function normalizeStoreSettings(settings = {}) {
  return {
    id: settings.id ?? "main",
    storeOpen: Boolean(settings.store_open ?? settings.storeOpen ?? true),
    openingHours: settings.opening_hours ?? settings.openingHours ?? defaultStoreSettings.openingHours,
    closedMessage:
      settings.closed_message ?? settings.closedMessage ?? defaultStoreSettings.closedMessage,
  };
}

function getLocalStoreSettings() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(STORE_SETTINGS_STORAGE_KEY);
    return raw ? normalizeStoreSettings(JSON.parse(raw)) : null;
  } catch (error) {
    console.error("No se pudo leer configuracion local de tienda:", error);
    return null;
  }
}

function saveLocalStoreSettings(settings) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(STORE_SETTINGS_STORAGE_KEY, JSON.stringify(normalizeStoreSettings(settings)));
}

export function storeSettingsPayload(settings) {
  return {
    id: "main",
    store_open: Boolean(settings.storeOpen ?? settings.store_open ?? true),
    opening_hours: String(settings.openingHours ?? settings.opening_hours ?? "").trim(),
    closed_message: String(settings.closedMessage ?? settings.closed_message ?? "").trim(),
    updated_at: new Date().toISOString(),
  };
}

export async function getStoreSettings() {
  const localSettings = getLocalStoreSettings();

  if (localSettings) {
    return localSettings;
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("store_settings")
      .select("id, store_open, opening_hours, closed_message, updated_at")
      .eq("id", "main")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? normalizeStoreSettings(data) : defaultStoreSettings;
  } catch (error) {
    console.error("Usando configuracion abierta por fallback:", error);
    return defaultStoreSettings;
  }
}

export async function saveStoreSettings(settings) {
  const payload = storeSettingsPayload(settings);

  try {
    const data = await invokeAdminCatalog("updateStoreSettings", payload);
    const normalized = normalizeStoreSettings(data);
    saveLocalStoreSettings(normalized);
    return { settings: normalized, persisted: true };
  } catch (error) {
    console.error("No se pudo guardar configuracion remota. Usando vista previa local:", error);
    const normalized = normalizeStoreSettings(payload);
    saveLocalStoreSettings(normalized);
    return { settings: normalized, persisted: false };
  }
}
