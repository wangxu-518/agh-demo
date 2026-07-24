import { describe, expect, it } from 'vitest'
import { seedState } from '../data/seed'
import { createGeneralCancerMonthlyPlan } from '../data/breastCancerCarePlan'
import { workflowQueueFor } from './workflowQueues'

describe('workflow patient queues', () => {
  it('keeps Malaysia workflow modules multi-patient', () => {
    for (const page of ['cases', 'documents', 'tasks', 'resources', 'leads']) {
      const queue = workflowQueueFor('malaysia', page, seedState)
      expect(queue.rows, page).toHaveLength(seedState.patients.length)
      expect(queue.rows.some((row) => row.featured && row.name === '王美玲'), page).toBe(true)
    }
  })

  it('derives specialist queues from each business stage', () => {
    expect(workflowQueueFor('expert', 'case', seedState).rows.length).toBeGreaterThan(1)
    expect(workflowQueueFor('expert', 'mdt', seedState).rows.length).toBeGreaterThan(1)
    expect(workflowQueueFor('hospital', 'inpatient', seedState).rows.length).toBeGreaterThan(1)
    expect(workflowQueueFor('china', 'records', seedState).rows.length).toBeGreaterThan(1)
    expect(workflowQueueFor('health', 'followups', seedState).rows.length).toBeGreaterThan(1)
    expect(workflowQueueFor('health', 'home-visits', seedState).rows.length).toBeGreaterThan(1)
  })

  it('uses case-bound values instead of the global active patient', () => {
    const rows = workflowQueueFor('hospital', 'inpatient', {
      ...seedState,
      activeCaseId: 'AGH-MY-2026-0021',
    }).rows
    const wang = rows.find((row) => row.caseId === 'AGH-MY-2026-0012')
    const lin = rows.find((row) => row.caseId === 'AGH-MY-2026-0018')
    expect(wang.primaryValue).toContain('乳腺科')
    expect(lin.primaryValue).toContain('胸外科')
  })

  it('keeps the main demo case clinically consistent across the workflow', () => {
    const wangCase = seedState.cases['AGH-MY-2026-0012']
    const wangDocuments = seedState.documents.filter((item) => item.caseId === 'AGH-MY-2026-0012')
    expect(wangCase.aiStructuring.reportSummary).toContain('乳腺癌')
    expect(wangCase.aiStructuring.reportSummary).not.toContain('肺腺癌')
    expect(wangCase.aiStructuring.extractedFields[0].value).toBe('乳腺癌术后')
    expect(wangDocuments).toHaveLength(4)
  })

  it('does not reuse the breast cancer template for other diagnoses', () => {
    const plan = createGeneralCancerMonthlyPlan({
      month: '2026-07',
      generatedAt: '2026-07-24T09:00:00+08:00',
      diagnosis: '卵巢癌治疗后 · 高危随访',
    })
    const content = JSON.stringify(plan)
    expect(content).toContain('卵巢癌治疗后')
    expect(content).not.toContain('来曲唑')
    expect(content).not.toContain('淋巴水肿')
  })
})
