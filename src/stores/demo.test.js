import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const memory = new Map()
global.localStorage = {
  getItem: (key) => memory.get(key) || null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
  clear: () => memory.clear(),
}

describe('case-isolated workflow store', () => {
  beforeEach(() => {
    memory.clear()
    setActivePinia(createPinia())
  })

  it('keeps review, treatment and follow-up isolated by case', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    const otherReview = store.state.cases['AGH-MY-2026-0012'].review.recommendation

    const result = store.finishReview({ recommendation: '主案例正式评审意见' })

    expect(result.ok).toBe(true)
    expect(store.activeReview.status).toBe('completed')
    expect(store.activePatient.phase).toBe('planning')
    expect(store.state.cases['AGH-MY-2026-0012'].review.recommendation).toBe(otherReview)
  })

  it('blocks case submission when documents or consent are incomplete', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.setActiveCase('AGH-MY-2026-0021')

    expect(store.submitCase().ok).toBe(false)
    store.activePatient.completeness = 100
    expect(store.submitCase().ok).toBe(false)
    store.activeConsent.status = 'active'
    expect(store.submitCase({ note: '资料齐全' }).ok).toBe(true)
    expect(store.activePatient.phase).toBe('review')
    expect(store.state.tasks.some((task) => task.id === `T-MY-${store.activePatient.caseId}`)).toBe(true)
  })

  it('requires a completed expert review before requesting a hospital', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    expect(store.requestHospital({ hospitalId: 'HOS-GZFAH' }).ok).toBe(false)

    store.finishReview({ recommendation: '建议医院承接评估' })
    const result = store.requestHospital({ hospitalId: 'HOS-GZFAH' })

    expect(result.ok).toBe(true)
    expect(store.activeTreatment.status).toBe('requested')
    expect(store.activeTreatment.hospitalId).toBe('HOS-GZFAH')
    expect(store.activeHospitalMatching.selectedHospitalId).toBe('HOS-GZFAH')
    expect(store.state.tasks.some((task) => task.id === `T-HOS-${store.activePatient.caseId}`)).toBe(true)
  })

  it('requires billing and travel confirmation before handoff', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.finishReview({ recommendation: '建议承接' })
    store.requestHospital({ hospitalId: 'HOS-GZFAH' })
    store.acceptHospital({ bed: '8F-12', admissionDate: '2026-06-28' })

    expect(store.completeHandoff().ok).toBe(false)
    store.confirmPlan()
    store.confirmTravel()
    expect(store.completeHandoff({ note: '全部确认' }).ok).toBe(true)
    expect(store.activePatient.phase).toBe('travel')
  })

  it('requires complete discharge materials before post-return care', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.activeTreatment.status = 'post_operation'

    expect(store.completeDischarge({ checklist: { summary: true } }).ok).toBe(false)
    const result = store.completeDischarge({
      checklist: { summary: true, imaging: true, medication: true, followup: true, patientSigned: true },
    })

    expect(result.ok).toBe(true)
    expect(store.activeTreatment.dischargeReady).toBe(true)
    expect(store.state.tasks.some((task) => task.id === `T-HLT-${store.activePatient.caseId}`)).toBe(true)
    expect(store.generateFollowup().ok).toBe(true)
    expect(store.activeFollowup.stages).toHaveLength(5)
    expect(store.activePatient.phase).toBe('followup')
    expect(store.activeCommunications.deliveries[0].type).toBe('followup')
    expect(store.activeCommunications.deliveries[0].channels).toContain('WhatsApp')
  })

  it('keeps China medical content outside the Malaysia case reference', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.setActiveCase('AGH-MY-2026-0012')

    expect(store.activeDomesticReference.chinaCaseId).toBe('CN-0012')
    expect(store.activeDomesticReference.availableCount).toBe(4)
    expect(store.activeDomesticReference).not.toHaveProperty('summary')
    expect(store.activeDomesticReference).not.toHaveProperty('attachments')
    expect(store.activeChinaRecords).toHaveLength(4)
    expect(store.activeChinaRecords.every((record) => record.ownerDomain === 'china')).toBe(true)
  })

  it('requires purpose and second factor before controlled domestic access', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.setActiveCase('AGH-MY-2026-0012')

    expect(store.requestDomesticAccess({ purpose: '制定康复方案' }).ok).toBe(false)
    const opened = store.requestDomesticAccess({
      purpose: '制定康复方案',
      secondFactor: '889102',
      actor: 'Farah Lim',
    })

    expect(opened.ok).toBe(true)
    expect(opened.session.watermark).toContain('仅限受控查看')
    expect(store.state.chinaDomain.accessAudits[0].result).toBe('会话已开启')
    expect(store.closeDomesticAccess(opened.session.id).ok).toBe(true)
    expect(opened.session.status).toBe('closed')
  })

  it('supports the demo case model from AI structuring through home visit', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    expect(store.scheduleConsultation().code).toBe('PATIENT_CONFIRMATION_REQUIRED')
    expect(store.confirmAiStructuring({ actor: 'Aisyah' }).ok).toBe(true)
    expect(store.activeAiStructuring.status).toBe('operator_confirmed')
    expect(store.scheduleConsultation().code).toBe('PATIENT_CONFIRMATION_REQUIRED')
    expect(store.sendAiReportToPatient({ actor: 'Aisyah' }).ok).toBe(true)
    expect(store.activeAiStructuring.patientConfirmation.status).toBe('pending')
    expect(store.activeCommunications.deliveries[0].type).toBe('report')
    expect(store.activeCommunications.deliveries[0].channels).toEqual(['WhatsApp', '患者端'])
    expect(store.confirmAiReportByPatient({ actor: '林秀英' }).ok).toBe(true)
    expect(store.activeAiStructuring.status).toBe('patient_confirmed')
    expect(store.scheduleConsultation().ok).toBe(true)
    expect(store.activeConsultation.meeting.status).toBe('booked')
    expect(store.activeConsultation.invitations.every((item) => item.status === 'sent')).toBe(true)
    expect(store.completeZoomConsultation({ actor: 'Zoom Cloud Recording' }).ok).toBe(true)
    expect(store.activeConsultation.recording.transcriptStatus).toBe('ready')
    expect(store.appendConsultationMinutesToRecord({ actor: 'Aisyah' }).ok).toBe(true)
    expect(store.activeConsultation.aiMinutes.status).toBe('added_to_record')
    expect(store.activeAiStructuring.reportVersion).toBe(2)
    expect(store.activeAiStructuring.reportAppendices[0].source).toContain('Zoom Cloud Recording')
    expect(store.activeAiStructuring.patientConfirmation.status).toBe('not_sent')
    expect(store.recordConsultationDecision({ decision: '选择方案 A，赴华评估' }).ok).toBe(true)

    store.setActiveCase('AGH-MY-2026-0012')
    expect(store.publishHealthPlan({ actor: 'Farah Lim' }).ok).toBe(true)
    expect(store.activeCommunications.deliveries[0].type).toBe('care_plan')
    expect(store.activeCommunications.deliveries[0].channels).toEqual(['WhatsApp', '患者端'])
    const visit = store.activeHomeVisits[0]
    expect(store.saveHomeVisit({
      id: visit.id,
      checklist: visit.checklist.map((item) => ({ ...item, done: true })),
      observations: '伤口轻微红肿，建议当日复诊',
      riskLevel: 'high',
      submit: true,
    }).ok).toBe(true)
    expect(visit.status).toBe('completed')
    expect(store.state.alerts[0].type).toBe('家访异常')
  })

  it('generates, revises and publishes a versioned monthly recovery plan', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.setActiveCase('AGH-MY-2026-0012')
    const startingVersion = store.activeHealthPlan.monthlyPlan.version

    expect(store.generateMonthlyHealthPlan({
      month: '2026-08',
      actor: 'Farah Lim',
    }).ok).toBe(true)
    expect(store.activeHealthPlan.monthlyPlan.version).toBe(startingVersion + 1)
    expect(store.activeHealthPlan.monthlyPlan.status).toBe('ai_generated')
    expect(store.activeHealthPlan.monthlyPlan.revisions).toHaveLength(1)
    expect(store.activeHealthPlan.monthlyPlan.diet).toHaveLength(6)
    expect(store.activeHealthPlan.monthlyPlan.exercise).toHaveLength(5)
    expect(store.activeHealthPlan.monthlyPlan.exerciseStages).toHaveLength(3)
    expect(store.activeHealthPlan.monthlyPlan.symptomAdjustments).toHaveLength(4)
    expect(store.activeHealthPlan.monthlyPlan.clinicalBasis.some((item) => item.value.includes('来曲唑'))).toBe(true)
    expect(JSON.stringify(store.activeHealthPlan.monthlyPlan)).not.toContain('胰腺')

    const revisedDiet = JSON.parse(JSON.stringify(store.activeHealthPlan.monthlyPlan.diet))
    revisedDiet[0].target = '蛋白质 25g'
    expect(store.reviseMonthlyHealthPlan({
      goal: '本月恢复连续步行 30 分钟并维持稳定体重',
      diet: revisedDiet,
      exercise: JSON.parse(JSON.stringify(store.activeHealthPlan.monthlyPlan.exercise)),
      actor: 'Farah Lim',
    }).ok).toBe(true)
    expect(store.activeHealthPlan.monthlyPlan.version).toBe(startingVersion + 2)
    expect(store.activeHealthPlan.monthlyPlan.status).toBe('edited')
    expect(store.activeHealthPlan.monthlyPlan.revisions).toHaveLength(2)
    expect(store.activeHealthPlan.diet[0].target).toBe('蛋白质 25g')
    expect(store.activeHealthPlan.monitoring).toHaveLength(4)

    expect(store.publishHealthPlan({ actor: 'Farah Lim' }).ok).toBe(true)
    expect(store.activeHealthPlan.monthlyPlan.status).toBe('published')
    expect(store.activeHealthPlan.monthlyPlan.publishedBy).toBe('Farah Lim')
    expect(store.activeHealthPlan.pushBatches[0].channels).toEqual(['WhatsApp', '患者端', '家访 Pad'])
  })

  it('provides verified patient contact channels for downstream delivery', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()

    for (const patient of store.state.patients) {
      expect(patient.contactChannels.some((channel) => channel.id === 'whatsapp' && channel.status === '已验证')).toBe(true)
      expect(patient.contactChannels.some((channel) => channel.id === 'patient')).toBe(true)
      expect(patient.preferredContactWindow).toBeTruthy()
    }
  })

  it('stores video and all four home visit capture sections', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.setActiveCase('AGH-MY-2026-0012')
    const visit = store.activeHomeVisits[0]

    expect(store.saveHomeVisit({
      id: visit.id,
      checklist: visit.checklist.map((item) => ({ ...item, done: true })),
      vitals: { bloodPressure: '126/76', oxygen: '99' },
      woundPain: { woundStatus: '轻微红肿', painScore: 3, notes: '换药后继续观察' },
      medicationReview: { adherence: '偶尔漏服', notes: '已设置服药提醒' },
      rehabAssessment: { shoulderFlexion: '142', movementQuality: '轻微受限' },
      videoRecording: {
        id: 'HVR-TEST',
        name: '家访现场视频-2026-07-24.mp4',
        duration: 42,
        status: 'ready',
      },
      actor: 'Farah Lim',
    }).ok).toBe(true)

    expect(visit.checklist.every((item) => item.done)).toBe(true)
    expect(visit.vitals.oxygen).toBe('99')
    expect(visit.woundPain.painScore).toBe(3)
    expect(visit.medicationReview.adherence).toBe('偶尔漏服')
    expect(visit.rehabAssessment.shoulderFlexion).toBe('142')
    expect(visit.videoRecordings[0].name).toContain('家访现场视频')
  })

  it('creates a new AI report version and requires patient reconfirmation', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.confirmAiStructuring({ actor: 'Aisyah' })
    store.sendAiReportToPatient({ actor: 'Aisyah' })
    store.confirmAiReportByPatient({ actor: '林秀英' })

    const result = store.reviseAiReport({
      summary: '补充最新检查后更新的结构化病情摘要。',
      actor: 'Aisyah',
    })

    expect(result.ok).toBe(true)
    expect(store.activeAiStructuring.reportVersion).toBe(2)
    expect(store.activeAiStructuring.revisions).toHaveLength(1)
    expect(store.activeAiStructuring.patientConfirmation.status).toBe('not_sent')
    expect(store.scheduleConsultation().code).toBe('PATIENT_CONFIRMATION_REQUIRED')
  })

  it('creates versioned documents instead of overwriting duplicates', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    const result = store.uploadDocument({ name: '肺穿刺病理报告.pdf', type: '病理报告', language: 'zh' })
    const versions = store.state.documents
      .filter((document) => document.caseId === store.activePatient.caseId && document.name === '肺穿刺病理报告.pdf')
      .map((document) => document.version)

    expect(result.ok).toBe(true)
    expect(versions).toContain(3)
  })

  it('escalates and closes an alert with required clinical notes', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    expect(store.escalateAlert({ alertId: 'A-07' }).ok).toBe(false)
    expect(store.escalateAlert({ alertId: 'A-07', assessment: '指标连续升高，需专家复评' }).ok).toBe(true)
    expect(store.state.alerts[0].status).toBe('escalated')
    expect(store.closeAlert({ alertId: 'A-07', resolution: '专家复评后调整复查计划' }).ok).toBe(true)
    expect(store.state.alerts[0].status).toBe('closed')
  })

  it('persists task collaboration and supports reset', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    expect(store.startTask('T-101', { comment: '已联系患者补充报告' }).ok).toBe(true)
    expect(store.addTaskComment('T-101', '患者将在下午上传', 'Aisyah').ok).toBe(true)
    expect(store.state.tasks.find((task) => task.id === 'T-101').comments).toHaveLength(2)
    store.reset()
    expect(store.state.activeCaseId).toBe('AGH-MY-2026-0018')
    expect(store.activeReview.status).toBe('in_review')
  })

  it('persists operational form inputs instead of only showing success messages', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    const leadCount = store.state.leads.length
    expect(store.createLead({ patientName: '测试患者', phone: '+60 1000', source: 'WhatsApp', note: '肺部检查咨询' }).ok).toBe(true)
    expect(store.state.leads).toHaveLength(leadCount + 1)
    expect(store.bookLocalResource({ resource: 'BP Healthcare Bangsar', appointmentAt: '2026-06-25T10:00' }).ok).toBe(true)
    expect(store.state.appointments[0].caseId).toBe(store.activePatient.caseId)
    expect(store.completeRehab({ note: '步行耐力改善，继续呼吸训练' }).ok).toBe(true)
    expect(store.state.rehabAssessments[0].conclusion).toContain('步行耐力')
  })

  it('persists configured primary actions and rejects unhandled buttons', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()

    expect(store.performAction('publishSummary', { summary: '中文摘要已结构化' }).ok).toBe(true)
    expect(store.activeReview.summaryVersion).toBe(1)
    expect(store.performAction('copyReview').ok).toBe(true)
    expect(store.activeReview.copiedFrom).toBeTruthy()
    expect(store.performAction('unknownAction').ok).toBe(false)
    expect(store.performAction('unknownAction').code).toBe('UNHANDLED_ACTION')
  })

  it('blocks role-forbidden business actions when a system context is provided', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()

    const forbidden = store.performAction('assignExpert', { __system: 'patient', expert: '张建国 主任' })
    expect(forbidden.ok).toBe(false)
    expect(forbidden.code).toBe('FORBIDDEN')

    const chinaForbidden = store.performAction('assignExpert', { __system: 'china', expert: '张建国 主任' })
    expect(chinaForbidden.ok).toBe(false)

    const allowed = store.performAction('assignExpert', { __system: 'malaysia', expert: '张建国 主任' })
    expect(allowed.ok).toBe(true)
  })

  it('keeps seed task due dates current for demo review', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    const openDueTimes = store.state.tasks
      .filter((task) => task.status !== 'done')
      .map((task) => new Date(task.dueAt).getTime())

    expect(openDueTimes.every((time) => time >= Date.now() - 60000)).toBe(true)
  })

  it('keeps hospital candidates and selections bound to the selected case', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    const mainCandidates = store.activeHospitalMatching.candidates.map((item) => item.id)
    const otherSelected = store.state.cases['AGH-MY-2026-0012'].hospitalMatching.selectedHospitalId

    expect(mainCandidates).toContain('HOS-GZFAH')
    expect(store.requestHospital({ hospitalId: 'UNKNOWN-HOSPITAL' }).ok).toBe(false)
    store.finishReview({ recommendation: '建议胸外科医院承接' })
    expect(store.requestHospital({ hospitalId: 'HOS-GZFAH' }).ok).toBe(true)

    expect(store.activeHospitalMatching.selectedHospitalId).toBe('HOS-GZFAH')
    expect(store.state.cases['AGH-MY-2026-0012'].hospitalMatching.selectedHospitalId).toBe(otherSelected)
    expect(store.state.cases['AGH-MY-2026-0021'].hospitalMatching.candidates.map((item) => item.id)).not.toEqual(mainCandidates)
  })
})
