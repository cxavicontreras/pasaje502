import { categories, merchants, products } from '../data/demo.ts'
import { normalizeText } from '../lib/text.ts'
import type { Product, ProductFilters } from '../types.ts'
import { NotFoundError, type DataSource } from './dataSource.ts'

/** Espera simulada para que los estados de carga se vean también en modo demo. */
const DEMO_LATENCY_MS = 250

/** Aplica sobre los datos de muestra las mismas reglas que `GET /api/products`. */
export function filterDemoProducts(filters: ProductFilters = {}): Product[] {
  const category = filters.category
    ? categories.find((item) => item.slug === filters.category)
    : undefined
  const merchant = filters.merchant
    ? merchants.find((item) => item.slug === filters.merchant)
    : undefined

  // Un slug que no existe no coincide con ningún producto.
  if (filters.category && !category) return []
  if (filters.merchant && !merchant) return []

  const query = filters.q ? normalizeText(filters.q) : ''
  const merchantNames = new Map(merchants.map((item) => [item.id, normalizeText(item.name)]))

  return products.filter((product) => {
    if (category && product.categoryId !== category.id) return false
    if (merchant && product.merchantId !== merchant.id) return false
    if (filters.minPrice !== undefined && product.price < filters.minPrice) return false
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false
    if (query) {
      const inProductName = normalizeText(product.name).includes(query)
      const inMerchantName = (merchantNames.get(product.merchantId) ?? '').includes(query)
      if (!inProductName && !inMerchantName) return false
    }
    return true
  })
}

/** Origen de datos de demo: responde con los datos de `src/data/demo.ts` respetando el contrato. */
export function createDemoSource(latencyMs = DEMO_LATENCY_MS): DataSource {
  function respond<T>(produce: () => T, signal?: AbortSignal): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (signal?.aborted) {
        reject(signal.reason)
        return
      }
      const timer = setTimeout(() => {
        try {
          // Se entrega una copia para que nadie modifique los datos de muestra.
          resolve(structuredClone(produce()))
        } catch (error) {
          reject(error)
        }
      }, latencyMs)
      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer)
          reject(signal.reason)
        },
        { once: true },
      )
    })
  }

  return {
    getCategories: (signal) => respond(() => categories, signal),
    getMerchants: (signal) => respond(() => merchants, signal),
    getMerchant: (slug, signal) =>
      respond(() => {
        const merchant = merchants.find((item) => item.slug === slug)
        if (!merchant) throw new NotFoundError(`No existe el comercio "${slug}"`)
        return merchant
      }, signal),
    getProducts: (filters, signal) => respond(() => filterDemoProducts(filters), signal),
    getProduct: (slug, signal) =>
      respond(() => {
        const product = products.find((item) => item.slug === slug)
        if (!product) throw new NotFoundError(`No existe el producto "${slug}"`)
        return product
      }, signal),
  }
}
