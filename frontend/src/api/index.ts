import { apiBaseUrl, dataMode } from '../config.ts'
import { DataError, type DataSource } from './dataSource.ts'
import { createDemoSource } from './demoSource.ts'
import { createHttpSource } from './httpSource.ts'

function notConfigured(): Promise<never> {
  return Promise.reject(
    new DataError(
      'Falta configurar el origen de datos.',
      'VITE_DATA_MODE debe ser "demo" o "api".',
    ),
  )
}

function selectDataSource(): DataSource {
  switch (dataMode) {
    case 'demo':
      return createDemoSource()
    case 'api':
      return createHttpSource(apiBaseUrl)
    default:
      // Sin modo válido no se asume demo: toda consulta falla con un error visible.
      return {
        getCategories: notConfigured,
        getMerchants: notConfigured,
        getMerchant: notConfigured,
        getProducts: notConfigured,
        getProduct: notConfigured,
      }
  }
}

/**
 * Único punto donde se elige el origen de datos, según VITE_DATA_MODE.
 * Las pantallas solo conocen la interfaz `DataSource`.
 */
export const dataSource: DataSource = selectDataSource()
