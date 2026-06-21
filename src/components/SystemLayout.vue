<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { systems } from '../config/systems'
import { useAuthStore } from '../stores/auth'
import { useDemoStore } from '../stores/demo'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const demo = useDemoStore()
const system = computed(() => route.meta.system)
const config = computed(() => systems[system.value])
const prefix = computed(() => ({ china: 'china-ops', health: 'health-management' }[system.value] || system.value))
const isPatient = computed(() => system.value === 'patient')

function logout() {
  auth.logout(system.value)
  router.push(`/${prefix.value}/login`)
}
</script>

<template>
  <div class="independent-shell" :class="{ 'patient-system-shell': isPatient }" :style="{ '--system-color': config.color }">
    <aside v-if="!isPatient" class="system-sidebar">
      <div class="system-brand"><span>{{ config.icon }}</span><div><b>{{ config.name }}</b><small>{{ config.en }}</small></div></div>
      <nav>
        <RouterLink v-for="[page, title, titleEn] in config.nav" :key="page" :to="`/${prefix}/${page}`">
          <i>{{ page.slice(0, 1).toUpperCase() }}</i><span>{{ demo.state.language === 'zh' ? title : titleEn }}</span>
        </RouterLink>
      </nav>
      <div class="system-user"><div class="avatar">{{ config.icon }}</div><div><b>{{ config.account.split('@')[0] }}</b><small>演示用户</small></div><button @click="logout">退出</button></div>
    </aside>
    <main class="system-main">
      <header class="system-topbar">
        <div v-if="isPatient" class="patient-top-brand"><span>{{ config.icon }}</span><b>{{ config.name }}</b></div>
        <div v-else><b>{{ route.meta.title || config.short }}</b><small>{{ demo.activePatient?.caseId }} · {{ demo.activePatient?.name }}</small></div>
        <div class="top-actions">
          <button class="ghost-button" @click="demo.toggleLanguage()">{{ demo.state.language === 'zh' ? 'EN' : '中文' }}</button>
          <button v-if="isPatient" class="ghost-button" @click="logout">退出</button>
          <div v-else class="avatar">{{ config.icon }}</div>
        </div>
      </header>
      <div class="system-content" :class="{ 'patient-system-content': isPatient }"><RouterView /></div>
      <nav v-if="isPatient" class="patient-bottom-nav">
        <RouterLink v-for="[page, title, titleEn] in config.nav" :key="page" :to="`/${prefix}/${page}`"><i>{{ page === 'home' ? '⌂' : page === 'records' ? '▤' : page === 'plan' ? '✚' : page === 'travel' ? '✈' : '♥' }}</i><span>{{ demo.state.language === 'zh' ? title : titleEn }}</span></RouterLink>
      </nav>
    </main>
  </div>
</template>
