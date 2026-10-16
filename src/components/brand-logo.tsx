import { Link } from 'react-router'
import { cn } from '@/lib/utils'

/** Runa molecular original: glifo de fuerza (Tiwaz estilizado) formado por nodos y enlaces. */
export function ForjaMark({
  className,
  title = 'Forja',
}: {
  className?: string
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="64" height="64" rx="14" fill="currentColor" className="text-[var(--mark-bg)]" />
      {/* Enlaces */}
      <g stroke="currentColor" className="text-[var(--mark-ink)]" strokeWidth="2.25" strokeLinecap="round">
        <path d="M32 12v40" />
        <path d="M32 20L18 32" />
        <path d="M32 20L46 32" />
        <path d="M18 32h28" />
        <path d="M32 44L20 52" />
        <path d="M32 44L44 52" />
      </g>
      {/* Nodos */}
      <g fill="currentColor" className="text-[var(--mark-node)]">
        <circle cx="32" cy="12" r="3.2" />
        <circle cx="32" cy="20" r="2.6" />
        <circle cx="18" cy="32" r="3" />
        <circle cx="32" cy="32" r="3.4" />
        <circle cx="46" cy="32" r="3" />
        <circle cx="32" cy="44" r="2.6" />
        <circle cx="20" cy="52" r="2.8" />
        <circle cx="44" cy="52" r="2.8" />
        <circle cx="32" cy="52" r="2.4" />
      </g>
    </svg>
  )
}

export function BrandMark({
  className,
  markClassName,
  wordmark = true,
  to = '/',
  size = 'md',
}: {
  className?: string
  markClassName?: string
  wordmark?: boolean
  to?: string | null
  size?: 'sm' | 'md' | 'lg' | 'hero'
}) {
  const markSize = {
    sm: 'size-7',
    md: 'size-8',
    lg: 'size-10',
    hero: 'size-14 sm:size-16',
  }[size]
  const textSize = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    hero: 'text-3xl sm:text-4xl',
  }[size]

  const content = (
    <>
      <ForjaMark className={cn(markSize, markClassName)} />
      {wordmark && (
        <span className={cn('font-display font-bold tracking-tight text-text', textSize)}>
          Forja
        </span>
      )}
    </>
  )

  if (to === null) {
    return <span className={cn('inline-flex items-center gap-2.5', className)}>{content}</span>
  }

  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-md',
        className,
      )}
    >
      {content}
    </Link>
  )
}
