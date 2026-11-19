import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { NotFoundError } from '../api/dataSource.ts'
import { dataSource } from '../api/index.ts'
import { BackIcon, PinIcon } from '../components/icons.tsx'
import { Price } from '../components/Price.tsx'
import { ProductImage } from '../components/ProductImage.tsx'
import { ErrorView, NotFoundView } from '../components/StatusViews.tsx'
import { useReferenceData } from '../context/referenceData.ts'
import { useAsync } from '../hooks/useAsync.ts'
import { catalogPath } from '../lib/catalogFilters.ts'
import { merchantPath } from '../lib/paths.ts'

/** Lee de dónde venía la persona (lo guarda `ProductCard` en el estado de la navegación). */
function readBackTo(state: unknown): string | null {
  if (typeof state !== 'object' || state === null || !('backTo' in state)) return null
  const { backTo } = state
  return typeof backTo === 'string' && backTo.startsWith('/') ? backTo : null
}

function BackLink() {
  const location = useLocation()
  const navigate = useNavigate()
  const backTo = readBackTo(location.state)

  if (!backTo) {
    return (
      <Link className="back-link" to="/productos">
        <BackIcon />
        Todos los productos
      </Link>
    )
  }

  let label = 'Volver al inicio'
  if (backTo.startsWith('/productos')) label = 'Volver a los resultados'
  if (backTo.startsWith('/comercios/')) label = 'Volver al comercio'

  return (
    <Link
      className="back-link"
      to={backTo}
      onClick={(event) => {
        // Un clic normal retrocede en el historial, así se recuperan los filtros y la posición de la lista.
        const plainClick =
          event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
        if (plainClick) {
          event.preventDefault()
          navigate(-1)
        }
      }}
    >
      <BackIcon />
      {label}
    </Link>
  )
}

export function ProductPage() {
  const { slug = '' } = useParams()
  const reference = useReferenceData()
  const product = useAsync(`product:${slug}`, (signal) => dataSource.getProduct(slug, signal))

  if (product.status === 'error') {
    if (product.error instanceof NotFoundError) {
      return (
        <div className="container page">
          <NotFoundView
            title="Este producto no existe"
            message="Puede que el enlace esté mal escrito o que el comercio haya retirado el producto."
          />
        </div>
      )
    }
    return (
      <div className="container page">
        <BackLink />
        <ErrorView
          title="No se pudo cargar el producto"
          error={product.error}
          onRetry={product.reload}
          as="h1"
        />
      </div>
    )
  }

  if (reference.status === 'error') {
    return (
      <div className="container page">
        <BackLink />
        <ErrorView
          title="No se pudo cargar la información del comercio"
          error={reference.error}
          onRetry={reference.reload}
          as="h1"
        />
      </div>
    )
  }

  if (product.status === 'loading' || reference.status === 'loading') {
    return (
      <div className="container page">
        <BackLink />
        <div className="product" role="status">
          <span className="visually-hidden">Cargando producto…</span>
          <div className="product__media skeleton" aria-hidden="true" />
          <div className="product__title" aria-hidden="true">
            <span className="skeleton skeleton--line skeleton--title" />
          </div>
          <div className="product__info" aria-hidden="true">
            <span className="skeleton skeleton--line skeleton--short" />
            <span className="skeleton skeleton--line" />
            <span className="skeleton skeleton--line" />
          </div>
        </div>
      </div>
    )
  }

  const { name, price, description, imageUrl, merchantId, categoryId } = product.data
  const merchant = reference.data.merchantById.get(merchantId)
  const category = reference.data.categoryById.get(categoryId)

  return (
    <div className="container page">
      <title>{`${name} | Pasaje 502`}</title>
      <BackLink />

      <article className="product">
        <div className="product__title">
          <h1>{name}</h1>
        </div>

        <div className="product__media">
          <ProductImage src={imageUrl} alt={name} priority />
        </div>

        <div className="product__info">
          <p className="product__price">
            <Price value={price} />
          </p>

          <section className="seller" aria-labelledby="seller-title">
            <div className="awning awning--small" aria-hidden="true" />
            <div className="seller__body">
              <h2 id="seller-title" className="seller__label">
                Vendido por
              </h2>
              {merchant ? (
                <>
                  <p className="seller__name">{merchant.name}</p>
                  <p className="place">
                    <PinIcon />
                    <span className="visually-hidden">Ubicación: </span>
                    {merchant.location}
                  </p>
                  <Link className="button button--primary" to={merchantPath(merchant.slug)}>
                    Ver perfil del comercio
                  </Link>
                </>
              ) : (
                <p>No se encontró la información del comercio que vende este producto.</p>
              )}
            </div>
          </section>

          <section className="product__description" aria-labelledby="description-title">
            <h2 id="description-title">Descripción</h2>
            <p>{description}</p>
            {category && (
              <p className="product__category">
                Categoría:{' '}
                <Link to={catalogPath({ category: category.slug })}>{category.name}</Link>
              </p>
            )}
          </section>

          <p className="product__note">
            Pasaje 502 todavía no vende en línea: por ahora es un catálogo para conocer los
            productos y a quien los vende.
          </p>
        </div>
      </article>
    </div>
  )
}
