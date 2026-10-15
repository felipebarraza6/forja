# Forja

Plataforma web para **personal trainers**: vender servicios de coaching, gestionar alumnos, rutinas, nutrición, check-ins/adherencia y mensajería.

Multi-coach (SaaS) sobre la API **Yggdra** (`api.yggdra.cl`), con aislamiento por branch/tenant. Inspirada en el producto «90 Días» (Hábito Firme / proyecto-90) y alineada con apps hermanas (Frig, Nxord, Gungir).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router · TanStack Query · Framer Motion · Sonner
- Auth Yggdra: `Authorization: Token <key>` + `X-Branch-ID`

## Desarrollo

```bash
cp .env.example .env
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run type-check
npm run build
```

Si la API no responde o el login falla por red, la app entra en **modo demo** con datos realistas.

## Roles

| Ruta | Rol | Qué hace |
|------|-----|----------|
| `/coach/*` | Coach | Alumnos, servicios, rutinas, nutrición, check-ins, mensajes, suscripciones |
| `/alumno/*` | Alumno | Plan, entrenos, comidas, agua, chat con el coach |

En login puedes elegir el rol. El primer coach-usuario usa su propia branch Yggdra; puede invitar/vender acceso a otros coaches (tenant por branch).

## API

Base: `VITE_YGGDRA_API_BASE` (default `https://api.yggdra.cl/api`).

Reutiliza hoy:

- `accounts/users/login_complete/` — sesión
- `customers/clients/` — roster de alumnos (cuando hay datos)
- `services/services/` y `services/memberships/` — catálogo y suscripciones

Lo que aún no existe en Yggdra (rutinas, macros, check-ins, SSE de mensajes, roles coach/alumno) está documentado en [`docs/backend-needs.md`](docs/backend-needs.md). El front ya tiene capa de dominio (`src/lib/api/forja.ts`) y fallback demo.

## Diseño

Estilo nórdico minimalista: neutros fríos, tipografía Outfit + IBM Plex Sans, mucho aire, mobile first, modo claro/oscuro.

## CI

GitHub Actions (`.github/workflows/ci.yml`): `lint` + `type-check` + `build` en cada PR a `main`.
