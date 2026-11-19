import type { Category, Merchant, Product, ProductFilters } from '../types.ts'

/**
 * Contrato de acceso a datos. Cada método corresponde a un endpoint del backend.
 * Lo implementan el modo demo (`demoSource.ts`) y el modo API (`httpSource.ts`).
 */
export interface DataSource {
  /** GET /api/categories */
  getCategories(signal?: AbortSignal): Promise<Category[]>
  /** GET /api/merchants */
  getMerchants(signal?: AbortSignal): Promise<Merchant[]>
  /** GET /api/merchants/{slug}. Rechaza con `NotFoundError` si no existe. */
  getMerchant(slug: string, signal?: AbortSignal): Promise<Merchant>
  /** GET /api/products con filtros opcionales y combinables. */
  getProducts(filters?: ProductFilters, signal?: AbortSignal): Promise<Product[]>
  /** GET /api/products/{slug}. Rechaza con `NotFoundError` si no existe. */
  getProduct(slug: string, signal?: AbortSignal): Promise<Product>
}

/** El recurso pedido no existe (404 del contrato). */
export class NotFoundError extends Error {
  constructor(message = 'Recurso no encontrado') {
    super(message)
    this.name = 'NotFoundError'
  }
}

/** No se pudieron obtener los datos: sin conexión, error del servidor o respuesta fuera del contrato. */
export class DataError extends Error {
  /** Detalle técnico para quien integra (petición y motivo). */
  readonly detail: string | undefined

  constructor(message: string, detail?: string) {
    super(message)
    this.name = 'DataError'
    this.detail = detail
  }
}
