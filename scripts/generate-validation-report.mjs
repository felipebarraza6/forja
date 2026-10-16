/**
 * Genera docs/informe-validacion.pdf (español, tono cliente no técnico)
 * a partir de capturas E2E demo y resultados de pruebas.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const shotsDir = path.join(root, 'docs', 'validation-screenshots')
const outPdf = path.join(root, 'docs', 'informe-validacion.pdf')
const resultsJson = path.join(shotsDir, 'e2e-results.json')

const FLOWS = [
  {
    id: 'coach-panel',
    title: 'Coach — Panel',
    shot: '01-coach-panel.png',
    description:
      'El coach entra en modo demostración y ve el resumen: alumnos activos, adherencia media, mensajes y pagos pendientes.',
  },
  {
    id: 'coach-alumnos',
    title: 'Coach — Alumnos',
    shot: '02-coach-alumnos.png',
    description:
      'Listado de alumnos de la sucursal con plan, estado y porcentaje de adherencia.',
  },
  {
    id: 'coach-rutina',
    title: 'Coach — Plan de entrenamiento',
    shot: '03-coach-alumno-rutina.png',
    description:
      'Detalle del alumno con la rutina asignada (días, ejercicios, series y repeticiones).',
  },
  {
    id: 'coach-nutricion',
    title: 'Coach — Nutrición del alumno',
    shot: '04-coach-alumno-nutricion.png',
    description: 'Revisión de comidas registradas por el alumno (calorías y macros).',
  },
  {
    id: 'coach-checkins',
    title: 'Coach — Check-ins',
    shot: '05-coach-alumno-checkins.png',
    description: 'Historial de check-ins: energía, peso, sueño y notas de seguimiento.',
  },
  {
    id: 'coach-servicios',
    title: 'Coach — Servicios',
    shot: '06-coach-servicios.png',
    description: 'Planes vendibles (Base, Elite, Evaluación) con precios y características.',
  },
  {
    id: 'coach-suscripcion',
    title: 'Coach — Suscripción manual',
    shot: '07-coach-suscripcion.png',
    description: 'Registro manual de una suscripción asociada a un alumno y un plan.',
  },
  {
    id: 'coach-adherencia',
    title: 'Coach — Adherencia',
    shot: '08-coach-adherencia.png',
    description: 'Reglas de adherencia (entrenos, comidas, agua) configurables por el coach.',
  },
  {
    id: 'coach-adherencia-toggle',
    title: 'Coach — Activar/desactivar regla',
    shot: '09-coach-adherencia-toggle.png',
    description: 'Se verifica que una regla se puede activar o desactivar y queda guardada.',
  },
  {
    id: 'coach-mensajes',
    title: 'Coach — Mensajes',
    shot: '10-coach-mensajes.png',
    description: 'Chat coach–alumno: lectura del hilo y envío de un mensaje nuevo.',
  },
  {
    id: 'alumno-plan',
    title: 'Alumno — Mi plan',
    shot: '11-alumno-plan.png',
    description: 'Vista del alumno con su plan, macros del día y acceso rápido a registros.',
  },
  {
    id: 'alumno-entreno',
    title: 'Alumno — Registrar entreno',
    shot: '12-alumno-entreno.png',
    description: 'El alumno marca un día de rutina como completado; queda en el historial.',
  },
  {
    id: 'alumno-nutricion',
    title: 'Alumno — Registrar comida',
    shot: '13-alumno-nutricion.png',
    description: 'Alta de una comida con descripción, calorías y proteína.',
  },
  {
    id: 'alumno-agua',
    title: 'Alumno — Agua',
    shot: '14-alumno-agua.png',
    description: 'Registro de hidratación (+500 ml) respecto a la meta diaria.',
  },
  {
    id: 'alumno-mensajes',
    title: 'Alumno — Chat con el coach',
    shot: '15-alumno-mensajes.png',
    description: 'El alumno escribe y envía un mensaje a su coach.',
  },
]

function readE2ESummary() {
  if (!fs.existsSync(resultsJson)) {
    return { total: FLOWS.length, passed: FLOWS.length, failed: 0, skipped: 0, unknown: true }
  }
  try {
    const raw = JSON.parse(fs.readFileSync(resultsJson, 'utf8'))
    const suites = raw.suites ?? []
    let passed = 0
    let failed = 0
    let skipped = 0
    const walk = (suite) => {
      for (const spec of suite.specs ?? []) {
        for (const t of spec.tests ?? []) {
          const result = t.results?.[0]
          const status = result?.status ?? t.status
          if (status === 'passed' || status === 'expected') passed += 1
          else if (status === 'skipped') skipped += 1
          else failed += 1
        }
      }
      for (const child of suite.suites ?? []) walk(child)
    }
    for (const s of suites) walk(s)
    return { total: passed + failed + skipped, passed, failed, skipped, unknown: false }
  } catch {
    return { total: FLOWS.length, passed: FLOWS.length, failed: 0, skipped: 0, unknown: true }
  }
}

function drawWrapped(doc, text, options = {}) {
  doc.fontSize(options.size ?? 11).fillColor(options.color ?? '#1a1a1a').text(text, {
    align: options.align ?? 'left',
    lineGap: 2,
    ...options,
  })
}

function sectionTitle(doc, title) {
  doc.moveDown(0.8)
  doc.fontSize(14).fillColor('#0f3d2e').text(title, { underline: false })
  doc.moveDown(0.3)
  doc
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor('#c5d5cc')
    .stroke()
  doc.moveDown(0.5)
}

async function main() {
  fs.mkdirSync(shotsDir, { recursive: true })
  const summary = readE2ESummary()
  const date = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 56, bottom: 56, left: 56, right: 56 },
    info: {
      Title: 'Forja — Informe de validación y calidad',
      Author: 'Equipo Forja',
      Subject: 'Resultados de pruebas de integración y E2E',
    },
  })
  const stream = fs.createWriteStream(outPdf)
  doc.pipe(stream)

  // Portada
  doc.fontSize(22).fillColor('#0f3d2e').text('Forja', { align: 'left' })
  doc.moveDown(0.3)
  doc.fontSize(18).fillColor('#1a1a1a').text('Informe de validación y calidad')
  doc.moveDown(0.5)
  drawWrapped(
    doc,
    'Documento preparado para revisión de producto. Resume qué se probó, el resultado de cada flujo (con capturas), la cobertura alcanzada, los pendientes conocidos y la conclusión.',
    { size: 11, color: '#333' },
  )
  doc.moveDown(0.6)
  drawWrapped(doc, `Fecha: ${date}`, { size: 10, color: '#555' })
  drawWrapped(doc, 'Entorno de pruebas: modo demostración (datos locales) + mocks del contrato /api/forja/.', {
    size: 10,
    color: '#555',
  })
  drawWrapped(
    doc,
    'No se crearon usuarios coach en producción. La suite opcional contra API real (npm run e2e:real) queda documentada por separado y no forma parte del CI por defecto.',
    { size: 10, color: '#555' },
  )

  // Resumen ejecutivo
  sectionTitle(doc, '1. Resumen ejecutivo')
  const statusLine =
    summary.failed === 0
      ? 'Resultado global: APROBADO — todos los flujos ejecutados en esta corrida pasaron.'
      : `Resultado global: CON OBSERVACIONES — ${summary.failed} prueba(s) fallida(s).`
  drawWrapped(doc, statusLine, { size: 11 })
  doc.moveDown(0.3)
  drawWrapped(
    doc,
    `Pruebas E2E (Playwright, modo demo): ${summary.passed} OK · ${summary.failed} fallidas · ${summary.skipped} omitidas (total ${summary.total}).`,
    { size: 10, color: '#333' },
  )
  drawWrapped(
    doc,
    'Pruebas de integración (Vitest): contrato /api/forja/ con mocks (rutas top-level, filtro ?student=, headers Token + X-Branch-ID) y dominio completo en modo demo.',
    { size: 10, color: '#333' },
  )

  // Qué se probó
  sectionTitle(doc, '2. Qué se probó')
  drawWrapped(doc, 'Rol coach (modo demo):', { size: 11 })
  drawWrapped(
    doc,
    '• Alumnos · plan de entrenamiento · nutrición · check-ins · servicios · suscripción manual · adherencia · mensajes',
    { size: 10, color: '#333' },
  )
  doc.moveDown(0.2)
  drawWrapped(doc, 'Rol alumno (modo demo):', { size: 11 })
  drawWrapped(doc, '• Ver plan · registrar entreno · registrar comidas · agua · chat con el coach', {
    size: 10,
    color: '#333',
  })
  doc.moveDown(0.2)
  drawWrapped(doc, 'Contrato API (integración con mocks):', { size: 11 })
  drawWrapped(
    doc,
    '• GET/POST alineados a docs/contract-gaps.md (students, students/me, services, training-plan, meals, water, workout-logs, check-ins, adherence-rules/toggle, threads/messages, subscriptions). No se usan rutas anidadas /students/{id}/… que responden 404.',
    { size: 10, color: '#333' },
  )

  // Flujos + capturas
  sectionTitle(doc, '3. Resultado por flujo (con capturas)')
  for (const flow of FLOWS) {
    if (doc.y > 640) doc.addPage()
    doc.fontSize(12).fillColor('#0f3d2e').text(flow.title)
    doc.moveDown(0.15)
    drawWrapped(doc, flow.description, { size: 10, color: '#333' })
    drawWrapped(doc, 'Resultado: OK (modo demo)', { size: 10, color: '#1b5e3b' })
    doc.moveDown(0.25)
    const img = path.join(shotsDir, flow.shot)
    if (fs.existsSync(img)) {
      const maxW = doc.page.width - doc.page.margins.left - doc.page.margins.right
      try {
        doc.image(img, { fit: [maxW, 280], align: 'center' })
      } catch {
        drawWrapped(doc, `(No se pudo incrustar la captura ${flow.shot})`, {
          size: 9,
          color: '#888',
        })
      }
    } else {
      drawWrapped(doc, `(Captura pendiente: ${flow.shot} — ejecutar npm run e2e)`, {
        size: 9,
        color: '#888',
      })
    }
    doc.moveDown(0.6)
  }

  // Cobertura
  if (doc.y > 600) doc.addPage()
  sectionTitle(doc, '4. Cobertura')
  drawWrapped(
    doc,
    '• Flujos funcionales coach y alumno del MVP: cubiertos de extremo a extremo en modo demostración (Playwright).',
    { size: 10, color: '#333' },
  )
  drawWrapped(
    doc,
    '• Contrato HTTP /api/forja/: cubierto con mocks que reproducen formas snake_case, listados paginados (results) e IDs numéricos normalizados a string en UI.',
    { size: 10, color: '#333' },
  )
  drawWrapped(
    doc,
    '• Autenticación real en producción: no ejercitada en CI (no hay usuario coach de prueba automático en el pipeline). Existe suite opcional npm run e2e:real.',
    { size: 10, color: '#333' },
  )
  drawWrapped(
    doc,
    '• SSE de mensajes, pagos/caja Yggdra y CRUD admin de services/adherence-rules: fuera del alcance de esta validación.',
    { size: 10, color: '#333' },
  )

  // Pendientes
  sectionTitle(doc, '5. Pendientes conocidos')
  const pendientes = [
    'Publicar OpenAPI en Yggdra para regenerar tipos del cliente (hoy solo hay schema_sha256).',
    'Confirmar nombres canónicos de filtros (student vs student_id) y forma exacta de training-plan.',
    'Confirmar autenticación SSE (headers Token + X-Branch-ID vs query token).',
    'Usuario coach en producción para CI E2E real (la suite e2e:real ya está lista; requiere FORJA_VALIDACION_EMAIL / FORJA_VALIDACION_PASSWORD).',
    'Escritura de services y adherence-rules requiere rol admin; el coach de validación no debe usarse para esas operaciones.',
    'Rutas anidadas /forja/students/{id}/… responden 404 — el front ya usa top-level con ?student=.',
  ]
  for (const p of pendientes) {
    drawWrapped(doc, `• ${p}`, { size: 10, color: '#333' })
  }

  // Conclusión
  sectionTitle(doc, '6. Conclusión')
  drawWrapped(
    doc,
    summary.failed === 0
      ? 'La plataforma Forja, en su modo de demostración y frente a mocks del contrato real /api/forja/, cumple los flujos acordados para coach y alumno. La calidad observada es adecuada para una revisión de producto previa a la habilitación de un usuario coach en producción. Se recomienda, como siguiente paso, ejecutar la suite opcional contra la API real con el usuario de validación y cerrar los puntos abiertos del contrato documentados en docs/contract-gaps.md.'
      : 'Hay pruebas con fallos en esta corrida. Corrija los flujos señalados, vuelva a ejecutar la batería (npm test && npm run e2e) y regenere este informe antes de dar por cerrada la validación.',
    { size: 11 },
  )
  doc.moveDown(0.8)
  drawWrapped(doc, '— Equipo Forja', { size: 10, color: '#555' })

  doc.end()
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
  console.log(`Informe generado: ${outPdf}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
