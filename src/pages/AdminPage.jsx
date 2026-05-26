import { Bike, Plus, Settings2, Store } from "lucide-react";
import { useState } from "react";
import AdminProductRow from "../components/AdminProductRow";
import { products as initialProducts } from "../data/products";

function ToggleCard({ icon: Icon, label, active, activeLabel, inactiveLabel, onToggle }) {
  return (
    <button
      className="card flex items-center justify-between gap-4 p-4 text-left transition hover:border-ocean-100"
      onClick={onToggle}
      type="button"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700">
          <Icon size={20} />
        </span>
        <span>
          <span className="block text-sm font-semibold text-ocean-950">{label}</span>
          <span className="block text-xs text-slate-400">
            {active ? activeLabel : inactiveLabel}
          </span>
        </span>
      </span>
      <span className={`toggle ${active ? "bg-ocean-900" : "bg-slate-200"}`}>
        <span className={active ? "translate-x-5" : "translate-x-0"} />
      </span>
    </button>
  );
}

function AdminPage() {
  const [products, setProducts] = useState(initialProducts);
  const [storeOpen, setStoreOpen] = useState(true);
  const [deliveryActive, setDeliveryActive] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState("5.00");

  function toggleAvailability(id) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, available: !product.available } : product,
      ),
    );
  }

  return (
    <div className="page-container pb-14 pt-8 sm:pt-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Administración</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ocean-950">
            Catálogo y tienda
          </h1>
          <p className="mt-2 text-slate-500">Gestiona disponibilidad, delivery y productos.</p>
        </div>
        <button className="button-primary" type="button">
          <Plus size={18} />
          Nuevo producto
        </button>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Settings2 className="text-ocean-600" size={19} />
          <h2 className="font-display text-lg font-bold text-ocean-950">Configuración rápida</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <ToggleCard
            active={storeOpen}
            activeLabel="Abierta para pedidos"
            icon={Store}
            inactiveLabel="No recibe pedidos"
            label="Tienda"
            onToggle={() => setStoreOpen((current) => !current)}
          />
          <ToggleCard
            active={deliveryActive}
            activeLabel="Repartos activos"
            icon={Bike}
            inactiveLabel="Repartos pausados"
            label="Delivery"
            onToggle={() => setDeliveryActive((current) => !current)}
          />
          <label className="card flex items-center justify-between gap-3 p-4">
            <span>
              <span className="block text-sm font-semibold text-ocean-950">Tarifa de delivery</span>
              <span className="block text-xs text-slate-400">Monto base actual</span>
            </span>
            <span className="flex items-center rounded-xl bg-sand-50 px-3 py-2 font-bold text-ocean-900">
              S/
              <input
                className="ml-2 w-14 bg-transparent text-right outline-none"
                min="0"
                onChange={(event) => setDeliveryFee(event.target.value)}
                step="0.5"
                type="number"
                value={deliveryFee}
              />
            </span>
          </label>
        </div>
      </section>

      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ocean-950">Productos</h2>
          <p className="text-sm text-slate-400">{products.length} registrados</p>
        </div>
        <div className="card overflow-hidden">
          {products.map((product) => (
            <AdminProductRow key={product.id} onToggle={toggleAvailability} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
