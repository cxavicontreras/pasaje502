import { Link } from 'react-router'
import { dataSource } from '../api/index.ts'
import { MerchantCard } from '../components/MerchantCard.tsx'
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid.tsx'
import { EmptyView, ErrorView } from '../components/StatusViews.tsx'
import { useReferenceData, type ReferenceData } from '../context/referenceData.ts'
import { useAsync, type AsyncResult } from '../hooks/useAsync.ts'
import { catalogPath } from '../lib/catalogFilters.ts'
import type { Product } from '../types.ts'

export function HomePage() {
  const reference = useReferenceData()
  const products = useAsync('products', (signal) => dataSource.getProducts({}, signal))

  return (
    <>
      <title>Pasaje 502 | Productos de almacenes y tiendas de Guatemala</title>

      <div className="home-top">
        <div className="container home-top__inner">
          <div className="home-top__intro">
            <h1 className="home-top__title">Productos de almacenes y tiendas de Guatemala</h1>
            <p className="home-top__lede">
              Un solo lugar para explorar lo que venden los comercios locales y saber quién vende
              cada producto.
            </p>
          </div>

          <nav className="arcade" aria-label="Categorías">
            {reference.status === 'loading' && (
              <div className="arcade__list" role="status">
                <span className="visually-hidden">Cargando categorías…</span>
                {Array.from({ length: 5 }, (_, index) => (
                  <span key={index} className="arch arch--skeleton skeleton" aria-hidden="true" />
                ))}
              </div>
            )}
            {reference.status === 'success' && (
              <ul className="arcade__list">
                {reference.data.categories.map((category) => (
                  <li key={category.id}>
                    <Link className="arch" to={catalogPath({ category: category.slug })}>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>
      </div>

      <div className="container page">
        {reference.status === 'error' ? (
          <ErrorView
            title="No se pudieron cargar las categorías y los comercios"
            error={reference.error}
            onRetry={() => {
              reference.reload()
              if (products.status === 'error') products.reload()
            }}
          />
        ) : (
          <>
            <section className="section" aria-labelledby="destacados-title">
              <div className="section__head">
                <h2 id="destacados-title">Productos destacados</h2>
                <Link to="/productos">Ver todos los productos</Link>
              </div>
              <FeaturedProducts products={products} reference={reference} />
            </section>

            <section className="section" id="comercios" aria-labelledby="comercios-title">
              <div className="section__head">
                <h2 id="comercios-title">Comercios</h2>
              </div>
              {reference.status === 'loading' ? (
                <p role="status">Cargando comercios…</p>
              ) : reference.data.merchants.length === 0 ? (
                <EmptyView title="Todavía no hay comercios publicados" as="h3" />
              ) : (
                <ul className="merchant-grid">
                  {reference.data.merchants.map((merchant) => (
                    <MerchantCard key={merchant.id} merchant={merchant} />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </>
  )
}

function FeaturedProducts({
  products,
  reference,
}: {
  products: AsyncResult<Product[]>
  reference: AsyncResult<ReferenceData>
}) {
  if (products.status === 'error') {
    return (
      <ErrorView
        title="No se pudieron cargar los productos"
        error={products.error}
        onRetry={products.reload}
        as="h3"
      />
    )
  }
  if (products.status === 'loading' || reference.status !== 'success') {
    return <ProductGridSkeleton count={6} featured />
  }

  // Destacados = productos con `featured: true`, como define el contrato.
  const featured = products.data.filter((product) => product.featured)
  if (featured.length === 0) {
    return (
      <EmptyView title="Todavía no hay productos destacados" as="h3">
        <p>
          El catálogo completo está en <Link to="/productos">todos los productos</Link>.
        </p>
      </EmptyView>
    )
  }
  return <ProductGrid products={featured} merchantById={reference.data.merchantById} featured />
}
