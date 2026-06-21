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

  function ensureTask(id, task) {
    if (!state.value.tasks.some((item) => item.id === id)) state.value.tasks.unshift({ id, ...task })
  }

  function performAction(action) {
    const patient = activePatient.value
    const messages = {
      uploadDocument: '资料上传入口已打开，演示文件已加入待核验队列',
      confirmPlan: '已确认阅读治疗方案，马来服务端收到患者确认',
      confirmTravel: '赴华行程已确认，中国运营端收到交接回执',
      completeFollowup: '本周随访已确认完成，健康管理端已归档',
      createLead: '已创建一条 Facebook 咨询线索并分配给 Nur',
      lockDocuments: '资料版本已锁定，中国运营端可接收',
      completeMalaysiaTask: '马来团队待办已完成并回传中国运营',
      bookLocalResource: '已预约吉隆坡合作检验中心首次复查',
      acceptChinaCase: '中国运营已接收病例并开始资料标准化',
      publishSummary: '中文结构化病例摘要 v2 已发布',
      assignExpert: '病例已分配张建国主任，专家端新增待办',
      requestHospital: '承接申请已发送广州医科大学附属第一医院',
      completeHandoff: '赴华交接清单已完成，患者端已收到行程',
      claimReview: '专家已接收病例，评审计时开始',
      finishMdt: 'MDT 会议结论已确认并同步中国运营',
      copyReview: '历史评审意见已复制为新草稿',
      confirmSchedule: '床位与诊疗日程已确认并同步患者端',
      advanceTreatment: '治疗进度已推进至术后恢复阶段',
      recordPayment: '已登记预付款 ¥50,000',
      completeDischarge: '双语出院资料已交付，归国管理任务已创建',
      confirmMedication: '今日用药已确认，依从性记录已更新',
      completeRehab: '本次康复评估完成并生成评估记录',
      generateQuality: '本月服务质控报告已生成',
      generic: '操作已完成并写入协同时间线',
    }
    switch (action) {
      case 'submitCase': submitCase(); return 'Case 已提交，中国运营端已产生接收任务'
      case 'finishReview': finishReview(); return '专家评审已完成，医院承接端已收到申请'
      case 'acceptHospital': acceptHospital(); return '医院已确认承接，患者端可查看床位和日程'
      case 'generateFollowup': generateFollowup(); return '五阶段随访计划已生成'
      case 'escalateAlert': escalateAlert(); return '高危预警已升级至专家复评'
      case 'assignExpert':
        ensureTask('T-EXP-201', { caseId: patient.caseId, title: '完成主案例专家评审', from: 'china', to: 'expert', owner: '张建国', due: '24小时内', status: 'pending', priority: 'urgent' })
        break
      case 'requestHospital':
        ensureTask('T-HOS-201', { caseId: patient.caseId, title: '确认国际患者承接申请', from: 'china', to: 'hospital', owner: '国际医疗中心', due: '24小时内', status: 'pending', priority: 'high' })
        break
      case 'completeDischarge':
        patient.phase = 'followup'; patient.phaseLabel = '归国随访'
        ensureTask('T-HLT-201', { caseId: patient.caseId, title: '建立归国五阶段服务计划', from: 'hospital', to: 'health', owner: '健康管家', due: '出院前3天', status: 'pending', priority: 'high' })
        break
      case 'recordPayment':
        state.value.treatment.paid += 50000
        break
      case 'advanceTreatment':
        state.value.treatment.status = 'post_operation'
        state.value.treatment.schedule[2].status = 'done'
        break
      case 'acceptChinaCase':
        patient.phase = 'review'; patient.phaseLabel = '中国运营整理'
        break
      case 'completeHandoff':
        patient.phase = 'planning'; patient.phaseLabel = '赴华准备'
        break
      case 'lockDocuments':
        patient.completeness = 100
        break
      case 'confirmMedication':
        state.value.alerts.find((item) => item.id === 'A-12').status = 'closed'
        break
    }
    addEvent(systemForAction(action), '演示用户', pageActionTitle(action), messages[action] || messages.generic)
    return messages[action] || messages.generic
  }

  function systemForAction(action) {
    if (['uploadDocument','confirmPlan','confirmTravel','completeFollowup'].includes(action)) return 'patient'
    if (['createLead','lockDocuments','completeMalaysiaTask','bookLocalResource'].includes(action)) return 'malaysia'
    if (['acceptChinaCase','publishSummary','assignExpert','requestHospital','completeHandoff'].includes(action)) return 'china'
    if (['claimReview','finishMdt','copyReview'].includes(action)) return 'expert'
    if (['confirmSchedule','advanceTreatment','recordPayment','completeDischarge'].includes(action)) return 'hospital'
    return 'health'
  }
  function pageActionTitle(action) {
    return {
      uploadDocument:'患者补充资料', confirmPlan:'患者确认方案', confirmTravel:'患者确认行程',
      completeFollowup:'完成患者随访', createLead:'创建咨询线索', lockDocuments:'锁定资料版本',
      completeMalaysiaTask:'完成跨国待办', bookLocalResource:'预约本地资源', acceptChinaCase:'接收跨境病例',
      publishSummary:'发布病例摘要', assignExpert:'分配评审专家', requestHospital:'发送医院承接申请',
      completeHandoff:'完成赴华交接', claimReview:'专家接收病例', finishMdt:'完成MDT会诊',
      copyReview:'复制评审意见', confirmSchedule:'确认诊疗日程', advanceTreatment:'更新治疗进度',
      recordPayment:'登记患者付款', completeDischarge:'完成出院交接', confirmMedication:'确认患者用药',
      completeRehab:'完成康复评估', generateQuality:'生成质控报告',
    }[action] || '完成业务操作'
  }

  return {
    state, activePatient, activeTasks, activeDocuments, progress,
    toggleLanguage, setActiveCase, completeTask, submitCase, finishReview,
    acceptHospital, generateFollowup, escalateAlert, performAction, reset,
  }
})
