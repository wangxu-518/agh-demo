<script setup>
import { computed } from 'vue'
import { useDemoStore } from '../stores/demo'
const props = defineProps({ patient: Object })
const store = useDemoStore()
const current = computed(() => props.patient || store.activePatient)
</script>
<template>
  <section class="patient-banner">
    <div class="patient-avatar">{{ current.avatar }}</div>
    <div class="patient-main">
      <div class="patient-title">
        <h2>{{ current.name }} <small>{{ current.englishName }}</small></h2>
        <span class="status-pill blue">{{ current.phaseLabel }}</span>
        <span class="status-pill" :class="current.risk">{{ current.risk === 'high' ? '高优先级' : '常规' }}</span>
      </div>
      <p>{{ current.caseId }} · {{ current.age }}岁 · {{ current.city }} · {{ current.diagnosis }}</p>
    </div>
    <div class="banner-meta">
      <span>资料完整度</span><b>{{ current.completeness }}%</b>
      <div class="progress"><i :style="{ width: `${current.completeness}%` }"></i></div>
    </div>
  </section>
</template>
