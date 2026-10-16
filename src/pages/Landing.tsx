import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight, Dumbbell, MessageCircle, Target } from 'lucide-react'
import { BrandMark, ForjaMark } from '@/components/brand-logo'
import { FadeIn, StaggerItem } from '@/components/page-motion'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

export function Landing() {
  const reduced = usePrefersReducedMotion()

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 nordic-grid opacity-60"
        style={{
          maskImage: 'radial-gradient(ellipse 75% 55% at 50% 18%, black, transparent)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-24 opacity-[0.07] sm:right-8 sm:top-16 sm:opacity-[0.1]"
      >
        <ForjaMark className="size-[280px] sm:size-[420px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <BrandMark size="md" to={null} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[78dvh] max-w-6xl flex-col justify-center px-4 pb-16 pt-6">
        <FadeIn>
          <p className="eyebrow mb-5">Para personal trainers</p>
        </FadeIn>
        {reduced ? (
          <h1 className="font-display max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight text-text sm:text-6xl md:text-7xl">
            Forja
          </h1>
        ) : (
          <motion.h1
            className="font-display max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight text-text sm:text-6xl md:text-7xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            Forja
          </motion.h1>
        )}
        <FadeIn delay={0.08}>
          <p className="mt-5 max-w-xl text-lg text-text-muted sm:text-xl">
            Vende tu servicio, guía a tus alumnos y sigue su adherencia — entrenamiento, nutrición y
            chat en un solo lugar.
          </p>
        </FadeIn>
        <FadeIn delay={0.14}>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/login">
                Empezar
                <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login?demo=coach">Probar demo coach</Link>
            </Button>
          </div>
        </FadeIn>
      </section>

      <section className="relative z-10 border-t border-border/70 bg-bg-raised/50 backdrop-blur-sm">
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
            <StaggerItem key={item.title} index={i}>
              <item.icon className="mb-3 size-5 text-accent" strokeWidth={1.75} />
              <h2 className="font-display text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.body}</p>
            </StaggerItem>
          ))}
        </div>
      </section>
    </div>
  )
}
