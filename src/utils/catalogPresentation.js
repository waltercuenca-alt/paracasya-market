export const categoryPresentation = {
  bebidas: {
    short: "BE",
    tone: "from-cyan-400 to-blue-600",
    productColors: "from-cyan-100 to-blue-200",
  },
  comida: {
    short: "CR",
    tone: "from-orange-400 to-red-500",
    productColors: "from-orange-100 to-red-200",
  },
  snacks: {
    short: "SN",
    tone: "from-amber-300 to-orange-500",
    productColors: "from-amber-100 to-orange-200",
  },
  "promo-dia": {
    short: "PD",
    tone: "from-rose-400 to-orange-500",
    productColors: "from-rose-100 to-orange-200",
  },
};

export function getCategoryPresentation(slug) {
  return (
    categoryPresentation[slug] ?? {
      short: String(slug ?? "CT").slice(0, 2).toUpperCase(),
      tone: "from-slate-200 to-slate-400",
      productColors: "from-slate-100 to-slate-200",
    }
  );
}

export function getProductVisual(name) {
  return String(name ?? "PY")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
