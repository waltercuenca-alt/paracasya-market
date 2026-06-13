import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function requireEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing required secret: ${name}`);
  }

  return value;
}

function requireEnvOption(primaryName: string, fallbackName: string) {
  const value = Deno.env.get(primaryName) || Deno.env.get(fallbackName);

  if (!value) {
    throw new Error(`Missing required secret: ${primaryName} or ${fallbackName}`);
  }

  return value;
}

function assertAdminToken(req: Request) {
  const expectedToken = requireEnv("ADMIN_CATALOG_TOKEN");
  const receivedToken = req.headers.get("x-admin-token") || "";

  if (!receivedToken || receivedToken !== expectedToken) {
    return false;
  }

  return true;
}

function productPayload(product: Record<string, unknown>) {
  return {
    name: String(product.name ?? "").trim(),
    description: product.description ? String(product.description).trim() : null,
    price: Number(product.price ?? 0),
    category_id: product.categoryId || product.category_id || null,
    category_slug: product.category || product.category_slug || null,
    image_url: product.imageUrl || product.image_url
      ? String(product.imageUrl ?? product.image_url).trim()
      : null,
    is_available: Boolean(product.available ?? product.isAvailable ?? product.is_available ?? true),
    is_featured: Boolean(product.isFeatured ?? product.is_featured ?? false),
    stock_status: String(product.stockStatus ?? product.stock_status ?? "available"),
    updated_at: new Date().toISOString(),
  };
}

function categoryPayload(category: Record<string, unknown>) {
  return {
    name: String(category.name ?? "").trim(),
    slug: String(category.slug ?? "").trim(),
    icon: category.icon ? String(category.icon).trim() : null,
    is_active: Boolean(category.isActive ?? category.is_active ?? true),
    sort_order: Number(category.sortOrder ?? category.sort_order ?? 0),
    updated_at: new Date().toISOString(),
  };
}

function storeSettingsPayload(settings: Record<string, unknown>) {
  const deliveryFee = Number(settings.deliveryFee ?? settings.delivery_fee ?? 5);

  return {
    id: "main",
    store_open: Boolean(settings.storeOpen ?? settings.store_open ?? true),
    delivery_active: Boolean(settings.deliveryActive ?? settings.delivery_active ?? true),
    delivery_fee: Number.isFinite(deliveryFee) && deliveryFee >= 0 ? deliveryFee : 5,
    opening_hours: String(
      settings.openingHours ?? settings.opening_hours ?? "Atendemos de 10:00 a.m. a 10:00 p.m.",
    ).trim(),
    closed_message: String(
      settings.closedMessage ??
        settings.closed_message ??
        "Estamos cerrados por ahora. Volvemos a atender mañana desde las 10:00 a.m.",
    ).trim(),
    updated_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    if (!assertAdminToken(req)) {
      return jsonResponse({ error: "Unauthorized admin catalog request" }, 401);
    }

    const supabaseUrl = requireEnvOption("SUPABASE_URL", "PROJECT_URL");
    const serviceRoleKey = requireEnvOption("SUPABASE_SERVICE_ROLE_KEY", "SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { action, payload = {} } = await req.json();

    switch (action) {
      case "listProducts": {
        const { data, error } = await supabase
          .from("products")
          .select("*, categories(id, slug, name)")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return jsonResponse({ data });
      }

      case "createProduct": {
        const { data, error } = await supabase
          .from("products")
          .insert(productPayload(payload))
          .select("*, categories(id, slug, name)")
          .single();

        if (error) throw error;
        return jsonResponse({ data });
      }

      case "updateProduct": {
        const { id, product } = payload;
        const { data, error } = await supabase
          .from("products")
          .update(productPayload(product ?? {}))
          .eq("id", id)
          .select("*, categories(id, slug, name)")
          .single();

        if (error) throw error;
        return jsonResponse({ data });
      }

      case "toggleProductAvailability": {
        const { id, isAvailable } = payload;
        const { data, error } = await supabase
          .from("products")
          .update({ is_available: Boolean(isAvailable), updated_at: new Date().toISOString() })
          .eq("id", id)
          .select("*, categories(id, slug, name)")
          .single();

        if (error) throw error;
        return jsonResponse({ data });
      }

      case "toggleProductFeatured": {
        const { id, isFeatured } = payload;
        const { data, error } = await supabase
          .from("products")
          .update({ is_featured: Boolean(isFeatured), updated_at: new Date().toISOString() })
          .eq("id", id)
          .select("*, categories(id, slug, name)")
          .single();

        if (error) throw error;
        return jsonResponse({ data });
      }

      case "listCategories": {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;
        return jsonResponse({ data });
      }

      case "createCategory": {
        const { data, error } = await supabase
          .from("categories")
          .insert(categoryPayload(payload))
          .select("*")
          .single();

        if (error) throw error;
        return jsonResponse({ data });
      }

      case "getStoreSettings": {
        const { data, error } = await supabase
          .from("store_settings")
          .select("*")
          .eq("id", "main")
          .maybeSingle();

        if (error) throw error;
        return jsonResponse({ data });
      }

      case "updateStoreSettings": {
        const { data, error } = await supabase
          .from("store_settings")
          .upsert(storeSettingsPayload(payload), { onConflict: "id" })
          .select("*")
          .single();

        if (error) throw error;
        return jsonResponse({ data });
      }

      case "updateCategory":
      case "toggleCategoryActive": {
        const { id, category, isActive } = payload;
        const updatePayload =
          action === "toggleCategoryActive"
            ? { is_active: Boolean(isActive), updated_at: new Date().toISOString() }
            : categoryPayload(category ?? {});
        const { data, error } = await supabase
          .from("categories")
          .update(updatePayload)
          .eq("id", id)
          .select("*")
          .single();

        if (error) throw error;
        return jsonResponse({ data });
      }

      default:
        return jsonResponse({ error: `Unsupported action: ${action}` }, 400);
    }
  } catch (error) {
    console.error("admin-catalog error", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unexpected admin catalog error" },
      500,
    );
  }
});
