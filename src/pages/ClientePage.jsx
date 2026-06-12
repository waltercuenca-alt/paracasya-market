import {
  Clock3,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Cart from "../components/Cart";
import CategoryPill from "../components/CategoryPill";
import OrderSuccessReceipt from "../components/OrderSuccessReceipt";
import ProductCard from "../components/ProductCard";
import { clientCategories } from "../data/categories";
import { products } from "../data/products";
import { getActiveCategories } from "../services/categoriesService";
import { createOrder } from "../services/ordersService";
import { getAvailableProducts } from "../services/productsService";
import { defaultStoreSettings, getStoreSettings } from "../services/storeSettingsService";
import { formatCurrency } from "../utils/currency";
import { calculateOrderTotals } from "../utils/orderTotals";
import { resolveOrderOriginFromUrl } from "../utils/orderOrigin";

const allCategory = { id: "all", name: "Todos", short: "ALL", tone: "from-cyan-300 to-blue-500" };
const lastOrderReceiptKey = "paracasya_last_order_receipt";
const initialForm = {
  name: "",
  whatsapp: "",
  address: "",
  reference: "",
  comments: "",
  payment: "Yape",
};

function buildStoredOrderReceipt(order) {
  return {
    created_at: order.createdAt,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    delivery_fee: order.totals.deliveryFee,
    delivery_notes: order.deliveryNotes,
    id: order.id,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
      unit_price: item.price,
    })),
    location_name: order.address,
    order_code: order.orderCode,
    order_origin_label: order.originLabel,
    payment_method: order.paymentMethod,
    room_reference: order.reference,
    status: order.status,
    subtotal: order.totals.subtotal,
    total: order.totals.total,
  };
}

function parseStoredOrderReceipt(payload) {
  if (!payload?.order_code) {
    return null;
  }

  const items = Array.isArray(payload.items) ? payload.items : [];

  return {
    address: payload.location_name ?? "",
    createdAt: payload.created_at ?? "",
    customerName: payload.customer_name ?? "",
    customerPhone: payload.customer_phone ?? "",
    deliveryNotes: payload.delivery_notes ?? "",
    id: payload.id ?? "",
    items: items.map((item, index) => ({
      id: `stored-${index}-${item.name ?? "producto"}`,
      name: item.name ?? "Producto",
      price: Number(item.unit_price ?? 0),
      quantity: Number(item.quantity ?? 0),
      totalPrice: Number(item.total_price ?? 0),
    })),
    orderCode: payload.order_code,
    originLabel: payload.order_origin_label ?? "",
    paymentMethod: payload.payment_method ?? "",
    reference: payload.room_reference ?? "",
    status: payload.status ?? "Pendiente",
    totals: {
      deliveryFee: Number(payload.delivery_fee ?? 0),
      subtotal: Number(payload.subtotal ?? 0),
      total: Number(payload.total ?? 0),
    },
  };
}

function readLastOrderReceipt() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(lastOrderReceiptKey);
    return raw ? parseStoredOrderReceipt(JSON.parse(raw)) : null;
  } catch (error) {
    console.error("No se pudo leer el ultimo comprobante guardado:", error);
    return null;
  }
}

function saveLastOrderReceipt(order) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(lastOrderReceiptKey, JSON.stringify(buildStoredOrderReceipt(order)));
}

function clearLastOrderReceipt() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(lastOrderReceiptKey);
  }
}

function ClientePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [catalogCategories, setCatalogCategories] = useState(clientCategories);
  const [catalogProducts, setCatalogProducts] = useState(products);
  const [catalogNotice, setCatalogNotice] = useState("");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);
  const [lastOrderReceipt, setLastOrderReceipt] = useState(null);
  const [shouldScrollToCatalog, setShouldScrollToCatalog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeSettings, setStoreSettings] = useState(defaultStoreSettings);
  const [orderOrigin, setOrderOrigin] = useState(null);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const { total: cartTotal } = calculateOrderTotals(items);

  useEffect(() => {
    let isMounted = true;

    const origin = resolveOrderOriginFromUrl(window.location.search);
    if (origin) {
      setOrderOrigin(origin);
    }

    setLastOrderReceipt(readLastOrderReceipt());

    async function loadStoreStatus() {
      const settings = await getStoreSettings();

      if (isMounted) {
        setStoreSettings(settings);
      }
    }

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

    loadStoreStatus();
    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!shouldScrollToCatalog || successOrder) {
      return;
    }

    document.getElementById("catalogo-cliente")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setShouldScrollToCatalog(false);
  }, [shouldScrollToCatalog, successOrder]);

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

  const featuredProducts = useMemo(
    () =>
      catalogProducts
        .filter((product) => product.isFeatured || product.tag === "Destacado")
        .slice(0, 4),
    [catalogProducts],
  );

  const activeCategoryName =
    activeCategory === "all"
      ? "Todos los productos"
      : catalogCategories.find((category) => category.id === activeCategory)?.name ?? "Productos";
  const showFeaturedSection = activeCategory === "all" && !query.trim() && featuredProducts.length > 0;

  function addProduct(product) {
    setFeedback(null);
    setSuccessOrder(null);
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
    setSuccessOrder(null);

    if (!storeSettings.storeOpen) {
      setFeedback({
        type: "error",
        message: storeSettings.closedMessage,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submittedForm = { ...form };
      const submittedItems = items.map((item) => ({ ...item }));
      const totals = calculateOrderTotals(submittedItems);
      const order = await createOrder({ form, items, origin: orderOrigin });
      const receiptOrder = {
        createdAt: new Date().toISOString(),
        id: order.id,
        orderCode: order.orderCode,
        customerName: submittedForm.name,
        customerPhone: submittedForm.whatsapp,
        address: submittedForm.address,
        reference: submittedForm.reference,
        deliveryNotes: submittedForm.comments.trim(),
        paymentMethod: submittedForm.payment,
        items: submittedItems,
        totals,
        originLabel: orderOrigin?.label ?? "",
        status: "Pendiente",
      };
      saveLastOrderReceipt(receiptOrder);
      setLastOrderReceipt(receiptOrder);
      setSuccessOrder(receiptOrder);
      setItems([]);
      setForm(initialForm);
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

  function handleNewOrder() {
    setItems([]);
    setForm(initialForm);
    setFeedback(null);
    setSuccessOrder(null);
    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  function handleShowLastOrder() {
    if (!lastOrderReceipt) {
      return;
    }

    setFeedback(null);
    setSuccessOrder(lastOrderReceipt);
    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  function handleDeleteLastOrderReceipt() {
    clearLastOrderReceipt();
    setLastOrderReceipt(null);
    setSuccessOrder(null);
    setFeedback(null);
  }

  function handleBackToStore() {
    setSuccessOrder(null);
    setShouldScrollToCatalog(true);
  }

  if (successOrder) {
    return (
      <div className="client-success-view">
        <div className="order-success-page">
          <div className="order-success-page-inner">
            <OrderSuccessReceipt
              onDeleteStoredReceipt={lastOrderReceipt ? handleDeleteLastOrderReceipt : null}
              onBackToStore={handleBackToStore}
              onNewOrder={handleNewOrder}
              order={successOrder}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-sand-50 via-white to-sand-50">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-200/25 blur-3xl" />
      <div className="page-container relative pb-14 pt-4 sm:pt-6">
        <section className="relative overflow-hidden rounded-[2rem] bg-ocean-950 px-4 py-4 text-white shadow-2xl shadow-ocean-950/20 sm:px-7 sm:py-6">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-delivery/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 hidden h-full w-1/2 bg-[radial-gradient(circle_at_70%_45%,rgba(255,255,255,0.18),transparent_34%)] lg:block" />

          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-center lg:gap-6">
            <div>
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-delivery ring-1 ring-white/10 sm:text-xs">
                {storeSettings.storeOpen ? "Tienda abierta ahora" : "Tienda cerrada por ahora"}
              </p>
              <h1 className="mt-3 max-w-2xl font-display text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Pedí tus esenciales de Paracas en minutos
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">
                Bebidas frías, comida rápida, snacks y promos directo a tu hotel, Airbnb o
                casa.
              </p>

              <label className="mt-4 flex h-13 max-w-xl items-center gap-3 rounded-[1.2rem] bg-white px-3 text-slate-400 shadow-xl shadow-ocean-950/10 ring-1 ring-white/20 sm:h-14 sm:px-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700">
                  <Search size={18} />
                </span>
                <input
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 sm:text-base"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar bebidas, comida, snacks..."
                  type="search"
                  value={query}
                />
              </label>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-bold text-blue-100 sm:max-w-xl sm:text-xs">
                <div className="rounded-xl bg-white/10 p-2.5 ring-1 ring-white/10">
                  <Clock3 className="mb-1 text-delivery" size={16} />
                  Rápido
                </div>
                <div className="rounded-xl bg-white/10 p-2.5 ring-1 ring-white/10">
                  <MapPin className="mb-1 text-delivery" size={16} />
                  Local
                </div>
                <div className="rounded-xl bg-white/10 p-2.5 ring-1 ring-white/10">
                  <ShieldCheck className="mb-1 text-delivery" size={16} />
                  Confiable
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[1.6rem] bg-white p-3 text-ocean-950 shadow-2xl shadow-ocean-950/20">
                <div className="rounded-[1.3rem] bg-gradient-to-br from-sand-50 to-cyan-50 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ocean-500">
                        Promo del día
                      </p>
                      <h2 className="mt-0.5 font-display text-lg font-black">Combos listos</h2>
                    </div>
                    <span className="rounded-full bg-ocean-900 px-3 py-1.5 text-xs font-black text-delivery">
                      Hoy
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {catalogProducts
                      .filter((product) => product.category === "promo-dia")
                      .slice(0, 3)
                      .map((product) => (
                        <div
                          className="rounded-2xl bg-white p-2 text-center shadow-sm"
                          key={product.id}
                        >
                          <div
                            className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-[10px] font-black text-ocean-900 sm:h-12 sm:w-12 ${product.colors}`}
                          >
                            {product.visual}
                          </div>
                          <p className="mt-1 truncate text-[10px] font-extrabold sm:text-[11px]">
                            {product.name}
                          </p>
                        </div>
                      ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-ocean-950 p-3 text-white">
                    <div>
                      <p className="text-xs text-blue-100">Delivery activo</p>
                      <p className="font-display text-base font-black">Desde S/ 5</p>
                    </div>
                    <Truck className="text-delivery" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 rounded-[2rem] border border-white bg-white/80 p-3 shadow-lg shadow-ocean-950/5 backdrop-blur">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-ocean-600">
              Categorías
            </p>
            <p className="text-xs font-bold text-slate-400">{activeCategoryName}</p>
          </div>
          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
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
        </div>
        <section
          aria-label="Confianza ParacasYa"
          className="mt-3 grid grid-cols-3 gap-2 rounded-[1.6rem] border border-ocean-100/70 bg-white/90 p-2.5 shadow-sm shadow-ocean-950/5"
        >
          {[
            { icon: Truck, title: "Entrega rápida", copy: "En Paracas" },
            { icon: MessageCircle, title: "Atención", copy: "Por WhatsApp" },
            { icon: ShieldCheck, title: "Pedido seguro", copy: "Servicio local" },
          ].map(({ icon: Icon, title, copy }) => (
            <div
              className="flex min-w-0 flex-col items-center rounded-2xl bg-sand-50 px-1.5 py-2.5 text-center sm:flex-row sm:gap-2.5 sm:px-3 sm:text-left"
              key={title}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ocean-900 text-delivery">
                <Icon size={15} strokeWidth={2.4} />
              </span>
              <div className="mt-1.5 min-w-0 sm:mt-0">
                <p className="text-[10px] font-black leading-tight text-ocean-950 sm:text-xs">
                  {title}
                </p>
                <p className="mt-0.5 text-[9px] font-semibold leading-tight text-slate-500 sm:text-[11px]">
                  {copy}
                </p>
              </div>
            </div>
          ))}
        </section>
        {catalogNotice && (
          <div className="my-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            {catalogNotice}
          </div>
        )}
        {orderOrigin?.label && (
          <div className="my-5 rounded-[1.35rem] border border-ocean-100 bg-white/90 px-4 py-3 text-sm font-bold text-ocean-800 shadow-sm">
            Pedido asociado a: <span className="text-ocean-950">{orderOrigin.label}</span>
          </div>
        )}
        {!storeSettings.storeOpen && (
          <div className="my-5 rounded-[1.6rem] border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
              Tienda cerrada
            </p>
            <h2 className="mt-2 font-display text-xl font-black text-ocean-950">
              No estamos recibiendo pedidos ahora
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-800">
              {storeSettings.closedMessage}
            </p>
            <p className="mt-3 rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold text-ocean-800">
              {storeSettings.openingHours}
            </p>
          </div>
        )}

        {lastOrderReceipt && !successOrder && (
          <section className="last-order-card">
            <div>
              <p className="last-order-eyebrow">Comprobante local</p>
              <h2>¿Ya hiciste un pedido?</h2>
              <p>
                Podés volver a ver el último pedido realizado desde este celular.
              </p>
              <p className="last-order-note">
                Este comprobante solo se guarda en este celular. El pedido real sigue registrado
                en ParacasYa Market.
              </p>
            </div>
            <div className="last-order-actions">
              <button className="primary" onClick={handleShowLastOrder} type="button">
                Ver mi último pedido
              </button>
              <button onClick={handleDeleteLastOrderReceipt} type="button">
                Eliminar comprobante de este celular
              </button>
            </div>
          </section>
        )}

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_390px]">
          <section id="catalogo-cliente">
            {showFeaturedSection && (
              <div className="mb-8">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-delivery-dark" size={20} />
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-ocean-600">
                        Recomendados
                      </p>
                    </div>
                    <h2 className="mt-1 font-display text-2xl font-black text-ocean-950">
                      Más pedidos para tu estadía
                    </h2>
                  </div>
                  <span className="hidden rounded-full bg-delivery/30 px-3 py-2 text-xs font-black text-ocean-900 sm:inline-flex">
                    Favoritos
                  </span>
                </div>
                <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4">
                  {featuredProducts.map((product) => (
                    <div className="min-w-[78%] snap-start sm:min-w-0" key={`featured-${product.id}`}>
                      <ProductCard onAdd={addProduct} product={product} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-delivery-dark" size={20} />
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-ocean-600">
                    Catálogo
                  </p>
                </div>
                <h2 className="mt-1 font-display text-2xl font-black text-ocean-950">
                  {activeCategoryName}
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
              orderOrigin={orderOrigin}
              storeSettings={storeSettings}
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
            className="fixed bottom-5 left-4 right-4 z-30 flex items-center justify-center gap-2 rounded-full bg-delivery px-5 py-4 font-black text-ocean-950 shadow-lg shadow-ocean-900/20 lg:hidden"
            href="#cart"
          >
            <ShoppingCart size={19} />
            Ver pedido ({itemCount}) · {formatCurrency(cartTotal)}
          </a>
        )}
      </div>
    </div>
  );
}

export default ClientePage;
