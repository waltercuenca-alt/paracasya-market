import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/currency";
import { calculateOrderTotals } from "../utils/orderTotals";

function Cart({
  items,
  form,
  onFormChange,
  onQuantityChange,
  onRemove,
  onSubmit,
  feedback,
  isSubmitting,
  orderOrigin,
  storeSettings,
}) {
  const { subtotal, deliveryFee, total } = calculateOrderTotals(items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isStoreOpen = storeSettings?.storeOpen ?? true;

  return (
    <aside
      className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-xl shadow-ocean-950/8"
      id="cart"
    >
      <div className="relative overflow-hidden bg-ocean-950 px-5 py-5 text-white">
        <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-delivery/15 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-delivery ring-1 ring-white/10">
            <ShoppingBag size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold">Tu pedido</h2>
            <p className="text-xs text-blue-100">Delivery rápido en Paracas</p>
          </div>
          <span className="rounded-full bg-delivery px-3 py-1.5 text-xs font-black text-ocean-950">
            {itemCount} items
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-blue-100">
          {["Carrito", "Datos", "Confirmar"].map((step, index) => (
            <div className="rounded-full bg-white/10 px-2 py-2 ring-1 ring-white/10" key={step}>
              {index + 1}. {step}
            </div>
          ))}
        </div>
      </div>

      <div className="max-h-[390px] space-y-3 overflow-y-auto p-5">
        {items.length === 0 && (
          <div className="rounded-[1.5rem] border border-dashed border-ocean-100 bg-sand-50 p-6 text-center text-sm text-slate-500">
            <ShoppingBag className="mx-auto mb-3 text-ocean-300" size={30} />
            <p className="font-display text-lg font-black text-ocean-950">Tu bolsa está vacía</p>
            <p className="mt-1 text-sm leading-relaxed">
              Agregá bebidas, snacks o promos y armamos tu pedido en minutos.
            </p>
          </div>
        )}
        {items.map((item) => (
          <div
            className="flex items-start gap-3 rounded-[1.35rem] border border-slate-100 bg-white p-3 shadow-sm shadow-slate-100"
            key={item.id}
          >
            {item.imageUrl ? (
              <img
                alt={item.name}
                className="h-12 w-12 shrink-0 rounded-2xl object-cover"
                loading="lazy"
                src={item.imageUrl}
              />
            ) : (
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xs font-black text-ocean-900 ${item.colors}`}
              >
                {item.visual}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ocean-950">{item.name}</p>
              <p className="text-xs font-bold text-ocean-700">{formatCurrency(item.price)}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  aria-label="Reducir cantidad"
                  className="quantity-button"
                  onClick={() => onQuantityChange(item.id, -1)}
                  type="button"
                >
                  <Minus size={13} />
                </button>
                <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                <button
                  aria-label="Aumentar cantidad"
                  className="quantity-button"
                  onClick={() => onQuantityChange(item.id, 1)}
                  type="button"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
            <button
              aria-label="Eliminar producto"
              className="rounded-full p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
              onClick={() => onRemove(item.id)}
              type="button"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      <form className="border-t border-slate-100 p-5" onSubmit={onSubmit}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500" size={18} />
          <h3 className="font-display font-bold text-ocean-950">Datos de entrega</h3>
        </div>
        <div className="mt-4 grid gap-3">
          {orderOrigin?.label && (
            <div className="rounded-2xl border border-ocean-100 bg-ocean-50 px-4 py-3 text-sm font-bold text-ocean-800">
              Origen del pedido: {orderOrigin.label}
            </div>
          )}
          <input
            className="input-field"
            name="name"
            onChange={onFormChange}
            placeholder="Nombre"
            required
            value={form.name}
          />
          <input
            className="input-field"
            name="whatsapp"
            onChange={onFormChange}
            placeholder="WhatsApp"
            required
            value={form.whatsapp}
          />
          <input
            className="input-field"
            name="address"
            onChange={onFormChange}
            placeholder="Hotel / Airbnb / Dirección"
            required
            value={form.address}
          />
          <input
            className="input-field"
            name="reference"
            onChange={onFormChange}
            placeholder="Habitación o referencia"
            value={form.reference}
          />
          <div className="grid grid-cols-2 gap-2">
            {["Yape", "Efectivo"].map((method) => (
              <label
                className={`cursor-pointer rounded-2xl border px-3 py-3 text-center text-sm font-bold transition ${
                  form.payment === method
                    ? "border-ocean-900 bg-ocean-50 text-ocean-900 shadow-sm"
                    : "border-slate-200 text-slate-500 hover:border-ocean-100"
                }`}
                key={method}
              >
                <input
                  checked={form.payment === method}
                  className="sr-only"
                  name="payment"
                  onChange={onFormChange}
                  type="radio"
                  value={method}
                />
                {method}
              </label>
            ))}
          </div>
        </div>

        <div className="my-5 space-y-2 rounded-[1.35rem] bg-sand-50 p-4 text-sm">
          <div className="flex justify-between font-semibold text-slate-500">
            <span>Productos</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Delivery</span>
            <span>{items.length ? formatCurrency(deliveryFee) : "-"}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 font-display text-xl font-black text-ocean-950">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {!isStoreOpen && (
          <div className="mb-4 rounded-[1.35rem] border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-display text-base font-black text-ocean-950">Tienda cerrada</p>
            <p className="mt-1 leading-relaxed">{storeSettings.closedMessage}</p>
            <p className="mt-2 font-bold text-ocean-800">{storeSettings.openingHours}</p>
          </div>
        )}

        <button
          className="button-primary w-full rounded-2xl py-4 text-base"
          disabled={!items.length || isSubmitting || !isStoreOpen}
          type="submit"
        >
          {!isStoreOpen
            ? "Tienda cerrada"
            : isSubmitting
              ? "Enviando pedido..."
              : "Continuar pedido"}
        </button>
        {feedback && (
          <p
            aria-live="polite"
            className={`mt-3 rounded-xl p-3 text-center text-sm font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {feedback.message}
          </p>
        )}
      </form>
    </aside>
  );
}

export default Cart;
