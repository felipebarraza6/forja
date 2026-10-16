import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { BrandMark, ForjaMark } from '@/components/brand-logo'
import { PageMotion } from '@/components/page-motion'
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
      <div className="relative hidden overflow-hidden frost-panel md:block">
        <div
          aria-hidden
          className="absolute inset-0 nordic-grid opacity-40"
          style={{
            maskImage: 'linear-gradient(180deg, black, transparent 85%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-10 opacity-[0.12]"
        >
          <ForjaMark className="size-[320px]" />
        </div>
        <div className="relative flex h-full flex-col justify-between p-10">
          <BrandMark size="lg" />
          <PageMotion>
            <p className="max-w-sm text-lg leading-relaxed text-text-muted">
              El estudio digital del coach: alumnos, planes y adherencia con la misma API Yggdra que
              el resto del ecosistema.
            </p>
          </PageMotion>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 md:justify-end">
          <BrandMark className="md:hidden" size="sm" />
          <ThemeToggle />
        </div>

        <PageMotion className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-12">
          <h1 className="font-display text-3xl font-bold tracking-tight">Entrar</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Cuenta Yggdra (org Forja, sucursal 91). Los alumnos recién creados entran con «olvidé mi
            contraseña». El modo demo es solo respaldo offline.
          </p>

          <div className="mt-6 flex gap-2" role="group" aria-label="Rol">
            {(['coach', 'alumno'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm capitalize transition-[background-color,border-color,color] duration-200',
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
            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}
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

          <p className="mt-8 text-center text-xs text-text-faint md:hidden">
            <Link to="/" className="underline-offset-2 hover:underline">
              Volver al inicio
            </Link>
          </p>
        </PageMotion>
      </div>
    </div>
  )
}
