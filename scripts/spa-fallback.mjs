import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(process.cwd(), 'dist')
const index = resolve(dist, 'index.html')
const fallback = resolve(dist, '404.html')

if (!existsSync(index)) {
  console.error('No existe dist/index.html — ejecuta el build primero.')
  process.exit(1)
}

copyFileSync(index, fallback)
console.log('SPA fallback: dist/404.html listo')
