import { Bike, LogOut, Plus, RefreshCw, Save, Settings2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import PartnerQrCard from "../components/PartnerQrCard";
import { clientCategories } from "../data/categories";
import { products as initialProducts } from "../data/products";
import {
  createCategory,
  getAllCategories,
  toggleCategoryActive,
} from "../services/categoriesService";
import {
  clearAdminCatalogToken,
  getAdminCatalogToken,
  saveAdminCatalogToken,
} from "../services/adminCatalogService";
import {
  createProduct,
  getAllProducts,
  toggleProductAvailability,
  toggleProductFeatured,
  updateProduct,
} from "../services/productsService";
import {
  defaultStoreSettings,
  getStoreSettings,
  saveStoreSettings,
} from "../services/storeSettingsService";
import { formatCurrency } from "../utils/currency";
import { clearInternalAccess } from "../utils/internalAccess";
import { partnerQrTargets } from "../utils/partnerQrData";

const initialForm = {
  id: null,
  name: "",
  description: "",
  price: "0",
  category: "bebidas",
  categoryId: "",
  imageUrl: "",
  available: true,
  isFeatured: false,
  stockStatus: "available",
};

function localAdminCategories() {
  return clientCategories.map((category, index) => ({
    ...category,
    supabaseId: null,
    isActive: true,
    sortOrder: (index + 1) * 10,
  }));
}

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
  const [categories, setCategories] = useState(localAdminCategories);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [storeOpen, setStoreOpen] = useState(true);
  const [openingHours, setOpeningHours] = useState(defaultStoreSettings.openingHours);
  const [closedMessage, setClosedMessage] = useState(defaultStoreSettings.closedMessage);
  const [isSavingStoreSettings, setIsSavingStoreSettings] = useState(false);
  const [deliveryActive, setDeliveryActive] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState("5.00");
  const [adminToken, setAdminToken] = useState(getAdminCatalogToken);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", icon: "" });

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  );

  const resetForm = useCallback(() => {
    const firstCategory = activeCategories[0] ?? categories[0];
    setEditingId(null);
    setForm({
      ...initialForm,
      category: firstCategory?.slug ?? firstCategory?.id ?? "bebidas",
      categoryId: firstCategory?.supabaseId ?? "",
    });
  }, [activeCategories, categories]);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const [remoteCategories, remoteProducts] = await Promise.all([
        getAllCategories(),
        getAllProducts(),
      ]);

      if (!remoteCategories.length) {
        throw new Error(
          "Productos todavía no están conectados a Supabase. Aplicá la migración SQL para activar el admin real.",
        );
      }

      setCategories(remoteCategories);
      setProducts(remoteProducts);
      setIsConnected(true);
      setSuccessMessage(
        remoteProducts.length
          ? "Catálogo conectado a Supabase."
          : "Supabase conectado. Todavía no hay productos cargados.",
      );
    } catch (error) {
      console.error("Admin usando catálogo local por fallback:", error);
      setCategories(localAdminCategories());
      setProducts(initialProducts);
      setIsConnected(false);
      setErrorMessage(
        error.message ||
          "Productos todavía no están conectados a Supabase. Aplicá la migración SQL para activar el admin real.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStoreSettings = useCallback(async () => {
    const settings = await getStoreSettings();
    setStoreOpen(settings.storeOpen);
    setOpeningHours(settings.openingHours);
    setClosedMessage(settings.closedMessage);
  }, []);

  useEffect(() => {
    loadCatalog();
    loadStoreSettings();
  }, [loadCatalog, loadStoreSettings]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  function handleLogout() {
    clearAdminCatalogToken();
    clearInternalAccess();
    window.location.reload();
  }

  function handleSaveAdminToken(event) {
    event.preventDefault();
    saveAdminCatalogToken(adminToken);
    setSuccessMessage("Token de Edge Function guardado para esta sesión.");
    setErrorMessage("");
  }

  async function handleSaveStoreSettings(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSavingStoreSettings(true);

    try {
      const result = await saveStoreSettings({
        storeOpen,
        openingHours,
        closedMessage,
      });

      setStoreOpen(result.settings.storeOpen);
      setOpeningHours(result.settings.openingHours);
      setClosedMessage(result.settings.closedMessage);
      setSuccessMessage(
        result.persisted
          ? "Configuración de tienda guardada en Supabase."
          : "Configuración guardada como vista previa local. Aplicá SQL y desplegá admin-catalog para producción.",
      );
    } catch (error) {
      setErrorMessage(error.message || "No pudimos guardar la configuración de tienda.");
    } finally {
      setIsSavingStoreSettings(false);
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleCategoryChange(slug) {
    const category = categories.find((item) => item.slug === slug || item.id === slug);
    setForm((current) => ({
      ...current,
      category: slug,
      categoryId: category?.supabaseId ?? "",
    }));
  }

  function editProduct(product) {
    const category = categories.find(
      (item) => item.slug === product.category || item.id === product.category,
    );
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      price: String(product.price ?? 0),
      category: product.category,
      categoryId: product.categoryId || category?.supabaseId || "",
      imageUrl: product.imageUrl ?? "",
      available: Boolean(product.available),
      isFeatured: Boolean(product.isFeatured),
      stockStatus: product.stockStatus ?? "available",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!isConnected) {
      setErrorMessage(
        "Productos todavía no están conectados a Supabase. Aplicá la migración SQL para activar el admin real.",
      );
      return;
    }

    const category = categories.find((item) => item.slug === form.category || item.id === form.category);
    const payload = {
      ...form,
      category: category?.slug ?? form.category,
      categoryId: category?.supabaseId ?? form.categoryId,
      price: Number(form.price),
    };

    setIsSaving(true);

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        setSuccessMessage("Producto actualizado en Supabase.");
      } else {
        await createProduct(payload);
        setSuccessMessage("Producto creado en Supabase.");
      }

      await loadCatalog();
    } catch (error) {
      setErrorMessage(error.message || "No pudimos guardar el producto.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateCategory(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!isConnected) {
      setErrorMessage("No se puede crear categoría hasta aplicar la migración SQL.");
      return;
    }

    try {
      await createCategory({
        name: newCategory.name,
        slug: newCategory.slug,
        icon: newCategory.icon,
        isActive: true,
        sortOrder: (categories.length + 1) * 10,
      });
      setNewCategory({ name: "", slug: "", icon: "" });
      setSuccessMessage("Categoría creada en Supabase.");
      await loadCatalog();
    } catch (error) {
      setErrorMessage(error.message || "No pudimos crear la categoría.");
    }
  }

  async function handleToggleAvailability(product) {
    setErrorMessage("");

    if (!isConnected) {
      setErrorMessage("No se puede cambiar la visibilidad en tienda hasta aplicar la migración SQL/RLS.");
      return;
    }

    try {
      const updated = await toggleProductAvailability(product.id, !product.available);
      setProducts((current) => current.map((item) => (item.id === product.id ? updated : item)));
    } catch (error) {
      setErrorMessage(error.message || "No pudimos cambiar la visibilidad en tienda.");
    }
  }

  async function handleToggleFeatured(product) {
    setErrorMessage("");

    if (!isConnected) {
      setErrorMessage("No se puede guardar destacado hasta aplicar la migración SQL/RLS.");
      return;
    }

    try {
      const updated = await toggleProductFeatured(product.id, !product.isFeatured);
      setProducts((current) => current.map((item) => (item.id === product.id ? updated : item)));
    } catch (error) {
      setErrorMessage(error.message || "No pudimos cambiar el destacado.");
    }
  }

  async function handleToggleCategory(category) {
    setErrorMessage("");

    if (!isConnected || !category.supabaseId) {
      setErrorMessage("No se puede gestionar categorías hasta aplicar la migración SQL/RLS.");
      return;
    }

    try {
      await toggleCategoryActive(category.supabaseId, !category.isActive);
      await loadCatalog();
    } catch (error) {
      setErrorMessage(error.message || "No pudimos actualizar la categoría.");
    }
  }

  return (
    <div className="page-container pb-14 pt-8 sm:pt-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Administración</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ocean-950">
            Catálogo y tienda
          </h1>
          <p className="mt-2 text-slate-500">
            Gestiona productos conectados a Supabase con fallback local seguro.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="button-secondary gap-2" onClick={loadCatalog} type="button">
            <RefreshCw className={isLoading ? "animate-spin" : ""} size={17} />
            Actualizar
          </button>
          <button className="button-secondary gap-2" onClick={handleLogout} type="button">
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </div>

      {(errorMessage || successMessage) && (
        <div
          className={`mt-5 rounded-2xl border p-4 text-sm font-semibold ${
            errorMessage
              ? "border-rose-100 bg-rose-50 text-rose-700"
              : "border-emerald-100 bg-emerald-50 text-emerald-700"
          }`}
        >
          {errorMessage || successMessage}
        </div>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Settings2 className="text-ocean-600" size={19} />
          <h2 className="font-display text-lg font-bold text-ocean-950">Estado de la tienda</h2>
        </div>
        <form className="card space-y-4 p-5" onSubmit={handleSaveStoreSettings}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] ${
                  storeOpen
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {storeOpen ? "Tienda abierta" : "Tienda cerrada"}
              </span>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
                Si cerrás la tienda, el cliente puede ver el catálogo, pero no puede finalizar
                pedidos hasta que vuelvas a abrirla.
              </p>
            </div>
            <button
              className={`toggle ${storeOpen ? "bg-ocean-900" : "bg-slate-200"}`}
              onClick={() => setStoreOpen((current) => !current)}
              type="button"
            >
              <span className={storeOpen ? "translate-x-5" : "translate-x-0"} />
            </button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-ocean-950">Horario visible</span>
              <input
                className="input-field"
                onChange={(event) => setOpeningHours(event.target.value)}
                placeholder="Atendemos de 10:00 a.m. a 10:00 p.m."
                value={openingHours}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-ocean-950">
                Mensaje cuando está cerrada
              </span>
              <input
                className="input-field"
                onChange={(event) => setClosedMessage(event.target.value)}
                placeholder="Estamos cerrados por ahora..."
                value={closedMessage}
              />
            </label>
          </div>

          <button
            className="button-primary rounded-2xl px-5 py-3"
            disabled={isSavingStoreSettings}
            type="submit"
          >
            <Save size={18} />
            {isSavingStoreSettings ? "Guardando..." : "Guardar configuración"}
          </button>
        </form>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Settings2 className="text-ocean-600" size={19} />
          <h2 className="font-display text-lg font-bold text-ocean-950">Configuración rápida</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
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

      <section className="mt-6 rounded-[2rem] border border-amber-100 bg-amber-50 p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <h2 className="font-display text-lg font-bold text-ocean-950">
              Escritura segura del admin
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-amber-800">
              Para guardar cambios, desplegá la Edge Function <strong>admin-catalog</strong> y
              pegá el token interno de Supabase Functions. No uses service_role ni secretos en
              variables VITE.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-amber-800">
              Los productos ocultos no aparecen en la tienda del cliente, pero siguen guardados
              en el admin y podés volver a activarlos cuando quieras.
            </p>
          </div>
          <form className="flex gap-2" onSubmit={handleSaveAdminToken}>
            <input
              className="input-field bg-white"
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="Token admin de Edge Function"
              type="password"
              value={adminToken}
            />
            <button className="button-secondary shrink-0 px-4" type="submit">
              Usar
            </button>
          </form>
        </div>
      </section>

      <section className="mt-9">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Hoteles y Airbnbs</p>
            <h2 className="mt-2 font-display text-2xl font-black text-ocean-950">
              Material QR para hoteles
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              Prepará tarjetas para recepción, habitaciones o Airbnbs. Cada QR abre la tienda con
              el origen listo para asociar el pedido al aliado correcto.
            </p>
          </div>
          <span className="rounded-full bg-ocean-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-ocean-700">
            {partnerQrTargets.length} materiales listos
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {partnerQrTargets.map((partner) => (
            <PartnerQrCard key={partner.slug} partner={partner} />
          ))}
        </div>
      </section>

      <section className="mt-9 grid gap-5 lg:grid-cols-[390px_minmax(0,1fr)]">
        <form className="card space-y-4 p-5" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-ocean-950">
                {editingId ? "Editar producto" : "Nuevo producto"}
              </h2>
              <p className="text-sm text-slate-400">
                {isConnected ? "Guarda cambios en Supabase." : "Aplicá SQL para activar escritura real."}
              </p>
            </div>
            {editingId && (
              <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100" onClick={resetForm} type="button">
                <X size={18} />
              </button>
            )}
          </div>

          <input
            className="input-field"
            onChange={(event) => updateForm("name", event.target.value)}
            placeholder="Nombre del producto"
            required
            value={form.name}
          />
          <textarea
            className="input-field min-h-24 resize-none"
            onChange={(event) => updateForm("description", event.target.value)}
            placeholder="Descripción"
            value={form.description}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input-field"
              min="0"
              onChange={(event) => updateForm("price", event.target.value)}
              placeholder="Precio"
              required
              step="0.1"
              type="number"
              value={form.price}
            />
            <select
              className="input-field"
              onChange={(event) => handleCategoryChange(event.target.value)}
              value={form.category}
            >
              {categories.map((category) => (
                <option key={category.slug ?? category.id} value={category.slug ?? category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <input
            className="input-field"
            onChange={(event) => updateForm("imageUrl", event.target.value)}
            placeholder="image_url manual"
            value={form.imageUrl}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer rounded-2xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-600">
              <input
                checked={form.available}
                className="mr-2"
                onChange={(event) => updateForm("available", event.target.checked)}
                type="checkbox"
              />
              Activo en tienda
            </label>
            <label className="cursor-pointer rounded-2xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-600">
              <input
                checked={form.isFeatured}
                className="mr-2"
                onChange={(event) => updateForm("isFeatured", event.target.checked)}
                type="checkbox"
              />
              Destacado
            </label>
          </div>
          <button className="button-primary w-full rounded-2xl py-4" disabled={isSaving} type="submit">
            <Save size={18} />
            {isSaving ? "Guardando..." : "Guardar en Supabase"}
          </button>
        </form>

        <div className="space-y-5">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ocean-950">Productos</h2>
              <p className="text-sm text-slate-400">{products.length} registrados</p>
            </div>
            <div className="grid gap-3">
              {products.map((product) => (
                <article className="card grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" key={product.id}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-ocean-950">{product.name}</h3>
                      {product.isFeatured && (
                        <span className="rounded-full bg-delivery/30 px-2 py-1 text-[10px] font-black uppercase text-ocean-900">
                          Destacado
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{product.description}</p>
                    <p className="mt-2 text-sm font-bold text-ocean-800">
                      {formatCurrency(product.price)} · {product.category}
                    </p>
                    {product.imageUrl && (
                      <p className="mt-1 truncate text-xs text-slate-400">Imagen: {product.imageUrl}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <span
                      className={`rounded-full px-3 py-2 text-xs font-bold ${
                        product.available
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {product.available ? "Activo en tienda" : "Oculto en tienda"}
                    </span>
                    <button
                      className="button-secondary px-3 py-2 text-xs"
                      onClick={() => handleToggleAvailability(product)}
                      type="button"
                    >
                      {product.available ? "Ocultar de tienda" : "Volver a mostrar"}
                    </button>
                    <button className="button-secondary px-3 py-2 text-xs" onClick={() => handleToggleFeatured(product)} type="button">
                      {product.isFeatured ? "Quitar destacado" : "Destacar"}
                    </button>
                    <button className="button-secondary px-3 py-2 text-xs" onClick={() => editProduct(product)} type="button">
                      Editar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-xl font-bold text-ocean-950">Categorías</h2>
            <p className="mt-1 text-sm text-slate-500">
              Activá o desactivá categorías cuando Supabase esté conectado.
            </p>
            <form className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_90px_auto]" onSubmit={handleCreateCategory}>
              <input
                className="input-field"
                onChange={(event) =>
                  setNewCategory((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Nombre"
                value={newCategory.name}
              />
              <input
                className="input-field"
                onChange={(event) =>
                  setNewCategory((current) => ({ ...current, slug: event.target.value }))
                }
                placeholder="slug"
                value={newCategory.slug}
              />
              <input
                className="input-field"
                maxLength={3}
                onChange={(event) =>
                  setNewCategory((current) => ({ ...current, icon: event.target.value }))
                }
                placeholder="Icon"
                value={newCategory.icon}
              />
              <button className="button-secondary px-4" type="submit">
                <Plus size={16} />
                Crear
              </button>
            </form>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {categories.map((category) => (
                <button
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                    category.isActive
                      ? "border-ocean-100 bg-ocean-50 text-ocean-900"
                      : "border-slate-100 bg-slate-50 text-slate-400"
                  }`}
                  key={category.slug ?? category.id}
                  onClick={() => handleToggleCategory(category)}
                  type="button"
                >
                  {category.name}
                  <span className="block text-xs font-semibold">
                    {category.isActive ? "Activa" : "Inactiva"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
