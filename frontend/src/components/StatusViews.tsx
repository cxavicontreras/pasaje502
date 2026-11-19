import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { DataError } from '../api/dataSource.ts'

type HeadingTag = 'h1' | 'h2' | 'h3'

function describeError(error: unknown): { message: string; detail?: string } {
  if (error instanceof DataError) return { message: error.message, detail: error.detail }
  if (error instanceof Error) return { message: 'Ocurrió un error inesperado.', detail: error.message }
  return { message: 'Ocurrió un error inesperado.' }
}

interface ErrorViewProps {
  title: string
  error: unknown
  onRetry?: () => void
  /** Nivel del título según dónde se muestre el aviso. */
  as?: HeadingTag
}

/** Error al obtener datos. Muestra qué falló y permite reintentar; nunca se tapa con datos de demo. */
export function ErrorView({ title, error, onRetry, as: Heading = 'h2' }: ErrorViewProps) {
  const { message, detail } = describeError(error)
  return (
    <div className="notice notice--error" role="alert">
      <Heading className="notice__title">{title}</Heading>
      <p>{message}</p>
      {detail && <p className="notice__detail">{detail}</p>}
      {onRetry && (
        <div className="notice__actions">
          <button type="button" className="button button--secondary" onClick={onRetry}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}

interface EmptyViewProps {
  title: string
  children?: ReactNode
  as?: HeadingTag
}

/** Lista vacía: explica por qué y, si aplica, cómo seguir. */
export function EmptyView({ title, children, as: Heading = 'h2' }: EmptyViewProps) {
  return (
    <div className="notice">
      <Heading className="notice__title">{title}</Heading>
      {children}
    </div>
  )
}

/** Recurso o página que no existe. */
export function NotFoundView({ title, message }: { title: string; message: string }) {
  return (
    <div className="notice notice--page">
      <title>{`${title} | Pasaje 502`}</title>
      <h1 className="notice__title">{title}</h1>
      <p>{message}</p>
      <div className="notice__actions">
        <Link className="button button--primary" to="/productos">
          Ver todos los productos
        </Link>
        <Link className="button button--secondary" to="/">
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
