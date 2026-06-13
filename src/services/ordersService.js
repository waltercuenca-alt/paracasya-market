import { getSupabaseClient } from "../lib/supabaseClient";
import { calculateOrderTotals } from "../utils/orderTotals";

export const validOrderStatuses = [
  "Pendiente",
  "Confirmado",
  "Preparando",
  "En camino",
  "Entregado",
  "Cancelado",
];

function generateOrderCode() {
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `PYA-${Date.now()}-${randomPart}`;
}

function formatCreatedAt(createdAt) {
  if (!createdAt) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(createdAt));
}

function normalizeOrder(order) {
  const items = order.order_items ?? [];
  const origin = order.order_origin ?? "";
  const originLabel = order.order_origin_label ?? "";

  return {
    id: order.id,
    orderCode: order.order_code,
    createdAt: order.created_at,
    customer: order.customer_name ?? "Cliente",
    phone: order.customer_phone ?? "",
    destination: [order.location_name, order.room_reference].filter(Boolean).join(" - "),
    time: formatCreatedAt(order.created_at),
    payment: order.payment_method ?? "",
    status: order.status ?? "Pendiente",
    items: items.map((item) => `${item.product_name} x${item.quantity}`),
    deliveryNotes: order.delivery_notes ?? "",
    total: Number(order.total ?? 0),
    origin,
    originLabel,
  };
}

function isMissingOriginColumnError(error) {
  const message = `${error?.message ?? ""} ${error?.details ?? ""} ${error?.hint ?? ""}`;
  return (
    error?.code === "PGRST204" ||
    message.includes("order_origin") ||
    message.includes("order_origin_label")
  );
}

function buildNotificationPayload({ orderCode, orderPayload, orderItems }) {
  return {
    order_code: orderCode,
    customer_name: orderPayload.customer_name,
    customer_phone: orderPayload.customer_phone,
    location_name: orderPayload.location_name,
    room_reference: orderPayload.room_reference,
    payment_method: orderPayload.payment_method,
    delivery_notes: orderPayload.delivery_notes,
    order_origin_label: orderPayload.order_origin_label,
    items: orderItems.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    })),
    subtotal: orderPayload.subtotal,
    delivery_fee: orderPayload.delivery_fee,
    total: orderPayload.total,
  };
}

async function notifyOrderTelegram(payload) {
  const internalNotifyToken = import.meta.env.VITE_INTERNAL_NOTIFY_TOKEN;

  if (!internalNotifyToken) {
    console.warn("Alerta Telegram omitida: VITE_INTERNAL_NOTIFY_TOKEN no esta configurado.");
    return;
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client.functions.invoke("notify-order-telegram", {
      body: payload,
      headers: {
        "x-internal-notify-token": internalNotifyToken,
      },
    });

    if (error || data?.error) {
      console.warn("No se pudo enviar la alerta interna de Telegram.", {
        error: error?.message ?? data?.error ?? "Error desconocido",
      });
    }
  } catch (error) {
    console.warn("No se pudo invocar la alerta interna de Telegram.", {
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

export async function createOrder({ form, items, origin, storeSettings }) {
  const client = getSupabaseClient();
  const orderCode = generateOrderCode();
  const { subtotal, deliveryFee, total } = calculateOrderTotals(items, storeSettings);

  const orderPayload = {
    order_code: orderCode,
    customer_name: form.name.trim(),
    customer_phone: form.whatsapp.trim(),
    location_name: form.address.trim(),
    room_reference: form.reference.trim() || null,
    payment_method: form.payment,
    delivery_notes: form.comments?.trim() || null,
    status: "Pendiente",
    subtotal,
    delivery_fee: deliveryFee,
    total,
  };

  if (origin?.origin) {
    orderPayload.order_origin = origin.origin;
    orderPayload.order_origin_label = origin.label || origin.origin;
  }

  let { data: order, error: orderError } = await client
    .from("orders")
    .insert(orderPayload)
    .select("id, order_code")
    .single();

  if (orderError && origin?.origin && isMissingOriginColumnError(orderError)) {
    console.warn(
      "La tabla orders todavia no tiene columnas de origen. Reintentando pedido sin origen.",
    );
    const { order_origin, order_origin_label, ...payloadWithoutOrigin } = orderPayload;
    const retry = await client
      .from("orders")
      .insert(payloadWithoutOrigin)
      .select("id, order_code")
      .single();
    order = retry.data;
    orderError = retry.error;
  }

  if (orderError) {
    console.error("Error creando el pedido en Supabase:", JSON.stringify(orderError, null, 2));
    throw new Error("No pudimos registrar tu pedido. Verifica tus datos e intenta nuevamente.");
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }));

  const { error: itemsError } = await client.from("order_items").insert(orderItems);

  if (itemsError) {
    console.error(
      "Error guardando los productos del pedido en Supabase:",
      JSON.stringify(itemsError, null, 2),
    );
    throw new Error(
      `El pedido ${orderCode} fue creado, pero no pudimos registrar sus productos. Contáctanos para confirmarlo.`,
    );
  }

  void notifyOrderTelegram(
    buildNotificationPayload({
      orderCode: order.order_code ?? orderCode,
      orderItems,
      orderPayload,
    }),
  );

  return {
    id: order.id,
    orderCode: order.order_code ?? orderCode,
  };
}

export async function getOrders() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error consultando pedidos en Supabase:", JSON.stringify(error, null, 2));
    throw new Error("No pudimos cargar los pedidos. Vuelve a intentarlo.");
  }

  return (data ?? []).map(normalizeOrder);
}

export async function getOrderStatus({ orderCode, orderId }) {
  if (!orderCode && !orderId) {
    return null;
  }

  const client = getSupabaseClient();
  let query = client.from("orders").select("id, order_code, status").limit(1);

  if (orderCode) {
    query = query.eq("order_code", orderCode);
  } else {
    query = query.eq("id", orderId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Error consultando el estado del pedido:", JSON.stringify(error, null, 2));
    throw new Error("No pudimos actualizar el estado del pedido.");
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    orderCode: data.order_code,
    status: data.status ?? "Pendiente",
  };
}

export async function updateOrderStatus(orderId, status) {
  if (!validOrderStatuses.includes(status)) {
    throw new Error("El estado seleccionado no es válido.");
  }

  const client = getSupabaseClient();
  const { error } = await client.from("orders").update({ status }).eq("id", orderId);

  if (error) {
    console.error(
      "Error actualizando el estado del pedido en Supabase:",
      JSON.stringify(error, null, 2),
    );
    throw new Error("No pudimos actualizar el estado del pedido.");
  }
}
