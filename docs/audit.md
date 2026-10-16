# Auditoría Forja (2026-10-16)

Alcance: pantallas coach/alumno vs API real `https://api.yggdra.cl/api/forja/` (branch **91**), seguridad, a11y, rendimiento/bundle, CI/CD y dependencias.  
Contrato canónico: `docs/contract-gaps.md` (confirmado por Yggdra en esta fecha).  
No se crearon usuarios en producción. No se tocó el diseño visual (PR de UI en curso).

## Resumen

| Severidad | Cantidad | Acción en este PR |
|-----------|----------|-------------------|
| Crítica | 0 | — |
| Alta | 3 | 1 corregida (SSE); 2 documentadas (backend/ops) |
| Media | 7 | 2 corregidas (payloads/401); resto documentado |
| Baja | 8 | Varias corregidas (a11y chica, deps, selects) |

---

## Hallazgos

### A1 — SSE usaba fetch+Authorization en lugar de stream-token
- **Severidad:** Alta  
- **Área:** API / Mensajes  
- **Detalle:** El contrato exige `POST …/stream-token/` y luego `EventSource(?stream_token=)`. El cliente abría el stream con header `Authorization`.  
- **Estado:** **Corregido** en `src/lib/api/forja.ts` (renovación antes de `expires_in`).  
- **Siguiente paso:** Probar E2E con usuario real en branch 91.

### A2 — Sin usuario coach/alumno de prueba en branch 91
- **Severidad:** Alta  
- **Área:** API / E2E  
- **Detalle:** No se puede validar pantallas contra datos reales sin credenciales. El front no debe crear usuarios en prod.  
- **Estado:** Documentado (también en contract-gaps).  
- **Siguiente paso:** Yggdra crea coach (+ alumno) en org 22 / branch 91.

### A3 — OpenAPI público 404; tipos no regenerables en CI
- **Severidad:** Alta  
- **Área:** Contrato  
- **Detalle:** `GET /api/schema/?format=json` → 404. OpenAPI vive en `yggdra_infra` (`api/schema/openapi.yaml`). Drift de tipos es manual.  
- **Estado:** Documentado. Cliente alineado a mano con el contrato confirmado.  
- **Siguiente paso:** Publicar schema o copiar/freeze el YAML en este repo + script de check.

### M1 — Token en `localStorage` (XSS → robo de sesión)
- **Severidad:** Media  
- **Área:** Seguridad  
- **Detalle:** Patrón Yggdra (`Authorization: Token`). No hay `dangerouslySetInnerHTML` hoy; el riesgo es XSS futuro.  
- **Estado:** Documentado. En este PR: limpieza de token/sesión en **401**.  
- **Siguiente paso:** Valorar cookie HttpOnly en API, o al menos CSP estricta en Pages.

### M2 — `docs/backend-needs.md` describe rutas anidadas obsoletas
- **Severidad:** Media  
- **Área:** Docs  
- **Detalle:** Habla de `/students/{id}/training-plan/` etc. (404). Puede confundir a backend/front.  
- **Estado:** Documentado; contract-gaps es la fuente de verdad.  
- **Siguiente paso:** Reescribir backend-needs al contrato confirmado (follow-up, sin bloquear).

### M3 — UI no consume aún macros/status/adherence weekly del coach
- **Severidad:** Media  
- **Área:** Funcionalidad coach  
- **Detalle:** Cliente expone `patchStudentMacros`, `patchStudentStatus`, `getStudentWeeklyAdherence`, `getWeeklyAdherence`. Pantallas solo leen.  
- **Estado:** Documentado (depende de producto; no es solo backend).  
- **Siguiente paso:** Pantallas de edición en PR de features (no UI visual ornamental).

### M4 — Login puede ignorar `forja_role: null` con toggle UI
- **Severidad:** Media  
- **Área:** Auth  
- **Detalle:** Si API devuelve `null`, el toggle coach/alumno del login decide el rol de la SPA.  
- **Estado:** Documentado; cliente ya prioriza raíz + `user.forja_role`.  
- **Siguiente paso:** Si `forja_role` es null, mostrar error “sin rol Forja” en vez de preferencia UI.

### M5 — Bundle monolítico + deps no usadas
- **Severidad:** Media  
- **Área:** Rendimiento  
- **Detalle:** Vite emite un solo `assets/index.js` (nombres fijos por Pages legacy). Medición post-build: **~586 kB** JS / **~183 kB gzip** (aviso Vite >500 kB). Había deps Radix/date-fns sin uso.  
- **Estado:** **Deps no usadas eliminadas** en este PR. Code-splitting documentado.  
- **Siguiente paso:** `manualChunks` / lazy routes cuando Pages deje de exigir entry fijo, o hash + map en index.

