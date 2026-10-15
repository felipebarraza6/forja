import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { motion } from 'framer-motion'
import { BRANCH_KEY, DEMO_KEY, ROLE_KEY, TOKEN_KEY, login, probeApi } from '@/lib/api/client'
import type { UserRole } from '@/lib/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ThemeToggle from '@/components/layout/ThemeToggle'

function startDemo(role: UserRole) {
  localStorage.setItem(TOKEN_KEY, 'demo-token')
  localStorage.setItem(BRANCH_KEY, '1')
  localStorage.setItem(ROLE_KEY, role)
  localStorage.setItem(DEMO_KEY, '1')
}

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('coach@forja.demo')
  const [password, setPassword] = useState('demo')
  const [role, setRole] = useState<UserRole>('coach')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      const r = localStorage.getItem(ROLE_KEY) === 'alumno' ? 'alumno' : 'coach'
      navigate(r === 'coach' ? '/coach' : '/alumno', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    probeApi().then(setApiOnline)
  }, [])

  useEffect(() => {
    if (params.get('demo') === '1') {
      startDemo('coach')
      navigate('/coach', { replace: true })
    }
  }, [params, navigate])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await login(email, password)
      if (!res.token) throw new Error('Sin token')
      localStorage.setItem(TOKEN_KEY, res.token)
      localStorage.setItem(BRANCH_KEY, String(res.branches?.[0]?.id ?? '1'))
      localStorage.setItem(ROLE_KEY, role)
      localStorage.removeItem(DEMO_KEY)
      navigate(role === 'coach' ? '/coach' : '/alumno', { replace: true })
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === undefined || status >= 500) {
        startDemo(role)
        navigate(role === 'coach' ? '/coach' : '/alumno', { replace: true })
        return
      }
      if (status === 400 || status === 401) {
        setError('Credenciales inválidas. Revisa correo y contraseña.')
      } else {
        setError('No se pudo iniciar sesión. Prueba el modo demo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh forja-mesh">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="font-display text-3xl font-semibold tracking-tight">
            Forja
          </Link>
          <p className="mt-2 text-sm text-text-muted">
            Accede como coach o alumno. Autenticación Token + X-Branch-ID (Yggdra).
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-bg-sunken p-1">
              {(['coach', 'alumno'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-md px-3 py-2 text-sm capitalize transition ${
                    role === r ? 'bg-bg-raised text-text shadow-sm' : 'text-text-muted'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

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
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                startDemo(role)
                navigate(role === 'coach' ? '/coach' : '/alumno', { replace: true })
              }}
            >
              Continuar en modo demo
            </Button>
          </form>

          <p className="mt-6 text-xs text-text-faint">
            API:{' '}
            {apiOnline === null ? 'comprobando…' : apiOnline ? 'alcanzable' : 'no alcanzable → demo'}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
