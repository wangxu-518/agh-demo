import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const memory = new Map()
const sessionMemory = new Map()
global.localStorage = {
  getItem: (key) => memory.get(key) || null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
  clear: () => memory.clear(),
}
global.sessionStorage = {
  getItem: (key) => sessionMemory.get(key) || null,
  setItem: (key, value) => sessionMemory.set(key, value),
  removeItem: (key) => sessionMemory.delete(key),
  clear: () => sessionMemory.clear(),
}

describe('independent demo authentication', () => {
  beforeEach(() => {
    memory.clear()
    sessionMemory.clear()
    setActivePinia(createPinia())
  })

  it('logs into only the selected system', async () => {
    const { useAuthStore } = await import('./auth')
    const auth = useAuthStore()
    expect(auth.login('malaysia', 'malaysia@agh.demo', '123456')).toBe(true)
    expect(auth.isLoggedIn('malaysia')).toBe(true)
    expect(auth.isLoggedIn('expert')).toBe(false)
  })

  it('rejects invalid credentials and supports logout', async () => {
    const { useAuthStore } = await import('./auth')
    const auth = useAuthStore()
    expect(auth.login('expert', 'wrong', 'wrong')).toBe(false)
    auth.demoLogin('expert')
    auth.logout('expert')
    expect(auth.isLoggedIn('expert')).toBe(false)
  })

  it('logs into the portal with a valid name and phone', async () => {
    const { useAuthStore } = await import('./auth')
    const auth = useAuthStore()
    expect(auth.loginWithContact('李', '13800138000')).toEqual({ ok: false, reason: 'invalid_name' })
    expect(auth.loginWithContact('李总', '12345')).toEqual({ ok: false, reason: 'invalid_phone' })
    expect(auth.loginWithContact('李总', '+86 138-0013-8000')).toEqual({ ok: true })
    expect(auth.isPortalVerified()).toBe(true)
    expect(auth.portalSession.name).toBe('李总')
    expect(auth.portalSession.phone).toBe('13800138000')
    expect(auth.portalHistory[0].type).toBe('portal_login')
  })

  it('validates mainland mobile phone format', async () => {
    const { useAuthStore } = await import('./auth')
    const auth = useAuthStore()
    expect(auth.isValidMainlandPhone('13800138000')).toBe(true)
    expect(auth.isValidMainlandPhone('+86 138-0013-8000')).toBe(true)
    expect(auth.isValidMainlandPhone('12800138000')).toBe(false)
    expect(auth.isValidMainlandPhone('1380013800')).toBe(false)
    expect(auth.isValidMainlandPhone('hello13800138000')).toBe(false)
  })

  it('ignores stale persistent portal sessions from previous demos', async () => {
    memory.set('agh-demo-portal-auth-v1', JSON.stringify({ id: 'wx-client-li', provider: 'wechat' }))
    memory.set('agh-demo-portal-session-v2', JSON.stringify({ id: 'wx-client-li', provider: 'wechat' }))
    const { useAuthStore } = await import('./auth')
    const auth = useAuthStore()
    expect(auth.isPortalVerified()).toBe(false)
  })

  it('clears system sessions when portal access is revoked', async () => {
    const { useAuthStore } = await import('./auth')
    const auth = useAuthStore()
    auth.loginWithContact('李总', '13900139000')
    auth.demoLogin('hospital')

    auth.logoutPortal()

    expect(auth.isPortalVerified()).toBe(false)
    expect(auth.isLoggedIn('hospital')).toBe(false)
  })

  it('provides system credentials only after contact portal login', async () => {
    const { useAuthStore } = await import('./auth')
    const auth = useAuthStore()
    expect(auth.credentialsForSystem('expert')).toEqual({ account: '', password: '' })

    auth.loginWithContact('王经理', '13800138000')

    expect(auth.credentialsForSystem('expert')).toEqual({ account: 'expert@agh.demo', password: '123456' })
    expect(auth.login('expert', 'expert@agh.demo', '123456')).toBe(true)
    expect(auth.portalHistory[0].type).toBe('system_login')
    expect(auth.portalHistory[0].system).toBe('expert')
  })

  it('allows only admin portal users to clear login history', async () => {
    const { useAuthStore } = await import('./auth')
    const auth = useAuthStore()
    auth.loginWithContact('李总', '13900139000')
    expect(auth.portalHistory.length).toBe(1)
    expect(auth.clearPortalHistory()).toBe(false)
    expect(auth.portalHistory.length).toBe(1)

    auth.loginWithContact('王经理', '13800138000')
    expect(auth.isPortalAdmin()).toBe(true)
    expect(auth.clearPortalHistory()).toBe(true)
    expect(auth.portalHistory.length).toBe(0)
  })
})
