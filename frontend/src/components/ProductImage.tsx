import { useState } from 'react'
import { resolveImageUrl } from '../lib/images.ts'

const FALLBACK_SRC = resolveImageUrl('/img/sin-imagen.svg', import.meta.env.BASE_URL)

interface ProductImageProps {
  /** `imageUrl` del producto, tal como llega del origen de datos. */
  src: string
  /** Texto alternativo. Vacío cuando el nombre del producto ya está escrito junto a la imagen. */
  alt: string
  /** Carga inmediata para la imagen principal de una página. */
  priority?: boolean
}

/** Imagen de producto. Si falta o no carga, muestra la imagen local "Sin imagen". */
export function ProductImage({ src, alt, priority = false }: ProductImageProps) {
  const resolved = resolveImageUrl(src, import.meta.env.BASE_URL)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const unavailable = !resolved || failedSrc === resolved

  return (
    <img
      src={unavailable ? FALLBACK_SRC : resolved}
      alt={unavailable && alt ? `${alt} (imagen no disponible)` : alt}
      width={600}
      height={600}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => {
        if (!unavailable) setFailedSrc(resolved)
      }}
    />
  )
}
