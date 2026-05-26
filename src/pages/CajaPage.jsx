import { CheckCheck, Clock3, Coins } from "lucide-react";
import { useMemo, useState } from "react";
import OrderCard from "../components/OrderCard";
import { initialOrders } from "../data/orders";
import { formatCurrency } from "../utils/currency";

function CajaPage() {
  const [orders, setOrders] = useState(initialOrders);

  const metrics = useMemo(
    () => ({
      pending: orders.filter((order) => !["Entregado", "Cancelado"].includes(order.status)).length,
      delivered: orders.filter((order) => order.status === "Entregado").length,
      sales: orders
        .filter((order) => order.status !== "Cancelado")
        .reduce((total, order) => total + order.total, 0),
    }),
    [orders],
  );

  function changeStatus(id, status) {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status } : order)),
    );
  }

  const summary = [
    { title: "Pedidos pendientes", value: metrics.pending, icon: Clock3, tone: "bg-amber-50 text-amber-700" },
    { title: "Entregados", value: metrics.delivered, icon: CheckCheck, tone: "bg-emerald-50 text-emerald-700" },
    { title: "Vendido hoy", value: formatCurrency(metrics.sales), icon: Coins, tone: "bg-cyan-50 text-ocean-700" },
  ];

  return (
    <div className="page-container pb-14 pt-8 sm:pt-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Operaciones</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ocean-950">
            Panel de pedidos
          </h1>
          <p className="mt-2 text-slate-500">Controla entregas y estados en tiempo real.</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
          Tienda abierta
        </div>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {summary.map(({ title, value, icon: Icon, tone }) => (
          <div className="card flex items-center gap-4 p-5" key={title}>
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
              <Icon size={23} />
            </span>
            <div>
              <p className="text-sm text-slate-500">{title}</p>
              <p className="font-display text-2xl font-extrabold text-ocean-950">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-9">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ocean-950">Pedidos de hoy</h2>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-500 shadow-sm">
            {orders.length} pedidos
          </span>
        </div>
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} onStatusChange={changeStatus} order={order} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default CajaPage;
