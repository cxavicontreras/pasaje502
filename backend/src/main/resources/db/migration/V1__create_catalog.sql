-- Esquema inicial del catálogo: comercios, categorías y productos.

-- Búsqueda sin distinguir tildes. unaccent es una extensión "trusted" desde
-- PostgreSQL 13, así que el dueño de la base puede crearla sin superusuario.
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE merchants (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug        VARCHAR(120) NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT         NOT NULL DEFAULT '',
    location    VARCHAR(200) NOT NULL DEFAULT '',
    CONSTRAINT merchants_slug_key UNIQUE (slug),
    CONSTRAINT merchants_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE TABLE categories (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug VARCHAR(120) NOT NULL,
    name VARCHAR(200) NOT NULL,
    CONSTRAINT categories_slug_key UNIQUE (slug),
    CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE TABLE products (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug        VARCHAR(160)  NOT NULL,
    name        VARCHAR(200)  NOT NULL,
    description TEXT          NOT NULL DEFAULT '',
    -- Quetzales con centavos exactos (no float, no centavos enteros).
    price       NUMERIC(12, 2) NOT NULL,
    -- URL absoluta (http/https) o ruta relativa a la raíz del frontend ("/...").
    image_url   VARCHAR(500)  NOT NULL,
    merchant_id BIGINT        NOT NULL,
    category_id BIGINT        NOT NULL,
    featured    BOOLEAN       NOT NULL DEFAULT FALSE,
    CONSTRAINT products_slug_key UNIQUE (slug),
    CONSTRAINT products_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT products_price_non_negative CHECK (price >= 0),
    CONSTRAINT products_image_url_format CHECK (image_url ~ '^(https?://|/)'),
    CONSTRAINT products_merchant_fk FOREIGN KEY (merchant_id) REFERENCES merchants (id),
    CONSTRAINT products_category_fk FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE INDEX products_merchant_id_idx ON products (merchant_id);
CREATE INDEX products_category_id_idx ON products (category_id);
CREATE INDEX products_price_idx ON products (price);
