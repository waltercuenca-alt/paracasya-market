import { PencilLine } from "lucide-react";
import { categories } from "../data/categories";
import { formatCurrency } from "../utils/currency";

function AdminProductRow({ product, onToggle }) {
  const categoryName = categories.find((category) => category.id === product.category)?.name;

  return (
    <div className="grid gap-4 border-b border-slate-100 px-4 py-4 last:border-none sm:grid-cols-[2fr_1fr_auto_auto] sm:items-center">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-ocean-900 ${product.colors}`}
        >
          {product.visual}
        </div>
        <div>
          <p className="font-semibold text-ocean-950">{product.name}</p>
          <p className="text-xs text-slate-500">{categoryName}</p>
        </div>
      </div>
      <p className="font-display font-bold text-ocean-900">{formatCurrency(product.price)}</p>
      <button
        className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
          product.available
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-500"
        }`}
        onClick={() => onToggle(product.id)}
        type="button"
      >
        {product.available ? "Disponible" : "No disponible"}
      </button>
      <button className="button-secondary w-fit gap-1.5 px-3 py-2 text-xs" type="button">
        <PencilLine size={14} />
        Editar
      </button>
    </div>
  );
}

export default AdminProductRow;
