import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const memory = new Map()
global.localStorage = {
  getItem: (key) => memory.get(key) || null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
  clear: () => memory.clear(),
}

describe('cross-system demo store', () => {
  beforeEach(async () => {
    memory.clear()
    setActivePinia(createPinia())
  })

  it('completes the review and hands the case to hospital intake', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.finishReview()
    expect(store.state.review.status).toBe('completed')
    expect(store.activePatient.phase).toBe('planning')
    expect(store.state.tasks.find((task) => task.id === 'T-103').status).toBe('done')
    expect(store.state.events[0].system).toBe('expert')
  })

  it('accepts the case and exposes a reserved hospital bed', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.acceptHospital()
    expect(store.state.treatment.status).toBe('accepted')
    expect(store.state.treatment.bed).toContain('预留')
    expect(store.activePatient.phase).toBe('treatment')
  })

  it('generates the five-stage post-return plan', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.generateFollowup()
    expect(store.state.followup.generated).toBe(true)
    expect(store.state.followup.stages).toHaveLength(5)
    expect(store.state.followup.stages[0].status).toBe('active')
  })

  it('escalates an alert into an expert review task', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.escalateAlert('A-07')
    expect(store.state.alerts[0].status).toBe('escalated')
    expect(store.state.tasks[0].to).toBe('expert')
    expect(store.state.tasks[0].priority).toBe('urgent')
  })

  it('resets mutated demo state', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.finishReview()
    store.reset()
    expect(store.state.review.status).toBe('in_review')
    expect(store.state.activeCaseId).toBe('AGH-MY-2026-0018')
  })

  it('creates cross-system tasks from operational actions', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.performAction('assignExpert')
    store.performAction('requestHospital')
    expect(store.state.tasks.some((task) => task.id === 'T-EXP-201' && task.to === 'expert')).toBe(true)
    expect(store.state.tasks.some((task) => task.id === 'T-HOS-201' && task.to === 'hospital')).toBe(true)
  })

  it('creates post-return handoff after discharge', async () => {
    const { useDemoStore } = await import('./demo')
    const store = useDemoStore()
    store.performAction('completeDischarge')
    expect(store.activePatient.phase).toBe('followup')
    expect(store.state.tasks.some((task) => task.id === 'T-HLT-201' && task.to === 'health')).toBe(true)
  })
})
