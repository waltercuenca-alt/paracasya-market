const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-notify-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(value: unknown) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "S/ 0";
  }

  return `S/ ${amount.toFixed(2).replace(/\.00$/, "")}`;
}

function formatDelivery(value: unknown) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Por confirmar";
  }

  return formatCurrency(amount);
}

function buildLine(label: string, value: unknown) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "";
  }

  return `<b>${escapeHtml(label)}:</b> ${escapeHtml(text)}\n`;
}

function buildItems(items: unknown) {
  if (!Array.isArray(items) || !items.length) {
    return "Sin productos registrados";
  }

  return items
    .map((item) => {
      const product = item as Record<string, unknown>;
      const quantity = Number(product.quantity ?? 1);
      const name = escapeHtml(product.product_name ?? product.name ?? "Producto");
      const total = product.total_price ?? Number(product.unit_price ?? 0) * quantity;

      return `• ${escapeHtml(quantity)}x ${name} — ${escapeHtml(formatCurrency(total))}`;
    })
    .join("\n");
}

function buildTelegramMessage(payload: Record<string, unknown>) {
  const destination = String(payload.location_name ?? "").trim();
  const reference = String(payload.room_reference ?? "").trim();
  const origin = String(payload.order_origin_label ?? "").trim();
  const comments = String(payload.delivery_notes ?? "").trim();

  return [
    "🛒 <b>Nuevo pedido ParacasYa Market</b>",
    "",
    buildLine("Código", payload.order_code).trimEnd(),
    buildLine("Cliente", payload.customer_name).trimEnd(),
    buildLine("WhatsApp", payload.customer_phone).trimEnd(),
    destination ? `<b>Destino:</b> ${escapeHtml(destination)}` : "",
    reference ? `<b>Referencia:</b> ${escapeHtml(reference)}` : "",
    buildLine("Pago", payload.payment_method).trimEnd(),
    origin ? `<b>Origen:</b> ${escapeHtml(origin)}` : "",
    comments ? `<b>Comentarios:</b> ${escapeHtml(comments)}` : "",
    "",
    "<b>Productos:</b>",
    buildItems(payload.items),
    "",
    `<b>Subtotal:</b> ${escapeHtml(formatCurrency(payload.subtotal))}`,
    `<b>Delivery:</b> ${escapeHtml(formatDelivery(payload.delivery_fee))}`,
    `<b>Total:</b> ${escapeHtml(formatCurrency(payload.total))}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const expectedToken = Deno.env.get("INTERNAL_NOTIFY_TOKEN");
    const receivedToken = req.headers.get("x-internal-notify-token") || "";

    if (!expectedToken || !receivedToken || receivedToken !== expectedToken) {
      return jsonResponse({ error: "No autorizado" }, 401);
    }

    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!telegramBotToken || !telegramChatId) {
      return jsonResponse({ error: "Telegram no esta configurado" }, 500);
    }

    const payload = await req.json();
    const message = buildTelegramMessage(payload ?? {});
    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      body: JSON.stringify({
        chat_id: telegramChatId,
        parse_mode: "HTML",
        text: message,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const telegramError = await response.text();
      console.error("Telegram sendMessage failed", {
        status: response.status,
        body: telegramError.slice(0, 300),
      });
      return jsonResponse({ error: "No se pudo enviar alerta a Telegram" }, 502);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("notify-order-telegram error", error);
    return jsonResponse({ error: "Error inesperado enviando alerta interna" }, 500);
  }
});
