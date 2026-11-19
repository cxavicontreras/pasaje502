import type { Merchant, Product } from '../types.ts'
import { ProductCard } from './ProductCard.tsx'

function gridClass(featured: boolean | undefined): string {
  return featured ? 'product-grid product-grid--featured' : 'product-grid'
}

interface ProductGridProps {
  products: Product[]
  merchantById: ReadonlyMap<string, Merchant>
  linkToMerchant?: boolean
  /** Variante de la portada: columnas fijas para que los destacados llenen filas completas. */
  featured?: boolean
}

export function ProductGrid({ products, merchantById, linkToMerchant, featured }: ProductGridProps) {
  return (
    <ul className={gridClass(featured)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          merchant={merchantById.get(product.merchantId)}
          linkToMerchant={linkToMerchant}
        />
      ))}
    </ul>
  )
}

interface ProductGridSkeletonProps {
  count?: number
  label?: string
  featured?: boolean
}

/** Estado de carga con la misma forma que la grilla de productos. */
export function ProductGridSkeleton({
  count = 8,
  label = 'Cargando productos…',
  featured,
}: ProductGridSkeletonProps) {
  return (
    <div role="status">
      <span className="visually-hidden">{label}</span>
      <ul className={gridClass(featured)} aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="product-card product-card--skeleton">
            <div className="product-card__media skeleton" />
            <div className="product-card__body">
              <span className="skeleton skeleton--line" />
              <span className="skeleton skeleton--line skeleton--short" />
              <span className="skeleton skeleton--line skeleton--shorter" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
