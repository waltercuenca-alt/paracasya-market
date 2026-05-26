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
    total: Number(order.total ?? 0),
  };
}

export async function createOrder({ form, items }) {
  const client = getSupabaseClient();
  const orderCode = generateOrderCode();
  const { subtotal, deliveryFee, total } = calculateOrderTotals(items);

  const orderPayload = {
    order_code: orderCode,
    customer_name: form.name.trim(),
    customer_phone: form.whatsapp.trim(),
    location_name: form.address.trim(),
    room_reference: form.reference.trim() || null,
    payment_method: form.payment,
    delivery_notes: null,
    status: "Pendiente",
    subtotal,
    delivery_fee: deliveryFee,
    total,
  };

  const { data: order, error: orderError } = await client
    .from("orders")
    .insert(orderPayload)
    .select("id, order_code")
    .single();

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
