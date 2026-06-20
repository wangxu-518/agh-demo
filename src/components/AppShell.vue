<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { routes } from '../router'
import { useDemoStore } from '../stores/demo'
import { useI18n } from '../i18n'

defineProps({ patientMode: Boolean })
const route = useRoute()
const router = useRouter()
const store = useDemoStore()
const { t } = useI18n()
const nav = computed(() => routes.filter((item) => !item.redirect && !item.meta.hidden))
const navKey = (path) => ({
  '/demo': 'demo', '/patient': 'patient', '/malaysia': 'malaysia', '/china-ops': 'china',
  '/expert': 'expert', '/hospital': 'hospital', '/health-management': 'health',
}[path])
</script>

<template>
  <div class="app-shell" :class="{ 'patient-shell': patientMode }">
    <aside v-if="!patientMode" class="sidebar">
      <RouterLink class="brand" to="/demo">
        <span class="brand-mark">A</span>
        <span><b>AGH Care</b><small>Cross-border Oncology</small></span>
      </RouterLink>
      <nav class="side-nav">
        <RouterLink v-for="item in nav" :key="item.path" :to="item.path" class="nav-link">
          <span class="nav-icon">{{ item.meta.icon }}</span>
          <span>{{ t(navKey(item.path)) }}</span>
        </RouterLink>
      </nav>
      <div class="sidebar-foot">
        <div class="demo-tag"><span class="live-dot"></span> DEMO ENVIRONMENT</div>
        <RouterLink to="/legacy" class="legacy-link">旧版原型参考 ↗</RouterLink>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <button v-if="patientMode" class="icon-button" @click="router.push('/demo')">‹</button>
        <div class="topbar-title">
          <b>{{ route.meta.title }}</b>
          <span v-if="!patientMode">AGH 跨境肿瘤医疗协同运营平台</span>
        </div>
        <div class="top-actions">
          <div v-if="!patientMode" class="case-chip">
            <span class="live-dot"></span>{{ store.activePatient?.caseId }}
          </div>
          <button class="ghost-button" @click="store.toggleLanguage()">{{ t('language') }}</button>
          <button v-if="route.path === '/demo'" class="ghost-button danger" @click="store.reset()">{{ t('reset') }}</button>
          <div class="avatar">WX</div>
        </div>
      </header>
      <div class="content-wrap" :class="{ 'patient-content': patientMode }">
        <slot />
      </div>
    </main>
  </div>
</template>
