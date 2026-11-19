import { rawDataMode } from '../config.ts'

/** Se muestra cuando VITE_DATA_MODE falta o no es válido: la app no elige un origen de datos por su cuenta. */
export function ConfigErrorPage() {
  return (
    <main className="container page">
      <title>Falta configurar el origen de datos | Pasaje 502</title>
      <div className="notice notice--error notice--page" role="alert">
        <h1 className="notice__title">Falta configurar el origen de datos</h1>
        <p>
          La variable <code>VITE_DATA_MODE</code> debe ser <code>demo</code> o <code>api</code>.{' '}
          {rawDataMode ? (
            <>
              Ahora vale <code>{rawDataMode}</code>.
            </>
          ) : (
            'Ahora no está definida.'
          )}
        </p>
        <p>
          Se define en <code>.env</code> o <code>.env.local</code>, dentro de la carpeta del
          frontend. Después hay que reiniciar el servidor de desarrollo o volver a compilar.
        </p>
      </div>
    </main>
  )
}
