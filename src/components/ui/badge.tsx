import type * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent/15 text-accent',
        secondary: 'border-transparent bg-bg-sunken text-text-muted',
        outline: 'border-border text-text-muted',
        success: 'border-transparent bg-success/15 text-success',
        warn: 'border-transparent bg-warn/15 text-warn',
        danger: 'border-transparent bg-danger/15 text-danger',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
