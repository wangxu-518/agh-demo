<script setup>
import { useDemoStore } from '../stores/demo'
const store = useDemoStore()
</script>
<template>
  <section class="patient-banner">
    <div class="patient-avatar">{{ store.activePatient.avatar }}</div>
    <div class="patient-main">
      <div class="patient-title">
        <h2>{{ store.activePatient.name }} <small>{{ store.activePatient.englishName }}</small></h2>
        <span class="status-pill blue">{{ store.activePatient.phaseLabel }}</span>
        <span class="status-pill" :class="store.activePatient.risk">{{ store.activePatient.risk === 'high' ? '高优先级' : '常规' }}</span>
      </div>
      <p>{{ store.activePatient.caseId }} · {{ store.activePatient.age }}岁 · {{ store.activePatient.city }} · {{ store.activePatient.diagnosis }}</p>
    </div>
    <div class="banner-meta">
      <span>资料完整度</span><b>{{ store.activePatient.completeness }}%</b>
      <div class="progress"><i :style="{ width: `${store.activePatient.completeness}%` }"></i></div>
    </div>
  </section>
</template>
