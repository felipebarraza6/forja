import { describe, expect, it } from 'vitest'
import { API_BASE } from './client'

describe('api client', () => {
  it('expone una base de API configurada', () => {
    expect(API_BASE).toMatch(/api/)
  })
})
