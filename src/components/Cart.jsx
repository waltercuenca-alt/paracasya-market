import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
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
}) {
  const { subtotal, deliveryFee, total } = calculateOrderTotals(items);

  return (
    <aside className="card overflow-hidden" id="cart">
      <div className="border-b border-slate-100 bg-ocean-950 px-5 py-5 text-white">
        <div className="flex items-center gap-3">
          <ShoppingBag className="text-delivery" size={22} />
          <div>
            <h2 className="font-display text-lg font-bold">Tu pedido</h2>
            <p className="text-xs text-blue-100">Delivery rápido en Paracas</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {items.length === 0 && (
          <div className="rounded-2xl bg-sand-100 p-6 text-center text-sm text-slate-500">
            Agrega productos para comenzar tu pedido.
          </div>
        )}
        {items.map((item) => (
          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3" key={item.id}>
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-ocean-900 ${item.colors}`}
            >
              {item.visual}
            </div>
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
              className="text-slate-400 transition hover:text-rose-500"
              onClick={() => onRemove(item.id)}
              type="button"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      <form className="border-t border-slate-100 p-5" onSubmit={onSubmit}>
        <h3 className="font-display font-bold text-ocean-950">Datos de entrega</h3>
        <div className="mt-4 grid gap-3">
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
                className={`cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-bold transition ${
                  form.payment === method
                    ? "border-ocean-900 bg-ocean-50 text-ocean-900"
                    : "border-slate-200 text-slate-500"
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
        <div className="my-5 space-y-2 border-y border-dashed border-slate-200 py-4 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Delivery</span>
            <span>{items.length ? formatCurrency(deliveryFee) : "-"}</span>
          </div>
          <div className="flex justify-between font-display text-base font-bold text-ocean-950">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <button
          className="button-primary w-full"
          disabled={!items.length || isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Enviando pedido..." : "Enviar pedido"}
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
