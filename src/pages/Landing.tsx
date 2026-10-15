import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/layout/ThemeToggle'

export default function Landing() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="forja-mesh absolute inset-0 -z-10" />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <p className="font-display text-2xl font-semibold tracking-tight">Forja</p>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-5xl flex-col justify-center px-5 pb-16 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl"
        >
          <p className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Forja
          </p>
          <h1 className="mt-5 max-w-xl text-xl font-medium leading-snug text-text sm:text-2xl">
            El estudio digital del personal trainer.
          </h1>
          <p className="mt-4 max-w-lg text-base text-text-muted sm:text-lg">
            Vende tu coaching, guía a tus alumnos y sigue la adherencia — todo en un espacio
            nórdico, claro y multi-coach.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/login">
                Empezar
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login?demo=1">Ver demo</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[42vh] bg-[radial-gradient(ellipse_at_bottom,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_70%)]"
          aria-hidden
        />
      </section>
    </div>
  )
}
