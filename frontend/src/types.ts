/**
 * Tipos del contrato con el backend.
 * El modo demo y el modo API devuelven exactamente estas formas.
 */

export interface Category {
  id: string
  slug: string
  name: string
}

export interface Merchant {
  id: string
  slug: string
  name: string
  description: string
  location: string
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  /** Quetzales, por ejemplo 59.90. No son centavos. */
  price: number
  /** URL absoluta o ruta relativa a la raíz del frontend. */
  imageUrl: string
  merchantId: string
  categoryId: string
  featured: boolean
}

/**
 * Parámetros opcionales de `GET /api/products`.
 * `category` y `merchant` son slugs. Los límites de precio son inclusivos.
 */
export interface ProductFilters {
  q?: string
  category?: string
  merchant?: string
  minPrice?: number
  maxPrice?: number
}
