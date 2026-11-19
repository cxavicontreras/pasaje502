-- Listado/búsqueda de productos. Todos los filtros son opcionales: un
-- parámetro NULL desactiva su condición. Los CAST explícitos permiten que
-- PostgreSQL conozca el tipo de un parámetro aunque llegue NULL.
--
-- q: coincidencia parcial en nombre del producto O del comercio, sin
-- distinguir mayúsculas ni tildes. Se usa strpos (no LIKE) para que '%' y '_'
-- escritos por el usuario se busquen literalmente.
SELECT p.id,
       p.slug,
       p.name,
       p.description,
       p.price,
       p.image_url,
       p.merchant_id,
       p.category_id,
       p.featured
FROM products p
JOIN merchants  m ON m.id = p.merchant_id
JOIN categories c ON c.id = p.category_id
WHERE (CAST(:q AS text) IS NULL
       OR strpos(lower(unaccent(p.name)), lower(unaccent(CAST(:q AS text)))) > 0
       OR strpos(lower(unaccent(m.name)), lower(unaccent(CAST(:q AS text)))) > 0)
  AND (CAST(:category AS text) IS NULL OR c.slug = CAST(:category AS text))
  AND (CAST(:merchant AS text) IS NULL OR m.slug = CAST(:merchant AS text))
  AND (CAST(:minPrice AS numeric) IS NULL OR p.price >= CAST(:minPrice AS numeric))
  AND (CAST(:maxPrice AS numeric) IS NULL OR p.price <= CAST(:maxPrice AS numeric))
ORDER BY p.name, p.id
