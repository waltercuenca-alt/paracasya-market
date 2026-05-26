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
- Todas las acciones son locales y demostrativas; no persisten al recargar.
- No incluye Supabase ni Cloudinary todavía.
- La separación entre datos, componentes y páginas deja lista la UI para conectar
  catálogo, pedidos, imágenes y autenticación en fases posteriores.
