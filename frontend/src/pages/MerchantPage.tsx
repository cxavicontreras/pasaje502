import { useParams } from 'react-router'
import { NotFoundError } from '../api/dataSource.ts'
import { dataSource } from '../api/index.ts'
import { PinIcon } from '../components/icons.tsx'
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid.tsx'
import { EmptyView, ErrorView, NotFoundView } from '../components/StatusViews.tsx'
import { useAsync } from '../hooks/useAsync.ts'

export function MerchantPage() {
  const { slug = '' } = useParams()
  const merchant = useAsync(`merchant:${slug}`, (signal) => dataSource.getMerchant(slug, signal))
  // Solo los productos de este comercio: GET /api/products?merchant={slug}
  const products = useAsync(`products?merchant=${slug}`, (signal) =>
    dataSource.getProducts({ merchant: slug }, signal),
  )

  if (merchant.status === 'error') {
    return (
      <div className="container page">
        {merchant.error instanceof NotFoundError ? (
          <NotFoundView
            title="Este comercio no existe"
            message="Puede que el enlace esté mal escrito o que el comercio ya no publique en Pasaje 502."
          />
        ) : (
          <ErrorView
            title="No se pudo cargar el comercio"
            error={merchant.error}
            onRetry={merchant.reload}
            as="h1"
          />
        )}
      </div>
    )
  }

  if (merchant.status === 'loading') {
    return (
      <div className="container page">
        <div className="storefront" role="status">
          <span className="visually-hidden">Cargando comercio…</span>
          <div className="awning" aria-hidden="true" />
          <div className="storefront__body" aria-hidden="true">
            <span className="skeleton skeleton--line skeleton--title" />
            <span className="skeleton skeleton--line skeleton--short" />
            <span className="skeleton skeleton--line" />
          </div>
        </div>
      </div>
    )
  }

  const { id, name, location, description } = merchant.data
  const merchantById = new Map([[id, merchant.data]])

  return (
    <div className="container page">
      <title>{`${name} | Pasaje 502`}</title>

      <header className="storefront">
        <div className="awning" aria-hidden="true" />
        <div className="storefront__body">
          <h1>{name}</h1>
          <p className="place">
            <PinIcon />
            <span className="visually-hidden">Ubicación: </span>
            {location}
          </p>
          <p className="storefront__description">{description}</p>
        </div>
      </header>

      <section className="section" aria-labelledby="merchant-products-title">
        <div className="section__head">
          <h2 id="merchant-products-title">Productos de {name}</h2>
          {products.status === 'success' && products.data.length > 0 && (
            <p className="section__meta">
              {products.data.length === 1 ? '1 producto' : `${products.data.length} productos`}
            </p>
          )}
        </div>

        {products.status === 'loading' && <ProductGridSkeleton count={4} />}
        {products.status === 'error' && (
          <ErrorView
            title="No se pudieron cargar los productos de este comercio"
            error={products.error}
            onRetry={products.reload}
            as="h3"
          />
        )}
        {products.status === 'success' &&
          (products.data.length === 0 ? (
            <EmptyView title="Este comercio todavía no tiene productos publicados" as="h3" />
          ) : (
            <ProductGrid
              products={products.data}
              merchantById={merchantById}
              linkToMerchant={false}
            />
          ))}
      </section>
    </div>
  )
}
