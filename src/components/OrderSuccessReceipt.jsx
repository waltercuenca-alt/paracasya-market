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
import { useMemo, useState } from "react";
import { formatCurrency } from "../utils/currency";

const supportWhatsappNumber = "";

const receiptSteps = [
  { icon: CheckCircle2, label: "Pedido recibido", active: true },
  { icon: MessageCircle, label: "Confirmacion por WhatsApp", active: false },
  { icon: PackageCheck, label: "Preparacion", active: false },
  { icon: Truck, label: "Entrega", active: false },
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

function OrderSuccessReceipt({ order, onNewOrder, onBackToStore, onDeleteStoredReceipt }) {
  const [copyLabel, setCopyLabel] = useState("Copiar codigo");

  const supportWhatsappUrl = useMemo(
    () => buildSupportWhatsappUrl(order?.orderCode),
    [order?.orderCode],
  );

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

        <div className="order-success-steps">
          {receiptSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div className={step.active ? "active" : ""} key={step.label}>
                <span>
                  <Icon size={16} />
                </span>
                <p>{step.label}</p>
              </div>
            );
          })}
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
