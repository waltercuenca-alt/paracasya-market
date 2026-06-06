import { getSupabaseClient } from "../lib/supabaseClient";
import { getCategoryPresentation, getProductVisual } from "../utils/catalogPresentation";
import { getAdminCatalogToken, invokeAdminCatalog } from "./adminCatalogService";

function normalizeProduct(product) {
  const categorySlug = product.category_slug || product.categories?.slug || "";
  const presentation = getCategoryPresentation(categorySlug);

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: Number(product.price ?? 0),
    category: categorySlug,
    categoryId: product.category_id ?? product.categories?.id ?? "",
    imageUrl: product.image_url ?? "",
    available: Boolean(product.is_available),
    isAvailable: Boolean(product.is_available),
    isFeatured: Boolean(product.is_featured),
    stockStatus: product.stock_status ?? "available",
    visual: getProductVisual(product.name),
    colors: presentation.productColors,
    tag: product.is_featured ? "Destacado" : "",
  };
}

export function productPayload(product) {
  return {
    name: product.name?.trim(),
    description: product.description?.trim() || null,
    price: Number(product.price ?? 0),
    category_id: product.categoryId || product.category_id || null,
    category_slug: product.category || product.category_slug || null,
    image_url: product.imageUrl?.trim() || product.image_url?.trim() || null,
    is_available: Boolean(product.available ?? product.isAvailable ?? product.is_available ?? true),
    is_featured: Boolean(product.isFeatured ?? product.is_featured ?? false),
    stock_status: product.stockStatus || product.stock_status || "available",
    updated_at: new Date().toISOString(),
  };
}

export async function getAvailableProducts() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("products")
    .select("*, categories(id, slug, name)")
    .eq("is_available", true)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error cargando productos desde Supabase:", JSON.stringify(error, null, 2));
    throw new Error("No pudimos cargar los productos desde Supabase.");
  }

  return (data ?? []).map(normalizeProduct);
}

export async function getAllProducts() {
  if (getAdminCatalogToken()) {
    try {
      const data = await invokeAdminCatalog("listProducts");
      return (data ?? []).map(normalizeProduct);
    } catch (error) {
      console.error(
        "No se pudo listar productos por Edge Function. Usando lectura publica:",
        error,
      );
    }
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from("products")
    .select("*, categories(id, slug, name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando productos admin:", JSON.stringify(error, null, 2));
    throw new Error("Productos todavía no están conectados a Supabase.");
  }

  return (data ?? []).map(normalizeProduct);
}

export async function createProduct(product) {
  const data = await invokeAdminCatalog("createProduct", productPayload(product));
  return normalizeProduct(data);
}

export async function updateProduct(productId, product) {
  const data = await invokeAdminCatalog("updateProduct", {
    id: productId,
    product: productPayload(product),
  });
  return normalizeProduct(data);
}

export async function toggleProductAvailability(productId, isAvailable) {
  const data = await invokeAdminCatalog("toggleProductAvailability", {
    id: productId,
    isAvailable,
  });
  return normalizeProduct(data);
}

export async function toggleProductFeatured(productId, isFeatured) {
  const data = await invokeAdminCatalog("toggleProductFeatured", {
    id: productId,
    isFeatured,
  });
  return normalizeProduct(data);
}
