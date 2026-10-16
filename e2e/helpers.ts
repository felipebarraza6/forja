import { expect, type Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const SCREENSHOTS_DIR = path.resolve(__dirname, '../docs/validation-screenshots')

export async function enterDemo(page: Page, role: 'coach' | 'alumno') {
  // Ruta relativa al baseURL (/forja/): un path absoluto /login sale del basename.
  await page.goto(`login?demo=${role}`)
  if (role === 'coach') {
    await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible()
    await expect(page.getByText('Demo')).toBeVisible()
  } else {
    await expect(page.getByRole('heading', { name: /Hola/ })).toBeVisible()
    await expect(page.getByText('Demo')).toBeVisible()
  }
}

export async function shot(page: Page, name: string) {
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${name}.png`),
    fullPage: true,
  })
}

export async function nav(page: Page, label: string) {
  await page.getByRole('navigation').getByRole('link', { name: label }).click()
}
