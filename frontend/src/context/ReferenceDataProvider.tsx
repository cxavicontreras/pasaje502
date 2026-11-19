import type { ReactNode } from 'react'
import { dataSource } from '../api/index.ts'
import { useAsync } from '../hooks/useAsync.ts'
import { ReferenceDataContext, type ReferenceData } from './referenceData.ts'

export function ReferenceDataProvider({ children }: { children: ReactNode }) {
  const state = useAsync<ReferenceData>('reference', async (signal) => {
    const [categories, merchants] = await Promise.all([
      dataSource.getCategories(signal),
      dataSource.getMerchants(signal),
    ])
    return {
      categories,
      merchants,
      categoryById: new Map(categories.map((category) => [category.id, category])),
      merchantById: new Map(merchants.map((merchant) => [merchant.id, merchant])),
    }
  })

  return <ReferenceDataContext value={state}>{children}</ReferenceDataContext>
}
