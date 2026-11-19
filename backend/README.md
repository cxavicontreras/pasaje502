# Marketplace API (fase 1: catálogo de solo lectura)

API REST pública para listar, buscar y filtrar productos de comercios locales de Guatemala.
Spring Boot 3.5 · Java 21 · PostgreSQL 16 · Flyway · Spring JDBC.

## Requisitos

- Java 21 y Maven 3.9+
- PostgreSQL 16+ con la extensión `unaccent` (viene en `contrib`; la imagen oficial de Docker ya la trae), o Docker para levantarlo

## Levantar en local

```bash
cd backend
cp .env.example .env          # editá DB_PASSWORD
docker compose up -d          # PostgreSQL en localhost:5432

set -a; source .env; set +a   # exporta las variables a la terminal
mvn spring-boot:run           # API en http://localhost:8080 (perfil dev por SPRING_PROFILES_ACTIVE)
```

Al arrancar, Flyway aplica `db/migration` (esquema). Con el perfil `dev` también aplica
`db/dev/R__dev_seed.sql`: 3 comercios, 5 categorías y 16 productos ficticios. El seed es
idempotente (upsert por `slug`) y solo se reaplica si el archivo cambia, así que reiniciar no
duplica datos.

**¿Ya tenés PostgreSQL instalado?** Saltate `docker compose` y creá el usuario y la base:

```sql
CREATE ROLE marketplace LOGIN PASSWORD '...';
CREATE DATABASE marketplace OWNER marketplace;
```

No hace falta superusuario: `unaccent` es una extensión *trusted* y la crea el dueño de la base.

## Variables de entorno

| Variable | Default | Uso |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/marketplace` | URL JDBC |
| `DB_USERNAME` | `marketplace` | Usuario de la base |
| `DB_PASSWORD` | *(obligatoria)* | Contraseña; nunca se versiona |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Orígenes del frontend, separados por comas |
| `SPRING_PROFILES_ACTIVE` | *(ninguno)* | `dev` para cargar datos de prueba |
| `PORT` | `8080` | Puerto HTTP |

## Endpoints

| Método y ruta | Respuesta |
|---|---|
| `GET /api/categories` | `Category[]` |
| `GET /api/merchants` | `Merchant[]` |
| `GET /api/merchants/{slug}` | `Merchant` o `404` |
| `GET /api/products?q=&category=&merchant=&minPrice=&maxPrice=` | `Product[]` (sin coincidencias → `200 []`) |
| `GET /api/products/{slug}` | `Product` o `404` |

- `category` y `merchant` reciben slugs. `q` busca coincidencias parciales en el nombre del producto o del comercio, sin distinguir mayúsculas ni tildes. Los filtros se combinan y el rango de precio es inclusivo.
- Un precio no numérico o negativo, o un `minPrice` mayor que `maxPrice`, devuelve `400` con `{status, error, message, path}`.
- Las listas se ordenan por nombre y luego por `id`. No hay paginación.
- IDs como string, `price` como número en quetzales (`249.00`) y `featured` como booleano. Para mostrar el comercio de un producto, el frontend cruza `merchantId` con `GET /api/merchants`.

```json
{ "id": "9", "slug": "audifonos-inalambricos-xela", "name": "Audífonos inalámbricos Bluetooth",
  "description": "Estuche de carga, 20 horas de batería.", "price": 249.00,
  "imageUrl": "/images/products/audifonos-inalambricos.jpg",
  "merchantId": "3", "categoryId": "3", "featured": true }
```

## Ejemplos con curl

```bash
curl http://localhost:8080/api/categories
curl http://localhost:8080/api/merchants/importaciones-xela
curl "http://localhost:8080/api/products?q=audifonos"                         # sin tilde → Audífonos
curl "http://localhost:8080/api/products?q=almacen"                           # por comercio
curl "http://localhost:8080/api/products?q=licuadora&merchant=importaciones-xela"
curl "http://localhost:8080/api/products?category=cocina&minPrice=95&maxPrice=150"
curl "http://localhost:8080/api/products?q=no-existe"                         # 200 []
curl -i "http://localhost:8080/api/products?minPrice=300&maxPrice=100"        # 400
curl -i http://localhost:8080/api/products/no-existe                          # 404
```

`q` con caracteres especiales o tildes va codificado en la URL: `curl -G --data-urlencode "q=cámara" http://localhost:8080/api/products`.

## Imágenes de prueba

`imageUrl` acepta una URL absoluta (`https://...`) o una ruta relativa a la raíz del
**frontend** (`/...`); una restricción `CHECK` en la base rechaza cualquier otra cosa. El seed usa
rutas como `/images/products/licuadora.jpg`, así que el frontend debe servir estos archivos desde
su carpeta pública (por ejemplo `public/images/products/` en Vite o Next.js):

`termo-acero.jpg`, `licuadora.jpg`, `sarten.jpg`, `sabanas.jpg`, `organizador.jpg`,
`audifonos-alambricos.jpg`, `audifonos-inalambricos.jpg`, `carrito.jpg`, `peluche-quetzal.jpg`,
`maquillaje.jpg`, `vela.jpg`, `cargador.jpg`, `camara.jpg`, `secadora.jpg`

Productos parecidos comparten imagen. Para usar imágenes externas, cambiá las rutas en
`R__dev_seed.sql` por URLs absolutas. Flyway reaplica el seed en el siguiente arranque.

## Tests

```bash
set -a; source .env; set +a
mvn test
```

`ProductFilterTest` no necesita base. `CatalogApiTest` prueba la API de punta a punta contra el
PostgreSQL local con el seed `dev`; se omite si `DB_PASSWORD` no está definida.

## Cómo viaja una solicitud a `/api/products`

1. `api/ProductController` recibe los query params como texto.
2. `catalog/ProductFilter.of(...)` normaliza los vacíos y valida los precios; si algo es inválido lanza `InvalidRequestException`, que `api/ApiExceptionHandler` convierte en `400`.
3. `catalog/CatalogRepository.findProducts(...)` ejecuta `resources/sql/find-products.sql` con parámetros tipados.
4. Cada fila se mapea a `catalog/Product` y luego a `api/ProductDto`, que Jackson serializa como JSON.

El esquema está en `resources/db/migration/V1__create_catalog.sql` y los datos de prueba en
`resources/db/dev/R__dev_seed.sql`.
