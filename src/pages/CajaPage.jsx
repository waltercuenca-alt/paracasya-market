import { CheckCheck, Clock3, Coins, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import OrderCard from "../components/OrderCard";
import { getOrders, updateOrderStatus } from "../services/ordersService";
import { formatCurrency } from "../utils/currency";

function CajaPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      setOrders(await getOrders());
    } catch (error) {
      console.error("No se pudieron cargar los pedidos:", error);
      setErrorMessage(error.message || "No pudimos cargar los pedidos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const metrics = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(
      (order) => order.createdAt && new Date(order.createdAt).toDateString() === today,
    );

    return {
      pending: orders.filter((order) => !["Entregado", "Cancelado"].includes(order.status)).length,
      delivered: todayOrders.filter((order) => order.status === "Entregado").length,
      sales: todayOrders
        .filter((order) => order.status !== "Cancelado")
        .reduce((total, order) => total + order.total, 0),
    };
  }, [orders]);

  async function changeStatus(id, status) {
    setUpdatingOrderId(id);
    setErrorMessage("");

    try {
      await updateOrderStatus(id, status);
      setOrders((current) =>
        current.map((order) => (order.id === id ? { ...order, status } : order)),
      );
    } catch (error) {
      console.error("No se pudo actualizar el pedido:", error);
      setErrorMessage(error.message || "No pudimos actualizar el estado.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const summary = [
    {
      title: "Pedidos pendientes",
      value: metrics.pending,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      title: "Entregados hoy",
      value: metrics.delivered,
      icon: CheckCheck,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Vendido hoy",
      value: formatCurrency(metrics.sales),
      icon: Coins,
      tone: "bg-cyan-50 text-ocean-700",
    },
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
        <button className="button-secondary gap-2" onClick={loadOrders} type="button">
          <RefreshCw className={isLoading ? "animate-spin" : ""} size={17} />
          Actualizar
        </button>
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
          <h2 className="font-display text-xl font-bold text-ocean-950">Pedidos recientes</h2>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-500 shadow-sm">
            {orders.length} pedidos
          </span>
        </div>
        {errorMessage && (
          <div
            aria-live="polite"
            className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
          >
            {errorMessage}
          </div>
        )}
        {isLoading && !orders.length && (
          <div className="card p-10 text-center text-slate-500">Cargando pedidos...</div>
        )}
        {!isLoading && !orders.length && !errorMessage && (
          <div className="card p-10 text-center text-slate-500">
            Todavía no hay pedidos registrados.
          </div>
        )}
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard
              isUpdating={updatingOrderId === order.id}
              key={order.id}
              onStatusChange={changeStatus}
              order={order}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default CajaPage;
