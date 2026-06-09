import {
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  Clock3,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getOrderStatus } from "../services/ordersService";
import { formatCurrency } from "../utils/currency";

const supportWhatsappNumber = "";

const receiptSteps = [
  { icon: CheckCircle2, label: "Pedido recibido" },
  { icon: MessageCircle, label: "Confirmacion por WhatsApp" },
  { icon: PackageCheck, label: "Preparacion" },
  { icon: Truck, label: "Entrega" },
];

function ReceiptLine({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div className="order-success-detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

async function copyText(value) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  window.prompt("Copia este codigo:", value);
}

function buildSupportWhatsappUrl(orderCode) {
  if (!supportWhatsappNumber) {
    return null;
  }

  const message = `Hola ParacasYa Market, acabo de hacer el pedido ${orderCode}. Quisiera confirmar disponibilidad y entrega.`;
  return `https://wa.me/${supportWhatsappNumber}?text=${encodeURIComponent(message)}`;
}

function formatDeliveryFee(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Por confirmar";
  }

  return formatCurrency(amount);
}

function normalizeStatus(status) {
  return String(status ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
}

function getProgressIndex(status) {
  const normalizedStatus = normalizeStatus(status);

  if (["confirmado", "confirmed"].includes(normalizedStatus)) {
    return 1;
  }

  if (["preparando", "preparing", "processing"].includes(normalizedStatus)) {
    return 2;
  }

  if (["en_camino", "on_the_way", "entregado", "delivered"].includes(normalizedStatus)) {
    return 3;
  }

  return 0;
}

function isTerminalStatus(status) {
  return ["entregado", "delivered", "cancelado", "cancelled", "canceled"].includes(
    normalizeStatus(status),
  );
}

function getStatusText(status) {
  const normalizedStatus = normalizeStatus(status);

  if (["entregado", "delivered"].includes(normalizedStatus)) {
    return "Pedido entregado. Gracias por usar ParacasYa Market.";
  }

  if (["cancelado", "cancelled", "canceled"].includes(normalizedStatus)) {
    return "Pedido cancelado. Contacta con ParacasYa Market si necesitas ayuda.";
  }

  return "Estado actualizado desde caja.";
}

function getStatusPresentation(status) {
  const normalizedStatus = normalizeStatus(status);

  if (["confirmado", "confirmed"].includes(normalizedStatus)) {
    return {
      eyebrow: "Paso 2 de 4",
      title: "Tu pedido fue confirmado",
      description: "Ya confirmamos tu pedido. Pronto lo prepararemos.",
      tone: "confirmed",
    };
  }

  if (["preparando", "preparing", "processing"].includes(normalizedStatus)) {
    return {
      eyebrow: "Paso 3 de 4",
      title: "Estamos preparando tu pedido",
      description: "Tu pedido se esta preparando con cuidado.",
      tone: "preparing",
    };
  }

  if (["en_camino", "on_the_way"].includes(normalizedStatus)) {
    return {
      eyebrow: "Paso 4 de 4",
      title: "Tu pedido va en camino",
      description: "Ya salio rumbo a tu hotel o direccion.",
      tone: "on-the-way",
    };
  }

  if (["entregado", "delivered"].includes(normalizedStatus)) {
    return {
      eyebrow: "Pedido completado",
      title: "Pedido entregado",
      description: "Gracias por usar ParacasYa Market.",
      tone: "delivered",
    };
  }

  if (["cancelado", "cancelled", "canceled"].includes(normalizedStatus)) {
    return {
      eyebrow: "Pedido cancelado",
      title: "Pedido cancelado",
      description: "Contacta con ParacasYa Market si necesitas ayuda.",
      tone: "cancelled",
    };
  }

  return {
    eyebrow: "Paso 1 de 4",
    title: "Recibimos tu pedido",
    description: "Estamos revisandolo para confirmarte por WhatsApp.",
    tone: "pending",
  };
}

function OrderSuccessReceipt({ order, onNewOrder, onBackToStore, onDeleteStoredReceipt }) {
  const [copyLabel, setCopyLabel] = useState("Copiar codigo");
  const [liveStatus, setLiveStatus] = useState(order?.status ?? "Pendiente");

  const supportWhatsappUrl = useMemo(
    () => buildSupportWhatsappUrl(order?.orderCode),
    [order?.orderCode],
  );
  const progressIndex = getProgressIndex(liveStatus);
  const normalizedLiveStatus = normalizeStatus(liveStatus);
  const isCancelled = ["cancelado", "cancelled", "canceled"].includes(normalizedLiveStatus);
  const statusPresentation = getStatusPresentation(liveStatus);

  useEffect(() => {
    setLiveStatus(order?.status ?? "Pendiente");
  }, [order?.orderCode, order?.status]);

  useEffect(() => {
    if (!order?.orderCode && !order?.id) {
      return undefined;
    }

    let isMounted = true;
    let intervalId;

    async function refreshStatus() {
      try {
        const statusData = await getOrderStatus({
          orderCode: order.orderCode,
          orderId: order.id,
        });

        if (isMounted && statusData?.status) {
          setLiveStatus(statusData.status);
        }
      } catch (error) {
        console.warn("No se pudo actualizar el estado del pedido en el recibo.", error);
      }
    }

    if (!isTerminalStatus(liveStatus)) {
      refreshStatus();
      intervalId = window.setInterval(refreshStatus, 8000);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [order?.id, order?.orderCode, liveStatus]);

  if (!order) {
    return null;
  }

  async function handleCopyCode() {
    await copyText(order.orderCode);
    setCopyLabel("Codigo copiado");
    window.setTimeout(() => setCopyLabel("Copiar codigo"), 1800);
  }

  return (
    <section className="order-success-premium">
      <div className="order-success-card">
        <div className="order-success-header">
          <div className="order-success-check">
            <CheckCircle2 size={38} strokeWidth={2.6} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="order-success-eyebrow">Comprobante de pedido</p>
            <h2>Pedido recibido</h2>
            <p className="order-success-lead">Tu pedido fue registrado correctamente.</p>
            <p className="order-success-copy">
              Estamos revisando disponibilidad y tiempo de entrega. Te confirmaremos por WhatsApp
              antes de prepararlo.
            </p>
          </div>
        </div>

        <div className="order-success-code">
          <div>
            <span>Codigo de pedido</span>
            <strong>{order.orderCode}</strong>
          </div>
          <button onClick={handleCopyCode} type="button">
            {copyLabel === "Codigo copiado" ? <ClipboardCheck size={17} /> : <Clipboard size={17} />}
            {copyLabel}
          </button>
        </div>

        <p className="order-success-local-note">
          Este comprobante solo se guarda en este celular. El pedido real sigue registrado en
          ParacasYa Market.
        </p>

        <div className={`order-success-tracker order-success-tracker-${statusPresentation.tone}`}>
          <div className="order-success-tracker-message">
            <div>
              <span>{statusPresentation.eyebrow}</span>
              <h3>{statusPresentation.title}</h3>
              <p>{statusPresentation.description}</p>
            </div>
          </div>

        <div className="order-success-steps">
          {receiptSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < progressIndex && !isCancelled;
            const isCurrent = index === progressIndex && !isCancelled;
            const stepState = isCancelled
              ? index === 0
                ? "cancelled"
                : "pending"
              : isCompleted
                ? "completed"
                : isCurrent
                  ? "current"
                  : "pending";

            return (
              <div
                className={`order-success-step ${stepState}`}
                key={step.label}
              >
                <span>
                  {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </span>
                <div>
                  <small>{index + 1}</small>
                  <p>{step.label}</p>
                </div>
              </div>
            );
          })}
        </div>
          <p className={`order-success-status-text ${isCancelled ? "cancelled" : ""}`}>
            {getStatusText(liveStatus)}
          </p>
        </div>

        <div className="order-success-grid">
          <div className="space-y-4">
            <div className="order-success-section">
              <div className="order-success-section-title">
                <MapPin size={19} />
                <h3>Entrega solicitada</h3>
              </div>
              {order.originLabel && (
                <div className="order-success-origin">
                  Pedido asociado a: <strong>{order.originLabel}</strong>
                </div>
              )}
              <ReceiptLine label="Cliente" value={order.customerName} />
              <ReceiptLine label="WhatsApp" value={order.customerPhone} />
              <ReceiptLine label="Hotel, Airbnb o direccion" value={order.address} />
              <ReceiptLine label="Habitacion o referencia" value={order.reference} />
              <ReceiptLine label="Metodo de pago" value={order.paymentMethod} />
              {order.deliveryNotes && (
                <div className="order-success-comments">
                  <span>Comentarios</span>
                  <p>{order.deliveryNotes}</p>
                </div>
              )}
              <p className="order-success-help">
                Lo enviaremos al hotel, habitacion o direccion indicada una vez confirmado por
                nuestro equipo.
              </p>
            </div>

            <div className="order-success-warning">
              <ShieldCheck size={20} />
              <p>
                No pagues hasta recibir la confirmacion oficial por WhatsApp de ParacasYa Market.
              </p>
            </div>
          </div>

          <aside className="order-success-section order-success-ticket">
            <div className="order-success-section-title">
              <ShoppingBag size={19} />
              <h3>Resumen del pedido</h3>
            </div>

            <div className="order-success-items">
              {order.items.map((item) => (
                <div key={`${item.id}-${item.name}`}>
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <strong>{formatCurrency(item.totalPrice ?? item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="order-success-totals">
              <div>
                <span>Subtotal</span>
                <strong>{formatCurrency(order.totals.subtotal)}</strong>
              </div>
              <div>
                <span>Delivery</span>
                <strong>{formatDeliveryFee(order.totals.deliveryFee)}</strong>
              </div>
              <div className="order-success-total">
                <span>Total</span>
                <strong>{formatCurrency(order.totals.total)}</strong>
              </div>
            </div>
          </aside>
        </div>

        <div className="order-success-actions">
          {supportWhatsappUrl ? (
            <a href={supportWhatsappUrl} rel="noopener noreferrer" target="_blank">
              <MessageCircle size={18} />
              Consultar por WhatsApp
            </a>
          ) : (
            <button disabled type="button">
              <MessageCircle size={18} />
              WhatsApp de soporte pendiente
            </button>
          )}
          <button className="primary" onClick={onNewOrder} type="button">
            <Clock3 size={18} />
            Hacer otro pedido
          </button>
          <button onClick={onBackToStore} type="button">
            Seguir viendo productos
          </button>
          {onDeleteStoredReceipt && (
            <button className="danger" onClick={onDeleteStoredReceipt} type="button">
              Eliminar comprobante de este celular
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default OrderSuccessReceipt;
