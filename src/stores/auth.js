import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { systems } from '../config/systems'

const KEY = 'agh-demo-auth-v1'

export const useAuthStore = defineStore('auth', () => {
  const sessions = ref(JSON.parse(localStorage.getItem(KEY) || '{}'))
  watch(sessions, (value) => localStorage.setItem(KEY, JSON.stringify(value)), { deep: true })

  function login(system, account, password) {
    const config = systems[system]
    if (!config || account !== config.account || password !== config.password) return false
    sessions.value[system] = { account, loginAt: Date.now() }
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
  return { sessions, login, demoLogin, logout, isLoggedIn }
})
