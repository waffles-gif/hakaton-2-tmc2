# Log Pose Console — Rumbo al Grand Line

Consola en React + TypeScript para la Guild de Cazarrecompensas: carteles de "Se Busca", noticias del
mundo y las grandes sagas del Grand Line.

**Equipo:** tmc · **Código de equipo:** `TEAM-042`

## Integrantes

| Nombre | Código |
|:-------|:-------|
| Tamara Iberico Gómez | 202510302 |
| César Rozas | 202510217 |
| María Fernanda Carbajal | 202510228 |

## Cómo ejecutar

Requisitos: Node 24 LTS y npm.

1. Instalar dependencias:

   ```bash
   npm ci
   ```

2. Configurar la URL de la API en un archivo `.env` en la raíz:

   ```txt
   VITE_API_BASE_URL=https://logpose-api-jg7f.onrender.com/api/v1
   ```

3. Levantar en desarrollo (abre en `http://localhost:5173`):

   ```bash
   npm run dev
   ```

4. Compilar para producción (incluye el chequeo de tipos):

   ```bash
   npm run build
   ```

Para entrar, inicien sesión con el email y la contraseña de la tripulación, o registren una nueva desde
`/register`. Las credenciales no se guardan en el repositorio.

## Stack

React, TypeScript estricto, Vite, React Router, Tailwind CSS y Axios. Sin librerías de caché, estado en
URL, infinite scroll ni animación: todo eso está implementado con React y APIs del navegador.

## Decisiones técnicas

- **Sesión:** el token vive en `localStorage` y un interceptor de Axios lo agrega a cada request. Al
  recargar se valida con `/auth/me` antes de mostrar nada. Un 401 o el vencimiento del token cierran la
  sesión. Las rutas privadas guardan a dónde quería ir el usuario y vuelven ahí después del login.
- **Respuestas viejas:** cada request se cancela con `AbortController` cuando cambian sus parámetros o
  se desmonta la pantalla, así la UI siempre corresponde a lo último que pidió el usuario.
- **Se Busca (`/wanted`):** paginación del servidor con todo el estado en la URL (`useSearchParams`).
  Los valores inválidos de la URL se reemplazan por sus defaults y la búsqueda usa debounce.
- **Noticias (`/news`):** infinite scroll por cursor con `IntersectionObserver`, una sola carga en
  vuelo y deduplicación por id. El detalle `/news/:id` es una ruta hija que se abre encima del feed,
  así el feed conserva su posición y lo que ya cargó.
- **Sagas (`/sagas`):** la navegación al detalle usa la View Transition API cuando el navegador la
  soporta. Con `prefers-reduced-motion` no hay animaciones.
