# Pasaje 502 · frontend

Marketplace para explorar productos de almacenes y tiendas de Guatemala y ver quién los vende. En esta fase no se puede comprar. "Pasaje 502" es un nombre provisional.

Stack: React 19, TypeScript y Vite. La única dependencia agregada es `react-router`.

## Cómo levantarlo

Necesita Node 22.18 o más reciente, porque las pruebas ejecutan TypeScript directamente.

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

| Comando           | Qué hace                                                  |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo                                     |
| `npm run build`   | Revisa tipos y compila en `dist/`                           |
| `npm run preview` | Sirve lo compilado en `dist/`                               |
| `npm run lint`    | ESLint                                                     |
| `npm test`        | Pruebas del contrato en modo demo y de las utilidades      |

## Demo o API

El origen de datos se elige con `VITE_DATA_MODE`. El archivo `.env` trae `demo`. Para cambiarlo en tu máquina, creá `.env.local` a partir de `.env.example`. Después de cambiar una variable hay que reiniciar `npm run dev` o volver a compilar.

| Variable            | Valores                                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_DATA_MODE`    | `demo`: datos ficticios de `src/data/demo.ts`. `api`: backend real. Si falta o tiene otro valor, la app muestra un aviso de configuración y no carga datos. |
| `VITE_API_BASE_URL` | Solo en modo `api`. Origen del backend **sin** `/api`, por ejemplo `https://api.ejemplo.gt`. Si queda vacío, se usa el mismo origen que el frontend. |
| `API_PROXY_TARGET`  | Opcional, solo en `dev` y `preview`. Reenvía `/api` a ese backend para no depender de CORS. Se usa con `VITE_API_BASE_URL` vacío.                 |

Ejemplo para trabajar contra un backend local:

```bash
# frontend/.env.local
VITE_DATA_MODE=api
API_PROXY_TARGET=http://localhost:8080
```

En modo API, si el servidor falla, responde algo que no es JSON o manda datos fuera del contrato (por ejemplo, `price` como texto), la pantalla muestra el error y un botón **Reintentar**. Nunca muestra datos de demo en su lugar. El modo demo se reconoce por la franja amarilla arriba de la página.

### Contrato esperado

- `GET /api/categories`, `GET /api/merchants`
- `GET /api/merchants/{slug}` y `GET /api/products/{slug}`, con `404` si no existen
- `GET /api/products?q=&category=&merchant=&minPrice=&maxPrice=`. `category` y `merchant` son slugs, `price` va en quetzales y los límites son inclusivos.

Los tipos están en `src/types.ts`.

## Editar los datos de muestra

Todo está en `src/data/demo.ts`: categorías, comercios y productos.

- `id` y `slug` deben ser únicos. El `slug` aparece en la URL.
- `merchantId` y `categoryId` apuntan al `id` de un comercio y de una categoría.
- `price` va en quetzales: `59.9` se muestra como Q59.90.
- `featured: true` hace que el producto aparezca en Destacados del inicio.
- `imageUrl` es una ruta dentro de `public/` (por ejemplo `/demo/products/gorra-bordada.svg`) o una URL absoluta. Las ilustraciones de muestra están en `public/demo/products/`. Si una imagen no carga, se muestra `public/img/sin-imagen.svg`.

Después de editar, `npm test` revisa que no haya ids o slugs repetidos, referencias rotas ni imágenes locales faltantes.

## Estructura

```
src/
  types.ts               Tipos del contrato
  config.ts              Lee VITE_DATA_MODE y VITE_API_BASE_URL
  data/demo.ts           Datos de muestra
  api/
    dataSource.ts        Interfaz DataSource y errores (NotFoundError, DataError)
    demoSource.ts        Implementación demo: filtra src/data/demo.ts con las reglas del contrato
    httpSource.ts        Implementación API: fetch y validación de las respuestas
    index.ts             Elige la implementación según el modo
  lib/                   Filtros en la URL, formato de precios, texto, imágenes, rutas
  hooks/useAsync.ts      Estados de carga, éxito y error, y cancelación de peticiones
  context/               Categorías y comercios, cargados una vez para toda la app
  components/            Encabezado, tarjetas, filtros, estados de error y vacío
  pages/                 Inicio, catálogo, producto, comercio, no encontrado
tests/                   Pruebas con node:test
```

Rutas: `/`, `/productos` (catálogo, filtros en la URL), `/productos/{slug}` y `/comercios/{slug}`.

## Recorrido de una búsqueda

1. **Entrada.** El buscador está en `src/components/SiteHeader.tsx` (`SearchForm`). Al enviarlo navega a `/productos?q=…`. Una búsqueda nueva no arrastra los filtros anteriores.
2. **URL.** La URL es la fuente de verdad. `src/pages/CatalogPage.tsx` lee los parámetros con `parseFilters` (`src/lib/catalogFilters.ts`). Los filtros de `src/components/CatalogFilters.tsx` son enlaces o formularios que solo cambian la URL, por eso se pueden compartir y el botón Atrás los recupera.
3. **Consulta.** `CatalogPage` llama a `dataSource.getProducts(filters)` a través de `useAsync`, que cancela la petición anterior si los filtros cambian.
4. **Origen.** `dataSource` sale de `src/api/index.ts`:
   - en modo `api`, `httpSource.ts` arma `GET {VITE_API_BASE_URL}/api/products?q=…` con los mismos nombres de parámetro y valida la respuesta;
   - en modo `demo`, `demoSource.ts` aplica las mismas reglas sobre `src/data/demo.ts`: coincidencia parcial sin mayúsculas ni tildes en producto o comercio, filtros combinados y precios inclusivos.

## Producción

`npm run build` genera un sitio estático en `dist/`. Como las rutas las maneja el navegador, el servidor tiene que responder `index.html` para cualquier ruta que no sea un archivo, por ejemplo `/productos/gorra-bordada`. Si el sitio se publica en una subcarpeta, compilá con `vite build --base=/subcarpeta/`. Las rutas y las imágenes relativas se ajustan solas.
