import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'

/** Posición de scroll de cada entrada del historial, para recuperarla con Atrás/Adelante. */
const savedScroll = new Map<string, number>()

const INTERRUPTIONS = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const

/**
 * Repite `step` en cada frame hasta que devuelva `true`, se acabe el tiempo o la persona interactúe.
 * Hace falta porque el contenido llega después de la navegación y la página todavía no tiene su alto final.
 */
function repeatUntil(step: () => boolean, timeoutMs: number): () => void {
  const startedAt = performance.now()
  let frame = 0

  const stop = () => {
    cancelAnimationFrame(frame)
    for (const type of INTERRUPTIONS) window.removeEventListener(type, stop)
  }
  const tick = () => {
    if (step() || performance.now() - startedAt > timeoutMs) stop()
    else frame = requestAnimationFrame(tick)
  }

  for (const type of INTERRUPTIONS) window.addEventListener(type, stop, { passive: true })
  tick()
  return stop
}

/**
 * Comportamiento de navegación de una SPA:
 * - página nueva: arriba del todo y con el foco en el contenido;
 * - Atrás/Adelante: recupera la posición en la que se dejó la página (por ejemplo, la lista de resultados);
 * - enlaces con #ancla: lleva a esa sección.
 */
export function RouteEffects() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const current = useRef<{ key: string; pathname: string } | null>(null)

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    const remember = () => {
      if (current.current) savedScroll.set(current.current.key, window.scrollY)
    }
    window.addEventListener('scroll', remember, { passive: true })
    return () => window.removeEventListener('scroll', remember)
  }, [])

  useLayoutEffect(() => {
    const previous = current.current
    current.current = { key: location.key, pathname: location.pathname }

    if (location.hash) {
      const id = location.hash.slice(1)
      return repeatUntil(() => {
        document.getElementById(id)?.scrollIntoView()
        return false
      }, 1200)
    }

    if (navigationType === 'POP') {
      const target = savedScroll.get(location.key) ?? 0
      return repeatUntil(() => {
        window.scrollTo(0, target)
        return Math.abs(window.scrollY - target) <= 1
      }, 3000)
    }

    if (previous && previous.pathname !== location.pathname) {
      window.scrollTo(0, 0)
      document.getElementById('contenido')?.focus({ preventScroll: true })
    }
  }, [location.key, location.pathname, location.hash, navigationType])

  return null
}
