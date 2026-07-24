import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { seedState } from '../data/seed'
import { createBreastCancerMonthlyPlan, createGeneralCancerMonthlyPlan } from '../data/breastCancerCarePlan'
import { canPerformAction } from '../config/permissions'

const KEY = 'agh-demo-v13'
const clone = (value) => JSON.parse(JSON.stringify(value))
const nowIso = () => new Date().toISOString()
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`

const phaseLabels = {
  lead: '新咨询',
  intake: '资料整理与初筛',
  review: '专家评审',
  planning: '医院承接',
  travel: '赴华准备',
  treatment: '在华治疗',
  discharge: '出院交接',
  followup: '归国随访',
  closed: '服务完成',
}

export const actionDefinitions = {
  submitCase: { system: 'malaysia', title: '完成资料初筛' },
  acceptChinaCase: { system: 'china', title: '接收跨境病例' },
  publishSummary: { system: 'malaysia', title: '确认 AI 病案摘要' },
  assignExpert: { system: 'malaysia', title: '指派 AGH 牵头专家' },
  requestHospital: { system: 'malaysia', title: '发送医院承接申请' },
  completeHandoff: { system: 'malaysia', title: '完成赴华交接' },
  claimReview: { system: 'expert', title: '专家接收病例' },
  finishReview: { system: 'expert', title: '提交专家评审意见' },
  selectReceivingTeam: { system: 'expert', title: '确认医院与接诊医生' },
  requestMoreDocuments: { system: 'expert', title: '要求补充资料' },
  rejectReview: { system: 'expert', title: '拒绝评审任务' },
  finishMdt: { system: 'expert', title: '完成 MDT 会诊' },
  acceptHospital: { system: 'hospital', title: '医院确认承接' },
  rejectHospital: { system: 'hospital', title: '医院拒绝承接' },
  confirmSchedule: { system: 'hospital', title: '确认诊疗日程' },
  advanceTreatment: { system: 'hospital', title: '更新治疗进度' },
  recordPayment: { system: 'hospital', title: '登记患者付款' },
  recordRefund: { system: 'hospital', title: '登记退款' },
  completeDischarge: { system: 'hospital', title: '完成出院交接' },
  generateFollowup: { system: 'health', title: '生成五阶段计划' },
  createFollowupTask: { system: 'health', title: '创建随访任务' },
  confirmMedication: { system: 'health', title: '确认患者用药' },
  completeRehab: { system: 'health', title: '完成康复评估' },
  escalateAlert: { system: 'health', title: '升级高危预警' },
  closeAlert: { system: 'health', title: '关闭预警' },
  uploadDocument: { system: 'patient', title: '上传医疗资料' },
  revokeConsent: { system: 'patient', title: '撤回数据授权' },
  confirmPlan: { system: 'patient', title: '患者确认治疗方案' },
  confirmTravel: { system: 'patient', title: '患者确认赴华行程' },
  completeFollowup: { system: 'patient', title: '患者完成随访' },
  createLead: { system: 'malaysia', title: '创建咨询线索' },
  createPatient: { system: 'malaysia', title: '创建患者档案' },
  lockDocuments: { system: 'malaysia', title: '锁定资料版本' },
  completeMalaysiaTask: { system: 'malaysia', title: '完成跨国待办' },
  bookLocalResource: { system: 'malaysia', title: '预约本地资源' },
  copyReview: { system: 'expert', title: '复制历史评审' },
  generateQuality: { system: 'health', title: '生成质控报告' },
}

export const useDemoStore = defineStore('demo', () => {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
  const parsed = saved ? JSON.parse(saved) : null
  const state = ref(parsed?.schemaVersion === seedState.schemaVersion ? parsed : clone(seedState))

  const activePatient = computed(() => state.value.patients.find((p) => p.caseId === state.value.activeCaseId))
  const activeCase = computed(() => state.value.cases[state.value.activeCaseId])
  const activeReview = computed(() => activeCase.value?.review)
  const activeTreatment = computed(() => activeCase.value?.treatment)
  const activeBilling = computed(() => activeCase.value?.billing)
  const activeTravel = computed(() => activeCase.value?.travel)
  const activeFollowup = computed(() => activeCase.value?.followup)
  const activeConsent = computed(() => activeCase.value?.consent)
  const activeHospitalMatching = computed(() => activeCase.value?.hospitalMatching)
  const activeDomesticReference = computed(() => activeCase.value?.domesticRecordReference)
  const activeAiStructuring = computed(() => activeCase.value?.aiStructuring)
  const activeConsultation = computed(() => activeCase.value?.consultation)
  const activeHealthPlan = computed(() => activeCase.value?.healthPlan)
  const activeHomeVisits = computed(() => activeCase.value?.homeVisits || [])
  const activeCommunications = computed(() => activeCase.value?.communications || { deliveries: [] })
  const activeChinaRecords = computed(() => {
    const chinaCaseId = activeDomesticReference.value?.chinaCaseId
    return state.value.chinaDomain.medicalRecords.filter((record) => record.chinaCaseId === chinaCaseId)
  })
  const activeTasks = computed(() => state.value.tasks.filter((t) => t.caseId === state.value.activeCaseId))
  const activeDocuments = computed(() => state.value.documents.filter((d) => d.caseId === state.value.activeCaseId && !d.voidedAt))
  const activeEvents = computed(() => state.value.events.filter((e) => e.caseId === state.value.activeCaseId))
  const progress = computed(() => {
    const phases = ['lead', 'intake', 'review', 'planning', 'travel', 'treatment', 'discharge', 'followup', 'closed']
    const index = phases.indexOf(activePatient.value?.phase)
    return Math.max(10, Math.round(((index + 1) / phases.length) * 100))
  })

  watch(state, (value) => localStorage.setItem(KEY, JSON.stringify(value)), { deep: true })

  function caseById(caseId = state.value.activeCaseId) {
    return state.value.cases[caseId]
  }

  function patientByCase(caseId = state.value.activeCaseId) {
    return state.value.patients.find((patient) => patient.caseId === caseId)
  }

  function setPhase(patient, phase) {
    patient.phase = phase
    patient.phaseLabel = phaseLabels[phase] || phase
    patient.updatedAt = nowIso()
  }

  function addEvent(system, actor, title, detail, caseId = state.value.activeCaseId) {
    state.value.events.unshift({ id: uid('EVT'), caseId, at: nowIso(), system, actor, title, detail })
  }

  function notify(to, title, caseId = state.value.activeCaseId) {
    state.value.notifications.unshift({ id: uid('N'), caseId, to, title, read: false, createdAt: nowIso() })
  }

  function patientDeliveryChannels(caseId = state.value.activeCaseId) {
    const channels = patientByCase(caseId)?.contactChannels
      ?.filter((channel) => channel.preferred && ['已验证', '可接收'].includes(channel.status))
      .map((channel) => channel.label)
    return channels?.length ? channels : ['患者端']
  }

  function recordPatientDelivery(type, title, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    const patient = patientByCase(caseId)
    const channels = patientDeliveryChannels(caseId)
    currentCase.communications ||= { deliveries: [] }
    currentCase.communications.deliveries.unshift({
      id: uid('DEL'),
      type,
      title,
      channels,
      status: '已发送',
      sentAt: nowIso(),
      recipient: patient?.name || '患者',
    })
    return channels
  }

  function ensureTask(id, task) {
    const existing = state.value.tasks.find((item) => item.id === id)
    if (existing) return existing
    const created = { comments: [], attachments: [], slaPausedAt: null, ...task, id }
    state.value.tasks.unshift(created)
    return created
  }

  function result(ok, message, code = ok ? 'OK' : 'INVALID_TRANSITION') {
    return { ok, message, code }
  }

  function toggleLanguage() {
    state.value.language = state.value.language === 'zh' ? 'en' : 'zh'
  }

  function setActiveCase(caseId) {
    if (!state.value.cases[caseId]) return false
    state.value.activeCaseId = caseId
    return true
  }

  function completeTask(id, payload = {}) {
    const task = state.value.tasks.find((item) => item.id === id)
    if (!task || task.status === 'done') return result(false, '任务不存在或已完成')
    task.status = 'done'
    task.completedAt = nowIso()
    if (payload.comment) task.comments.push({ id: uid('C'), author: payload.actor || task.owner, text: payload.comment, createdAt: nowIso() })
    addEvent(task.to, payload.actor || task.owner, `完成任务：${task.title}`, `任务 ${id} 已闭环`, task.caseId)
    return result(true, `任务“${task.title}”已完成`)
  }

  function startTask(id, payload = {}) {
    const task = state.value.tasks.find((item) => item.id === id)
    if (!task || task.status === 'done') return result(false, '任务不存在或已完成')
    task.status = 'processing'
    task.startedAt ||= nowIso()
    if (payload.owner) task.owner = payload.owner
    if (payload.comment) task.comments.push({ id: uid('C'), author: payload.owner || task.owner, text: payload.comment, createdAt: nowIso() })
    addEvent(task.to, payload.owner || task.owner, `开始处理：${task.title}`, payload.comment || '任务进入处理中', task.caseId)
    return result(true, `任务“${task.title}”已进入处理中`)
  }

  function addTaskComment(id, text, actor) {
    const task = state.value.tasks.find((item) => item.id === id)
    if (!task || !text?.trim()) return result(false, '请输入协作内容')
    task.comments.push({ id: uid('C'), author: actor || task.owner, text: text.trim(), createdAt: nowIso() })
    addEvent(task.to, actor || task.owner, `更新任务：${task.title}`, text.trim(), task.caseId)
    return result(true, '协作记录已保存')
  }

  function reassignTask(id, owner, actor) {
    const task = state.value.tasks.find((item) => item.id === id)
    if (!task || !owner) return result(false, '请选择新的负责人')
    const previous = task.owner
    task.owner = owner
    addEvent(task.to, actor || '系统用户', `转派任务：${task.title}`, `${previous} → ${owner}`, task.caseId)
    return result(true, `任务已转派给 ${owner}`)
  }

  function pauseTaskSla(id, reason, actor) {
    const task = state.value.tasks.find((item) => item.id === id)
    if (!task || !reason?.trim()) return result(false, '请输入暂停原因')
    task.status = 'blocked'
    task.slaPausedAt = nowIso()
    task.comments.push({ id: uid('C'), author: actor || task.owner, text: `SLA暂停：${reason.trim()}`, createdAt: nowIso() })
    return result(true, '任务 SLA 已暂停')
  }

  function submitCase(payload = {}, caseId = state.value.activeCaseId) {
    const patient = patientByCase(caseId)
    const currentCase = caseById(caseId)
    if (!patient || !currentCase) return result(false, '病例不存在')
    if (patient.completeness < 100) return result(false, `资料完整度仅 ${patient.completeness}%，不能提交`)
    if (currentCase.consent.status !== 'active') return result(false, '跨境数据授权未生效，不能提交')
    if (!['lead', 'intake'].includes(patient.phase)) return result(false, '当前阶段不能重复提交')
    setPhase(patient, 'intake')
    setPhase(patient, 'review')
    ensureTask(`T-MY-${caseId}`, { caseId, title: '完成初筛并安排专家', from: 'malaysia', to: 'malaysia', owner: payload.owner || 'Aisyah', dueAt: payload.dueAt || nowIso(), status: 'pending', priority: payload.priority || 'high' })
    addEvent('malaysia', payload.actor || 'Aisyah', '完成资料初筛', payload.note || '资料与授权符合专家安排条件', caseId)
    return result(true, '资料初筛完成，可由马来运营安排专家与面诊')
  }

  function acceptChinaCase(payload = {}, caseId = state.value.activeCaseId) {
    const patient = patientByCase(caseId)
    const currentCase = caseById(caseId)
    if (patient.phase !== 'intake') return result(false, '仅待接收病例可以进入运营整理')
    if (currentCase.consent.status !== 'active') return result(false, '患者授权已失效')
    setPhase(patient, 'review')
    completeTask(`T-CN-${caseId}`, { actor: payload.actor || '李雯', comment: payload.note })
    addEvent('china', payload.actor || '李雯', '接收跨境病例', payload.note || '开始资料标准化与医学核验', caseId)
    return result(true, '中国运营已接收病例并开始资料标准化')
  }

  function assignExpert(payload = {}, caseId = state.value.activeCaseId) {
    const patient = patientByCase(caseId)
    const currentCase = caseById(caseId)
    if (!['review', 'intake'].includes(patient.phase)) return result(false, '当前阶段不能指派牵头专家')
    if (!payload.expert) return result(false, '请选择 AGH 牵头专家')
    const aghExpert = state.value.aghExperts.find((expert) => expert.name === payload.expert || expert.id === payload.expert)
    if (!aghExpert) return result(false, '牵头专家必须从 AGH 内部专家中选择', 'AGH_EXPERT_REQUIRED')
    currentCase.review.status = 'assigned'
    currentCase.review.expert = aghExpert.name
    currentCase.review.specialty = payload.specialty || aghExpert.specialty
    currentCase.review.meetingAt = payload.meetingAt || ''
    ensureTask(`T-EXP-${caseId}`, { caseId, title: `完成 ${patient.name} 专家评审`, from: 'malaysia', to: 'expert', owner: aghExpert.name, dueAt: payload.dueAt || nowIso(), status: 'pending', priority: payload.priority || 'high' })
    addEvent('malaysia', payload.actor || 'Aisyah', '指派 AGH 牵头专家', `${aghExpert.name} · ${currentCase.review.specialty}`, caseId)
    notify('expert', `${patient.name} 的病例待评审`, caseId)
    return result(true, `病例已指派给 ${aghExpert.name}`)
  }

  function claimReview(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    if (!['assigned', 'changes_requested'].includes(currentCase.review.status)) return result(false, '当前评审任务不可接收')
    currentCase.review.status = 'in_review'
    addEvent('expert', payload.actor || currentCase.review.expert, '接收专家评审任务', payload.note || '评审计时开始', caseId)
    return result(true, '专家已接收病例，评审计时开始')
  }

  function finishReview(payload = {}, caseId = state.value.activeCaseId) {
    const patient = patientByCase(caseId)
    const currentCase = caseById(caseId)
    if (!['assigned', 'in_review', 'changes_requested'].includes(currentCase.review.status)) return result(false, '当前状态不能提交评审')
    if (!payload.recommendation?.trim()) return result(false, '请填写完整评审意见')
    currentCase.review.revisions.push({ version: currentCase.review.version || 1, recommendation: currentCase.review.recommendation, savedAt: nowIso() })
    currentCase.review.status = 'completed'
    currentCase.review.recommendation = payload.recommendation.trim()
    currentCase.review.version = (currentCase.review.version || 0) + 1
    currentCase.review.signedAt = nowIso()
    setPhase(patient, 'planning')
    completeTask(`T-EXP-${caseId}`, { actor: payload.actor || currentCase.review.expert })
    const legacyTask = state.value.tasks.find((task) => task.id === 'T-103' && task.caseId === caseId)
    if (legacyTask) legacyTask.status = 'done'
    addEvent('expert', payload.actor || currentCase.review.expert, '完成专家评审', currentCase.review.recommendation, caseId)
    notify('malaysia', `${patient.name} 的专家意见已签署`, caseId)
    currentCase.hospitalMatching.status = 'awaiting_expert_decision'
    return result(true, '专家评审已签署，请继续确认医院与接诊医生')
  }

  function requestMoreDocuments(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    if (!payload.items?.trim()) return result(false, '请填写需补充的资料')
    currentCase.review.status = 'changes_requested'
    ensureTask(`T-DOC-${Date.now()}`, { caseId, title: `补充资料：${payload.items.trim()}`, from: 'expert', to: 'malaysia', owner: payload.owner || 'Aisyah', dueAt: payload.dueAt || nowIso(), status: 'pending', priority: 'high' })
    addEvent('expert', payload.actor || currentCase.review.expert, '专家要求补充资料', payload.items.trim(), caseId)
    return result(true, '补充资料任务已发送马来服务端')
  }

  function rejectReview(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    if (!payload.reason?.trim()) return result(false, '请填写拒接原因')
    currentCase.review.status = 'rejected'
    addEvent('expert', payload.actor || currentCase.review.expert, '拒绝评审任务', payload.reason.trim(), caseId)
    notify('malaysia', '专家拒绝评审，请重新分配', caseId)
    return result(true, '评审任务已退回马来运营')
  }

  function selectReceivingTeam(payload = {}, caseId = state.value.activeCaseId) {
    const patient = patientByCase(caseId)
    const currentCase = caseById(caseId)
    const reviewCompleted = currentCase.review.status === 'completed'
    const mdtCompleted = Boolean(currentCase.review.mdtCompletedAt)
    if (!reviewCompleted && !mdtCompleted) {
      return result(false, '请先完成专家评审或 MDT 会审，再决定接诊团队', 'REVIEW_DECISION_REQUIRED')
    }
    if (!payload.hospitalId) return result(false, '请选择医院及接诊医生')
    if (!payload.rationale?.trim()) return result(false, '请填写选择该接诊团队的专业依据')
    const candidate = currentCase.hospitalMatching?.candidates.find((item) => item.id === payload.hospitalId)
    if (!candidate) return result(false, '所选接诊团队不属于当前病例候选范围')
    if (candidate.status === 'rejected') return result(false, '该接诊团队已拒绝承接，请选择其他团队')
    currentCase.review.receivingTeamDecision = {
      status: 'confirmed',
      hospitalId: candidate.id,
      hospital: candidate.name,
      department: candidate.department,
      doctor: candidate.doctor,
      rationale: payload.rationale.trim(),
      source: payload.source || (mdtCompleted ? 'MDT会审' : '专家评审'),
      decidedAt: nowIso(),
      decidedBy: payload.actor || currentCase.review.expert || 'AGH专家组',
    }
    currentCase.hospitalMatching.status = 'decision_confirmed'
    currentCase.hospitalMatching.selectedHospitalId = candidate.id
    currentCase.hospitalMatching.candidates.forEach((item) => {
      if (item.status !== 'rejected') item.status = item.id === candidate.id ? 'expert_selected' : 'candidate'
    })
    addEvent('expert', payload.actor || currentCase.review.expert, '确认接诊团队', `${candidate.name} · ${candidate.department} · ${candidate.doctor} · ${payload.rationale.trim()}`, caseId)
    notify('malaysia', `${patient.name} 的接诊团队已由专家确认`, caseId)
    return result(true, `已确认 ${candidate.name} · ${candidate.doctor}`)
  }

  function requestHospital(payload = {}, caseId = state.value.activeCaseId) {
    const patient = patientByCase(caseId)
    const currentCase = caseById(caseId)
    if (currentCase.review.status !== 'completed') return result(false, '专家评审尚未完成，不能申请医院')
    const decision = currentCase.review.receivingTeamDecision
    if (decision?.status !== 'confirmed') {
      return result(false, '接诊医院和医生尚未由专家评审或 MDT 会审确认', 'EXPERT_TEAM_DECISION_REQUIRED')
    }
    if (payload.hospitalId && payload.hospitalId !== decision.hospitalId) {
      return result(false, '马来运营只能向专家已确认的接诊团队发送申请', 'EXPERT_TEAM_DECISION_MISMATCH')
    }
    const candidate = currentCase.hospitalMatching?.candidates.find((item) => item.id === decision.hospitalId)
    if (!candidate) return result(false, '专家确认的接诊团队不存在')
    if (candidate.status === 'unavailable') return result(false, '该医院当前不可承接')
    if (currentCase.hospitalMatching.selectedHospitalId && currentCase.treatment.status === 'requested') {
      return result(false, '当前病例已有承接申请，请先等待医院响应或撤回申请')
    }
    currentCase.treatment.status = 'requested'
    currentCase.treatment.hospitalId = candidate.id
    currentCase.treatment.hospital = candidate.name
    currentCase.treatment.department = candidate.department
    currentCase.treatment.doctor = candidate.doctor
    currentCase.treatment.admissionDate = payload.admissionDate || ''
    currentCase.treatment.estimatedCost = `¥${Math.round(candidate.costMin / 10000)}–${Math.round(candidate.costMax / 10000)}万`
    currentCase.hospitalMatching.status = 'requested'
    currentCase.hospitalMatching.selectedHospitalId = candidate.id
    currentCase.hospitalMatching.requestedAt = nowIso()
    currentCase.hospitalMatching.candidates.forEach((item) => {
      item.status = item.id === candidate.id ? 'requested' : 'candidate'
    })
    ensureTask(`T-HOS-${caseId}`, { caseId, title: `确认 ${patient.name} 国际患者承接申请`, from: 'malaysia', to: 'hospital', owner: payload.owner || '国际医疗中心', dueAt: payload.dueAt || nowIso(), status: 'pending', priority: payload.priority || 'high' })
    addEvent('malaysia', payload.actor || 'Aisyah', '发送专家确认的医院承接申请', `${candidate.name} · ${candidate.department} · ${candidate.doctor}`, caseId)
    notify('hospital', `${patient.name} 的承接申请待处理`, caseId)
    return result(true, `${patient.name} 的承接申请已发送 ${candidate.name}`)
  }

  function acceptHospital(payload = {}, caseId = state.value.activeCaseId) {
    const patient = patientByCase(caseId)
    const currentCase = caseById(caseId)
    if (!['requested', 'planning'].includes(currentCase.treatment.status)) return result(false, '当前没有可确认的承接申请')
    if (!payload.bed?.trim()) return result(false, '请填写床位或床位协调说明')
    currentCase.treatment.status = 'accepted'
    currentCase.treatment.bed = payload.bed.trim()
    currentCase.treatment.admissionDate = payload.admissionDate || currentCase.treatment.admissionDate
    currentCase.travel.hospitalConfirmed = true
    currentCase.hospitalMatching.status = 'accepted'
    const selectedCandidate = currentCase.hospitalMatching.candidates.find((item) => item.id === currentCase.hospitalMatching.selectedHospitalId)
    if (selectedCandidate) selectedCandidate.status = 'accepted'
    setPhase(patient, 'planning')
    completeTask(`T-HOS-${caseId}`, { actor: payload.actor || '刘敏', comment: payload.note })
    const legacyTask = state.value.tasks.find((task) => task.id === 'T-104' && task.caseId === caseId)
    if (legacyTask) legacyTask.status = 'done'
    addEvent('hospital', payload.actor || '刘敏', '医院确认承接', `${currentCase.treatment.bed} · ${currentCase.treatment.admissionDate}`, caseId)
    notify('malaysia', `${patient.name} 已获医院承接`, caseId)
    return result(true, '医院已确认承接并同步床位信息')
  }

  function rejectHospital(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    if (currentCase.treatment.status !== 'requested') return result(false, '当前没有可拒绝的承接申请')
    if (!payload.reason?.trim()) return result(false, '请填写拒绝原因')
    currentCase.treatment.status = 'rejected'
    currentCase.treatment.rejectionReason = payload.reason.trim()
    currentCase.hospitalMatching.status = 'expert_reconsideration'
    const selectedCandidate = currentCase.hospitalMatching.candidates.find((item) => item.id === currentCase.hospitalMatching.selectedHospitalId)
    if (selectedCandidate) {
      selectedCandidate.status = 'rejected'
      selectedCandidate.rejectionReason = payload.reason.trim()
    }
    currentCase.hospitalMatching.selectedHospitalId = null
    currentCase.review.receivingTeamDecision = {
      ...currentCase.review.receivingTeamDecision,
      status: 'reconsideration_required',
      decidedAt: null,
    }
    addEvent('hospital', payload.actor || '刘敏', '医院拒绝承接', payload.reason.trim(), caseId)
    notify('expert', '医院无法承接，请重新确认接诊团队', caseId)
    notify('malaysia', '医院无法承接，已退回专家重新决策', caseId)
    return result(true, '承接申请已退回专家重新确认接诊团队')
  }

  function recordPayment(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    const amount = Number(payload.amount)
    if (!Number.isFinite(amount) || amount <= 0) return result(false, '请输入有效付款金额')
    currentCase.billing.payments.push({ id: uid('PAY'), amount, method: payload.method || 'bank_transfer', reference: payload.reference || '', paidAt: payload.paidAt || nowIso() })
    currentCase.billing.paid += amount
    addEvent('hospital', payload.actor || '财务人员', '登记患者付款', `${currentCase.billing.currency} ${amount.toLocaleString()}`, caseId)
    return result(true, `已登记付款 ${currentCase.billing.currency} ${amount.toLocaleString()}`)
  }

  function recordRefund(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    const amount = Number(payload.amount)
    if (!Number.isFinite(amount) || amount <= 0 || amount > currentCase.billing.paid) return result(false, '退款金额无效或超过已付款金额')
    if (!payload.reason?.trim()) return result(false, '请填写退款原因')
    currentCase.billing.refunds.push({ id: uid('REF'), amount, reason: payload.reason.trim(), refundedAt: nowIso() })
    currentCase.billing.paid -= amount
    addEvent('hospital', payload.actor || '财务人员', '登记退款', `${amount.toLocaleString()} · ${payload.reason.trim()}`, caseId)
    return result(true, `已登记退款 ${amount.toLocaleString()}`)
  }

  function confirmSchedule(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    if (currentCase.treatment.status !== 'accepted') return result(false, '医院尚未确认承接')
    if (!currentCase.treatment.schedule.length) return result(false, '请先创建诊疗日程')
    currentCase.treatment.schedule.forEach((item) => { if (item.status === 'planned') item.status = 'confirmed' })
    addEvent('hospital', payload.actor || '刘敏', '确认诊疗日程', payload.note || '日程已同步患者端', caseId)
    return result(true, '床位与诊疗日程已确认并同步患者端')
  }

  function completeHandoff(payload = {}, caseId = state.value.activeCaseId) {
    const patient = patientByCase(caseId)
    const currentCase = caseById(caseId)
    if (currentCase.treatment.status !== 'accepted') return result(false, '医院尚未确认承接')
    if (!currentCase.billing.patientConfirmed) return result(false, '患者尚未确认费用预估')
    if (!currentCase.travel.patientConfirmed || !currentCase.travel.hospitalConfirmed) return result(false, '患者或医院尚未确认行程')
    currentCase.travel.status = 'confirmed'
    setPhase(patient, 'travel')
    addEvent('malaysia', payload.actor || 'Aisyah', '完成赴华交接', payload.note || '资料、费用、医院与行程均已确认', caseId)
    return result(true, '赴华交接已完成')
  }

  function advanceTreatment(payload = {}, caseId = state.value.activeCaseId) {
    const patient = patientByCase(caseId)
    const currentCase = caseById(caseId)
    if (!['accepted', 'in_treatment', 'post_operation'].includes(currentCase.treatment.status)) return result(false, '当前治疗状态不可推进')
    const nextStatus = payload.status || 'post_operation'
    currentCase.treatment.status = nextStatus
    setPhase(patient, nextStatus === 'completed' ? 'discharge' : 'treatment')
    const scheduleItem = currentCase.treatment.schedule.find((item) => item.id === payload.scheduleId)
    if (scheduleItem) scheduleItem.status = 'done'
    addEvent('hospital', payload.actor || '医疗团队', '更新治疗进度', payload.note || nextStatus, caseId)
    return result(true, '治疗进度已更新')
  }

  function completeDischarge(payload = {}, caseId = state.value.activeCaseId) {
    const patient = patientByCase(caseId)
    const currentCase = caseById(caseId)
    const checklist = { ...currentCase.treatment.dischargeChecklist, ...(payload.checklist || {}) }
    currentCase.treatment.dischargeChecklist = checklist
    if (!Object.values(checklist).every(Boolean)) return result(false, '出院资料、带药、复查计划及患者签字尚未全部完成')
    if (currentCase.treatment.status !== 'post_operation' && currentCase.treatment.status !== 'completed') return result(false, '患者尚未进入可出院阶段')
    currentCase.treatment.status = 'completed'
    currentCase.treatment.dischargeReady = true
    setPhase(patient, 'discharge')
    ensureTask(`T-HLT-${caseId}`, { caseId, title: `建立 ${patient.name} 归国五阶段服务计划`, from: 'hospital', to: 'health', owner: payload.owner || '健康管家', dueAt: payload.dueAt || nowIso(), status: 'pending', priority: 'high' })
    addEvent('hospital', payload.actor || '刘敏', '完成出院交接', payload.note || '双语资料、带药和复查计划已交付', caseId)
    notify('health', `${patient.name} 待建立归国计划`, caseId)
    return result(true, '出院交接完成，健康管理端已收到建档任务')
  }

  function generateFollowup(payload = {}, caseId = state.value.activeCaseId) {
    const patient = patientByCase(caseId)
    const currentCase = caseById(caseId)
    if (!currentCase.treatment.dischargeReady) return result(false, '医院尚未完成出院交接')
    currentCase.followup.generated = true
    currentCase.followup.status = 'active'
    currentCase.followup.stages = currentCase.followup.stages.map((stage, index) => ({ ...stage, status: index === 0 ? 'active' : 'upcoming' }))
    setPhase(patient, 'followup')
    completeTask(`T-HLT-${caseId}`, { actor: payload.actor || 'Farah' })
    const channels = recordPatientDelivery('followup', '五阶段归国随访计划', caseId)
    addEvent('health', payload.actor || 'Farah', '生成五阶段随访计划', payload.note || `已通过 ${channels.join(' + ')} 推送患者`, caseId)
    return result(true, `五阶段随访计划已生成并通过 ${channels.join(' + ')} 推送患者`)
  }

  function escalateAlert(payload = {}, caseId = state.value.activeCaseId) {
    const alert = state.value.alerts.find((item) => item.id === (payload.alertId || 'A-07'))
    if (!alert || alert.status !== 'open') return result(false, '预警不存在或已处理')
    if (!payload.assessment?.trim()) return result(false, '请填写风险评估')
    alert.status = 'escalated'
    alert.assessment = payload.assessment.trim()
    alert.assignedTo = payload.expert || '肿瘤质控组'
    ensureTask(`T-ALERT-${alert.id}`, { caseId: alert.caseId, title: '高危复查异常专家复评', from: 'health', to: 'expert', owner: alert.assignedTo, dueAt: payload.dueAt || nowIso(), status: 'pending', priority: 'urgent' })
    addEvent('health', payload.actor || 'Farah', '升级高危预警', alert.assessment, alert.caseId)
    notify('expert', `${alert.patient} 的高危预警待复评`, alert.caseId)
    return result(true, '高危预警已升级至专家复评')
  }

  function closeAlert(payload = {}, caseId = state.value.activeCaseId) {
    const alert = state.value.alerts.find((item) => item.id === payload.alertId)
    if (!alert || !['open', 'escalated'].includes(alert.status)) return result(false, '预警不存在或已关闭')
    if (!payload.resolution?.trim()) return result(false, '请填写处置结论')
    alert.status = 'closed'
    alert.resolution = payload.resolution.trim()
    alert.closedAt = nowIso()
    addEvent('health', payload.actor || 'Farah', '关闭预警', alert.resolution, alert.caseId)
    return result(true, '预警已完成闭环')
  }

  function uploadDocument(payload = {}, caseId = state.value.activeCaseId) {
    if (!payload.name?.trim() || !payload.type) return result(false, '请填写文件名称和资料类型')
    const duplicates = state.value.documents.filter((doc) => doc.caseId === caseId && doc.name === payload.name.trim() && !doc.voidedAt)
    const version = duplicates.length ? Math.max(...duplicates.map((doc) => doc.version)) + 1 : 1
    state.value.documents.push({
      id: uid('DOC'), caseId, type: payload.type, name: payload.name.trim(), language: payload.language || 'zh',
      source: payload.source || '用户上传', status: 'pending_verification', version, originalId: duplicates[0]?.originalId || uid('ORIG'),
      translationStatus: payload.language === 'zh' ? 'not_required' : 'pending', medicalVerification: 'pending',
      authorizationScopes: payload.authorizationScopes || ['patient', 'malaysia'], downloadCount: 0, voidedAt: null,
    })
    addEvent(actionDefinitions.uploadDocument.system, payload.actor || '当前用户', '上传医疗资料', `${payload.name.trim()} · v${version}`, caseId)
    return result(true, duplicates.length ? `检测到同名文件，已作为 v${version} 新版本上传` : '资料已上传并进入核验队列')
  }

  function accessDocument(documentId, actor = '当前用户') {
    const documentRecord = state.value.documents.find((item) => item.id === documentId)
    if (!documentRecord || documentRecord.voidedAt) return result(false, '文件不存在或已作废')
    documentRecord.downloadCount += 1
    addEvent('document', actor, '查看医疗文件', `${documentRecord.name} · v${documentRecord.version}`, documentRecord.caseId)
    return result(true, '已记录本次文件访问；演示环境不加载真实医疗文件')
  }

  function saveCaseNote(caseId, text, actor = '当前用户') {
    const currentCase = caseById(caseId)
    if (!currentCase || !text?.trim()) return result(false, '请输入备注内容')
    currentCase.notes.unshift({ id: uid('NOTE'), text: text.trim(), actor, createdAt: nowIso() })
    addEvent('core', actor, '保存业务备注', text.trim(), caseId)
    return result(true, '备注已保存')
  }

  function addAttachment(caseId, payload = {}) {
    const currentCase = caseById(caseId)
    if (!currentCase || !payload.name?.trim()) return result(false, '请输入附件名称')
    currentCase.attachments.unshift({ id: uid('ATT'), name: payload.name.trim(), type: payload.type || '业务附件', uploadedAt: nowIso(), uploadedBy: payload.actor || '当前用户' })
    return result(true, '附件已加入业务记录')
  }

  function updatePatient(caseId, fields = {}, actor = '当前用户') {
    const patient = patientByCase(caseId)
    if (!patient) return result(false, '患者不存在')
    const allowed = ['name', 'englishName', 'phone', 'city', 'owner', 'completeness']
    allowed.forEach((key) => { if (fields[key] !== undefined) patient[key] = fields[key] })
    patient.updatedAt = nowIso()
    addEvent('core', actor, '更新患者资料', allowed.filter((key) => fields[key] !== undefined).join('、'), caseId)
    return result(true, '患者资料已更新')
  }

  function createPatient(payload = {}) {
    if (!payload.name?.trim()) return result(false, '请填写患者姓名')
    const sequence = String(state.value.patients.length + 22).padStart(4, '0')
    const caseId = `AGH-MY-${new Date().getFullYear()}-${sequence}`
    const template = clone(state.value.cases['AGH-MY-2026-0021'])
    template.id = caseId
    template.notes = []
    template.attachments = []
    template.messages = []
    template.hospitalMatching = { status: 'waiting_review', selectedHospitalId: null, requestedAt: null, candidates: [] }
    state.value.cases[caseId] = template
    state.value.patients.unshift({
      id: `P-${sequence}`, caseId, name: payload.name.trim(), englishName: payload.englishName || '',
      age: Number(payload.age) || 0, gender: payload.gender || 'unknown', country: 'Malaysia',
      city: payload.city || '', language: payload.language || 'zh', phone: payload.phone || '',
      diagnosis: payload.diagnosis || '待初诊评估', diagnosisEn: '', phase: 'lead', phaseLabel: '新咨询',
      completeness: 10, owner: payload.owner || 'Aisyah', risk: 'normal', avatar: payload.name.trim().slice(0, 1),
      source: payload.source || 'Manual', updatedAt: nowIso(),
    })
    state.value.activeCaseId = caseId
    addEvent('malaysia', payload.actor || 'Aisyah', '建立患者档案', `生成 Case ${caseId}`, caseId)
    return result(true, `患者档案已建立：${caseId}`)
  }

  function createLead(payload = {}) {
    if (!payload.patientName?.trim() || !payload.phone?.trim()) return result(false, '请填写咨询人姓名和联系电话')
    state.value.leads.unshift({
      id: uid('LEAD'), name: payload.patientName.trim(), source: payload.source || 'WhatsApp',
      disease: payload.note?.trim() || '待了解', phone: payload.phone.trim(), status: '待联系',
      owner: payload.owner || 'Nur', note: payload.note?.trim() || '',
    })
    addEvent('malaysia', payload.actor || 'Nur', '创建咨询线索', `${payload.patientName.trim()} · ${payload.source || 'WhatsApp'}`)
    return result(true, '咨询线索已创建并进入待联系队列')
  }

  function bookLocalResource(payload = {}, caseId = state.value.activeCaseId) {
    if (!payload.resource || !payload.appointmentAt) return result(false, '请选择合作机构和预约时间')
    state.value.appointments.unshift({
      id: uid('APT'), caseId, resource: payload.resource, appointmentAt: payload.appointmentAt,
      note: payload.note || '', status: 'booked', createdAt: nowIso(),
    })
    addEvent('malaysia', payload.actor || 'Aisyah', '预约本地资源', `${payload.resource} · ${payload.appointmentAt}`, caseId)
    return result(true, '本地服务预约已保存')
  }

  function completeRehab(payload = {}, caseId = state.value.activeCaseId) {
    if (!payload.note?.trim()) return result(false, '请填写康复评估结论')
    state.value.rehabAssessments.unshift({ id: uid('REHAB'), caseId, conclusion: payload.note.trim(), assessor: payload.actor || '康复师', createdAt: nowIso() })
    addEvent('health', payload.actor || '康复师', '完成康复评估', payload.note.trim(), caseId)
    return result(true, '康复评估已归档')
  }

  function generateQuality(payload = {}) {
    state.value.qualityReports.unshift({ id: uid('QR'), note: payload.note || '月度服务质控报告', generatedAt: nowIso(), generatedBy: payload.actor || '医疗质控组' })
    addEvent('health', payload.actor || '医疗质控组', '生成质控报告', payload.note || '月度服务质控报告')
    return result(true, '质控报告已生成并归档')
  }

  function sendMessage(caseId, payload = {}) {
    const currentCase = caseById(caseId)
    if (!currentCase || !payload.text?.trim()) return result(false, '请输入消息内容')
    currentCase.messages.unshift({
      id: uid('MSG'), channel: payload.channel || 'in_app', text: payload.text.trim(),
      from: payload.from || 'service', to: payload.to || 'patient', sentAt: nowIso(), status: 'sent',
    })
    addEvent(payload.from || 'core', payload.actor || '当前用户', '发送服务消息', payload.text.trim(), caseId)
    return result(true, '消息已发送并留痕')
  }

  function confirmPlan(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    if (currentCase.review.status !== 'completed') return result(false, '专家方案尚未完成')
    currentCase.billing.patientConfirmed = true
    addEvent('patient', payload.actor || '患者', '确认治疗与费用方案', payload.note || '患者已阅读并确认', caseId)
    return result(true, '治疗与费用方案已确认')
  }

  function confirmTravel(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    if (currentCase.treatment.status !== 'accepted') return result(false, '医院尚未确认承接')
    currentCase.travel.patientConfirmed = true
    currentCase.travel.status = 'patient_confirmed'
    addEvent('patient', payload.actor || '患者', '确认赴华行程', payload.note || '患者已确认航班与接送', caseId)
    return result(true, '赴华行程已确认')
  }

  function revokeConsent(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    if (!payload.reason?.trim()) return result(false, '请填写撤回原因')
    currentCase.consent.status = 'revoked'
    currentCase.consent.revokedAt = nowIso()
    currentCase.consent.revokeReason = payload.reason.trim()
    state.value.tasks.filter((task) => task.caseId === caseId && task.status !== 'done').forEach((task) => {
      task.status = 'blocked'
      task.slaPausedAt = nowIso()
    })
    addEvent('patient', payload.actor || '患者', '撤回数据授权', payload.reason.trim(), caseId)
    return result(true, '数据授权已撤回，未完成任务已暂停')
  }

  function performAction(action, payload = {}, caseId = state.value.activeCaseId) {
    const actorSystem = payload.__system
    if (actorSystem && !canPerformAction(state.value.permissions, actorSystem, action)) {
      return result(false, '当前角色没有执行该操作的权限', 'FORBIDDEN')
    }
    const handlers = {
      submitCase, acceptChinaCase, assignExpert, claimReview, finishReview, selectReceivingTeam, requestMoreDocuments,
      rejectReview, requestHospital, acceptHospital, rejectHospital, recordPayment, recordRefund,
      confirmSchedule, completeHandoff, advanceTreatment, completeDischarge, generateFollowup,
      escalateAlert, closeAlert, uploadDocument, confirmPlan, confirmTravel, revokeConsent, createPatient,
      createLead, bookLocalResource, completeRehab, generateQuality,
    }
    if (handlers[action]) return handlers[action](payload, caseId)

    const currentCase = caseById(caseId)
    const patient = patientByCase(caseId)
    if (action === 'lockDocuments') {
      if (!patient || !currentCase) return result(false, '病例不存在')
      const activeDocs = state.value.documents.filter((doc) => doc.caseId === caseId && !doc.voidedAt)
      if (!activeDocs.length) return result(false, '当前病例暂无可锁定资料')
      activeDocs.forEach((doc) => {
        if (doc.status === 'pending_verification') doc.status = 'verified'
        if (doc.medicalVerification === 'pending') doc.medicalVerification = 'verified'
      })
      patient.completeness = 100
      if (currentCase.consent.status === 'pending') currentCase.consent.status = 'active'
      addEvent('malaysia', payload.actor || 'Aisyah', '锁定资料版本', payload.note || '资料完整度达到100%', caseId)
      return result(true, '资料版本已锁定，中国运营端可接收')
    }
    if (action === 'publishSummary') {
      if (!currentCase) return result(false, '病例不存在')
      const summary = payload.summary?.trim() || currentCase.review.summary?.trim()
      if (!summary) return result(false, '请填写中文结构化病例摘要')
      currentCase.review.summary = summary
      currentCase.review.summaryVersion = (currentCase.review.summaryVersion || 0) + 1
      currentCase.review.summaryPublishedAt = nowIso()
      addEvent('china', payload.actor || '李雯', '发布病例摘要', `摘要版本 v${currentCase.review.summaryVersion}`, caseId)
      return result(true, '中文结构化病例摘要已发布')
    }
    if (action === 'finishMdt') {
      if (!payload.conclusion?.trim()) return result(false, '请填写 MDT 结论')
      currentCase.review.mdtConclusion = payload.conclusion.trim()
      currentCase.review.mdtCompletedAt = nowIso()
      currentCase.hospitalMatching.status = 'awaiting_expert_decision'
      addEvent('expert', payload.actor || 'MDT秘书', '完成 MDT 会诊', payload.conclusion.trim(), caseId)
      return result(true, 'MDT 结论已确认，请继续确认医院与接诊医生')
    }
    if (action === 'confirmMedication') {
      const alert = state.value.alerts.find((item) => item.caseId === caseId && item.type === '用药提醒' && item.status === 'open')
      if (alert) alert.status = 'closed'
      currentCase.followup.medicationLogs.unshift({ id: uid('MED'), confirmedAt: nowIso(), note: payload.note || '按计划服药' })
      addEvent('health', payload.actor || '健康管家', '确认患者用药', payload.note || '依从性记录已更新', caseId)
      return result(true, '今日用药已确认')
    }
    if (action === 'createFollowupTask') {
      if (!payload.title?.trim()) return result(false, '请填写随访任务')
      const task = ensureTask(uid('T-FU'), { caseId, title: payload.title.trim(), from: 'health', to: payload.to || 'health', owner: payload.owner || 'Farah', dueAt: payload.dueAt || nowIso(), status: 'pending', priority: payload.priority || 'normal' })
      addEvent('health', payload.actor || 'Farah', '创建随访任务', `${task.title} · ${task.owner}`, caseId)
      return result(true, '随访任务已创建')
    }
    if (action === 'completeMalaysiaTask') {
      const task = state.value.tasks.find((item) => item.caseId === caseId && item.to === 'malaysia' && item.status !== 'done')
      return task ? completeTask(task.id, payload) : result(false, '没有可完成的马来团队待办')
    }
    if (action === 'completeFollowup') {
      if (!currentCase.followup.generated) return result(false, '五阶段计划尚未生成，不能完成随访')
      currentCase.followup.encounters.unshift({ id: uid('FU'), completedAt: nowIso(), note: payload.note || '患者完成本周随访' })
      addEvent('patient', payload.actor || '患者', '完成患者随访', payload.note || '本周随访已归档', caseId)
      return result(true, '本周随访已确认完成')
    }
    if (action === 'copyReview') {
      const completedReview = Object.entries(state.value.cases)
        .map(([sourceCaseId, sourceCase]) => ({ sourceCaseId, review: sourceCase.review }))
        .find((item) => item.sourceCaseId !== caseId && item.review.status === 'completed' && item.review.recommendation)
      if (!completedReview) return result(false, '暂无可复制的历史评审')
      currentCase.review.summary = currentCase.review.summary || completedReview.review.summary
      currentCase.review.recommendation = completedReview.review.recommendation
      currentCase.review.copiedFrom = completedReview.sourceCaseId
      currentCase.review.revisions.push({ version: currentCase.review.version || 0, recommendation: currentCase.review.recommendation, savedAt: nowIso(), copiedFrom: completedReview.sourceCaseId })
      addEvent('expert', payload.actor || '当前专家', '复制历史评审', `引用 ${completedReview.sourceCaseId} 的历史意见`, caseId)
      return result(true, '历史评审已复制到当前病例草稿')
    }
    return result(false, `动作 ${action || 'unknown'} 尚未配置业务处理器`, 'UNHANDLED_ACTION')
  }

  function requestDomesticAccess(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    const patient = patientByCase(caseId)
    const reference = currentCase?.domesticRecordReference
    if (!reference?.chinaCaseId) return result(false, '该患者暂无中国境内诊疗资料', 'NO_DOMESTIC_RECORD')
    if (currentCase.consent?.status !== 'active' || !currentCase.consent.scopes.includes('china')) {
      return result(false, '患者授权未生效，不能发起受控查看', 'CONSENT_REQUIRED')
    }
    if (!payload.purpose?.trim() || !payload.secondFactor?.trim()) {
      return result(false, '请填写查看用途并完成二次验证', 'SECOND_FACTOR_REQUIRED')
    }
    const createdAt = new Date()
    const session = {
      id: uid('CN-SESSION'),
      caseId,
      chinaCaseId: reference.chinaCaseId,
      actor: payload.actor || state.value.currentUsers.malaysia.name,
      purpose: payload.purpose.trim(),
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(createdAt.getTime() + 10 * 60 * 1000).toISOString(),
      watermark: `${payload.actor || state.value.currentUsers.malaysia.name} · ${patient?.id || caseId} · 仅限受控查看`,
      status: 'active',
    }
    state.value.chinaDomain.activeSessions.unshift(session)
    state.value.chinaDomain.accessAudits.unshift({
      id: uid('AUD'), caseId, chinaCaseId: reference.chinaCaseId, actor: session.actor,
      purpose: session.purpose, action: '受控查看', result: '会话已开启', at: session.createdAt,
    })
    addEvent('malaysia', session.actor, '开启境内资料受控查看', `${session.purpose} · 10 分钟演示会话`, caseId)
    return { ...result(true, '已通过二次验证，受控查看会话已开启'), session }
  }

  function closeDomesticAccess(sessionId, actor = state.value.currentUsers.malaysia.name) {
    const session = state.value.chinaDomain.activeSessions.find((item) => item.id === sessionId && item.status === 'active')
    if (!session) return result(false, '受控查看会话不存在或已关闭', 'SESSION_NOT_FOUND')
    session.status = 'closed'
    session.closedAt = nowIso()
    state.value.chinaDomain.accessAudits.unshift({
      id: uid('AUD'), caseId: session.caseId, chinaCaseId: session.chinaCaseId, actor,
      purpose: session.purpose, action: '关闭查看', result: '已关闭', at: session.closedAt,
    })
    return result(true, '受控查看会话已关闭')
  }

  function uploadChinaRecord(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    const chinaCaseId = currentCase?.domesticRecordReference?.chinaCaseId || `CN-${caseId.slice(-4)}`
    if (!payload.title?.trim() || !payload.type?.trim()) return result(false, '请填写资料名称和类型')
    const record = {
      id: uid('CN-R'), chinaCaseId, caseId, type: payload.type.trim(), title: payload.title.trim(),
      hospital: payload.hospital || '国内合作医院', occurredAt: payload.occurredAt || nowIso().slice(0, 10),
      uploadedAt: nowIso(), stage: payload.stage || '治疗中',
      summary: payload.summary || '资料已由医院端上传至中国境内资料库。', ownerDomain: 'china',
    }
    state.value.chinaDomain.medicalRecords.unshift(record)
    currentCase.domesticRecordReference = {
      chinaCaseId, status: 'available', treatmentStage: record.stage, updatedAt: record.uploadedAt,
      availableCount: state.value.chinaDomain.medicalRecords.filter((item) => item.chinaCaseId === chinaCaseId).length,
      accessStatus: '二次验证后查看',
    }
    addEvent('hospital', payload.actor || '医院协调员', '上传国内诊疗资料', record.title, caseId)
    return result(true, '资料已保存至中国境内资料库')
  }

  function confirmAiStructuring(payload = {}, caseId = state.value.activeCaseId) {
    const structuring = caseById(caseId)?.aiStructuring
    if (!structuring) return result(false, '尚未生成 AI 病案草稿')
    structuring.status = 'operator_confirmed'
    structuring.confirmedAt = nowIso()
    structuring.confirmedBy = payload.actor || state.value.currentUsers.malaysia.name
    addEvent('malaysia', structuring.confirmedBy, '确认 AI 结构化病案', `置信度 ${structuring.confidence}% · 人工校对完成`, caseId)
    return result(true, '运营人员已确认报告，可发送患者核对')
  }

  function reviseAiReport(payload = {}, caseId = state.value.activeCaseId) {
    const structuring = caseById(caseId)?.aiStructuring
    if (!structuring) return result(false, '病案报告不存在')
    if (!payload.summary?.trim()) return result(false, '报告摘要不能为空')
    structuring.revisions.unshift({
      version: structuring.reportVersion,
      summary: structuring.reportSummary,
      savedAt: nowIso(),
      savedBy: payload.actor || state.value.currentUsers.malaysia.name,
    })
    structuring.reportVersion += 1
    structuring.reportSummary = payload.summary.trim()
    structuring.status = 'operator_confirmed'
    structuring.patientConfirmation = {
      status: 'not_sent', sentAt: null, confirmedAt: null, confirmedBy: '', note: '',
    }
    addEvent('malaysia', payload.actor || 'Aisyah', '更新结构化病案报告', `生成 v${structuring.reportVersion}，等待重新发送患者确认`, caseId)
    return result(true, `报告已保存为 v${structuring.reportVersion}`)
  }

  function sendAiReportToPatient(payload = {}, caseId = state.value.activeCaseId) {
    const structuring = caseById(caseId)?.aiStructuring
    if (!structuring || structuring.status !== 'operator_confirmed') {
      return result(false, '请先完成人工校对，再发送患者确认', 'OPERATOR_CONFIRMATION_REQUIRED')
    }
    structuring.status = 'awaiting_patient'
    structuring.patientConfirmation = {
      status: 'pending',
      sentAt: nowIso(),
      confirmedAt: null,
      confirmedBy: '',
      note: payload.note || '请患者确认基本信息、病程时间和资料出处。',
    }
    notify('patient', `结构化病案报告 v${structuring.reportVersion} 待确认`, caseId)
    const channels = recordPatientDelivery('report', `结构化病案报告 v${structuring.reportVersion}`, caseId)
    addEvent('malaysia', payload.actor || 'Aisyah', '发送患者确认', `结构化病案报告 v${structuring.reportVersion} · ${channels.join(' + ')}`, caseId)
    return result(true, `报告已通过 ${channels.join(' + ')} 发送患者确认`)
  }

  function confirmAiReportByPatient(payload = {}, caseId = state.value.activeCaseId) {
    const structuring = caseById(caseId)?.aiStructuring
    if (!structuring || structuring.patientConfirmation?.status !== 'pending') {
      return result(false, '当前没有待确认的病案报告', 'NO_PENDING_REPORT')
    }
    structuring.status = 'patient_confirmed'
    structuring.patientConfirmation.status = 'confirmed'
    structuring.patientConfirmation.confirmedAt = nowIso()
    structuring.patientConfirmation.confirmedBy = payload.actor || patientByCase(caseId)?.name || '患者'
    structuring.patientConfirmation.note = payload.note || '患者确认病案信息无误'
    addEvent('patient', structuring.patientConfirmation.confirmedBy, '确认结构化病案报告', `v${structuring.reportVersion} 已确认`, caseId)
    notify('malaysia', `${patientByCase(caseId)?.name} 已确认结构化病案报告`, caseId)
    return result(true, '病案报告已确认，可以进入下一流程')
  }

  function scheduleConsultation(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    const consultation = currentCase?.consultation
    if (!consultation) return result(false, '面诊信息不存在')
    if (currentCase.aiStructuring?.patientConfirmation?.status !== 'confirmed') {
      return result(false, '结构化病案必须先由患者确认，才能安排面诊', 'PATIENT_CONFIRMATION_REQUIRED')
    }
    Object.assign(consultation, {
      status: 'scheduled', date: payload.date || consultation.date, expert: payload.expert || consultation.expert,
      hospital: payload.hospital || consultation.hospital, mode: payload.mode || 'Zoom 视频面诊',
      location: payload.location || consultation.location,
    })
    consultation.meeting = {
      provider: 'Zoom',
      status: 'booked',
      meetingId: payload.meetingId || '894 1620 2607',
      joinUrl: payload.joinUrl || 'https://zoom.us/j/89416202607',
      passcode: payload.passcode || 'AGH2607',
      host: payload.actor || 'AGH Malaysia',
      createdAt: nowIso(),
    }
    consultation.invitations = consultation.invitations.map((invitation) => ({
      ...invitation, status: 'sent', sentAt: nowIso(),
    }))
    consultation.recording.consentStatus = 'requested'
    notify('patient', `Zoom 面诊已安排：${consultation.date}`, caseId)
    notify('expert', `Zoom 面诊邀请：${patientByCase(caseId)?.name}`, caseId)
    addEvent('malaysia', payload.actor || 'Aisyah', '创建并分发 Zoom 面诊', `${consultation.date} · ${consultation.expert} · ${consultation.meeting.meetingId}`, caseId)
    return result(true, 'Zoom 会议已创建，并分发给患者和专家')
  }

  function completeZoomConsultation(payload = {}, caseId = state.value.activeCaseId) {
    const consultation = caseById(caseId)?.consultation
    if (!consultation || consultation.meeting?.status !== 'booked') {
      return result(false, '请先创建并分发 Zoom 会议', 'ZOOM_NOT_BOOKED')
    }
    consultation.status = 'transcript_ready'
    consultation.meeting.status = 'completed'
    consultation.recording = {
      ...consultation.recording,
      consentStatus: 'confirmed',
      status: 'ready',
      transcriptStatus: 'ready',
      recordingUrl: 'zoom-cloud://recordings/89416202607',
      transcriptSource: 'Zoom Cloud Recording · audio_transcript.vtt',
    }
    consultation.transcript = {
      generatedAt: nowIso(),
      text: payload.transcript || '林志远医学总监：现有病理和 PET-CT 支持肺腺癌 IIIB 期判断。建议赴华后补充肺功能、EBUS 及分子检测，再由AGH专家评审或MDT会审确认治疗路径和接诊团队。患者林秀英：理解检查目的，愿意赴华进一步评估。Aisyah：将在专家确认医院与医生后协调承接申请、费用预估和赴华行程。',
    }
    consultation.aiMinutes.status = 'ready_for_review'
    addEvent('malaysia', payload.actor || 'Zoom 回调', 'Zoom 面诊转写完成', consultation.recording.transcriptSource, caseId)
    return result(true, 'Zoom 云录制与会议转写已就绪，可进行 AI 分析')
  }

  function appendConsultationMinutesToRecord(payload = {}, caseId = state.value.activeCaseId) {
    const currentCase = caseById(caseId)
    const consultation = currentCase?.consultation
    const structuring = currentCase?.aiStructuring
    if (!consultation?.transcript?.text || consultation.aiMinutes.status !== 'ready_for_review') {
      return result(false, '会议转写尚未就绪', 'TRANSCRIPT_NOT_READY')
    }
    const summary = payload.summary || '专家认为现有资料支持肺腺癌 IIIB 期判断，建议赴华补充肺功能、EBUS 与分子检测后，由胸外科、肿瘤内科及放疗科联合确定综合治疗路径；患者已理解并同意进一步评估。'
    consultation.aiMinutes = {
      status: 'added_to_record',
      summary,
      decisions: ['患者同意赴华进一步检查与专家联合评估', '当前不直接确定单一治疗方案'],
      actions: ['马来团队协调 Zoom 后续沟通与赴华行程', '医院安排肺功能、EBUS 和分子检测', '补充检查后再次进入多学科评估'],
      addedToRecordAt: nowIso(),
    }
    consultation.status = 'minutes_archived'
    consultation.completedAt = nowIso()
    consultation.notes = summary
    structuring.revisions.unshift({
      version: structuring.reportVersion,
      summary: structuring.reportSummary,
      savedAt: nowIso(),
      savedBy: payload.actor || 'Aisyah Rahman',
    })
    structuring.reportVersion += 1
    structuring.reportAppendices.unshift({
      type: 'Zoom 专家面诊纪要',
      title: '专家视频面诊纪要与 AI 分析',
      source: consultation.recording.transcriptSource,
      meetingId: consultation.meeting.meetingId,
      occurredAt: consultation.date,
      summary,
      decisions: consultation.aiMinutes.decisions,
      actions: consultation.aiMinutes.actions,
    })
    structuring.timeline.push({
      date: nowIso().slice(0, 10),
      title: '完成 Zoom 专家面诊并形成 AI 纪要',
      source: `Zoom 会议转写 · ${consultation.meeting.meetingId}`,
    })
    structuring.status = 'operator_confirmed'
    structuring.confirmedAt = nowIso()
    structuring.confirmedBy = payload.actor || 'Aisyah Rahman'
    structuring.patientConfirmation = {
      status: 'not_sent', sentAt: null, confirmedAt: null, confirmedBy: '', note: '',
    }
    addEvent('malaysia', structuring.confirmedBy, 'AI 面诊纪要写入患者档案', `报告更新为 v${structuring.reportVersion}，来源：${consultation.recording.transcriptSource}`, caseId)
    notify('patient', `面诊纪要已补充至病案报告 v${structuring.reportVersion}，待重新确认`, caseId)
    return result(true, `AI 纪要已写入档案，报告更新为 v${structuring.reportVersion}`)
  }

  function recordConsultationDecision(payload = {}, caseId = state.value.activeCaseId) {
    const consultation = caseById(caseId)?.consultation
    if (!consultation || !payload.decision?.trim()) return result(false, '请记录患者确认的治疗选择')
    consultation.status = 'completed'
    consultation.patientDecision = payload.decision.trim()
    consultation.notes = payload.notes || ''
    consultation.completedAt = nowIso()
    addEvent('malaysia', payload.actor || 'Aisyah', '确认面诊结论', consultation.patientDecision, caseId)
    return result(true, '面诊结论和患者选择已记录')
  }

  function updateJourneyItem(payload = {}, caseId = state.value.activeCaseId) {
    const item = caseById(caseId)?.travel?.itinerary.find((entry) => entry.id === payload.id)
    if (!item) return result(false, '行程节点不存在')
    item.status = payload.status || item.status
    item.note = payload.note || item.note || ''
    item.updatedAt = nowIso()
    addEvent('malaysia', payload.actor || 'Aisyah', `更新行程：${item.title}`, item.status, caseId)
    return result(true, '治疗行程已更新')
  }

  function publishHealthPlan(payload = {}, caseId = state.value.activeCaseId) {
    const plan = caseById(caseId)?.healthPlan
    if (!plan) return result(false, '健康方案不存在')
    plan.status = 'published'
    plan.version += 1
    plan.approvedBy = payload.actor || state.value.currentUsers.health.name
    plan.approvedAt = nowIso()
    if (plan.monthlyPlan) {
      plan.monthlyPlan.status = 'published'
      plan.monthlyPlan.publishedAt = plan.approvedAt
      plan.monthlyPlan.publishedBy = plan.approvedBy
    }
    const channels = recordPatientDelivery('care_plan', `${plan.monthlyPlan?.month || ''} 饮食运动方案 v${plan.monthlyPlan?.version || plan.version}`, caseId)
    plan.pushBatches.unshift({ id: uid('PUSH'), at: plan.approvedAt, channels: [...channels, '家访 Pad'], status: '已推送' })
    addEvent('health', plan.approvedBy, '发布月度饮食运动方案', `${plan.monthlyPlan?.month || ''} · v${plan.monthlyPlan?.version || plan.version} 已通过 ${channels.join(' + ')} 推送患者，并同步家访 Pad`, caseId)
    return result(true, `月度饮食运动方案已通过 ${channels.join(' + ')} 推送患者`)
  }

  function generateMonthlyHealthPlan(payload = {}, caseId = state.value.activeCaseId) {
    const plan = caseById(caseId)?.healthPlan
    if (!plan) return result(false, '健康方案不存在')
    const previous = plan.monthlyPlan
    const version = (previous?.version || 0) + 1
    const revisions = previous?.revisions || []
    if (previous) {
      const snapshot = clone(previous)
      delete snapshot.revisions
      revisions.unshift({
        version: previous.version,
        content: snapshot,
        savedAt: nowIso(),
        savedBy: payload.actor || state.value.currentUsers.health.name,
      })
    }
    const createMonthlyPlan = caseId === 'AGH-MY-2026-0012'
      ? createBreastCancerMonthlyPlan
      : createGeneralCancerMonthlyPlan
    plan.monthlyPlan = createMonthlyPlan({
      month: payload.month || nowIso().slice(0, 7),
      generatedAt: nowIso(),
      version,
      revisions,
      diagnosis: patientByCase(caseId)?.diagnosis,
    })
    plan.diet = plan.monthlyPlan.diet.map((item) => ({ title: item.title, target: item.target, note: item.note }))
    plan.exercise = plan.monthlyPlan.exercise.map((item) => ({ title: item.title, target: item.target, intensity: item.intensity }))
    plan.monitoring = clone(plan.monthlyPlan.monitoring)
    plan.status = 'ready_to_publish'
    addEvent('health', payload.actor || state.value.currentUsers.health.name, 'AI生成月度饮食运动方案', `${plan.monthlyPlan.month} · v${version}`, caseId)
    return result(true, `AI 已生成 ${plan.monthlyPlan.month} 月度方案 v${version}`)
  }

  function reviseMonthlyHealthPlan(payload = {}, caseId = state.value.activeCaseId) {
    const plan = caseById(caseId)?.healthPlan
    const monthly = plan?.monthlyPlan
    if (!monthly || !payload.diet?.length || !payload.exercise?.length) return result(false, '请保留至少一项饮食和运动方案')
    const snapshot = clone(monthly)
    delete snapshot.revisions
    monthly.revisions.unshift({
      version: monthly.version,
      content: snapshot,
      savedAt: nowIso(),
      savedBy: payload.actor || state.value.currentUsers.health.name,
    })
    monthly.version += 1
    monthly.goal = payload.goal?.trim() || monthly.goal
    const editableCollections = [
      'dietPrinciples', 'diet', 'symptomAdjustments', 'exercisePrinciples',
      'exerciseStages', 'exercise', 'safetyRules',
    ]
    editableCollections.forEach((key) => {
      if (payload[key]?.length) monthly[key] = clone(payload[key])
    })
    monthly.status = 'edited'
    monthly.editedAt = nowIso()
    monthly.editedBy = payload.actor || state.value.currentUsers.health.name
    plan.diet = monthly.diet.map((item) => ({ title: item.title, target: item.target, note: item.note }))
    plan.exercise = monthly.exercise.map((item) => ({ title: item.title, target: item.target, intensity: item.intensity }))
    plan.monitoring = clone(monthly.monitoring)
    plan.status = 'ready_to_publish'
    addEvent('health', monthly.editedBy, '修改月度饮食运动方案', `${monthly.month} · v${monthly.version}`, caseId)
    return result(true, `月度方案已保存为 v${monthly.version}`)
  }

  function saveHomeVisit(payload = {}, caseId = state.value.activeCaseId) {
    const visit = caseById(caseId)?.homeVisits?.find((item) => item.id === payload.id)
    if (!visit) return result(false, '家访任务不存在')
    if (payload.checklist) visit.checklist = payload.checklist
    if (payload.vitals) visit.vitals = { ...visit.vitals, ...payload.vitals }
    if (payload.woundPain) visit.woundPain = { ...visit.woundPain, ...payload.woundPain }
    if (payload.medicationReview) visit.medicationReview = { ...visit.medicationReview, ...payload.medicationReview }
    if (payload.rehabAssessment) visit.rehabAssessment = { ...visit.rehabAssessment, ...payload.rehabAssessment }
    if (payload.videoRecording) visit.videoRecordings.unshift(payload.videoRecording)
    visit.observations = payload.observations ?? visit.observations
    visit.riskLevel = payload.riskLevel || visit.riskLevel
    visit.status = payload.submit ? 'completed' : 'in_progress'
    visit.updatedAt = nowIso()
    if (payload.submit && visit.riskLevel === 'high') {
      state.value.alerts.unshift({
        id: uid('A-HV'), caseId, patient: patientByCase(caseId)?.name, type: '家访异常',
        severity: 'high', detail: visit.observations || '家访发现高风险情况', status: 'open',
        createdAt: visit.updatedAt, resolution: '', assignedTo: state.value.currentUsers.health.name,
      })
    }
    addEvent('health', payload.actor || visit.visitor, payload.submit ? '提交家访记录' : '保存家访草稿', visit.observations || '检查项已更新', caseId)
    return result(true, payload.submit ? '家访记录已提交' : '家访草稿已保存')
  }

  function reset() {
    state.value = clone(seedState)
    localStorage.removeItem(KEY)
  }

  return {
    state, activePatient, activeCase, activeReview, activeTreatment, activeBilling, activeTravel,
    activeFollowup, activeConsent, activeHospitalMatching, activeDomesticReference, activeAiStructuring,
    activeConsultation, activeHealthPlan, activeHomeVisits, activeCommunications, activeChinaRecords,
    activeTasks, activeDocuments, activeEvents, progress,
    toggleLanguage, setActiveCase, completeTask, startTask, addTaskComment, reassignTask, pauseTaskSla,
    submitCase, acceptChinaCase, assignExpert, claimReview, finishReview, selectReceivingTeam, requestMoreDocuments,
    rejectReview, requestHospital, acceptHospital, rejectHospital, recordPayment, recordRefund,
    confirmSchedule, completeHandoff, advanceTreatment, completeDischarge, generateFollowup,
    escalateAlert, closeAlert, uploadDocument, saveCaseNote, addAttachment, updatePatient,
    confirmPlan, confirmTravel, revokeConsent, createPatient, createLead, bookLocalResource,
    completeRehab, generateQuality, sendMessage, accessDocument,
    requestDomesticAccess, closeDomesticAccess, uploadChinaRecord, confirmAiStructuring,
    reviseAiReport, sendAiReportToPatient, confirmAiReportByPatient,
    scheduleConsultation, completeZoomConsultation, appendConsultationMinutesToRecord,
    recordConsultationDecision, updateJourneyItem, generateMonthlyHealthPlan, reviseMonthlyHealthPlan,
    publishHealthPlan, saveHomeVisit,
    performAction, reset, caseById, patientByCase,
  }
})