### M6 — CD publica `dist/` en la raíz de `main` (Pages legacy)
- **Severidad:** Media  
- **Área:** CI/CD  
- **Detalle:** Mezcla fuente y artefacto; riesgo de conflictos y deploys confusos. Token CI no puede cambiar Source → Actions (403).  
- **Estado:** Documentado (README ya lo explica).  
- **Siguiente paso:** Admin del repo: Pages → GitHub Actions; volver a artifact deploy.

### M7 — Fallback a demo en errores de red/5xx puede enmascarar outages
- **Severidad:** Media  
- **Área:** UX / datos  
- **Detalle:** `withDemoFallback` sirve datos demo si la API cae. Útil offline; peligroso si el usuario cree que ve datos reales.  
- **Estado:** Documentado. Badge “Demo” solo si `DEMO_KEY`. Fallback silencioso en 5xx no marca demo.  
- **Siguiente paso:** Marcar UI “modo degradado” o no caer a demo salvo flag explícito.

### B1 — Selects de suscripción con IDs demo hardcodeados
- **Severidad:** Baja  
- **Área:** Coach / Servicios  
- **Estado:** **Corregido** — se inicializan con el primer alumno/servicio cargado.

### B2 — A11y: nav, rol login, textarea mensajes
- **Severidad:** Baja  
- **Área:** Accesibilidad  
- **Estado:** **Corregido** (`aria-label` nav, `aria-pressed` roles, `aria-label` mensaje).

### B3 — Barra de agua sin rol progressbar
- **Severidad:** Baja  
- **Área:** Accesibilidad alumno/Agua  
- **Estado:** **Corregido** en este PR.

### B4 — Skip link / landmark main
- **Severidad:** Baja  
- **Área:** Accesibilidad  
- **Detalle:** Hay `<motion.main>` pero no skip-to-content.  
- **Estado:** Documentado.  
- **Siguiente paso:** Añadir skip link en shell (PR a11y dedicado).

### B5 — Contraste / focus en tema (depende PR UI)
- **Severidad:** Baja  
- **Área:** Accesibilidad visual  
- **Estado:** No auditado en profundidad (UI PR en curso). Focus ring básico en Button OK.

### B6 — Fuentes Google en runtime (privacidad / FOIT)
- **Severidad:** Baja  
- **Área:** Rendimiento / privacidad  
- **Estado:** Documentado.  
- **Siguiente paso:** Self-host Syne/Manrope.

### B7 — `npm audit` / pins de acciones
- **Severidad:** Baja (dev) / Media si se sube a runtime  
- **Área:** Dependencias / CI  
- **Detalle:** Quedan avisos en **devDeps** (vitest/tinypool críticos, vite path traversal en dev server, braces vía tailwind). Fix limpio exige `vitest@5` / `vite@8` (breaking). Actions en `@v4` (mutable). Sin Dependabot.  
- **Estado:** Documentado; deps de runtime no usadas eliminadas. No se forzó major de vitest/vite en este PR.  
- **Siguiente paso:** Subir vitest/vite en PR dedicado + Dependabot + pins SHA.

### B8 — Sesión duplicada (TOKEN_KEY + SESSION_KEY.token)
- **Severidad:** Baja  
- **Área:** Seguridad  
- **Estado:** Documentado. 401 limpia ambas.  
- **Siguiente paso:** Una sola fuente de verdad.

---

## Matriz pantallas ↔ API

| Pantalla | Endpoints | Notas |
|----------|-----------|-------|
| Login | `login_complete` | OK contrato |
| Coach Panel | students, threads, check-ins, subscriptions | OK top-level |
| Coach Alumnos | students | Filtros status/service listos en cliente, UI sin filtros |
| Coach Alumno detail | student, training-plan?is_current, meals, workout-logs, check-ins | Lectura OK; sin PATCH macros/status |
| Coach Servicios | services, subscriptions POST | Campos service/billing_period normalizados |
| Coach Adherencia | adherence-rules + toggle | weekly adherence no en UI |
| Mensajes | threads, messages, stream-token+SSE | SSE alineado |
| Alumno Dashboard/Entreno/Nutrición/Agua | me, training-plan, meals, water, workout-logs | Payloads canónicos |

---

## Correcciones incluidas en este PR

1. Alineación de tipos/normalización/payloads al contrato confirmado.  
2. SSE con `stream-token` + EventSource + renovación.  
3. Login lee `forja_role` en raíz y en `user`.  
4. Limpieza de sesión en 401.  
5. Selects de suscripción sin IDs demo fijos.  
6. A11y menor (nav, login roles, mensajes, progress agua).  
7. Eliminación de dependencias no usadas (Radix avatar/dialog/dropdown/scroll-area, date-fns).  
8. Actualización de `docs/contract-gaps.md` + este `docs/audit.md`.
