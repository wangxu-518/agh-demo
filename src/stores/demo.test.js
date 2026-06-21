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
    expect(store.activePatient.phase).toBe('intake')
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
