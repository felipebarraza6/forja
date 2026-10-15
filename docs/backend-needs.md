# Necesidades de backend (Yggdra / Ginnung) para Forja

> Este documento lista lo que el frontend MVP de **Forja** espera de `api.yggdra.cl`.
> **No editar `yggdra_infra` desde este repo** — implementar allí y cruzar con este checklist.

## Contexto multi-tenant

- Crear una **organización propia Forja** en Yggdra.
- Cada coach opera como **branch/tenant** (o rol equivalente) aislado: alumnos, planes, mensajes y suscripciones no cruzan entre coaches.
- Header obligatorio (igual que Frig/Nxord/Gungir):

```
Authorization: Token <key>
X-Branch-ID: <branch_id>
```

- Login existente reutilizable:

```
POST /api/accounts/users/login_complete/
→ { token, user, branches[] }
```

Ideal: incluir `forja_role: "coach" | "alumno" | "admin"` en la respuesta (o un claim/membership por organización).

## CORS (staging)

Añadir el origen de GitHub Pages a `CORS_ALLOWED_ORIGINS` (y headers permitidos):

- `https://felipebarraza6.github.io`
- Métodos: `GET, POST, PATCH, PUT, DELETE, OPTIONS`
- Headers: `Authorization`, `Content-Type`, `X-Branch-ID`, `Accept`
- Si se usa SSE: permitir `text/event-stream` y no bufferizar el stream en el proxy.

## Módulo propuesto: `/api/forja/`

Prefijo sugerido bajo la org Forja (aislamiento por `X-Branch-ID`).

### Servicios / planes vendibles

| Método | Ruta | Notas |
|--------|------|-------|
| GET | `/forja/services/` | Lista de planes del coach/branch |
| POST | `/forja/services/` | Crear plan (`name`, `description`, `price_clp`, `billing`, `features[]`, `active`) |
| PATCH | `/forja/services/{id}/` | Actualizar / archivar |

### Alumnos

| Método | Ruta | Notas |
|--------|------|-------|
| GET | `/forja/students/` | Alumnos del branch |
| POST | `/forja/students/` | Invitar / dar de alta (`email`, `full_name`, `plan_id`, `goals`, `macros`) |
| GET | `/forja/students/{id}/` | Detalle + macros + status |
| PATCH | `/forja/students/{id}/` | Estado, plan, macros |

### Rutinas / entrenamiento

| Método | Ruta | Notas |
|--------|------|-------|
| GET | `/forja/students/{id}/training-plan/` | Plan activo (días + ejercicios) |
| PUT | `/forja/students/{id}/training-plan/` | Asignar / reemplazar plan |
| GET | `/forja/students/{id}/workout-logs/` | Historial |
| POST | `/forja/students/{id}/workout-logs/` | Registrar sesión completada |

### Nutrición y agua

| Método | Ruta | Notas |
|--------|------|-------|
| GET/POST | `/forja/students/{id}/meals/` | Registro de comidas + macros |
| GET/POST | `/forja/students/{id}/water/` | Logs de hidratación (`ml`) |

### Check-ins y adherencia (reutilizar espíritu de 90 Días)

| Método | Ruta | Notas |
|--------|------|-------|
| GET/POST | `/forja/students/{id}/check-ins/` | Peso, energía, sueño, notas |
| GET | `/forja/check-ins/` | Vista coach (todos los alumnos del branch) |
| GET | `/forja/adherence-rules/` | Reglas configurables |
| POST | `/forja/adherence-rules/` | Crear regla (`metric`, `target_per_week`, `enabled`) |
| POST | `/forja/adherence-rules/{id}/toggle/` | Activar/desactivar |
| GET | `/forja/students/{id}/adherence/` | Resumen % / métricas semanales |

### Mensajería + SSE

| Método | Ruta | Notas |
|--------|------|-------|
| GET | `/forja/threads/` | Hilos del coach (o el hilo del alumno autenticado) |
| GET | `/forja/threads/{id}/messages/` | Historial |
| POST | `/forja/threads/{id}/messages/` | Enviar mensaje |
| GET | `/forja/threads/{id}/events/` | **SSE** (`text/event-stream`) con eventos de nuevos mensajes |

Evento SSE sugerido:

```json
{ "id": "...", "thread_id": "...", "sender": "coach|alumno", "body": "...", "created_at": "..." }
```

### Suscripciones / pagos

Si Yggdra ya tiene **cuotas / caja / finance**:

- Reutilizar endpoints de pagos/cuotas existentes y documentar el mapeo alumno↔customer.
- Exponer un enlace o `subscription_id` en el alumno Forja.

Si **no** hay módulo listo (caso actual del MVP front):

| Método | Ruta | Notas |
|--------|------|-------|
| GET | `/forja/subscriptions/` | Registros manuales de suscripción |
| POST | `/forja/subscriptions/` | Alta manual (`student_id`, `plan_id`, `amount_clp`, `status`, `note`, fechas) |
| PATCH | `/forja/subscriptions/{id}/` | Marcar activa / cancelada / pendiente |

## Modelos mínimos sugeridos

- `ForjaService` — plan vendible del coach
- `ForjaStudent` — vínculo user↔branch + plan + macros + status
- `ForjaTrainingPlan` / `ForjaWorkoutDay` / `ForjaExercise`
- `ForjaWorkoutLog`, `ForjaMealLog`, `ForjaWaterLog`, `ForjaCheckIn`
- `ForjaAdherenceRule`
- `ForjaThread` / `ForjaMessage`
- `ForjaSubscription` (manual hasta integrar finance)

Soft-delete / `is_active` al estilo BranchModelApi del resto de Yggdra.

## Roles

- **coach**: CRUD de alumnos, planes, reglas; lectura de logs; chat
- **alumno**: lectura de su plan; escritura de meals/water/workout-logs/check-ins; chat propio
- **admin org Forja**: gestionar coaches (branches) y venta de acceso a la plataforma

## Notas del frontend actual

- Cliente en `src/lib/api/client.ts` (Token + `X-Branch-ID`), mismo patrón que Nxord/Frig.
- Si la API falla o no hay endpoints `/forja/*`, el front entra en **modo demo** con datos locales.
- Staging esperado: `https://felipebarraza6.github.io/forja/`
