import { formatOrderOriginLabel, normalizeOrderOrigin } from "./orderOrigin";

export const PARTNER_QR_STORAGE_KEY = "paracasya_partner_qr_materials";
export const DEFAULT_PARTNER_QR_MESSAGE =
  "Pedi agua, snacks y comida rapida sin salir del hotel.";

export const partnerQrTargets = [
  { id: "base-hotel-paracas", name: "Hotel Paracas", slug: "hotel-paracas" },
  { id: "base-airbnb-centro", name: "Airbnb Centro", slug: "airbnb-centro" },
  { id: "base-recepcion-1", name: "Recepcion 1", slug: "recepcion-1" },
  { id: "base-hotel-san-agustin", name: "Hotel San Agustin", slug: "hotel-san-agustin" },
].map((partner) => {
  const slug = normalizeOrderOrigin(partner.slug);

  return {
    ...partner,
    isBase: true,
    label: partner.name || formatOrderOriginLabel(slug),
    message: DEFAULT_PARTNER_QR_MESSAGE,
    slug,
  };
});

export function createPartnerSlug(value) {
  return normalizeOrderOrigin(
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""),
  );
}

export function normalizePartnerQrMaterial(material) {
  const slug = createPartnerSlug(material?.slug || material?.name);
  const name = String(material?.name || formatOrderOriginLabel(slug) || "Nuevo aliado").trim();

  return {
    id: material?.id || `partner-${Date.now()}`,
    isBase: Boolean(material?.isBase),
    label: name,
    message: String(material?.message || DEFAULT_PARTNER_QR_MESSAGE).trim(),
    name,
    slug,
  };
}

export function readCustomPartnerQrMaterials() {
  if (typeof localStorage === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(PARTNER_QR_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.map((material) => normalizePartnerQrMaterial(material)).filter((material) => material.slug)
      : [];
  } catch (error) {
    console.error("No se pudieron leer los materiales QR personalizados:", error);
    return [];
  }
}

export function saveCustomPartnerQrMaterials(materials) {
  if (typeof localStorage === "undefined") {
    return;
  }

  const normalizedMaterials = materials
    .map((material) => normalizePartnerQrMaterial(material))
    .filter((material) => material.slug && !material.isBase);

  localStorage.setItem(PARTNER_QR_STORAGE_KEY, JSON.stringify(normalizedMaterials));
}

export function buildPartnerQrLink(baseUrl, slug) {
  const normalizedSlug = normalizeOrderOrigin(slug);
  const normalizedBase = String(baseUrl || "").replace(/\/$/, "");
  const path = `/cliente?origen=${encodeURIComponent(normalizedSlug)}`;

  return normalizedBase ? `${normalizedBase}${path}` : path;
}

export function buildPartnerCommercialMessage(partner, link) {
  const partnerName = partner?.label || partner?.name || formatOrderOriginLabel(partner?.slug);
  const customMessage = String(partner?.message || DEFAULT_PARTNER_QR_MESSAGE).trim();

  return [
    `Hola ${partnerName}, te compartimos tu enlace de ParacasYa Market.`,
    "",
    customMessage,
    "Escanea y hace tu pedido en ParacasYa Market.",
    "",
    link,
  ].join("\n");
}

export function buildPartnerQrFilename(partner, extension = "png") {
  const slug = createPartnerSlug(partner?.slug || partner?.name || "material-qr");
  return `paracasya-qr-${slug || "material-qr"}.${extension}`;
}
