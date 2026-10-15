# Necesidades de backend (Yggdra / Ginnung)

El front de Forja **no** modifica `yggdra_infra`. Este documento lista lo que falta o debe adaptarse en la API (`api.yggdra.cl`) para sacar el MVP de demo.

Contexto revisado vía contrato OpenAPI embebido en Frig (`schema_sha256` vivo en `/api/schema/contract/`) y patrón de apps hermanas (Token + `X-Branch-ID`).

**Nota:** los repos `proyecto-90` y `yggdra_infra` no estaban accesibles desde este entorno; la lista se basa en el schema Yggdra público/sincronizado y en el dominio Forja. Conviene contrastar con el código de 90 Días al implementar.

---

## Ya reutilizable (sin cambios o mínimos)

| Capacidad | Endpoint / módulo | Uso en Forja |
|-----------|-------------------|--------------|
| Login | `POST /api/accounts/users/login_complete/` | Auth coach/alumno |
| Tenant | header `X-Branch-ID` + `branches` del login | 1 branch = 1 estudio/coach |
| Clientes | `GET/POST /api/customers/clients/` | Roster de alumnos |
| Servicios vendibles | `/api/services/services/`, `/api/services/service-categories/` | Catálogo de planes del coach |
| Membresías | `/api/services/memberships/` (+ `by_client`, `use`, `expiring_soon`) | Suscripción alumno↔servicio |
| Contratos | `/api/services/contracts/` | Alternativa a membresía por programa |
| Pagos genéricos | `/api/finance/payments/` | Registrar cobro si se enlaza a membership/order |
| Cuotas de pedido | `/api/sales/orders/{id}/installments/` | Solo si se vende vía order |
| Checkout de planes plataforma | `/api/plan-checkout/…`, `/api/shared/subscriptions/` | Vender **acceso Forja a coaches** (SaaS), no el coaching al alumno |

---

## Faltante / a crear (módulo sugerido `forja` o extensión)

### 1. Roles y vínculo coach ↔ alumno

- Modelo o claim de rol por usuario en la branch: `coach` | `alumno` (hoy no hay roles fitness).
- Relación explícita `CoachProfile` / `AthleteProfile` ligada a `customers.Client` y `accounts.User`.
- Endpoint: `GET /api/forja/me/` → `{ role, coach_id?, athlete_id?, branch_id }`.
- Invitación: `POST /api/forja/athletes/invite/` `{ email, service_id?, membership_id? }`.

### 2. Planes de entrenamiento (rutinas)

No existe dominio de workout en el schema actual.

```
GET/POST   /api/forja/routines/
GET/PATCH  /api/forja/routines/{id}/
POST       /api/forja/routines/{id}/assign/   { athlete_id, start_date }
GET        /api/forja/athletes/{id}/routine/
POST       /api/forja/workout-logs/           { athlete_id, routine_day_id?, completed, duration_min, date }
GET        /api/forja/workout-logs/?athlete_id=&from=&to=
```

Campos mínimos de rutina: `name`, `days_per_week`, `focus`, `exercises[]` (`name`, `sets`, `notes`).

### 3. Nutrición y macros

Las APIs de `recipes/nutrition-*` son gastronómicas (etiquetado), no aptas para coaching.

```
GET/PUT  /api/forja/athletes/{id}/nutrition-targets/
         # protein_g, carbs_g, fat_g, kcal, water_goal_ml
POST     /api/forja/meal-logs/
GET      /api/forja/meal-logs/?athlete_id=&date=
POST     /api/forja/water-logs/               { athlete_id, ml, at }
GET      /api/forja/water-logs/summary/?athlete_id=&date=
```

### 4. Check-ins y adherencia (patrón 90 Días)

```
GET/POST   /api/forja/adherence-rules/        # name, description, weight, enabled (por branch)
GET/PATCH  /api/forja/adherence-rules/{id}/
POST       /api/forja/check-ins/              # athlete_id, date, workout_done, meals_logged, water_ml, note
GET        /api/forja/check-ins/?athlete_id=&from=&to=
GET        /api/forja/athletes/{id}/adherence-score/?from=&to=
```

El score puede calcularse en backend a partir de reglas + logs del día.

### 5. Mensajería coach ↔ alumno + SSE

Los módulos `ai-agents/*` y `support/tickets` no cubren chat 1:1 coach-alumno.

```
GET/POST   /api/forja/threads/                # coach ve todos; alumno solo el suyo
GET        /api/forja/threads/{id}/messages/
POST       /api/forja/threads/{id}/messages/  { text }
GET        /api/forja/threads/{id}/events/    # text/event-stream (SSE)
```

Eventos SSE sugeridos: `message.created`, `message.read`. Auth: mismo Token; filtrar por membresía del thread.

Alternativa: WebSocket branch como Frig (`/ws/branch/<id>/`) con canal `forja.chat`.

### 6. Suscripciones de coaching (venta alumno)

Corto plazo (MVP actual del front): registro manual en UI → idealmente:

```
POST /api/forja/subscriptions/manual/
{
  "athlete_id": 101,
  "service_id": 1,
  "amount_clp": 89000,
  "started_at": "2026-10-01",
  "ends_at": "2026-11-01",
  "notes": "Transferencia…",
  "status": "activa"
}
```

Implementación preferida: wrapper sobre `services/memberships/` + opcional `finance/payments/` (`direction=in`, vínculo al cliente).

Campos útiles en membership: `billing_period` (`mensual|programa|sesion`), `manual_payment_note`, `status`.

### 7. Multi-coach SaaS (vender Forja a otros coaches)

- Plan/grupo Forja en `plan-checkout` / `shared/module-plans` que active módulos `forja_*` por branch.
- Endpoint de onboarding: crear organization + branch + usuario coach.
- `GET /api/shared/app-status/check-app-access/forja/` ya existe el patrón; registrar app `forja`.

### 8. CORS y headers

Asegurar origen de Forja en `CORS_ALLOWED_ORIGINS` y permitir header `X-Branch-ID` (y `Last-Event-ID` si SSE).

---

## Prioridad sugerida

1. Roles + `forja/me` + vínculo athlete↔client  
2. Memberships/servicios alineados al catálogo del coach (puede bastar con lo existente)  
3. Rutinas + workout-logs  
4. Nutrition targets + meal/water logs  
5. Adherence rules + check-ins  
6. Threads + messages + SSE  
7. Suscripción manual tipada + pagos finance  
8. Plan SaaS multi-coach  

Hasta que existan, el front opera en **modo demo** y degrada a demo si los endpoints fallan.
