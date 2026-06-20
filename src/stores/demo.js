import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { seedState } from '../data/seed'

const KEY = 'agh-demo-v2'
const clone = (value) => JSON.parse(JSON.stringify(value))

export const useDemoStore = defineStore('demo', () => {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
  const state = ref(saved ? JSON.parse(saved) : clone(seedState))
  const activePatient = computed(() => state.value.patients.find((p) => p.caseId === state.value.activeCaseId))
  const activeTasks = computed(() => state.value.tasks.filter((t) => t.caseId === state.value.activeCaseId))
  const activeDocuments = computed(() => state.value.documents.filter((d) => d.caseId === state.value.activeCaseId))
  const progress = computed(() => {
    const phases = ['lead', 'review', 'planning', 'treatment', 'followup']
    const index = phases.indexOf(activePatient.value?.phase)
    return Math.max(18, Math.round(((index + 1) / phases.length) * 100))
  })

  watch(state, (value) => localStorage.setItem(KEY, JSON.stringify(value)), { deep: true })

  function addEvent(system, actor, title, detail) {
    state.value.events.unshift({ id: Date.now(), at: '刚刚', system, actor, title, detail })
  }
  function toggleLanguage() {
    state.value.language = state.value.language === 'zh' ? 'en' : 'zh'
  }
  function setActiveCase(caseId) {
    state.value.activeCaseId = caseId
  }
  function completeTask(id) {
    const task = state.value.tasks.find((item) => item.id === id)
    if (!task || task.status === 'done') return
    task.status = 'done'
    addEvent(task.to, task.owner, `完成任务：${task.title}`, `任务 ${id} 已闭环`)
  }
  function submitCase() {
    const patient = activePatient.value
    patient.phase = 'review'
    patient.phaseLabel = '专家评审'
    patient.completeness = 100
    if (!state.value.tasks.some((t) => t.id === 'T-103')) {
      state.value.tasks.push({ id: 'T-103', caseId: patient.caseId, title: '提交专家评审意见', from: 'china', to: 'expert', owner: '张主任', due: '明天 18:00', status: 'pending', priority: 'urgent' })
    }
    addEvent('malaysia', 'Aisyah', '提交中国运营审核', '资料完整度达到100%，进入专家评审')
  }
  function finishReview() {
    state.value.review.status = 'completed'
    state.value.review.recommendation = '建议先完成EBUS纵隔淋巴结取样及分子检测，随后由胸外科、肿瘤内科和放疗科联合制定治疗方案。'
    state.value.review.hospital = '广州医科大学附属第一医院'
    state.value.review.version += 1
    activePatient.value.phase = 'planning'
    activePatient.value.phaseLabel = '医院承接'
    const task = state.value.tasks.find((t) => t.id === 'T-103')
    if (task) task.status = 'done'
    addEvent('expert', '张建国 主任', '完成专家评审', '治疗建议已同步中国运营、患者和医院承接端')
  }
  function acceptHospital() {
    state.value.treatment.status = 'accepted'
    state.value.treatment.bed = '胸外科 8F-12（预留）'
    activePatient.value.phase = 'treatment'
    activePatient.value.phaseLabel = '在华治疗'
    const task = state.value.tasks.find((t) => t.id === 'T-104')
    if (task) task.status = 'done'
    addEvent('hospital', '刘协调员', '医院确认承接', '已预留床位并发布入院检查日程')
  }
  function generateFollowup() {
    state.value.followup.generated = true
    state.value.followup.stages[0].status = 'active'
    activePatient.value.phase = 'followup'
    activePatient.value.phaseLabel = '归国随访'
    addEvent('health', '健康管理中心', '生成五阶段随访计划', '已同步患者、马来团队和中方医生')
  }
  function escalateAlert(id = 'A-07') {
    const alert = state.value.alerts.find((item) => item.id === id)
    if (!alert || alert.status === 'escalated') return
    alert.status = 'escalated'
    state.value.tasks.unshift({ id: `T-${Date.now()}`, caseId: alert.caseId, title: '高危复查异常专家复评', from: 'health', to: 'expert', owner: '肿瘤质控组', due: '12小时内', status: 'pending', priority: 'urgent' })
    addEvent('health', '健康管家 Farah', '升级高危预警', `${alert.patient} 的复查异常已进入专家复评`)
  }
  function reset() {
    state.value = clone(seedState)
    localStorage.removeItem(KEY)
  }

  return {
    state, activePatient, activeTasks, activeDocuments, progress,
    toggleLanguage, setActiveCase, completeTask, submitCase, finishReview,
    acceptHospital, generateFollowup, escalateAlert, reset,
  }
})
