import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { validateFeedback } from './feedback'

const memory = new Map()
global.localStorage = {
  getItem: (key) => memory.get(key) || null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
  clear: () => memory.clear(),
}

describe('demo feedback', () => {
  beforeEach(() => {
    memory.clear()
    setActivePinia(createPinia())
    global.fetch = vi.fn()
  })

  it('rejects empty feedback content', () => {
    expect(validateFeedback({ type: '建议', priority: '一般', content: '' })).toEqual({
      ok: false,
      reason: 'content_too_short',
    })
  })

  it('accepts valid feedback content', () => {
    expect(validateFeedback({ type: '问题', priority: '重要', content: '这里有一个流程问题' })).toEqual({
      ok: true,
      content: '这里有一个流程问题',
    })
  })

  it('prevents normal portal users from reading feedback records', async () => {
    const { useAuthStore } = await import('./auth')
    const { useFeedbackStore } = await import('./feedback')
    const auth = useAuthStore()
    const feedback = useFeedbackStore()

    auth.loginWithContact('客户经理', '13900139000')
    const result = await feedback.loadFeedback(auth)

    expect(result).toEqual({ ok: false, reason: 'forbidden' })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('allows admin portal users to read feedback records', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, items: [{ id: 'f1', content: '希望新增导出能力' }] }),
    })
    const { useAuthStore } = await import('./auth')
    const { useFeedbackStore } = await import('./feedback')
    const auth = useAuthStore()
    const feedback = useFeedbackStore()

    auth.loginWithContact('管理员', '13800138000')
    const result = await feedback.loadFeedback(auth)

    expect(result.ok).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith('/api/feedback')
    expect(feedback.items).toEqual([{ id: 'f1', content: '希望新增导出能力' }])
  })
})
