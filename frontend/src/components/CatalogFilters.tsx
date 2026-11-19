import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { ReferenceData } from '../context/referenceData.ts'
import {
  catalogPath,
  hasRefinements,
  omitFilters,
  parsePrice,
} from '../lib/catalogFilters.ts'
import { formatPrice } from '../lib/format.ts'
import type { ProductFilters } from '../types.ts'
import { CloseIcon } from './icons.tsx'

/** Ruta del catálogo que conserva la búsqueda por texto y quita categoría, comercio y precio. */
function clearedPath(filters: ProductFilters): string {
  return catalogPath(filters.q ? { q: filters.q } : {})
}

interface FilterOption {
  key: string
  label: string
  to: string
  current: boolean
}

function FilterGroup({
  id,
  title,
  options,
}: {
  id: string
  title: string
  options: FilterOption[]
}) {
  const headingId = `${id}-title`
  return (
    <div className="filters__group">
      <h3 id={headingId} className="filters__label">
        {title}
      </h3>
      <ul className="filter-options" aria-labelledby={headingId}>
        {options.map((option) => (
          <li key={option.key}>
            <Link
              className="filter-option"
              to={option.to}
              aria-current={option.current ? 'true' : undefined}
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PriceFilter({ filters }: { filters: ProductFilters }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  return (
    <form
      className="filters__group price-filter"
      onSubmit={(event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const minPrice = parsePrice(String(form.get('minPrice') ?? ''))
        const maxPrice = parsePrice(String(form.get('maxPrice') ?? ''))
        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
          setError('El precio mínimo no puede ser mayor que el máximo.')
          return
        }
        setError('')
        const next = omitFilters(filters, 'minPrice', 'maxPrice')
        if (minPrice !== undefined) next.minPrice = minPrice
        if (maxPrice !== undefined) next.maxPrice = maxPrice
        navigate(catalogPath(next))
      }}
    >
      <fieldset className="price-filter__fieldset">
        <legend className="filters__label">Precio en quetzales</legend>
        <div className="price-filter__fields">
          <label className="price-filter__field">
            Mínimo
            <input
              type="number"
              name="minPrice"
              min="0"
              step="any"
              inputMode="decimal"
              defaultValue={filters.minPrice ?? ''}
            />
          </label>
          <label className="price-filter__field">
            Máximo
            <input
              type="number"
              name="maxPrice"
              min="0"
              step="any"
              inputMode="decimal"
              defaultValue={filters.maxPrice ?? ''}
            />
          </label>
        </div>
      </fieldset>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button button--secondary button--block">
        Aplicar precio
      </button>
    </form>
  )
}

interface CatalogFiltersProps {
  id: string
  /** En celular el panel se abre y se cierra; en escritorio siempre está visible. */
  open: boolean
  filters: ProductFilters
  /** `null` mientras cargan las categorías y los comercios, o si no se pudieron cargar. */
  reference: ReferenceData | null
  referenceFailed: boolean
  /** Texto del botón que cierra el panel en celular, por ejemplo "Ver 7 productos". */
  closeLabel: string
  onClose: () => void
}

/**
 * Filtros del catálogo. Cada opción es un enlace a la misma página con otros parámetros,
 * así los filtros viven en la URL: se pueden compartir y el botón Atrás los recupera.
 */
export function CatalogFilters({
  id,
  open,
  filters,
  reference,
  referenceFailed,
  closeLabel,
  onClose,
}: CatalogFiltersProps) {
  const navigate = useNavigate()
  const canClear = hasRefinements(filters)

  return (
    <aside
      id={id}
      className={open ? 'filters is-open' : 'filters'}
      aria-labelledby="filters-title"
    >
      <h2 id="filters-title" className="filters__title">
        Filtros
      </h2>

      {reference ? (
        <>
          <FilterGroup
            id="filter-category"
            title="Categoría"
            options={[
              {
                key: '',
                label: 'Todas',
                to: catalogPath(omitFilters(filters, 'category')),
                current: !filters.category,
              },
              ...reference.categories.map((category) => ({
                key: category.id,
                label: category.name,
                to: catalogPath({ ...filters, category: category.slug }),
                current: filters.category === category.slug,
              })),
            ]}
          />
          <FilterGroup
            id="filter-merchant"
            title="Comercio"
            options={[
              {
                key: '',
                label: 'Todos',
                to: catalogPath(omitFilters(filters, 'merchant')),
                current: !filters.merchant,
              },
              ...reference.merchants.map((merchant) => ({
                key: merchant.id,
                label: merchant.name,
                to: catalogPath({ ...filters, merchant: merchant.slug }),
                current: filters.merchant === merchant.slug,
              })),
            ]}
          />
        </>
      ) : referenceFailed ? (
        <p className="filters__loading">Las categorías y los comercios no están disponibles.</p>
      ) : (
        <p className="filters__loading" role="status">
          Cargando categorías y comercios…
        </p>
      )}

      {/* La clave reinicia los campos cuando el precio cambia desde la URL (Atrás, quitar un filtro). */}
      <PriceFilter key={`${filters.minPrice ?? ''}-${filters.maxPrice ?? ''}`} filters={filters} />

      <div className="filters__footer">
        <button
          type="button"
          className="button button--quiet button--block"
          aria-disabled={!canClear}
          onClick={() => {
            if (canClear) navigate(clearedPath(filters))
          }}
        >
          Limpiar filtros
        </button>
        <button
          type="button"
          className="button button--primary button--block filters__close"
          onClick={onClose}
        >
          {closeLabel}
        </button>
      </div>
    </aside>
  )
}

function priceLabel(minPrice: number | undefined, maxPrice: number | undefined): string {
  if (minPrice !== undefined && maxPrice !== undefined) {
    return `Precio: ${formatPrice(minPrice)} a ${formatPrice(maxPrice)}`
  }
  if (minPrice !== undefined) return `Precio: desde ${formatPrice(minPrice)}`
  return `Precio: hasta ${formatPrice(maxPrice ?? 0)}`
}

interface ActiveFiltersProps {
  filters: ProductFilters
  reference: ReferenceData | null
}

/** Resumen de lo que está aplicado. Cada etiqueta quita su filtro. */
export function ActiveFilters({ filters, reference }: ActiveFiltersProps) {
  const chips: { key: string; label: string; to: string }[] = []

  if (filters.q) {
    chips.push({
      key: 'q',
      label: `Búsqueda: “${filters.q}”`,
      to: catalogPath(omitFilters(filters, 'q')),
    })
  }
  if (filters.category) {
    const category = reference?.categories.find((item) => item.slug === filters.category)
    chips.push({
      key: 'category',
      label: `Categoría: ${category?.name ?? filters.category}`,
      to: catalogPath(omitFilters(filters, 'category')),
    })
  }
  if (filters.merchant) {
    const merchant = reference?.merchants.find((item) => item.slug === filters.merchant)
    chips.push({
      key: 'merchant',
      label: `Comercio: ${merchant?.name ?? filters.merchant}`,
      to: catalogPath(omitFilters(filters, 'merchant')),
    })
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    chips.push({
      key: 'price',
      label: priceLabel(filters.minPrice, filters.maxPrice),
      to: catalogPath(omitFilters(filters, 'minPrice', 'maxPrice')),
    })
  }

  if (chips.length === 0) return null

  return (
    <ul className="chips" aria-label="Búsqueda y filtros aplicados">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Link className="chip" to={chip.to}>
            <span className="visually-hidden">Quitar </span>
            {chip.label}
            <CloseIcon width="16" height="16" />
          </Link>
        </li>
      ))}
      {hasRefinements(filters) && (
        <li>
          <Link className="chips__clear" to={clearedPath(filters)}>
            Limpiar filtros
          </Link>
        </li>
      )}
    </ul>
  )
}
