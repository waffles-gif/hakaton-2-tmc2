import { Link } from 'react-router-dom'

// 404: ruta que no existe. Va fuera de PrivateRoute para que funcione con o sin sesión.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-sky-950 p-6 text-center text-sky-50">
      {/* Brújula que gira sin rumbo; con reduced motion queda quieta */}
      <div
        aria-hidden="true"
        className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-amber-400 text-6xl motion-safe:animate-spin motion-safe:[animation-duration:3s]"
      >
        🧭
      </div>
      <p className="font-mono text-6xl font-bold text-amber-400">404</p>
      <h1 className="text-2xl font-bold">Esta isla no aparece en ningún mapa</h1>
      <p className="max-w-md text-sky-200">
        El Log Pose gira sin rumbo: la ruta que buscas no existe o se la tragó el Calm Belt.
      </p>
      <Link
        to="/dashboard"
        className="rounded bg-amber-400 px-5 py-2 font-semibold text-sky-950 hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
      >
        Volver a puerto seguro
      </Link>
    </main>
  )
}
