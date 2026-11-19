import { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { dataSource } from '../api/index.ts'
import { ActiveFilters, CatalogFilters } from '../components/CatalogFilters.tsx'
import { FilterIcon } from '../components/icons.tsx'
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid.tsx'
import { EmptyView, ErrorView } from '../components/StatusViews.tsx'
import { useReferenceData } from '../context/referenceData.ts'
import { useAsync } from '../hooks/useAsync.ts'
import {
  catalogPath,
  filtersToSearchParams,
  hasRefinements,
  parseFilters,
} from '../lib/catalogFilters.ts'

function countLabel(count: number): string {
  return count === 1 ? '1 producto' : `${count} productos`
}

/**
 * Catálogo. La URL es la fuente de verdad de la búsqueda y los filtros:
 * se leen de sus parámetros y con ellos se consulta `dataSource.getProducts`.
 */
export function CatalogPage() {
  const [searchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const query = filtersToSearchParams(filters).toString()

  const reference = useReferenceData()
  const products = useAsync(`products?${query}`, (signal) =>
    dataSource.getProducts(filters, signal),
  )

  const [filtersOpen, setFiltersOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const referenceData = reference.status === 'success' ? reference.data : null
  const category = referenceData?.categories.find((item) => item.slug === filters.category)
  const title = filters.q
    ? `Resultados para “${filters.q}”`
    : (category?.name ?? 'Todos los productos')

  const appliedCount =
    (filters.category ? 1 : 0) +
    (filters.merchant ? 1 : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0)

  let status = ''
  if (products.status === 'loading') status = 'Buscando productos…'
  if (products.status === 'success') status = countLabel(products.data.length)

  return (
    <div className="container page">
      <title>{`${title} | Pasaje 502`}</title>

      <header className="catalog-head">
        <h1>{title}</h1>
        <p className="catalog-head__count" role="status">
          {status}
        </p>
      </header>

      <div className="catalog">
        <div className="catalog__sidebar">
          <button
            ref={toggleRef}
            type="button"
            className="button button--secondary filters-toggle"
            aria-expanded={filtersOpen}
            aria-controls="filtros"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <FilterIcon />
            {appliedCount > 0 ? `Filtros (${appliedCount})` : 'Filtros'}
          </button>
          <CatalogFilters
            id="filtros"
            open={filtersOpen}
            filters={filters}
            reference={referenceData}
            referenceFailed={reference.status === 'error'}
            closeLabel={
              products.status === 'success'
                ? `Ver ${countLabel(products.data.length)}`
                : 'Ver productos'
            }
            onClose={() => {
              setFiltersOpen(false)
              toggleRef.current?.focus()
            }}
          />
        </div>

        <section className="catalog__results" aria-label="Productos">
          <ActiveFilters filters={filters} reference={referenceData} />

          {reference.status === 'error' ? (
            <ErrorView
              title="No se pudieron cargar las categorías y los comercios"
              error={reference.error}
              onRetry={() => {
                reference.reload()
                if (products.status === 'error') products.reload()
              }}
            />
          ) : products.status === 'error' ? (
            <ErrorView
              title="No se pudieron cargar los productos"
              error={products.error}
              onRetry={products.reload}
            />
          ) : products.status === 'loading' || !referenceData ? (
            <ProductGridSkeleton />
          ) : products.data.length === 0 ? (
            <EmptyView title="No hay productos que coincidan">
              <p>
                {filters.q
                  ? `Ningún producto ni comercio coincide con “${filters.q}”${hasRefinements(filters) ? ' y los filtros elegidos' : ''}. Se puede buscar con otras palabras${hasRefinements(filters) ? ' o quitar algún filtro' : ''}.`
                  : 'Ningún producto cumple con todos los filtros elegidos. Se puede quitar alguno o ampliar el rango de precio.'}
              </p>
              <div className="notice__actions">
                {hasRefinements(filters) && (
                  <Link
                    className="button button--primary"
                    to={catalogPath(filters.q ? { q: filters.q } : {})}
                  >
                    Limpiar filtros
                  </Link>
                )}
                <Link className="button button--secondary" to="/productos">
                  Ver todos los productos
                </Link>
              </div>
            </EmptyView>
          ) : (
            <ProductGrid products={products.data} merchantById={referenceData.merchantById} />
          )}
        </section>
      </div>
    </div>
  )
}
