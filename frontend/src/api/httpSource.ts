import { filtersToSearchParams } from '../lib/catalogFilters.ts'
import type { Category, Merchant, Product } from '../types.ts'
import { DataError, NotFoundError, type DataSource } from './dataSource.ts'

type Json = Record<string, unknown>

function asObject(payload: unknown): Json {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new Error('se esperaba un objeto')
  }
  return payload as Json
}

function text(source: Json, field: string): string {
  const value = source[field]
  if (typeof value !== 'string') throw new Error(`el campo "${field}" debe ser un string`)
  return value
}

function parseCategory(payload: unknown): Category {
  const source = asObject(payload)
  return { id: text(source, 'id'), slug: text(source, 'slug'), name: text(source, 'name') }
}

function parseMerchant(payload: unknown): Merchant {
  const source = asObject(payload)
  return {
    id: text(source, 'id'),
    slug: text(source, 'slug'),
    name: text(source, 'name'),
    description: text(source, 'description'),
    location: text(source, 'location'),
  }
}

function parseProduct(payload: unknown): Product {
  const source = asObject(payload)
  const { price, featured } = source
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    throw new Error('el campo "price" debe ser un número en quetzales')
  }
  if (typeof featured !== 'boolean') throw new Error('el campo "featured" debe ser booleano')
  return {
    id: text(source, 'id'),
    slug: text(source, 'slug'),
    name: text(source, 'name'),
    description: text(source, 'description'),
    price,
    imageUrl: text(source, 'imageUrl'),
    merchantId: text(source, 'merchantId'),
    categoryId: text(source, 'categoryId'),
    featured,
  }
}

function listOf<T>(parseItem: (payload: unknown) => T): (payload: unknown) => T[] {
  return (payload) => {
    if (!Array.isArray(payload)) throw new Error('se esperaba una lista')
    return payload.map(parseItem)
  }
}

/**
 * Origen de datos real: consulta el backend por HTTP según el contrato.
 * `baseUrl` es el origen del backend sin la ruta `/api`; vacío usa el mismo origen que el frontend.
 * Cualquier fallo se informa con `DataError`: nunca se reemplaza por datos de demo.
 */
export function createHttpSource(baseUrl: string): DataSource {
  const root = baseUrl.replace(/\/+$/, '')

  async function request<T>(
    path: string,
    parse: (payload: unknown) => T,
    signal: AbortSignal | undefined,
    notFoundMeansMissing = false,
  ): Promise<T> {
    const url = `${root}${path}`

    let response: Response
    try {
      response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    } catch (error) {
      if (signal?.aborted) throw error
      throw new DataError('No se pudo conectar con el servidor.', `GET ${url}: sin respuesta`)
    }

    if (response.status === 404 && notFoundMeansMissing) throw new NotFoundError()
    if (!response.ok) {
      throw new DataError(
        'El servidor respondió con un error.',
        `GET ${url}: HTTP ${response.status}`,
      )
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch (error) {
      if (signal?.aborted) throw error
      throw new DataError(
        'El servidor devolvió una respuesta que no se pudo leer.',
        `GET ${url}: la respuesta no es JSON`,
      )
    }

    try {
      return parse(payload)
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'formato desconocido'
      throw new DataError(
        'El servidor devolvió datos con un formato distinto al esperado.',
        `GET ${url}: ${reason}`,
      )
    }
  }

  return {
    getCategories: (signal) => request('/api/categories', listOf(parseCategory), signal),
    getMerchants: (signal) => request('/api/merchants', listOf(parseMerchant), signal),
    getMerchant: (slug, signal) =>
      request(`/api/merchants/${encodeURIComponent(slug)}`, parseMerchant, signal, true),
    getProducts: (filters = {}, signal) => {
      const query = filtersToSearchParams(filters).toString()
      return request(`/api/products${query ? `?${query}` : ''}`, listOf(parseProduct), signal)
    },
    getProduct: (slug, signal) =>
      request(`/api/products/${encodeURIComponent(slug)}`, parseProduct, signal, true),
  }
}
