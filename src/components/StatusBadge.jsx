const variants = {
  Pendiente: "bg-amber-50 text-amber-700 ring-amber-200",
  Confirmado: "bg-blue-50 text-blue-700 ring-blue-200",
  Preparando: "bg-violet-50 text-violet-700 ring-violet-200",
  "En camino": "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Entregado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Cancelado: "bg-rose-50 text-rose-700 ring-rose-200",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
        variants[status] ?? variants.Pendiente
      }`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
