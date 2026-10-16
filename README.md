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

API real: `VITE_YGGDRA_API_BASE` (default `https://api.yggdra.cl/api`). Login usa `forja_role` (raíz y `user`) y branch **91**.  
**Modo demo** solo con los botones de `/login` (`?demo=coach` / `?demo=alumno`) o si la API no es alcanzable (red/5xx). Errores 4xx de credenciales no caen a demo.

Contrato confirmado: [`docs/contract-gaps.md`](docs/contract-gaps.md). Auditoría: [`docs/audit.md`](docs/audit.md).

## CI / CD

- **CI** (`.github/workflows/ci.yml`): lint + typecheck + tests + build en cada PR/push a `main`
- **CD** (`.github/workflows/deploy-pages.yml`): despliega staging a GitHub Pages en cada merge a `main`

### Staging (GitHub Pages)

URL: https://felipebarraza6.github.io/forja/

**Estado actual:** Pages está en modo **legacy** (`main` /). El CD (`.github/workflows/deploy-pages.yml`) publica el `dist/` en la raíz de `main` en cada merge. El token de CI **no puede** cambiar Source → GitHub Actions (API 403).

Para migrar a Actions (opcional, requiere admin del repo):

1. https://github.com/felipebarraza6/forja/settings/pages → Source: **GitHub Actions**
2. Sustituir el job de publish-commit por `upload-pages-artifact` + `deploy-pages`
3. Dejar de commitear `assets/`, `404.html` y el `index.html` de producción en `main`

CORS staging ya permitido en Yggdra. Sucursal Forja: **91** (`X-Branch-ID`). Contrato: ver `docs/contract-gaps.md`.

## Backend

Los cambios de API se documentan en [`docs/backend-needs.md`](docs/backend-needs.md) — no se edita `yggdra_infra` desde este repo.

## Estructura

```
src/
  components/     # shell, theme, ui (shadcn)
  lib/api/        # client Yggdra + dominio Forja + demo
  pages/          # landing, login, coach/*, alumno/*
docs/
  contract-gaps.md   # contrato API confirmado
  audit.md           # auditoría y hallazgos
  backend-needs.md   # histórico (parcialmente obsoleto)
```

## Diseño

Estilo nórdico minimalista: neutros fríos, tipografía Syne + Manrope, modo claro/oscuro, mobile first.
