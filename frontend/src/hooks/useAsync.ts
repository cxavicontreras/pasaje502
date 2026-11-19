import { useCallback, useEffect, useEffectEvent, useMemo, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: unknown }

export type AsyncResult<T> = AsyncState<T> & {
  /** Vuelve a ejecutar la carga (botón "Reintentar"). */
  reload: () => void
}

const LOADING = { status: 'loading' } as const

/**
 * Ejecuta `load` cada vez que cambia `key` y expone el estado: cargando, éxito o error.
 * Si `key` cambia antes de que llegue la respuesta, la petición anterior se cancela y se descarta.
 */
export function useAsync<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
): AsyncResult<T> {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<{ token: string; state: AsyncState<T> } | null>(null)
  const token = `${attempt}:${key}`
  const runLoad = useEffectEvent(load)

  useEffect(() => {
    const controller = new AbortController()
    runLoad(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setSettled({ token, state: { status: 'success', data } })
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setSettled({ token, state: { status: 'error', error } })
      },
    )
    return () => controller.abort()
  }, [token])

  const reload = useCallback(() => setAttempt((current) => current + 1), [])
  const state: AsyncState<T> = settled?.token === token ? settled.state : LOADING

  return useMemo(() => ({ ...state, reload }), [state, reload])
}
