import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSession } from '@/lib/session'
import type { Role } from '@/lib/api/types'
import { cn } from '@/lib/utils'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('coach')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useSession((s) => s.login)
  const demo = useSession((s) => s.demo)
  const session = useSession((s) => s.session)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const demoRole = params.get('demo')
    if (demoRole === 'coach' || demoRole === 'alumno') {
      demo(demoRole)
    }
  }, [params, demo])

  useEffect(() => {
    if (!session) return
    navigate(session.role === 'alumno' ? '/alumno' : '/coach', { replace: true })
  }, [session, navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password, role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-bg-sunken md:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 20%, var(--accent-dim), transparent 45%), linear-gradient(160deg, var(--bg-sunken), var(--bg))',
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link to="/" className="font-display text-2xl font-bold">
            Forja
          </Link>
          <motion.p
            className="max-w-sm text-lg text-text-muted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            El estudio digital del coach: alumnos, planes y adherencia con la misma API Yggdra que
            el resto del ecosistema.
          </motion.p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 md:justify-end">
          <Link to="/" className="font-display text-lg font-bold md:hidden">
            Forja
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-12">
          <h1 className="font-display text-3xl font-bold tracking-tight">Entrar</h1>
          <p className="mt-2 text-sm text-text-muted">
            Cuenta Yggdra (org Forja, sucursal 91). Los alumnos recién creados entran con «olvidé mi
            contraseña». El modo demo es solo respaldo offline.
          </p>

          <div className="mt-6 flex gap-2" role="group" aria-label="Rol preferido">
            {(['coach', 'alumno'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm capitalize transition-colors',
                  role === r
                    ? 'border-accent bg-accent/10 text-text'
                    : 'border-border text-text-muted hover:bg-bg-sunken',
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando…' : 'Continuar'}
            </Button>
          </form>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button type="button" variant="outline" onClick={() => demo('coach')}>
              Demo coach
            </Button>
            <Button type="button" variant="outline" onClick={() => demo('alumno')}>
              Demo alumno
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
