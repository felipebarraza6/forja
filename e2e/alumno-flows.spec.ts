import { test, expect } from '@playwright/test'
import { enterDemo, nav, shot } from './helpers'

test.describe('Flujos alumno (modo demo)', () => {
  test.beforeEach(async ({ page }) => {
    await enterDemo(page, 'alumno')
  })

  test('plan, registrar entreno, comidas, agua y chat', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Hola, Camila/ })).toBeVisible()
    await expect(page.getByText('Bloque fuerza — 6 semanas')).toBeVisible()
    await expect(page.getByText('Forja Elite')).toBeVisible()
    await shot(page, '11-alumno-plan')

    await nav(page, 'Entreno')
    await expect(page.getByRole('heading', { name: 'Tu rutina' })).toBeVisible()
    await expect(page.getByText('Press banca')).toBeVisible()
    await page.getByRole('button', { name: 'Marcar completado' }).nth(1).click()
    await expect(page.getByText('Entreno registrado')).toBeVisible()
    await expect(page.getByText('Día B — Tirón')).toBeVisible()
    await shot(page, '12-alumno-entreno')

    await nav(page, 'Nutrición')
    await expect(page.getByRole('heading', { name: 'Comidas y macros' })).toBeVisible()
    await page.getByLabel('Descripción').fill('Batido E2E de proteína')
    await page.getByLabel('Calorías').fill('380')
    await page.getByRole('button', { name: 'Registrar comida' }).click()
    await expect(page.getByText('Comida registrada')).toBeVisible()
    await expect(page.getByText('Batido E2E de proteína')).toBeVisible()
    await shot(page, '13-alumno-nutricion')

    await nav(page, 'Agua')
    await expect(page.getByRole('heading', { name: 'Agua' })).toBeVisible()
    const beforeText = await page.locator('.font-display.text-4xl').innerText()
    await page.getByRole('button', { name: '+500 ml' }).click()
    await expect(page.getByText('Agua registrada')).toBeVisible()
    await expect(page.locator('.font-display.text-4xl')).not.toHaveText(beforeText)
    await shot(page, '14-alumno-agua')

    await nav(page, 'Mensajes')
    await expect(page.getByRole('heading', { name: 'Mensajes' })).toBeVisible()
    await expect(page.getByText('Tu coach')).toBeVisible()
    const msg = `E2E alumno ${Date.now()}`
    await page.getByPlaceholder('Escribe un mensaje…').fill(msg)
    await page.getByRole('button', { name: 'Enviar' }).click()
    await expect(page.getByText(msg)).toBeVisible()
    await shot(page, '15-alumno-mensajes')
  })
})
