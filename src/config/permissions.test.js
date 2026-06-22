import { describe, expect, it } from 'vitest'
import { systems } from './systems'
import { actionPermissions, canAccessPage, canPerformAction, pagePermissions, permissionForAction } from './permissions'
import { pageSchemas } from './pageSchemas'
import { seedState } from '../data/seed'

describe('role permissions', () => {
  it('defines route permissions for every configured navigation page', () => {
    for (const [system, config] of Object.entries(systems)) {
      for (const [page] of config.nav) {
        expect(pagePermissions[system]?.[page], `${system}/${page}`).toBeTruthy()
        expect(canAccessPage(seedState.permissions, system, page), `${system}/${page}`).toBe(true)
      }
      expect(pagePermissions[system]?.record, `${system}/record`).toBeTruthy()
    }
  })

  it('defines action permissions for every primary business action', () => {
    for (const [system, pages] of Object.entries(pageSchemas)) {
      for (const [page, schema] of Object.entries(pages)) {
        if (!schema.primary?.[1]) continue
        expect(permissionForAction(schema.primary[1]), `${system}/${page}/${schema.primary[1]}`).toBeTruthy()
      }
    }
  })

  it('allows each role to perform its own actions and blocks unrelated roles', () => {
    expect(canPerformAction(seedState.permissions, 'china', 'assignExpert')).toBe(true)
    expect(canPerformAction(seedState.permissions, 'patient', 'assignExpert')).toBe(false)
    expect(canPerformAction(seedState.permissions, 'hospital', 'recordPayment')).toBe(true)
    expect(canPerformAction(seedState.permissions, 'expert', 'recordPayment')).toBe(false)
  })

  it('keeps all mapped action permissions represented in at least one role', () => {
    const allPermissions = new Set(Object.values(seedState.permissions).flat())
    for (const permission of Object.values(actionPermissions)) {
      expect(allPermissions.has(permission), permission).toBe(true)
    }
  })
})
