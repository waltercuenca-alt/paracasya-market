import { CheckCircle2, ClipboardList, MapPin, MessageCircle, ShoppingBag } from "lucide-react";
import { formatCurrency } from "../utils/currency";

function ReceiptLine({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-right font-bold text-ocean-950">{value}</span>
    </div>
  );
}

function OrderSuccessReceipt({ order, onNewOrder, onBackToStore }) {
  if (!order) {
    return null;
  }

  return (
    <section className="mb-7 overflow-hidden rounded-[2.2rem] border border-emerald-100 bg-white shadow-2xl shadow-ocean-950/10">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-ocean-700 to-ocean-950 px-5 py-7 text-white sm:px-7">
        <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-delivery/25 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-white text-emerald-600 shadow-lg shadow-ocean-950/20">
              <CheckCircle2 size={31} strokeWidth={2.6} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-delivery">
                Confirmacion
              </p>
              <h2 className="mt-2 font-display text-3xl font-black">Pedido recibido</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50">
                Ya registramos tu pedido. Te confirmaremos por WhatsApp en breve.
              </p>
            </div>
          </div>
          <div className="rounded-[1.4rem] bg-white/12 px-4 py-3 ring-1 ring-white/15">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">
              Codigo de pedido
            </p>
            <p className="mt-1 font-display text-xl font-black text-delivery">{order.orderCode}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {order.originLabel && (
            <div className="rounded-[1.4rem] border border-ocean-100 bg-ocean-50 px-4 py-3 text-sm font-bold text-ocean-800">
              Pedido asociado a: <span className="text-ocean-950">{order.originLabel}</span>
            </div>
          )}

          <div className="rounded-[1.6rem] border border-slate-100 bg-slate-50/70 p-4">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="text-ocean-600" size={18} />
              <h3 className="font-display text-lg font-black text-ocean-950">
                Datos de entrega
              </h3>
            </div>
            <ReceiptLine label="Cliente" value={order.customerName} />
            <ReceiptLine label="WhatsApp" value={order.customerPhone} />
            <ReceiptLine label="Destino" value={order.address} />
            <ReceiptLine label="Habitacion / referencia" value={order.reference} />
            <ReceiptLine label="Metodo de pago" value={order.paymentMethod} />
          </div>

          <div className="rounded-[1.6rem] border border-slate-100 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardList className="text-ocean-600" size={18} />
              <h3 className="font-display text-lg font-black text-ocean-950">
                Resumen del pedido
              </h3>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  className="flex justify-between gap-3 rounded-2xl bg-sand-50 px-3 py-2 text-sm"
                  key={`${item.id}-${item.name}`}
                >
                  <span className="font-bold text-ocean-950">
                    {item.quantity} x {item.name}
                  </span>
                  <span className="font-black text-ocean-800">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-[1.8rem] bg-ocean-950 p-5 text-white shadow-xl shadow-ocean-950/15">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-delivery" size={20} />
            <h3 className="font-display text-lg font-black">Total confirmado</h3>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-blue-100">
              <span>Subtotal</span>
              <span>{formatCurrency(order.totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-blue-100">
              <span>Delivery</span>
              <span>{formatCurrency(order.totals.deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-white/15 pt-4 font-display text-3xl font-black text-delivery">
              <span>Total</span>
              <span>{formatCurrency(order.totals.total)}</span>
            </div>
          </div>

          <div className="mt-5 rounded-[1.3rem] bg-white/10 p-4 text-sm leading-relaxed text-blue-50 ring-1 ring-white/10">
            Lo enviaremos al hotel, habitacion o direccion indicada una vez confirmado.
          </div>
          <div className="mt-3 rounded-[1.3rem] border border-delivery/30 bg-delivery/15 p-4 text-sm font-bold leading-relaxed text-delivery">
            No pagues hasta recibir la confirmacion del equipo de ParacasYa Market.
          </div>

          <div className="mt-5 grid gap-2">
            <button className="button-primary rounded-2xl py-3" onClick={onNewOrder} type="button">
              <MessageCircle size={18} />
              Hacer otro pedido
            </button>
            <button
              className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15"
              onClick={onBackToStore}
              type="button"
            >
              Volver a la tienda
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default OrderSuccessReceipt;
