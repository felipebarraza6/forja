import { describe, expect, it } from 'vitest'
import { listBranchPks, pickForjaBranchId, resolveBranchPk } from './branch'

describe('branch (login_complete BranchUser)', () => {
  it('usa branch_id y no el id del membership', () => {
    const membership = {
      id: 230,
      branch_id: 91,
      name: 'Forja',
    }
    expect(resolveBranchPk(membership)).toBe(91)
    expect(listBranchPks([membership])).toEqual([91])
    expect(pickForjaBranchId([membership])).toBe(91)
  })

  it('no confunde BranchUser id 230 con la sucursal 91', () => {
    const wrongIfUsingId = {
      id: 230,
      branch_id: 91,
      name: 'Forja',
    }
    expect(pickForjaBranchId([wrongIfUsingId])).not.toBe(230)
  })
})
