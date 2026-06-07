import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency } from "../utils/currency";

function ProductCard({ product, onAdd }) {
  const [imageFailed, setImageFailed] = useState(false);
  const isAvailable = product.available ?? product.isAvailable ?? true;
  const isFeatured = Boolean(product.isFeatured || product.tag === "Destacado");
  const isPromo = product.category === "promo-dia" || product.name?.toLowerCase().includes("promo");
  const hasImage = Boolean(product.imageUrl && !imageFailed);
  const badges = [
    !isAvailable ? "No disponible" : null,
    isAvailable && isFeatured ? "Popular" : null,
    isAvailable && isPromo ? "Promo" : null,
  ].filter(Boolean);

  useEffect(() => {
    setImageFailed(false);
  }, [product.imageUrl]);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white bg-white p-2.5 shadow-[0_18px_45px_rgba(15,42,68,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,42,68,0.14)]">
      <div
        className={`relative flex h-40 items-center justify-center overflow-hidden rounded-[1.6rem] bg-gradient-to-br sm:h-44 ${product.colors}`}
      >
        <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/35 blur-xl" />
        <div className="absolute -bottom-10 left-4 h-24 w-24 rounded-full bg-white/30 blur-lg" />
        {hasImage ? (
          <img
            alt={product.name}
            className="relative h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={product.imageUrl}
          />
        ) : (
          <span className="relative flex h-24 w-24 items-center justify-center rounded-[1.7rem] bg-white/75 font-display text-4xl font-black text-ocean-900/70 shadow-inner">
            {product.visual}
          </span>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide shadow-sm ${
                badge === "No disponible"
                  ? "bg-slate-900 text-white"
                  : "bg-delivery text-ocean-950"
              }`}
              key={badge}
            >
              {badge}
            </span>
          ))}
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold text-ocean-800 shadow-sm backdrop-blur">
          Listo para pedir
        </span>
      </div>

      <div className="flex flex-1 flex-col px-2.5 pb-2 pt-4">
        <h3 className="font-display text-base font-black leading-tight text-ocean-950">
          {product.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-10 flex-1 text-xs leading-relaxed text-slate-500">
          {product.description}
        </p>
        <div className="mt-4 rounded-[1.25rem] bg-sand-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Precio
          </p>
          <p className="font-display text-2xl font-black text-ocean-950">
            {formatCurrency(product.price)}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
              <Plus size={18} strokeWidth={3} />
            </span>
          </div>
          <button
            aria-label={`Agregar ${product.name}`}
            className="flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-ocean-900 px-4 text-sm font-black text-delivery shadow-lg shadow-ocean-900/20 transition hover:scale-[1.02] hover:bg-ocean-950 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            disabled={!isAvailable}
            onClick={() => onAdd(product)}
            type="button"
          >
            {isAvailable ? "Agregar" : "Agotado"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
