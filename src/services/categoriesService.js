import { getSupabaseClient } from "../lib/supabaseClient";
import { getCategoryPresentation } from "../utils/catalogPresentation";
import { getAdminCatalogToken, invokeAdminCatalog } from "./adminCatalogService";

function normalizeCategory(category) {
  const presentation = getCategoryPresentation(category.slug);

  return {
    id: category.slug,
    supabaseId: category.id,
    name: category.name,
    slug: category.slug,
    short: category.icon || presentation.short,
    tone: presentation.tone,
    visibleInClient: Boolean(category.is_active),
    isActive: Boolean(category.is_active),
    sortOrder: Number(category.sort_order ?? 0),
  };
}

export function categoryPayload(category) {
  return {
    name: category.name?.trim(),
    slug: category.slug?.trim(),
    icon: category.icon?.trim() || null,
    is_active: Boolean(category.isActive ?? category.is_active ?? true),
    sort_order: Number(category.sortOrder ?? category.sort_order ?? 0),
    updated_at: new Date().toISOString(),
  };
}

export async function getActiveCategories() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error cargando categorías desde Supabase:", JSON.stringify(error, null, 2));
    throw new Error("No pudimos cargar las categorías desde Supabase.");
  }

  return (data ?? []).map(normalizeCategory);
}

export async function getAllCategories() {
  if (getAdminCatalogToken()) {
    try {
      const data = await invokeAdminCatalog("listCategories");
      return (data ?? []).map(normalizeCategory);
    } catch (error) {
      console.error(
        "No se pudo listar categorias por Edge Function. Usando lectura publica:",
        error,
      );
    }
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error cargando categorías admin:", JSON.stringify(error, null, 2));
    throw new Error("Categorías todavía no están conectadas a Supabase.");
  }

  return (data ?? []).map(normalizeCategory);
}

export async function createCategory(category) {
  const data = await invokeAdminCatalog("createCategory", categoryPayload(category));
  return normalizeCategory(data);
}

export async function updateCategory(categoryId, category) {
  const data = await invokeAdminCatalog("updateCategory", {
    id: categoryId,
    category: categoryPayload(category),
  });
  return normalizeCategory(data);
}

export async function toggleCategoryActive(categoryId, isActive) {
  const data = await invokeAdminCatalog("toggleCategoryActive", {
    id: categoryId,
    isActive,
  });
  return normalizeCategory(data);
}
