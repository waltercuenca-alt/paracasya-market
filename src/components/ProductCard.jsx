import { Plus } from "lucide-react";
import { formatCurrency } from "../utils/currency";

function ProductCard({ product, onAdd }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.7rem] border border-white bg-white p-2.5 shadow-sm shadow-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ocean-900/10">
      <div
        className={`relative flex h-34 items-center justify-center overflow-hidden rounded-[1.35rem] bg-gradient-to-br ${product.colors}`}
      >
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/35 blur-xl" />
        <div className="absolute -bottom-8 left-4 h-20 w-20 rounded-full bg-white/30 blur-lg" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-white/75 font-display text-3xl font-black text-ocean-900/70 shadow-inner">
          {product.visual}
        </span>
        {product.tag && (
          <span className="absolute left-3 top-3 rounded-full bg-ocean-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
            {product.tag}
          </span>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-extrabold text-ocean-800 shadow-sm">
          Stock
        </span>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <h3 className="font-display text-[15px] font-extrabold leading-tight text-ocean-950">
          {product.name}
        </h3>
        <p className="mt-1.5 min-h-10 flex-1 text-xs leading-relaxed text-slate-500">
          {product.description}
        </p>
        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Precio
            </p>
            <p className="font-display text-lg font-black text-ocean-950">
              {formatCurrency(product.price)}
            </p>
          </div>
          <button
            aria-label={`Agregar ${product.name}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ocean-900 text-delivery shadow-lg shadow-ocean-900/20 transition hover:scale-105 hover:bg-ocean-950 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            disabled={!product.available}
            onClick={() => onAdd(product)}
            type="button"
          >
            {product.available ? (
              <Plus size={18} strokeWidth={3} />
            ) : (
              <span className="text-[10px] font-black">OFF</span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
