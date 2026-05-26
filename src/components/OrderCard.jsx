import { MapPin, MessageCircle, ReceiptText } from "lucide-react";
import { statusOptions } from "../data/orders";
import { formatCurrency } from "../utils/currency";
import StatusBadge from "./StatusBadge";

function OrderCard({ order, onStatusChange }) {
  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold text-ocean-950">{order.id}</h3>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-700">{order.customer}</p>
          <p className="text-xs text-slate-400">{order.time}</p>
        </div>
        <p className="font-display text-xl font-extrabold text-ocean-900">
          {formatCurrency(order.total)}
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl bg-sand-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
        <div className="flex gap-2">
          <ReceiptText className="mt-0.5 shrink-0 text-ocean-500" size={16} />
          <p>{order.items.join(" + ")}</p>
        </div>
        <div className="flex gap-2">
          <MapPin className="mt-0.5 shrink-0 text-ocean-500" size={16} />
          <p>{order.destination}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {statusOptions.map((status) => (
          <button
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition ${
              order.status === status
                ? "bg-ocean-900 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-ocean-50 hover:text-ocean-900"
            }`}
            key={status}
            onClick={() => onStatusChange(order.id, status)}
            type="button"
          >
            {status}
          </button>
        ))}
      </div>
      <button className="button-secondary mt-4 w-full gap-2 py-3 sm:w-auto" type="button">
        <MessageCircle size={17} />
        Enviar WhatsApp
      </button>
    </article>
  );
}

export default OrderCard;
