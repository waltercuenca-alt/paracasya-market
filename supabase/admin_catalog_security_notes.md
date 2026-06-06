# ParacasYa Admin Catalog Security Notes

## Current MVP Rule

Do not open `INSERT`, `UPDATE`, or `DELETE` policies to `anon` on `products` or `categories`.

The current PIN in the React app is only a visual/operational barrier. It is not database security.

## Safe Write Path

Use the local Edge Function:

```text
supabase/functions/admin-catalog/index.ts
```

The function expects:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_CATALOG_TOKEN`

Only the Edge Function should receive `SUPABASE_SERVICE_ROLE_KEY`. Never put it in Vercel or any `VITE_*` variable.

## Frontend Token

The frontend sends `x-admin-token` to the Edge Function. For this MVP, the operator can enter that token in `/admin`, and it is stored in `sessionStorage` only.

This is still not final-grade security. It is a safer MVP than anon writes because:

- `service_role` stays server-side.
- RLS keeps anon writes blocked.
- The token is not bundled into the frontend.

For production, replace this with Supabase Auth and an admin role/profile, or keep writes behind an authenticated server-only function.

## Deploy Steps

1. Apply `supabase/paracasya_products_categories.sql` manually in Supabase SQL editor.
2. Set Edge Function secrets:

```bash
supabase secrets set ADMIN_CATALOG_TOKEN="your-long-random-token"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

`SUPABASE_URL` is normally available in Supabase Functions, but set it if your environment requires it.

3. Deploy:

```bash
supabase functions deploy admin-catalog
```

4. In `/admin`, paste the same `ADMIN_CATALOG_TOKEN` into the secure admin token field for that browser session.

## Validate anon cannot write

Using only the anon key, attempts like these should fail:

- `insert` into `products`
- `update` `products`
- `delete` from `products`
- `insert/update/delete` on `categories`

Public `select` should only return:

- active categories
- available products
