export function normalizePeruWhatsappNumber(value) {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (/^9\d{8}$/.test(digits)) {
    return `51${digits}`;
  }

  if (/^519\d{8}$/.test(digits)) {
    return digits;
  }

  return null;
}

function formatWhatsappTotal(value) {
  return new Intl.NumberFormat("es-PE", {
    currency: "PEN",
    style: "currency",
  }).format(value);
}

export function buildOrderWhatsappMessage(order) {
  const customerLine = order.customer ? `Hola ${order.customer}, somos ParacasYa Market 👋` : "Hola, somos ParacasYa Market 👋";
  const orderCode = order.orderCode ?? order.id ?? "tu pedido";
  const items = order.items?.length
    ? order.items.map((item) => `- ${item}`).join("\n")
    : "- Productos por confirmar";
  const total = Number.isFinite(Number(order.total))
    ? formatWhatsappTotal(Number(order.total))
    : "Por confirmar";

  return `${customerLine}
Recibimos tu pedido ${orderCode}.

Estamos revisando disponibilidad y te confirmamos en breve.

Resumen:
${items}

Total: ${total}

Gracias por usar ParacasYa Market, el kiosco online de Paracas.`;
}

export function buildOrderWhatsappUrl(order) {
  const phone = normalizePeruWhatsappNumber(order.phone);

  if (!phone) {
    return null;
  }

  const message = buildOrderWhatsappMessage(order);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
