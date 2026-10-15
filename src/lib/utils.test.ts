import { describe, expect, it } from 'vitest'
import { cn, pct } from './utils'

describe('utils', () => {
  it('combina clases con cn', () => {
    const hidden = false
    expect(cn('px-2', hidden && 'hidden', 'py-1')).toContain('px-2')
    expect(cn('px-2', 'px-4')).toContain('px-4')
  })

  it('calcula porcentaje seguro', () => {
    expect(pct(1, 0)).toBe(0)
    expect(pct(3, 4)).toBe(75)
  })
})
