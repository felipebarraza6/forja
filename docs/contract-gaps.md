# Contrato Forja ↔ front (confirmado por Yggdra)

Fecha: 2026-10-16 · API base: `https://api.yggdra.cl/api` · Branch: `91` · Org: `22`  
OpenAPI canónico: repo **yggdra_infra** → `api/schema/openapi.yaml`  
Público en runtime: `GET /api/schema/?format=json` → **404**. Solo  
`GET /api/schema/contract/` con `schema_sha256` (freeze). El front **no** regenera tipos desde la URL pública.

## Auth

```
POST /api/accounts/users/login_complete/
Body: { email, password }
→ { token, user, branches[], forja_role }

Header: Authorization: Token <token>
Header: X-Branch-ID: 91
```

- `forja_role` viene en la **raíz** y en `user.forja_role`: `alumno | coach | admin | null`.
- El cliente usa `res.forja_role ?? res.user.forja_role` (fallback UI solo si ambos son null).

## Rutas

**No hay rutas anidadas** de recursos (p. ej. `/students/{id}/meals/`). Todo es top-level con `?student=<id>`.

### Extras confirmados

| Método | Ruta |
|--------|------|
| PATCH | `/forja/students/{id}/macros/` |
| PATCH | `/forja/students/{id}/status/` |
| GET | `/forja/students/{id}/adherence/weekly/?week_start=` |
| GET | `/forja/adherence/weekly/` |
| GET/POST | `/forja/threads/{id}/messages/` |
| POST | `/forja/threads/{id}/stream-token/` |
| POST | `/forja/adherence-rules/{id}/toggle/` |
| GET | `/forja/threads/{id}/events/?stream_token=` |

### Filtros

| Recurso | Filtros |
|---------|---------|
| `training-plan` | `student`, **`is_current`** |
| `workout-logs` | `student`, `performed_on`, `completed` |
| `meals` | `student`, `logged_on`, `meal_type` |
| `water` | `student`, `logged_on` |
| `check-ins` | `student`, `checked_on` |
| `subscriptions` | `service`, `status` |
| `students` | `status`, `service` |

## Modelos (shape canónico)

### training-plan

Lista **paginada** `{ count, next, previous, results }` (`page_size` default 10, máx 200).

Plan vigente:

```
GET /forja/training-plan/?student=X&is_current=true
→ results[0]
```

Campos:

- Plan: `id`, `student`, `title`, `notes`, `effective_from`, `effective_to`, `is_current`
- `days[]`: `id`, `name`, `weekday`, `position`, `notes`, `exercises[]`
- `exercises[]`: `id`, `name`, `position`, `sets`, `reps`, `rest_seconds`, `tempo`, `load_kg`, `notes`, `video_url`

Las **macros no van en el plan**; viven en el alumno.

### students (macros)

`calories_target`, `protein_target`, `carbs_target`, `fats_target`, `water_target_ml`,  
`sessions_per_week`, `height_cm`, `weight_kg`, `goal`  
(+ `PATCH …/macros/`).

### meals

`student`, `logged_on`, `meal_type`, `description`, `calories`, `protein`, `carbs`, `fats`, `notes`

### water

`student`, `logged_on`, `ml`

### workout-logs

`student`, `performed_on`, `workout_day`, `title`, `completed`, `notes`

### check-ins

`student`, `checked_on`, …

### services

`name`, `description`, `price`, `billing_period` (`monthly|quarterly|yearly|one_time`),  
`duration_weeks`, `includes_nutrition`, `includes_training`

### SSE

1. `POST /forja/threads/{id}/stream-token/` → `{ stream_token, expires_in: 120, stream_path }`
2. `EventSource` a `stream_path` (o `GET …/events/`) con `?stream_token=` y opcional `?after_id=`

No usar `Authorization` en EventSource; el token de stream es de corta vida.

## Alineación del front

| Área | Estado |
|------|--------|
| Rutas top-level + `?student=` | OK |
| `training-plan?is_current=true` → `results[0]` | OK |
| Payloads meals/water/workouts con campos canónicos | OK |
| Normalización API → modelo UI (`protein_g`, `date`, etc.) | OK |
| SSE vía `stream-token` + EventSource | OK |
| `forja_role` raíz + `user.forja_role` | OK |
| `patchStudentMacros` / `patchStudentStatus` / adherence weekly | Cliente listo; UI de edición pendiente |
| Regenerar tipos desde OpenAPI público | Bloqueado (404); usar `yggdra_infra` |

### Enums canónicos (modelo `api/apps/forja/models/core.py`)

Valores **en inglés** en API/filtros/payloads; la UI muestra etiquetas en español (`src/lib/api/labels.ts`).

| Campo | Valores |
|-------|---------|
| `Student.status` | `invited` \| `active` \| `paused` \| `finished` \| `cancelled` (default `invited`) |
| `Subscription.status` | `active` \| `past_due` \| `cancelled` \| `trial` |
| `Service.billing_period` | `monthly` \| `quarterly` \| `yearly` \| `one_time` |
| `Meal.meal_type` | `breakfast` \| `lunch` \| `dinner` \| `snack` \| `other` |
| `AdherenceRule.metric` | `training` \| `water` \| `macros` \| `check_in` |
| `Message.author_role` | `coach` \| `alumno` \| `admin` |

`normalize*` acepta aliases ES legacy (p. ej. `activo` → `active`) al leer respuestas antiguas.

## Pendiente / seguimiento

1. Publicar de nuevo OpenAPI en `GET /api/schema/?format=json` (o documentar URL) para codegen.
2. Usuario coach (y opcional admin) en branch **91** para E2E reales (no crear desde el front).
3. Confirmar shape exacto de `adherence/weekly/` y de POST `subscriptions` (campos `amount_*` vs `price`).
4. Actualizar `docs/backend-needs.md` (aún describe rutas anidadas obsoletas) en un follow-up.
5. Confirmar enum canónico de `students.status` en OpenAPI de `yggdra_infra` (front ya dejó de enviar `invitado`).

CORS staging (`https://felipebarraza6.github.io`) OK.
