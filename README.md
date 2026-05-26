# ParacasYa Market

Base visual inicial para **el kiosco online de Paracas**, construida con React, Vite y
Tailwind CSS. Esta fase presenta una experiencia mobile-first navegable con datos
simulados y preparada para integrar servicios reales más adelante.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Para validar una compilación de producción:

```bash
npm run build
```

## Rutas

- `/`: landing comercial con hero, categorías, beneficios y llamados a la acción.
- `/cliente`: tienda, filtros, productos mock, carrito y checkout básico.
- `/caja`: panel operativo para gestionar pedidos y estados.
- `/admin`: inventario y configuración rápida de la tienda.

## Estructura

```text
src/
  components/  Componentes visuales reutilizables
  data/        Categorías, productos y pedidos mock
  pages/       Pantallas vinculadas a cada ruta
  styles/      Tema Tailwind y estilos globales
  utils/       Utilidades compartidas
```

## Alcance de esta fase

- Incluye 14 productos mock en soles y ocho categorías iniciales.
- El catálogo sigue siendo local y demostrativo.
- Los pedidos de `/cliente` y su gestión en `/caja` se conectan a Supabase.
- No incluye Cloudinary, autenticación ni gestión remota de productos todavía.

## Supabase

Define estas variables en `.env` y también en Vercel:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica
```

En Vercel, las variables deben existir en el entorno del despliegue correspondiente
(`Production`, `Preview` o `Development`). Como Vite las incorpora al compilar, luego
de agregarlas o corregirlas es necesario ejecutar un nuevo deployment.

La integración de pedidos usa las siguientes columnas:

```text
orders:
  id, order_code, customer_name, customer_phone, location_name,
  room_reference, payment_method, delivery_notes, status,
  subtotal, delivery_fee, total, created_at

order_items:
  id, order_id, product_id, product_name, quantity, unit_price, total_price
```

`order_items.order_id` debe relacionarse con `orders.id` para que `/caja` pueda
consultar cada pedido con sus productos mediante `order_items(*)`.

Las políticas RLS deben permitir las operaciones que uses con la clave pública:
insertar pedidos e ítems, leer pedidos para caja y actualizar su estado. Hasta que
exista autenticación, una política de lectura para `/caja` implica que esos pedidos
pueden ser consultados desde el cliente web; conviene restringirla antes de operar
con datos reales en producción.
