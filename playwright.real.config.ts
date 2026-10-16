import { defineConfig } from '@playwright/test'

/**
 * Suite E2E opcional contra API real.
 * No arranca servidor web: solo llamadas HTTP autenticadas.
 * Credenciales: FORJA_VALIDACION_EMAIL / FORJA_VALIDACION_PASSWORD
 */
export default defineConfig({
  testDir: './e2e/real',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  retries: 0,
  reporter: [['list']],
  use: {
    locale: 'es-CL',
  },
})
