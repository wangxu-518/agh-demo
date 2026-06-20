<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from './components/AppShell.vue'

const route = useRoute()
const isPatient = computed(() => route.meta.patient)
</script>

<template>
  <AppShell :patient-mode="isPatient">
    <RouterView />
  </AppShell>
</template>
