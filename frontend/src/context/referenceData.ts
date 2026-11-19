import { createContext, useContext } from 'react'
import type { AsyncResult } from '../hooks/useAsync.ts'
import type { Category, Merchant } from '../types.ts'

/** Categorías y comercios: se cargan una vez y sirven para filtros y para mostrar quién vende cada producto. */
export interface ReferenceData {
  categories: Category[]
  merchants: Merchant[]
  categoryById: ReadonlyMap<string, Category>
  merchantById: ReadonlyMap<string, Merchant>
}

export const ReferenceDataContext = createContext<AsyncResult<ReferenceData> | null>(null)

export function useReferenceData(): AsyncResult<ReferenceData> {
  const value = useContext(ReferenceDataContext)
  if (!value) throw new Error('useReferenceData debe usarse dentro de ReferenceDataProvider')
  return value
}
