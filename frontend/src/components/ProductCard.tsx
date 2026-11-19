import { Link, useLocation } from 'react-router'
import { merchantPath, productPath } from '../lib/paths.ts'
import type { Merchant, Product } from '../types.ts'
import { Price } from './Price.tsx'
import { ProductImage } from './ProductImage.tsx'

interface ProductCardProps {
  product: Product
  /** Comercio que vende el producto. `undefined` si no vino en la lista de comercios. */
  merchant: Merchant | undefined
  /** En el perfil del comercio el nombre del vendedor no necesita enlace. */
  linkToMerchant?: boolean
}

/** Tarjeta de producto: siempre muestra nombre, precio y vendedor. */
export function ProductCard({ product, merchant, linkToMerchant = true }: ProductCardProps) {
  const location = useLocation()
  // La página de detalle usa este dato para ofrecer "Volver a los resultados".
  const backTo = `${location.pathname}${location.search}`

  return (
    <li className="product-card">
      <div className="product-card__media">
        <ProductImage src={product.imageUrl} alt="" />
      </div>
      <div className="product-card__body">
        <h3 className="product-card__name">
          <Link className="product-card__link" to={productPath(product.slug)} state={{ backTo }}>
            {product.name}
          </Link>
        </h3>
        <p className="product-card__price">
          <Price value={product.price} />
        </p>
        <p className="product-card__seller">
          {!merchant && 'Comercio no disponible'}
          {merchant && linkToMerchant && (
            <>
              Vende <Link to={merchantPath(merchant.slug)}>{merchant.name}</Link>
            </>
          )}
          {merchant && !linkToMerchant && <>Vende {merchant.name}</>}
        </p>
      </div>
    </li>
  )
}
