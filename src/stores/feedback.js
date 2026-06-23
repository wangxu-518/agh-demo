import { ref } from 'vue'
import { defineStore } from 'pinia'
import { systems, systemFromPath } from '../config/systems'

export const FEEDBACK_TYPES = ['建议', '问题', '不理解', '希望新增']
export const FEEDBACK_PRIORITIES = ['一般', '重要', '紧急']
const MIN_CONTENT_LENGTH = 5
const MAX_CONTENT_LENGTH = 1000

export function validateFeedback(payload) {
  const type = payload?.type
  const priority = payload?.priority
  const content = String(payload?.content || '').trim()
  if (!FEEDBACK_TYPES.includes(type)) return { ok: false, reason: 'invalid_type' }
  if (!FEEDBACK_PRIORITIES.includes(priority)) return { ok: false, reason: 'invalid_priority' }
  if (content.length < MIN_CONTENT_LENGTH) return { ok: false, reason: 'content_too_short' }
  if (content.length > MAX_CONTENT_LENGTH) return { ok: false, reason: 'content_too_long' }
  return { ok: true, content }
}

function currentPath() {
  if (typeof window === 'undefined') return '/'
  return `${window.location.pathname}${window.location.search || ''}`
}

function currentUserAgent() {
  if (typeof navigator === 'undefined') return ''
  return navigator.userAgent || ''
}

function systemLabel(path) {
  if (path.startsWith('/portal')) return 'Portal'
  const key = systemFromPath(path)
  return key ? systems[key]?.short || key : '未知页面'
}

export const useFeedbackStore = defineStore('feedback', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref('')

  async function submitFeedback(payload, auth) {
    error.value = ''
    if (!auth?.isPortalVerified?.()) {
      error.value = '请先登录 Portal 后再提交反馈'
      return { ok: false, reason: 'not_verified' }
    }

    const validation = validateFeedback(payload)
    if (!validation.ok) {
      error.value = validation.reason
      return validation
    }

    const path = currentPath()
    const session = auth.portalSession || {}
    const body = {
      type: payload.type,
      priority: payload.priority,
      content: validation.content,
      name: session.name || '',
      phone: session.phone || '',
      phoneMasked: auth.maskPhone?.(session.phone) || '',
      path,
      system: systemLabel(path),
      submittedAt: new Date().toISOString(),
      userAgent: currentUserAgent(),
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.ok === false) {
        error.value = result.error || '反馈提交失败，请稍后再试'
        return { ok: false, reason: error.value }
      }
      return { ok: true }
    } catch {
      error.value = '反馈提交失败，请稍后再试'
      return { ok: false, reason: 'network_error' }
    }
  }

  async function loadFeedback(auth) {
    error.value = ''
    if (!auth?.isPortalAdmin?.()) {
      error.value = '只有 admin 用户可以查看反馈记录'
      return { ok: false, reason: 'forbidden' }
    }

    loading.value = true
    try {
      const response = await fetch('/api/feedback')
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.ok === false) {
        error.value = result.error || '反馈记录读取失败'
        return { ok: false, reason: error.value }
      }
      items.value = Array.isArray(result.items) ? result.items : []
      return { ok: true, items: items.value }
    } catch {
      error.value = '反馈记录读取失败'
      return { ok: false, reason: 'network_error' }
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, submitFeedback, loadFeedback }
})
