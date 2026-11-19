-- Datos ficticios SOLO para desarrollo (perfil "dev").
--
-- Es una migración repetible de Flyway: corre una vez y se vuelve a aplicar
-- solo si este archivo cambia. Además todo es upsert por slug, así que
-- reiniciar la API o reaplicar el archivo nunca duplica filas.
--
-- Imágenes: las rutas "/images/products/<slug>.jpg" son relativas a la raíz
-- del frontend (ver README, sección "Imágenes de prueba").

INSERT INTO merchants (slug, name, description, location) VALUES
    ('almacen-el-quetzal',     'Almacén El Quetzal',      'Artículos para el hogar y cocina a precio de mayoreo.',            'Zona 1, Ciudad de Guatemala'),
    ('variedades-la-antigua',  'Variedades La Antigua',   'Tienda de variedades con regalos, juguetes y detalles.',           'Antigua Guatemala, Sacatepéquez'),
    ('importaciones-xela',     'Importaciones Xela',      'Tecnología y accesorios importados directamente.',                 'Quetzaltenango')
ON CONFLICT (slug) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    location    = EXCLUDED.location;

INSERT INTO categories (slug, name) VALUES
    ('hogar',      'Hogar'),
    ('cocina',     'Cocina'),
    ('tecnologia', 'Tecnología'),
    ('juguetes',   'Juguetes'),
    ('belleza',    'Belleza y cuidado personal')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name;

-- Productos parecidos entre comercios a propósito (termos, licuadoras,
-- audífonos, sartenes) para probar que el filtro por comercio no los mezcla.
INSERT INTO products (slug, name, description, price, image_url, merchant_id, category_id, featured)
SELECT v.slug, v.name, v.description, v.price, v.image_url, m.id, c.id, v.featured
FROM (VALUES
    -- Almacén El Quetzal
    ('termo-acero-1l-el-quetzal',          'Termo de acero inoxidable 1 L',     'Mantiene bebidas calientes 12 horas.',                 95.00,  '/images/products/termo-acero.jpg',          'almacen-el-quetzal',    'cocina',     TRUE),
    ('licuadora-5-velocidades-el-quetzal', 'Licuadora 5 velocidades',           'Vaso de vidrio de 1.5 L, cuchillas de acero.',         349.00, '/images/products/licuadora.jpg',            'almacen-el-quetzal',    'cocina',     FALSE),
    ('sarten-antiadherente-el-quetzal',    'Sartén antiadherente 28 cm',        'Recubrimiento cerámico, apto para inducción.',         150.00, '/images/products/sarten.jpg',               'almacen-el-quetzal',    'cocina',     FALSE),
    ('juego-sabanas-matrimonial',          'Juego de sábanas matrimonial',      'Algodón y poliéster, 4 piezas.',                       225.50, '/images/products/sabanas.jpg',              'almacen-el-quetzal',    'hogar',      FALSE),
    ('organizador-plastico-3-gavetas',     'Organizador plástico 3 gavetas',    'Ideal para ropa o útiles escolares.',                  180.00, '/images/products/organizador.jpg',          'almacen-el-quetzal',    'hogar',      FALSE),
    ('audifonos-alambricos-el-quetzal',    'Audífonos alámbricos',              'Conector 3.5 mm con micrófono.',                       45.00,  '/images/products/audifonos-alambricos.jpg', 'almacen-el-quetzal',    'tecnologia', FALSE),

    -- Variedades La Antigua
    ('termo-acero-1l-la-antigua',          'Termo de acero inoxidable 1 L',     'Diseño de tejido típico, tapa a presión.',             110.00, '/images/products/termo-acero.jpg',          'variedades-la-antigua', 'cocina',     FALSE),
    ('carrito-control-remoto',             'Carrito a control remoto',          'Recargable por USB, alcance de 30 m.',                 199.99, '/images/products/carrito.jpg',              'variedades-la-antigua', 'juguetes',   TRUE),
    ('peluche-quetzal',                    'Peluche de quetzal',                'Peluche de 30 cm del ave nacional.',                   75.00,  '/images/products/peluche-quetzal.jpg',      'variedades-la-antigua', 'juguetes',   FALSE),
    ('set-maquillaje-basico',              'Set de maquillaje básico',          'Sombras, rubor y brochas en estuche.',                 135.00, '/images/products/maquillaje.jpg',           'variedades-la-antigua', 'belleza',    FALSE),
    ('vela-aromatica-cafe',                'Vela aromática de café',            'Cera de soya con aroma a café de Antigua.',            60.00,  '/images/products/vela.jpg',                 'variedades-la-antigua', 'hogar',      FALSE),

    -- Importaciones Xela
    ('audifonos-inalambricos-xela',        'Audífonos inalámbricos Bluetooth',  'Estuche de carga, 20 horas de batería.',               249.00, '/images/products/audifonos-inalambricos.jpg','importaciones-xela',   'tecnologia', TRUE),
    ('cargador-rapido-usb-c',              'Cargador rápido USB-C 20 W',        'Compatible con la mayoría de teléfonos.',              89.90,  '/images/products/cargador.jpg',             'importaciones-xela',    'tecnologia', FALSE),
    ('licuadora-5-velocidades-xela',       'Licuadora 5 velocidades',           'Importada, vaso de plástico libre de BPA.',            299.00, '/images/products/licuadora.jpg',            'importaciones-xela',    'cocina',     FALSE),
    ('camara-seguridad-wifi',              'Cámara de seguridad Wi-Fi',         'Visión nocturna y app para el teléfono.',              350.00, '/images/products/camara.jpg',               'importaciones-xela',    'tecnologia', FALSE),
    ('secadora-pelo-ionica',               'Secadora de pelo iónica',           '2000 W, dos velocidades y aire frío.',                 210.00, '/images/products/secadora.jpg',             'importaciones-xela',    'belleza',    FALSE)
) AS v(slug, name, description, price, image_url, merchant_slug, category_slug, featured)
JOIN merchants  m ON m.slug = v.merchant_slug
JOIN categories c ON c.slug = v.category_slug
ON CONFLICT (slug) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    price       = EXCLUDED.price,
    image_url   = EXCLUDED.image_url,
    merchant_id = EXCLUDED.merchant_id,
    category_id = EXCLUDED.category_id,
    featured    = EXCLUDED.featured;
