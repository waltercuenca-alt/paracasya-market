function CategoryPill({ category, active = false, onClick, compact = false }) {
  return (
    <button
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
        active
          ? "border-ocean-900 bg-ocean-900 text-white shadow-md"
          : "border-slate-200 bg-white text-slate-600 hover:border-ocean-200 hover:text-ocean-900"
      }`}
      onClick={onClick}
      type="button"
    >
      {!compact && (
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-extrabold ${category.tone} ${
            active ? "text-white" : "text-ocean-900"
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
