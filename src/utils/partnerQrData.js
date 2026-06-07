import { formatOrderOriginLabel, normalizeOrderOrigin } from "./orderOrigin";

export const partnerQrTargets = [
  { name: "Hotel Paracas", slug: "hotel-paracas" },
  { name: "Airbnb Centro", slug: "airbnb-centro" },
  { name: "Recepcion 1", slug: "recepcion-1" },
  { name: "Hotel San Agustin", slug: "hotel-san-agustin" },
].map((partner) => {
  const slug = normalizeOrderOrigin(partner.slug);

  return {
    ...partner,
    label: partner.name || formatOrderOriginLabel(slug),
    slug,
  };
});

export function buildPartnerQrLink(baseUrl, slug) {
  const normalizedSlug = normalizeOrderOrigin(slug);
  const normalizedBase = String(baseUrl || "").replace(/\/$/, "");
  const path = `/cliente?origen=${encodeURIComponent(normalizedSlug)}`;

  return normalizedBase ? `${normalizedBase}${path}` : path;
}

export function buildPartnerCommercialMessage(partner, link) {
  const partnerName = partner?.label || partner?.name || formatOrderOriginLabel(partner?.slug);

  return [
    `Hola ${partnerName}, te compartimos tu enlace de ParacasYa Market.`,
    "",
    "Pedi agua, snacks y comida rapida sin salir de tu hotel.",
    "Escanea y hace tu pedido en ParacasYa Market.",
    "",
    link,
  ].join("\n");
}
