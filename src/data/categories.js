export const categories = [
  {
    id: "bebidas",
    name: "Bebidas",
    short: "BE",
    tone: "from-cyan-400 to-blue-600",
    visibleInClient: true,
  },
  {
    id: "comida",
    name: "Comida rápida",
    short: "CR",
    tone: "from-orange-400 to-red-500",
    visibleInClient: true,
  },
  {
    id: "snacks",
    name: "Snacks",
    short: "SN",
    tone: "from-amber-300 to-orange-500",
    visibleInClient: true,
  },
  {
    id: "promo-dia",
    name: "Promo del día",
    short: "PD",
    tone: "from-rose-400 to-orange-500",
    visibleInClient: true,
  },
  {
    id: "hielo",
    name: "Hielo",
    short: "HI",
    tone: "from-sky-200 to-cyan-500",
    visibleInClient: false,
  },
  {
    id: "farmacia",
    name: "Farmacia básica",
    short: "FA",
    tone: "from-teal-300 to-emerald-600",
    visibleInClient: false,
  },
  {
    id: "playa",
    name: "Playa",
    short: "PL",
    tone: "from-yellow-300 to-amber-500",
    visibleInClient: false,
  },
  {
    id: "extras",
    name: "Extras útiles",
    short: "EX",
    tone: "from-indigo-300 to-blue-600",
    visibleInClient: false,
  },
  {
    id: "promos",
    name: "Promos rápidas",
    short: "PR",
    tone: "from-rose-400 to-orange-500",
    visibleInClient: false,
  },
];

export const clientCategories = categories.filter((category) => category.visibleInClient);
