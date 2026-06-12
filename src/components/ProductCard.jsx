import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency } from "../utils/currency";

function ProductCard({ product, onAdd, compactMobile = false }) {
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
    <article
      className={`group flex h-full flex-col overflow-hidden border border-white bg-white shadow-[0_18px_45px_rgba(15,42,68,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,42,68,0.14)] ${
        compactMobile ? "rounded-[1.5rem] p-2 sm:rounded-[2rem] sm:p-2.5" : "rounded-[2rem] p-2.5"
      }`}
    >
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br sm:h-44 sm:rounded-[1.6rem] ${
          compactMobile ? "h-28 rounded-[1.2rem]" : "h-40 rounded-[1.6rem]"
        } ${product.colors}`}
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
          <span
            className={`relative flex items-center justify-center bg-white/75 font-display font-black text-ocean-900/70 shadow-inner sm:h-24 sm:w-24 sm:rounded-[1.7rem] sm:text-4xl ${
              compactMobile
                ? "h-16 w-16 rounded-[1.2rem] text-2xl"
                : "h-24 w-24 rounded-[1.7rem] text-4xl"
            }`}
          >
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
        <span
          className={`absolute rounded-full bg-white/90 font-extrabold text-ocean-800 shadow-sm backdrop-blur sm:bottom-3 sm:right-3 sm:px-3 sm:py-1 sm:text-[10px] ${
            compactMobile
              ? "bottom-2 right-2 px-2 py-0.5 text-[8px]"
              : "bottom-3 right-3 px-3 py-1 text-[10px]"
          }`}
        >
          Listo para pedir
        </span>
      </div>

      <div
        className={`flex flex-1 flex-col sm:px-2.5 sm:pb-2 sm:pt-4 ${
          compactMobile ? "px-1.5 pb-1 pt-2.5" : "px-2.5 pb-2 pt-4"
        }`}
      >
        <h3
          className={`font-display font-black leading-tight text-ocean-950 sm:text-base ${
            compactMobile ? "text-sm" : "text-base"
          }`}
        >
          {product.name}
        </h3>
        <p
          className={`line-clamp-2 flex-1 leading-relaxed text-slate-500 sm:mt-1.5 sm:min-h-10 sm:text-xs ${
            compactMobile ? "mt-1 min-h-8 text-[10px]" : "mt-1.5 min-h-10 text-xs"
          }`}
        >
          {product.description}
        </p>
        <div
          className={`bg-sand-50 sm:mt-4 sm:rounded-[1.25rem] sm:p-3 ${
            compactMobile ? "mt-2 rounded-xl p-2" : "mt-4 rounded-[1.25rem] p-3"
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Precio
          </p>
          <p
            className={`font-display font-black text-ocean-950 sm:text-2xl ${
              compactMobile ? "text-lg" : "text-2xl"
            }`}
          >
            {formatCurrency(product.price)}
          </p>
        </div>
        <div className={`flex items-center gap-2 sm:mt-3 ${compactMobile ? "mt-2" : "mt-3"}`}>
          <div className={compactMobile ? "hidden sm:block" : ""}>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
              <Plus size={18} strokeWidth={3} />
            </span>
          </div>
          <button
            aria-label={`Agregar ${product.name}`}
            className={`flex flex-1 items-center justify-center bg-ocean-900 font-black text-delivery shadow-lg shadow-ocean-900/20 transition hover:scale-[1.02] hover:bg-ocean-950 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:min-h-12 sm:rounded-2xl sm:px-4 sm:text-sm ${
              compactMobile
                ? "min-h-10 rounded-xl px-3 text-xs"
                : "min-h-12 rounded-2xl px-4 text-sm"
            }`}
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
