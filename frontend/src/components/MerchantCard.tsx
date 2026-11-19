import { Link } from 'react-router'
import { merchantPath } from '../lib/paths.ts'
import type { Merchant } from '../types.ts'
import { PinIcon } from './icons.tsx'

export function MerchantCard({ merchant }: { merchant: Merchant }) {
  return (
    <li className="merchant-card">
      <div className="awning" aria-hidden="true" />
      <div className="merchant-card__body">
        <h3 className="merchant-card__name">
          <Link className="merchant-card__link" to={merchantPath(merchant.slug)}>
            {merchant.name}
          </Link>
        </h3>
        <p className="place">
          <PinIcon />
          <span className="visually-hidden">Ubicación: </span>
          {merchant.location}
        </p>
        <p className="merchant-card__description">{merchant.description}</p>
        {/* Pista visual de que la tarjeta lleva al perfil; el enlace real es el nombre. */}
        <p className="merchant-card__cue" aria-hidden="true">
          Ver perfil y productos
        </p>
      </div>
    </li>
  )
}
