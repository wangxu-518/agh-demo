import { describe, expect, it } from 'vitest'
import { systems } from './systems'
import { schemaFor } from './pageSchemas'
import { seedState } from '../data/seed'

describe('business page schemas', () => {
  it('defines a complete page for every non-dashboard menu', () => {
    for (const [system, config] of Object.entries(systems)) {
      for (const [page] of config.nav) {
        if (page === 'home' || page === 'dashboard') continue
        const schema = schemaFor(system, page)
        expect(schema, `${system}/${page}`).toBeTruthy()
        expect(schema.title).toBeTruthy()
        expect(schema.description).toBeTruthy()
        expect(schema.type).toBeTruthy()
        if (schema.readOnly) expect(schema.primary).toBeUndefined()
        else expect(schema.primary).toHaveLength(2)
      }
    }
  })

  it('does not reuse the same title for different menu pages', () => {
    const titles = Object.entries(systems).flatMap(([system, config]) =>
      config.nav
        .filter(([page]) => page !== 'home' && page !== 'dashboard')
        .map(([page]) => schemaFor(system, page).title),
    )
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('maps repurposed Malaysia pages to journey and coordination workspaces', () => {
    expect(schemaFor('malaysia', 'leads', seedState).type).toBe('journey')
    expect(schemaFor('malaysia', 'resources', seedState).type).toBe('comparison')
  })

  it('keeps rehabilitation inside follow-up and home visits instead of a separate menu', () => {
    expect(systems.health.nav.map(([page]) => page)).not.toContain('rehab')
    expect(schemaFor('health', 'rehab', seedState)).toBeUndefined()
    expect(systems.health.nav.map(([page]) => page)).toContain('followups')
    expect(systems.health.nav.map(([page]) => page)).toContain('home-visits')
  })

  it('derives patient workflow queues from the unified case state', () => {
    const cases = schemaFor('malaysia', 'cases', seedState)
    const expertQueue = schemaFor('expert', 'queue', seedState)
    const hospitalQueue = schemaFor('hospital', 'intake', seedState)
    expect(cases.rows).toHaveLength(seedState.patients.length)
    expect(expertQueue.rows.some((row) => row.id === seedState.activeCaseId)).toBe(true)
    expect(hospitalQueue.rows.every((row) => seedState.cases[row.id])).toBe(true)
  })

  it('derives receiving-team decision metrics from case-bound candidate sets', () => {
    const hospitals = schemaFor('china', 'hospitals', seedState)
    expect(hospitals.metrics[0]).toEqual(['当前患者候选团队', '3'])
    expect(seedState.cases['AGH-MY-2026-0018'].hospitalMatching.candidates[0].name).not.toBe(
      seedState.cases['AGH-MY-2026-0021'].hospitalMatching.candidates[0].name,
    )
  })

  it('derives P0 dashboard metrics from business data rather than static placeholders', () => {
    const leads = schemaFor('malaysia', 'leads', seedState)
    const records = schemaFor('china', 'records', seedState)
    const billing = schemaFor('hospital', 'billing', seedState)
    const quality = schemaFor('health', 'quality', seedState)

    expect(leads.metrics[0]).toEqual(['线索总数', String(seedState.leads.length)])
    expect(records.metrics[0]).toEqual(['原始文件', String(seedState.documents.length)])
    expect(billing.metrics[3]).toEqual([
      '付款笔数',
      String(Object.values(seedState.cases).reduce((sum, item) => sum + item.billing.payments.length, 0)),
    ])
    expect(quality.metrics[1][1]).toMatch(/%$/)
  })

  it('provides patient collections for every internal case-scoped menu', () => {
    const pages = [
      ['expert', 'case'],
      ['expert', 'mdt'],
      ['hospital', 'schedule'],
      ['hospital', 'inpatient'],
      ['hospital', 'billing'],
      ['hospital', 'discharge'],
      ['health', 'followups'],
    ]
    for (const [system, page] of pages) {
      const schema = schemaFor(system, page, seedState)
      expect(schema.type, `${system}/${page}`).toBe('case-list')
      expect(schema.rows.length, `${system}/${page}`).toBeGreaterThan(0)
      expect(schema.rows.every((row) => seedState.cases[row.id]), `${system}/${page}`).toBe(true)
    }
  })
})
