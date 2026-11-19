import type { ProductFilters } from '../types.ts'

/** Convierte un texto en precio. Devuelve `undefined` si está vacío o no es un número válido (>= 0). */
export function parsePrice(raw: string | null): number | undefined {
  if (raw === null || raw.trim() === '') return undefined
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : undefined
}

/** Lee los filtros del catálogo desde los parámetros de la URL. Ignora valores vacíos o inválidos. */
export function parseFilters(params: URLSearchParams): ProductFilters {
  const filters: ProductFilters = {}

  const q = params.get('q')?.trim()
  if (q) filters.q = q

  const category = params.get('category')?.trim()
  if (category) filters.category = category

  const merchant = params.get('merchant')?.trim()
  if (merchant) filters.merchant = merchant

  const minPrice = parsePrice(params.get('minPrice'))
  if (minPrice !== undefined) filters.minPrice = minPrice

  const maxPrice = parsePrice(params.get('maxPrice'))
  if (maxPrice !== undefined) filters.maxPrice = maxPrice

  return filters
}

/**
 * Serializa los filtros con los nombres de parámetro del contrato.
 * Se usa igual para la URL del catálogo y para la consulta a `GET /api/products`.
 */
export function filtersToSearchParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.merchant) params.set('merchant', filters.merchant)
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice))
  return params
}

/** Ruta del catálogo con los filtros dados. */
export function catalogPath(filters: ProductFilters = {}): string {
  const query = filtersToSearchParams(filters).toString()
  return query ? `/productos?${query}` : '/productos'
}

/** Copia de los filtros sin las claves indicadas. */
export function omitFilters(
  filters: ProductFilters,
  ...keys: (keyof ProductFilters)[]
): ProductFilters {
  const next = { ...filters }
  for (const key of keys) delete next[key]
  return next
}

/** Indica si hay filtros de categoría, comercio o precio (la búsqueda por texto no cuenta). */
export function hasRefinements(filters: ProductFilters): boolean {
  return Boolean(
    filters.category ||
      filters.merchant ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined,
  )
}
