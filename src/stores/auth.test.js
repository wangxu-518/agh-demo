import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const memory = new Map()
global.localStorage = {
  getItem: (key) => memory.get(key) || null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
  clear: () => memory.clear(),
}

describe('independent demo authentication', () => {
  beforeEach(() => {
    memory.clear()
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
})
