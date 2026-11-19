import { NotFoundView } from '../components/StatusViews.tsx'

export function NotFoundPage() {
  return (
    <div className="container page">
      <NotFoundView
        title="Esta página no existe"
        message="La dirección no corresponde a ninguna página de Pasaje 502."
      />
    </div>
  )
}
