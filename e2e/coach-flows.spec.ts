import { test, expect } from '@playwright/test'
import { enterDemo, nav, shot } from './helpers'

test.describe('Flujos coach (modo demo)', () => {
  test.beforeEach(async ({ page }) => {
    await enterDemo(page, 'coach')
  })

  test('panel, alumnos, plan, nutrición y check-ins', async ({ page }) => {
    await expect(page.getByText('Alumnos activos')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Camila Rojas' })).toBeVisible()
    await shot(page, '01-coach-panel')

    await nav(page, 'Alumnos')
    await expect(page.getByRole('heading', { name: 'Alumnos' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Diego Muñoz/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Valentina Pérez/ })).toBeVisible()
    await shot(page, '02-coach-alumnos')

    await page.getByRole('link', { name: /Camila Rojas/ }).click()
    await expect(page.getByRole('heading', { name: 'Camila Rojas' })).toBeVisible()
    await expect(page.getByText('Bloque fuerza — 6 semanas')).toBeVisible()
    await expect(page.getByText('Press banca')).toBeVisible()
    await shot(page, '03-coach-alumno-rutina')

    await page.getByRole('tab', { name: 'Nutrición' }).click()
    await expect(page.getByText('Avena, yogurt griego y berries')).toBeVisible()
    await shot(page, '04-coach-alumno-nutricion')

    await page.getByRole('tab', { name: 'Check-ins' }).click()
    await expect(page.getByText(/Energía 4\/5/)).toBeVisible()
    await expect(page.getByText('Semana estable')).toBeVisible()
    await shot(page, '05-coach-alumno-checkins')
  })

  test('servicios y suscripción manual', async ({ page }) => {
    await nav(page, 'Servicios')
    await expect(page.getByRole('heading', { name: 'Servicios' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Forja Elite' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Forja Base' })).toBeVisible()
    await shot(page, '06-coach-servicios')

    await page.getByLabel('Nota').fill('E2E — comprobante de prueba')
    await page.getByRole('button', { name: 'Guardar registro' }).click()
    await expect(page.getByText('Suscripción registrada')).toBeVisible()
    await expect(page.getByText(/E2E — comprobante de prueba/)).toBeVisible()
    await shot(page, '07-coach-suscripcion')
  })

  test('adherencia: activar/desactivar regla', async ({ page }) => {
    await nav(page, 'Adherencia')
    await expect(page.getByRole('heading', { name: 'Adherencia' })).toBeVisible()
    await expect(page.getByText('Entrenos semanales')).toBeVisible()
    await shot(page, '08-coach-adherencia')

    const switchControl = page.getByRole('switch', { name: 'Activar Entrenos semanales' })
    const before = await switchControl.getAttribute('data-state')
    await switchControl.click()
    await expect(page.getByText('Regla actualizada')).toBeVisible()
    await expect(switchControl).toHaveAttribute(
      'data-state',
      before === 'checked' ? 'unchecked' : 'checked',
    )
    await shot(page, '09-coach-adherencia-toggle')
  })

  test('mensajes: enviar al alumno', async ({ page }) => {
    await nav(page, 'Mensajes')
    await expect(page.getByRole('heading', { name: 'Mensajes' })).toBeVisible()
    await expect(page.getByText('Camila Rojas').first()).toBeVisible()
    await expect(
      page.getByText('¿Cambiamos el press militar por mancuernas?').first(),
    ).toBeVisible()

    const msg = `E2E coach ${Date.now()}`
    await page.getByPlaceholder('Escribe un mensaje…').fill(msg)
    await page.getByRole('button', { name: 'Enviar' }).click()
    await expect(page.getByText(msg)).toBeVisible()
    await shot(page, '10-coach-mensajes')
  })
})
