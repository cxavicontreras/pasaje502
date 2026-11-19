import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { dataMode } from '../config.ts'
import { catalogPath } from '../lib/catalogFilters.ts'
import { SearchIcon } from './icons.tsx'

function BrandMark() {
  return (
    <svg
      className="brand__mark"
      viewBox="0 0 32 32"
      width="30"
      height="30"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 29V15a12 12 0 0 1 24 0v14h-6.5V15a5.5 5.5 0 0 0-11 0v14H4Z"
        fill="currentColor"
      />
      <circle cx="16" cy="23.5" r="3.2" fill="var(--sun)" />
    </svg>
  )
}

/**
 * Buscador del encabezado: aquí entra toda búsqueda por texto.
 * Al enviar navega a /productos?q=…; el catálogo lee ese parámetro de la URL y consulta los datos.
 */
function SearchForm() {
  const location = useLocation()
  const navigate = useNavigate()

  const urlQuery =
    location.pathname === '/productos' ? (new URLSearchParams(location.search).get('q') ?? '') : ''
  const [value, setValue] = useState(urlQuery)

  // En cada navegación (incluido el botón Atrás) el campo vuelve a mostrar la búsqueda de la URL.
  const [syncedKey, setSyncedKey] = useState(location.key)
  if (syncedKey !== location.key) {
    setSyncedKey(location.key)
    setValue(urlQuery)
  }

  return (
    <form
      className="search"
      role="search"
      action="/productos"
      onSubmit={(event) => {
        event.preventDefault()
        const q = value.trim()
        // Una búsqueda nueva recorre todo el marketplace: no arrastra filtros anteriores.
        navigate(catalogPath(q ? { q } : {}))
        // El foco pasa a los resultados (y en celular se cierra el teclado).
        document.getElementById('contenido')?.focus({ preventScroll: true })
      }}
    >
      <label className="visually-hidden" htmlFor="site-search">
        Buscar productos o comercios
      </label>
      <input
        id="site-search"
        className="search__input"
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar productos o comercios"
        autoComplete="off"
        enterKeyHint="search"
      />
      <button className="search__button" type="submit">
        <SearchIcon />
        <span className="search__button-text">Buscar</span>
      </button>
    </form>
  )
}

export function SiteHeader() {
  return (
    <header className="site-header">
      {dataMode === 'demo' && (
        <p className="demo-strip">Modo demo: los productos y comercios son ficticios.</p>
      )}
      <div className="container site-header__inner">
        <Link className="brand" to="/" aria-label="Pasaje 502, ir al inicio">
          <BrandMark />
          <span className="brand__name">Pasaje 502</span>
        </Link>
        <SearchForm />
        <nav className="site-nav" aria-label="Principal">
          <NavLink className="site-nav__link" to="/productos">
            Productos
          </NavLink>
          <Link className="site-nav__link" to="/#comercios">
            Comercios
          </Link>
        </nav>
      </div>
    </header>
  )
}
