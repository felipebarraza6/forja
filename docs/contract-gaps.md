# Diferencias de contrato Forja ↔ front (para Yggdra)

Fecha: 2026-10-16 · API base: `https://api.yggdra.cl/api` · Branch: `91` · Org: `22`  
OpenAPI público: **no disponible** (`GET /api/schema/?format=json` → 404). Solo existe  
`GET /api/schema/contract/` con `schema_sha256=2515f6ea…`. El front no pudo regenerar tipos desde OpenAPI.

## Rutas verificadas (sin auth)

| Ruta | Estado |
|------|--------|
| `GET /forja/students/` | 401 (existe) |
| `GET /forja/students/me/` | 401 (existe) — usado por rol alumno |
| `GET /forja/services/` | 401 (existe) |
| `GET /forja/training-plan/` | 401 (existe) |
| `GET /forja/meals/` | 401 (existe) |
| `GET /forja/water/` | 401 (existe) |
| `GET /forja/workout-logs/` | 401 (existe) |
| `GET /forja/check-ins/` | 401 (existe) |
| `GET /forja/adherence-rules/` | 401 (existe) |
| `POST /forja/adherence-rules/{id}/toggle/` | 401 (existe) |
| `GET /forja/threads/` | 401 (existe) |
| `GET /forja/threads/{id}/messages/` | 401 (existe) |
| `GET /forja/threads/{id}/events/` | 401 / SSE (`Autenticación requerida`) |
| `GET /forja/subscriptions/` | 401 (existe) |
| `GET /forja/students/{id}/training-plan/` | **404** (no usar anidadas) |
| `GET /forja/students/{id}/meals/` | **404** |
| `GET /forja/students/{id}/water/` | **404** |
| `GET /forja/students/{id}/workout-logs/` | **404** |
| `GET /forja/students/{id}/check-ins/` | **404** |

El front ya apunta a rutas **top-level** con filtro `?student=<id>`.

## Supuestos del front (confirmar o corregir)

Sin OpenAPI, el cliente normaliza ambos estilos. Confirmar el contrato canónico:

### Filtros
- `?student=<pk>` en `training-plan`, `meals`, `water`, `workout-logs`, `check-ins`  
  ¿Es `student` o `student_id`?

### Campos (snake_case asumido)
- **Student:** `id`, `full_name`, `email`, `plan`/`plan_id` (+ `plan.name` o `plan_name`), `status`, `adherence_pct`, `started_at`, `goals`, `macros{calories,protein_g,carbs_g,fat_g,water_ml}`
- **Service:** `id`, `name`, `description`, `price_clp`, `billing` (`mensual|anual|unico`), `active`/`is_active`, `features[]`
- **TrainingPlan:** `id`, `student`/`student_id`, `title`, `weeks`, `days[]` con `day_label`, `focus`, `exercises[{name,sets,reps,rest_sec}]`
- **Meal:** `student`, `date`, `meal`, `description`, `calories`, `protein_g`, `carbs_g`, `fat_g`
- **Water:** `student`, `date`, `ml`
- **WorkoutLog:** `student`, `date`, `workout_day`/`workout_day_id`, `title`, `completed`, `notes`
- **CheckIn:** `student`, `date`, `weight_kg`, `energy` (1–5), `sleep_hours`, `notes`, `adherence_ok`
- **AdherenceRule:** `name`, `description`, `metric`, `target_per_week`, `enabled`
- **Thread/Message:** `student`, `unread`, `last_message`, `body`, `sender` (`coach|alumno`), `created_at`
- **Subscription:** `student`, `plan`, `amount_clp`, `status`, `started_at`, `note`
- **login_complete:** `forja_role` ∈ `coach|alumno|admin` + `branches[]` (idealmente incluye id `91`)

### SSE
- El front abre `GET /forja/threads/{id}/events/` con headers `Authorization: Token …` y `X-Branch-ID` vía **fetch stream** (EventSource no envía headers).
- ¿El backend acepta eso, o exige `?token=` / cookie de sesión?

### IDs
- El front convierte todos los `id` a `string` en UI. ¿Los PK son int?

## Gaps / pedidos a Yggdra

1. **Publicar OpenAPI** otra vez en `GET /api/schema/?format=json` (o URL documentada) para alinear tipos.
2. Confirmar nombres exactos de filtros (`student` vs `student_id`) y shape de `training-plan` (objeto vs lista paginada).
3. Confirmar auth SSE (headers vs query token).
4. ¿Existe CRUD de `services` como planes vendibles del coach, o el plan vive solo como FK en student/subscription?
5. Crear al menos un usuario **coach** (y opcional admin) en sucursal **91** para pruebas E2E (sin inventar desde el front).
6. Flujo alumno: confirmar que `students/me/` devuelve el alumno ligado al user token tras setear contraseña con forgot-password.

## CORS

OK: `https://felipebarraza6.github.io` ya permitido (preflight OPTIONS 200 con `X-Branch-ID`).
