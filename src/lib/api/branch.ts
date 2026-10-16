import type { Branch } from './types'
import { FORJA_BRANCH_ID } from './config'

/**
 * Id de sucursal real para X-Branch-ID.
 * En login_complete, `branches[].id` es el BranchUser; la sucursal es `branch_id`.
 */
export function resolveBranchPk(b: Branch): number | undefined {
  if (typeof b.branch_id === 'number') return b.branch_id
  if (typeof b.branch === 'number') return b.branch
  if (b.branch && typeof b.branch === 'object' && typeof b.branch.id === 'number') {
    return b.branch.id
  }
  return undefined
}

export function listBranchPks(branches: Branch[] | undefined): number[] {
  if (!branches?.length) return []
  return branches
    .map(resolveBranchPk)
    .filter((id): id is number => typeof id === 'number')
}

/** Prefiere la sucursal Forja (91) si viene en el login; si no, la primera. */
export function pickForjaBranchId(branches: Branch[]): number {
  const forja = branches.find((b) => resolveBranchPk(b) === FORJA_BRANCH_ID)
  if (forja) return resolveBranchPk(forja) ?? FORJA_BRANCH_ID
  const first = branches[0] ? resolveBranchPk(branches[0]) : undefined
  return first ?? FORJA_BRANCH_ID
}
