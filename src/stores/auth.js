import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { systems } from '../config/systems'

const KEY = 'agh-demo-auth-v1'
const PORTAL_KEY = 'agh-demo-portal-session-v4'
const PORTAL_HISTORY_KEY = 'agh-demo-portal-login-history-v1'
const PORTAL_SESSION_TTL_MS = 2 * 60 * 60 * 1000

function normalizePhone(phone) {
  const raw = String(phone || '').trim()
  if (!/^\+?[\d\s-]+$/.test(raw)) return raw
  let digits = raw.replace(/[^\d]/g, '')
  if (digits.startsWith('86') && digits.length === 13) digits = digits.slice(2)
  return digits
}

function isValidMainlandPhone(phone) {
  return /^1[3-9]\d{9}$/.test(normalizePhone(phone))
}

function maskPhone(phone) {
  const digits = normalizePhone(phone)
  return digits ? `${digits.slice(0, 3)}****${digits.slice(-4)}` : ''
}

function portalAdminPhones() {
  return String(import.meta.env.VITE_PORTAL_ADMIN_PHONES || '13800138000')
    .split(',')
    .map((phone) => normalizePhone(phone))
    .filter(Boolean)
}

export const useAuthStore = defineStore('auth', () => {
  const sessions = ref(JSON.parse(localStorage.getItem(KEY) || '{}'))
  const portalSession = ref(JSON.parse(localStorage.getItem(PORTAL_KEY) || 'null'))
  const portalHistory = ref(JSON.parse(localStorage.getItem(PORTAL_HISTORY_KEY) || '[]'))
  watch(sessions, (value) => localStorage.setItem(KEY, JSON.stringify(value)), { deep: true })
  watch(portalSession, (value) => {
    if (value) localStorage.setItem(PORTAL_KEY, JSON.stringify(value))
    else localStorage.removeItem(PORTAL_KEY)
  }, { deep: true, flush: 'sync' })
  watch(portalHistory, (value) => localStorage.setItem(PORTAL_HISTORY_KEY, JSON.stringify(value)), { deep: true })

  function recordHistory(type, detail = {}) {
    const user = portalSession.value
    portalHistory.value = [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        at: Date.now(),
        userId: user?.id || '',
        nickname: user?.name || '未识别用户',
        company: user?.phone ? maskPhone(user.phone) : '',
        ...detail,
      },
      ...portalHistory.value,
    ].slice(0, 30)
  }

  function login(system, account, password) {
    const config = systems[system]
    if (!config || account !== config.account || password !== config.password) return false
    sessions.value[system] = { account, loginAt: Date.now(), portalUserId: portalSession.value?.id || '' }
    recordHistory('system_login', { system, systemName: config.short })
    return true
  }
  function demoLogin(system) {
    const config = systems[system]
    return login(system, config.account, config.password)
  }
  function logout(system) {
    delete sessions.value[system]
  }
  function isLoggedIn(system) {
    return Boolean(sessions.value[system])
  }
  function loginWithContact(name, phone) {
    const cleanName = String(name || '').trim()
    const normalizedPhone = normalizePhone(phone)
    if (cleanName.length < 2 || cleanName.length > 30) return { ok: false, reason: 'invalid_name' }
    if (!isValidMainlandPhone(normalizedPhone)) return { ok: false, reason: 'invalid_phone' }
    portalSession.value = {
      id: normalizedPhone,
      name: cleanName,
      phone: normalizedPhone,
      provider: 'contact',
      admin: portalAdminPhones().includes(normalizedPhone),
      verifiedAt: Date.now(),
      expiresAt: Date.now() + PORTAL_SESSION_TTL_MS,
    }
    recordHistory('portal_login')
    return { ok: true }
  }
  function isPortalVerified() {
    if (portalSession.value?.expiresAt && portalSession.value.expiresAt <= Date.now()) {
      portalSession.value = null
      return false
    }
    return portalSession.value?.provider === 'contact' && isValidMainlandPhone(portalSession.value?.phone)
  }
  function credentialsForSystem(system) {
    if (!isPortalVerified()) return { account: '', password: '' }
    const config = systems[system]
    return config ? { account: config.account, password: config.password } : { account: '', password: '' }
  }
  function isPortalAdmin() {
    return isPortalVerified() && portalSession.value?.admin === true
  }
  function logoutPortal() {
    portalSession.value = null
    sessions.value = {}
  }
  function clearPortalHistory() {
    if (!isPortalAdmin()) return false
    portalHistory.value = []
    return true
  }
  return {
    sessions,
    portalSession,
    portalHistory,
    login,
    demoLogin,
    logout,
    isLoggedIn,
    loginWithContact,
    normalizePhone,
    isValidMainlandPhone,
    maskPhone,
    isPortalVerified,
    isPortalAdmin,
    credentialsForSystem,
    logoutPortal,
    clearPortalHistory,
  }
})
