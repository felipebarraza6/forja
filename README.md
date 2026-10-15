# Forja

Plataforma web para **personal trainers**: vende tu servicio, gestiona alumnos, rutinas, nutrición, adherencia y mensajes — sobre la API Yggdra (`api.yggdra.cl`).

**Staging:** [https://felipebarraza6.github.io/forja/](https://felipebarraza6.github.io/forja/)

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (New York)
- TanStack Query · React Router · Zustand · Framer Motion · next-themes
- Auth Yggdra: `Authorization: Token …` + `X-Branch-ID`
- Base path de staging: `/forja/`

## Desarrollo

```bash
cp .env.example .env   # opcional
npm install
npm run dev            # http://localhost:5173/forja/
```

Scripts:

| Comando | Qué hace |
|---------|----------|
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest |
| `npm run build` | Build + `404.html` (SPA fallback) |

## Roles MVP

- **Coach:** panel, alumnos, servicios/planes, adherencia, mensajes, registro manual de suscripciones
- **Alumno:** ver plan, registrar entrenos / comidas / agua, chat con el coach

Si la API no responde o aún no existen los endpoints `/api/forja/*`, la app entra en **modo demo** (botones en `/login` o `?demo=coach` / `?demo=alumno`).

## CI / CD

- **CI** (`.github/workflows/ci.yml`): lint + typecheck + tests + build en cada PR/push a `main`
- **CD** (`.github/workflows/deploy-pages.yml`): despliega staging a GitHub Pages en cada merge a `main`

### Activar GitHub Pages (una vez)

1. Repo → **Settings** → **Pages**
2. **Source:** GitHub Actions
3. Tras el primer merge a `main`, el workflow *Deploy staging* publica en:
   - `https://felipebarraza6.github.io/forja/`
4. Asegurar que el origen `https://felipebarraza6.github.io` esté en CORS del backend (ver `docs/backend-needs.md`)

## Backend

Los cambios de API se documentan en [`docs/backend-needs.md`](docs/backend-needs.md) — no se edita `yggdra_infra` desde este repo.

## Estructura

```
src/
  components/     # shell, theme, ui (shadcn)
  lib/api/        # client Yggdra + dominio Forja + demo
  pages/          # landing, login, coach/*, alumno/*
docs/
  backend-needs.md
```

## Diseño

Estilo nórdico minimalista: neutros fríos, tipografía Syne + Manrope, modo claro/oscuro, mobile first.
