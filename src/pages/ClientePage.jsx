import { Search, ShoppingCart, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import Cart from "../components/Cart";
import CategoryPill from "../components/CategoryPill";
import ProductCard from "../components/ProductCard";
import { categories } from "../data/categories";
import { products } from "../data/products";

const allCategory = { id: "all", name: "Todos", short: "ALL", tone: "from-cyan-300 to-blue-500" };
const initialForm = {
  name: "",
  whatsapp: "",
  address: "",
  reference: "",
  payment: "Yape",
};

function ClientePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [sent, setSent] = useState(false);

  const filteredProducts = useMemo(() => {
    const text = query.toLowerCase().trim();
    return products.filter(
      (product) =>
        (activeCategory === "all" || product.category === activeCategory) &&
        (!text ||
          product.name.toLowerCase().includes(text) ||
          product.description.toLowerCase().includes(text)),
    );
  }, [activeCategory, query]);

  function addProduct(product) {
    setSent(false);
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...current, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(id, amount) {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(item.quantity + amount, 0) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <div className="page-container pb-14 pt-8 sm:pt-10">
      <div className="rounded-[2rem] bg-ocean-950 px-5 py-7 text-white sm:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="eyebrow bg-white/10 text-delivery ring-white/10">
              Tienda abierta ahora
            </p>
            <h1 className="mt-4 font-display text-3xl font-extrabold">¿Qué necesitas hoy?</h1>
            <p className="mt-2 text-blue-100">Delivery a tu hotel, Airbnb o domicilio en Paracas.</p>
          </div>
          <label className="flex h-14 items-center gap-3 rounded-2xl bg-white px-4 text-slate-400 md:w-80">
            <Search size={20} />
            <input
              className="w-full bg-transparent text-sm text-slate-700 outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar productos..."
              type="search"
              value={query}
            />
          </label>
        </div>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-6 sm:mx-0 sm:px-0">
        {[allCategory, ...categories].map((category) => (
          <CategoryPill
            active={activeCategory === category.id}
            category={category}
            compact
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
          />
        ))}
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_370px]">
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-delivery-dark" size={20} />
              <h2 className="font-display text-xl font-bold text-ocean-950">
                Productos destacados
              </h2>
            </div>
            <p className="hidden text-sm text-slate-400 sm:block">
              {filteredProducts.length} productos
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} onAdd={addProduct} product={product} />
            ))}
          </div>
          {!filteredProducts.length && (
            <div className="card p-10 text-center text-slate-500">
              No encontramos productos para tu búsqueda.
            </div>
          )}
        </section>

        <div className="lg:sticky lg:top-25">
          <Cart
            form={form}
            items={items}
            onFormChange={(event) =>
              setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
            }
            onQuantityChange={changeQuantity}
            onRemove={(id) => setItems((current) => current.filter((item) => item.id !== id))}
            onSubmit={handleSubmit}
            sent={sent}
          />
        </div>
      </div>

      {!!items.length && (
        <a className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-delivery px-5 py-3 font-bold text-ocean-950 shadow-lg lg:hidden" href="#cart">
          <ShoppingCart size={19} />
          Ver carrito ({items.reduce((total, item) => total + item.quantity, 0)})
        </a>
      )}
    </div>
  );
}

export default ClientePage;
