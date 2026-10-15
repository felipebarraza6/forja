import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight, Dumbbell, MessageCircle, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export function Landing() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(to right, color-mix(in srgb, var(--border) 55%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--border) 55%, transparent) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 20%, black, transparent)',
        }}
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="font-display text-xl font-bold tracking-tight">Forja</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[78dvh] max-w-6xl flex-col justify-center px-4 pb-16 pt-6">
        <motion.p
          className="eyebrow mb-4"
          initial={{ opacity: 0.6, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          Para personal trainers
        </motion.p>
        <motion.h1
          className="font-display max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-text sm:text-6xl md:text-7xl"
          initial={{ opacity: 0.85, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Forja
        </motion.h1>
        <motion.p
          className="mt-5 max-w-xl text-lg text-text-muted sm:text-xl"
          initial={{ opacity: 0.7, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          Vende tu servicio, guía a tus alumnos y sigue su adherencia — entrenamiento, nutrición y
          chat en un solo lugar.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-wrap gap-3"
          initial={{ opacity: 0.75, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <Button asChild size="lg">
            <Link to="/login">
              Empezar
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/login?demo=coach">Probar demo coach</Link>
          </Button>
        </motion.div>
      </section>

      <section className="relative z-10 border-t border-border/70 bg-bg-raised/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-3">
          {[
            {
              icon: Dumbbell,
              title: 'Planes y rutinas',
              body: 'Crea servicios vendibles y asigna bloques de entrenamiento a cada alumno.',
            },
            {
              icon: Target,
              title: 'Adherencia real',
              body: 'Reglas configurables, check-ins y seguimiento de comidas, agua y entrenos.',
            },
            {
              icon: MessageCircle,
              title: 'Mensajes en vivo',
              body: 'Conversación coach–alumno con eventos en tiempo real (SSE).',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <item.icon className="mb-3 size-5 text-accent" />
              <h2 className="font-display text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
