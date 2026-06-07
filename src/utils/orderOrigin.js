const ORDER_ORIGIN_STORAGE_KEY = "paracasya_order_origin";

export function normalizeOrderOrigin(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function formatOrderOriginLabel(origin) {
  const normalized = normalizeOrderOrigin(origin);

  if (!normalized) {
    return "";
  }

  return normalized
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (part === "airbnb") return "Airbnb";
      if (part === "qr") return "QR";
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

export function readStoredOrderOrigin() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(ORDER_ORIGIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("No se pudo leer el origen guardado:", error);
    return null;
  }
}

export function saveOrderOrigin(origin) {
  const normalized = normalizeOrderOrigin(origin);

  if (!normalized || typeof localStorage === "undefined") {
    return null;
  }

  const payload = {
    origin: normalized,
    label: formatOrderOriginLabel(normalized),
  };

  localStorage.setItem(ORDER_ORIGIN_STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function resolveOrderOriginFromUrl(search) {
  const params = new URLSearchParams(search);
  const origin = normalizeOrderOrigin(params.get("origen"));

  if (origin) {
    return saveOrderOrigin(origin);
  }

  return readStoredOrderOrigin();
}
