<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import { useDemoStore } from '../stores/demo'

const store = useDemoStore()
const router = useRouter()
const filter = ref('全部患者')

const patientCards = computed(() => store.state.patients.map((patient) => {
  const currentCase = store.state.cases[patient.caseId]
  const confirmation = currentCase.aiStructuring?.patientConfirmation?.status || 'not_sent'
  return {
    ...patient,
    missing: currentCase.aiStructuring?.missingItems || [],
    confirmation,
    documentCount: store.state.documents.filter((document) => document.caseId === patient.caseId && !document.voidedAt).length,
  }
}))

const filteredPatients = computed(() => patientCards.value.filter((patient) => {
  if (filter.value === '待补资料') return patient.missing.length > 0
  if (filter.value === '待患者确认') return patient.confirmation === 'pending'
  if (filter.value === '术后管理') return patient.phase === 'followup'
  return true
}))

function openPatient(patient) {
  store.setActiveCase(patient.caseId)
  router.push('/malaysia/cases')
}

function confirmationLabel(status) {
  return {
    not_sent: '报告未发送',
    pending: '待患者确认',
    confirmed: '患者已确认',
  }[status] || 'AI 整理中'
}
</script>

<template>
  <div class="patient-centric-dashboard">
    <PageHeader eyebrow="Patient command center" title="今天，先看患者" subtitle="以患者为中心管理资料、病案确认、面诊和跨境治疗进度">
      <button class="secondary-button">新建患者</button>
      <button class="primary-button" @click="router.push('/malaysia/tasks')">进入 AI 报告中心</button>
    </PageHeader>

    <section class="command-strip">
      <div><span>在管患者</span><strong>{{ store.state.patients.length }}</strong><small>2 位需要今天跟进</small></div>
      <div><span>待补资料</span><strong>{{ patientCards.filter(item => item.missing.length).length }}</strong><small>最近到期：肿瘤标志物</small></div>
      <div><span>待患者确认</span><strong>{{ patientCards.filter(item => item.confirmation === 'pending').length }}</strong><small>确认后才能进入面诊</small></div>
      <div><span>术后健康管理</span><strong>{{ patientCards.filter(item => item.phase === 'followup').length }}</strong><small>1 位有高风险预警</small></div>
    </section>

    <div class="patient-board-heading">
      <div><h2>患者全景卡片</h2><p>点击患者，打开身体档案、资料缺口和下一步行动</p></div>
      <div class="segmented-filter">
        <button v-for="item in ['全部患者','待补资料','待患者确认','术后管理']" :key="item" :class="{ active: filter === item }" @click="filter=item">{{ item }}</button>
      </div>
    </div>

    <section class="visual-patient-grid">
      <button v-for="patient in filteredPatients" :key="patient.id" class="visual-patient-card" @click="openPatient(patient)">
        <div class="patient-card-portrait">
          <img v-if="patient.portrait" :src="patient.portrait" :alt="`${patient.name}演示肖像`" />
          <span v-else>{{ patient.avatar }}</span>
          <i :class="patient.risk"></i>
          <em>{{ patient.phaseLabel }}</em>
        </div>
        <div class="patient-card-content">
          <header><div><h3>{{ patient.name }}</h3><p>{{ patient.englishName }} · {{ patient.age }}岁</p></div><b>{{ patient.completeness }}%</b></header>
          <div class="patient-diagnosis"><span>主要诊断</span><strong>{{ patient.diagnosis }}</strong></div>
          <div class="patient-card-progress"><span :style="{ width: `${patient.completeness}%` }"></span></div>
          <div class="patient-card-meta"><span>{{ patient.documentCount }} 份资料</span><span>{{ patient.owner }} 负责</span><span>{{ patient.city }}</span></div>
          <div v-if="patient.missing.length" class="patient-missing"><b>缺少</b><span v-for="item in patient.missing" :key="item">{{ item }}</span></div>
          <div v-else class="patient-ready">资料已齐备</div>
          <footer><span :class="['confirmation-chip', patient.confirmation]">{{ confirmationLabel(patient.confirmation) }}</span><b>打开患者档案 →</b></footer>
        </div>
      </button>
    </section>

    <section class="today-journey">
      <header><div><span>今日运营主线</span><h2>从零散资料到患者确认</h2></div><b>林秀英 · 主演示病例</b></header>
      <div>
        <article class="done"><span>1</span><div><b>资料已采集</b><small>5 份来源已归档</small></div></article>
        <article class="active"><span>2</span><div><b>AI 报告待确认</b><small>运营校对 → 患者确认</small></div></article>
        <article><span>3</span><div><b>初筛与面诊</b><small>确认后自动解锁</small></div></article>
        <article><span>4</span><div><b>治疗行程</b><small>专家与医院协同</small></div></article>
      </div>
    </section>
  </div>
</template>
