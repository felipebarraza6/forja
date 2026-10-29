# Forja

## Qué es

Forja es la plataforma de Ginnung para personal trainers: vende el servicio y lleva alumnos, rutinas, nutrición, adherencia, mensajes y suscripciones. El backend es la app `forja` de la API Yggdra, más cuentas.

## A quién sirve

Coaches que administran alumnos y planes, y alumnos que registran entrenos, comidas y mensajes. Staging publicado: https://felipebarraza6.github.io/forja/.

## Stack

React 19, TypeScript, Vite 7, Tailwind, shadcn/ui, TanStack Query, React Router, Zustand, Framer Motion, Vitest y Playwright. npm con `package-lock.json`. El CI usa Node 22.

## Cómo correr en local

```bash
cp .env.example .env
npm ci
npm run dev
```

El dev server queda en http://localhost:5173/forja/ (el `base` de Vite es `/forja/`).

`npm run predev` copia `index.dev.html` sobre `index.html` antes de levantar Vite.


## Variables de entorno

Solo nombres. Copia el ejemplo a un archivo local y completa los valores ahí. No los commitees ni los pegues en un issue.

| Nombre | Uso |
|--------|-----|
| `VITE_YGGDRA_API_BASE` | Base de la API, con `/api`. Si no está, el cliente usa `https://api.yggdra.cl/api` |
| `FORJA_VALIDACION_EMAIL` | Solo `npm run e2e:real`. No commitear |
| `FORJA_VALIDACION_PASSWORD` | Solo `npm run e2e:real`. No commitear |

Esas dos últimas son de la máquina o del entorno de la persona que corre la suite. El workflow de CI no las inyecta.


## Scripts

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Vite |
| `npm run build` | Tipos, build y `404.html` para el fallback del SPA |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc -b` |
| `npm test` | Vitest, con mocks del contrato |
| `npm run test:watch` | Vitest en watch |
| `npm run test:integration` | Un archivo de integración del cliente Forja |
| `npm run e2e` | Playwright en modo demo |
| `npm run e2e:real` | Playwright contra la API real. Se omite si faltan las variables |
| `npm run report:validation` | Regenera `docs/informe-validacion.pdf` |
| `npm run validate` | Tests, e2e demo e informe |
| `npm run preview` | Previsualiza el build |


## Deploy (como está hoy)

Dos workflows:

- **CI** (`.github/workflows/ci.yml`): en PR y push a `main` corre lint, typecheck, tests, build, E2E demo y el PDF. No corre `e2e:real`.
- **CD** (`.github/workflows/deploy-pages.yml`): en cada push a `main` publica el staging. GitHub Pages del repo está en modo legacy (Source = branch `main` / raíz). El job compila y commitea `dist` de vuelta a `main` porque el token de CI no puede cambiar Pages a GitHub Actions. La URL es https://felipebarraza6.github.io/forja/.

`docs/CONSUMERS.yaml` describe ese deploy como `github-pages` desde `main`. No hay otro destino de producción cableado en el repo. La sucursal de validación que usa la suite real es la `91` (`X-Branch-ID`).

El usuario de `e2e:real` tiene que ser el coach de validación. La suite crea un alumno con prefijo `QA-` y lo limpia al final. Si faltan `FORJA_VALIDACION_EMAIL` y `FORJA_VALIDACION_PASSWORD`, los tests se saltan.


Este PR de documentación no cambia workflows, secretos ni el destino del deploy.

## Relación con la API Ginnung

Auth `Authorization: Token` y `X-Branch-ID`. El login usa `forja_role` y la lista de sucursales. Errores 4xx de credenciales no caen al demo. El demo entra por los botones de `/login` (`?demo=coach` o `?demo=alumno`) o si la API no es alcanzable (red o 5xx).

Rutas de API que declara el inventario: `/api/forja/**` y `/api/accounts/**`. El cliente hace fetch manual. No genera tipos con `openapi-typescript` y no llama al chequeo de contrato.

Roles del MVP: coach (panel, alumnos, planes, adherencia, mensajes, suscripciones) y alumno (plan, registros y chat).

Gaps ya anotados en el propio repo: [docs/contract-gaps.md](docs/contract-gaps.md). El backend marca como obligatorio que Forja no tiene ruta `/reset-password` ni `/forgot-password`.

Id de consumidor y etiqueta de issues de backend: `front:forja`.


El chequeo reutilizable está en [docs/CONTRACT_CHECK.md](https://github.com/felipebarraza6/yggdra_infra/blob/main/docs/CONTRACT_CHECK.md) y en `.github/workflows/contract-check.yml` de `yggdra_infra`. Corre en el runner del VPS, compara el `schema_sha256` de `https://api.yggdra.cl/api/schema/contract/` con el sha commiteado en el front, regenera tipos desde el freeze de `api/schema/openapi.yaml` y exige `tsc --noEmit`.

En la rama por defecto de este repo **no hay** un workflow `contract.yml` que llame ese chequeo. El inventario `docs/CONSUMERS.yaml` del backend describe el estilo de consumo de cada app.

## Enlaces

- Arquitectura: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)
- Contrato visto desde el cliente: [docs/contract-gaps.md](docs/contract-gaps.md)
- Auditoría: [docs/audit.md](docs/audit.md)
- Pedidos históricos al backend: [docs/backend-needs.md](docs/backend-needs.md)
- API Ginnung: https://github.com/felipebarraza6/yggdra_infra
- Chequeo de contrato: https://github.com/felipebarraza6/yggdra_infra/blob/main/docs/CONTRACT_CHECK.md
- Staging: https://felipebarraza6.github.io/forja/
