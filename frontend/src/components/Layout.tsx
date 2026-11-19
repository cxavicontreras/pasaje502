import { Outlet } from 'react-router'
import { RouteEffects } from './RouteEffects.tsx'
import { SiteHeader } from './SiteHeader.tsx'

export function Layout() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>
            Pasaje 502 es un nombre provisional. Por ahora el sitio sirve para explorar productos y
            conocer a los comercios que los venden; todavía no se puede comprar en línea.
          </p>
        </div>
      </footer>
      <RouteEffects />
    </>
  )
}
