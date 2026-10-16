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
| `npm test` | Vitest (unit + integración con mocks del contrato) |
| `npm run e2e` | Playwright E2E en modo demo (flujos coach y alumno) |
| `npm run e2e:real` | E2E opcional contra la API real (ver abajo) |
| `npm run report:validation` | Regenera `docs/informe-validacion.pdf` |
| `npm run validate` | test + e2e + informe PDF |
| `npm run build` | Build + `404.html` (SPA fallback) |

### E2E contra API real (`e2e:real`)

Suite **opcional** que llama a `https://api.yggdra.cl/api` con `X-Branch-ID: 91`. **No corre en CI** por defecto.

```bash
export FORJA_VALIDACION_EMAIL='coach@…'
export FORJA_VALIDACION_PASSWORD='…'
npm run e2e:real
```

Si las variables no están definidas, las pruebas se omiten (skip). El usuario debe ser el **coach de validación** (no admin: crear `services/` y escribir `adherence-rules` requiere admin). Los datos que crea la suite llevan el prefijo `QA-` y se intentan limpiar al final (DELETE/PATCH cuando la API lo permite).

## Roles MVP

- **Coach:** panel, alumnos, servicios/planes, adherencia, mensajes, registro manual de suscripciones
- **Alumno:** ver plan, registrar entrenos / comidas / agua, chat con el coach

API real: `VITE_YGGDRA_API_BASE` (default `https://api.yggdra.cl/api`). Login usa `forja_role` (raíz y `user`) y branch **91**.  
**Modo demo** solo con los botones de `/login` (`?demo=coach` / `?demo=alumno`) o si la API no es alcanzable (red/5xx). Errores 4xx de credenciales no caen a demo.

Contrato confirmado: [`docs/contract-gaps.md`](docs/contract-gaps.md). Auditoría: [`docs/audit.md`](docs/audit.md).

## CI / CD

- **CI** (`.github/workflows/ci.yml`): lint + typecheck + tests (unit/integración) + build + E2E demo (Playwright) + informe PDF en cada PR/push a `main`. Artifact `forja-validacion` incluye el PDF y capturas. **No** ejecuta `e2e:real`.
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
  contract-gaps.md         # contrato API confirmado
  audit.md                 # auditoría y hallazgos
  backend-needs.md         # histórico (parcialmente obsoleto)
  informe-validacion.pdf   # informe de validación E2E
e2e/
  coach-flows.spec.ts      # demo
  alumno-flows.spec.ts     # demo
  real/                    # API real (npm run e2e:real)
```

## Diseño

Estilo nórdico minimalista: neutros fríos, tipografía Syne + Manrope, modo claro/oscuro, mobile first.
