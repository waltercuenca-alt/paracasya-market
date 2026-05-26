import { Plus } from "lucide-react";
import { formatCurrency } from "../utils/currency";

function ProductCard({ product, onAdd }) {
  return (
    <article className="card group flex h-full flex-col overflow-hidden p-3">
      <div
        className={`relative flex h-32 items-center justify-center rounded-2xl bg-gradient-to-br ${product.colors}`}
      >
        <span className="font-display text-3xl font-black text-ocean-900/65">{product.visual}</span>
        {product.tag && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ocean-900 shadow-sm">
            {product.tag}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <h3 className="font-display text-base font-bold leading-tight text-ocean-950">{product.name}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-snug text-slate-500">{product.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="font-display text-lg font-extrabold text-ocean-900">
            {formatCurrency(product.price)}
          </p>
          <button
            className="flex items-center gap-1 rounded-xl bg-delivery px-3 py-2 text-sm font-bold text-ocean-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            disabled={!product.available}
            onClick={() => onAdd(product)}
            type="button"
          >
            {product.available ? (
              <>
                <Plus size={16} /> Agregar
              </>
            ) : (
              "Agotado"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
