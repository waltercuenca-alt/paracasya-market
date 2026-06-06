function CategoryPill({ category, active = false, onClick, compact = false }) {
  return (
    <button
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-extrabold transition-all duration-200 ${
        active
          ? "border-ocean-900 bg-ocean-900 text-white shadow-lg shadow-ocean-900/15"
          : "border-white bg-white/85 text-slate-600 shadow-sm shadow-slate-200/60 hover:-translate-y-0.5 hover:border-ocean-100 hover:text-ocean-900"
      }`}
      onClick={onClick}
      type="button"
    >
      {!compact ? (
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-extrabold ${category.tone} ${
            active ? "text-white" : "text-ocean-900"
          }`}
        >
          {category.short}
        </span>
      ) : (
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black ${
            active ? "bg-white/15 text-delivery" : "bg-ocean-50 text-ocean-700"
          }`}
        >
          {category.short}
        </span>
      )}
      {category.name}
    </button>
  );
}

export default CategoryPill;
