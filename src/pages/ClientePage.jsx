import { Clock3, MapPin, Search, ShieldCheck, ShoppingCart, Sparkles, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Cart from "../components/Cart";
import CategoryPill from "../components/CategoryPill";
import ProductCard from "../components/ProductCard";
import { clientCategories } from "../data/categories";
import { products } from "../data/products";
import { getActiveCategories } from "../services/categoriesService";
import { createOrder } from "../services/ordersService";
import { getAvailableProducts } from "../services/productsService";

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
  const [catalogCategories, setCatalogCategories] = useState(clientCategories);
  const [catalogProducts, setCatalogProducts] = useState(products);
  const [catalogNotice, setCatalogNotice] = useState("");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const [remoteCategories, remoteProducts] = await Promise.all([
          getActiveCategories(),
          getAvailableProducts(),
        ]);

        if (!isMounted) {
          return;
        }

        if (!remoteCategories.length || !remoteProducts.length) {
          setCatalogCategories(clientCategories);
          setCatalogProducts(products);
          setCatalogNotice("Mostrando catálogo inicial mientras se activa Supabase.");
          return;
        }

        setCatalogCategories(remoteCategories);
        setCatalogProducts(remoteProducts);
        setCatalogNotice("");
      } catch (error) {
        console.error("Usando catálogo local por fallback:", error);

        if (isMounted) {
          setCatalogCategories(clientCategories);
          setCatalogProducts(products);
          setCatalogNotice("Mostrando catálogo inicial mientras se activa Supabase.");
        }
      }
    }

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const text = query.toLowerCase().trim();
    return catalogProducts.filter(
      (product) =>
        (activeCategory === "all" || product.category === activeCategory) &&
        (!text ||
          product.name.toLowerCase().includes(text) ||
          (product.description ?? "").toLowerCase().includes(text)),
    );
  }, [activeCategory, catalogProducts, query]);

  function addProduct(product) {
    setFeedback(null);
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

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const order = await createOrder({ form, items });
      setItems([]);
      setForm(initialForm);
      setFeedback({
        type: "success",
        message: `Pedido ${order.orderCode} enviado correctamente. Pronto lo confirmaremos.`,
      });
    } catch (error) {
      console.error("No se pudo enviar el pedido:", error);
      setFeedback({
        type: "error",
        message: error.message || "No pudimos enviar tu pedido. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-sand-50 via-white to-sand-50">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-200/25 blur-3xl" />
      <div className="page-container relative pb-14 pt-6 sm:pt-8">
        <section className="relative overflow-hidden rounded-[2.3rem] bg-ocean-950 px-5 py-6 text-white shadow-2xl shadow-ocean-950/20 sm:px-8 sm:py-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-delivery/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 hidden h-full w-1/2 bg-[radial-gradient(circle_at_70%_45%,rgba(255,255,255,0.18),transparent_34%)] lg:block" />

          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-delivery ring-1 ring-white/10">
                Tienda abierta ahora
              </p>
              <h1 className="mt-5 max-w-2xl font-display text-3xl font-black tracking-tight sm:text-5xl">
                Pedí tus esenciales de Paracas en minutos
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">
                Bebidas frías, comida rápida, snacks y promos directo a tu hotel, Airbnb o
                casa.
              </p>

              <label className="mt-6 flex h-14 max-w-xl items-center gap-3 rounded-2xl bg-white px-4 text-slate-400 shadow-xl shadow-ocean-950/10">
                <Search size={20} />
                <input
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar bebidas, comida, snacks..."
                  type="search"
                  value={query}
                />
              </label>

              <div className="mt-5 grid grid-cols-3 gap-2 text-xs font-bold text-blue-100 sm:max-w-xl">
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                  <Clock3 className="mb-2 text-delivery" size={18} />
                  Rápido
                </div>
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                  <MapPin className="mb-2 text-delivery" size={18} />
                  Local
                </div>
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                  <ShieldCheck className="mb-2 text-delivery" size={18} />
                  Confiable
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] bg-white p-4 text-ocean-950 shadow-2xl shadow-ocean-950/20">
                <div className="rounded-[1.6rem] bg-gradient-to-br from-sand-50 to-cyan-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ocean-500">
                        Promo del día
                      </p>
                      <h2 className="mt-1 font-display text-xl font-black">Combos listos</h2>
                    </div>
                    <span className="rounded-full bg-ocean-900 px-3 py-1.5 text-xs font-black text-delivery">
                      Hoy
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {catalogProducts
                      .filter((product) => product.category === "promo-dia")
                      .slice(0, 3)
                      .map((product) => (
                        <div
                          className="rounded-2xl bg-white p-2 text-center shadow-sm"
                          key={product.id}
                        >
                          <div
                            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-xs font-black text-ocean-900 ${product.colors}`}
                          >
                            {product.visual}
                          </div>
                          <p className="mt-2 truncate text-[11px] font-extrabold">
                            {product.name}
                          </p>
                        </div>
                      ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-ocean-950 p-4 text-white">
                    <div>
                      <p className="text-xs text-blue-100">Delivery activo</p>
                      <p className="font-display text-lg font-black">Desde S/ 5</p>
                    </div>
                    <Truck className="text-delivery" size={28} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {[allCategory, ...catalogCategories].map((category) => (
            <CategoryPill
              active={activeCategory === category.id}
              category={category}
              compact
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </div>
        {catalogNotice && (
          <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            {catalogNotice}
          </div>
        )}

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_390px]">
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-delivery-dark" size={20} />
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-ocean-600">
                    Catálogo
                  </p>
                </div>
                <h2 className="mt-1 font-display text-2xl font-black text-ocean-950">
                  Productos destacados
                </h2>
              </div>
              <p className="rounded-full bg-white px-3 py-2 text-sm font-extrabold text-slate-500 shadow-sm">
                {filteredProducts.length} productos
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} onAdd={addProduct} product={product} />
              ))}
            </div>
            {!filteredProducts.length && (
              <div className="rounded-[2rem] border border-white bg-white p-10 text-center text-slate-500 shadow-sm">
                No encontramos productos para tu búsqueda.
              </div>
            )}
          </section>

          <div className="lg:sticky lg:top-25">
            <Cart
              form={form}
              feedback={feedback}
              isSubmitting={isSubmitting}
              items={items}
              onFormChange={(event) =>
                setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
              }
              onQuantityChange={changeQuantity}
              onRemove={(id) => setItems((current) => current.filter((item) => item.id !== id))}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        {!!items.length && (
          <a
            className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-delivery px-5 py-3 font-bold text-ocean-950 shadow-lg shadow-ocean-900/20 lg:hidden"
            href="#cart"
          >
            <ShoppingCart size={19} />
            Ver carrito ({items.reduce((total, item) => total + item.quantity, 0)})
          </a>
        )}
      </div>
    </div>
  );
}

export default ClientePage;
