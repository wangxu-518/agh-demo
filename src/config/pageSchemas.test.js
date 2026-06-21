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
        expect(schema.primary).toHaveLength(2)
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

  it('provides records for every Malaysia lead and resource filter', () => {
    for (const page of ['leads', 'resources']) {
      const schema = schemaFor('malaysia', page, seedState)
      for (const filter of schema.filters.slice(1)) {
        expect(schema.rows.some((row) => row.filter === filter), `${page}/${filter}`).toBe(true)
      }
    }
  })

  it('derives patient workflow queues from the unified case state', () => {
    const cases = schemaFor('malaysia', 'cases', seedState)
    const expertQueue = schemaFor('expert', 'queue', seedState)
    const hospitalQueue = schemaFor('hospital', 'intake', seedState)
    expect(cases.rows).toHaveLength(seedState.patients.length)
    expect(expertQueue.rows.some((row) => row.id === seedState.activeCaseId)).toBe(true)
    expect(hospitalQueue.rows.every((row) => seedState.cases[row.id])).toBe(true)
  })

  it('derives hospital matching metrics from case-bound candidate sets', () => {
    const hospitals = schemaFor('china', 'hospitals', seedState)
    expect(hospitals.metrics[0]).toEqual(['当前患者候选', '3'])
    expect(seedState.cases['AGH-MY-2026-0018'].hospitalMatching.candidates[0].name).not.toBe(
      seedState.cases['AGH-MY-2026-0021'].hospitalMatching.candidates[0].name,
    )
  })

  it('provides patient collections for every internal case-scoped menu', () => {
    const pages = [
      ['china', 'handoff'],
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
