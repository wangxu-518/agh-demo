import { describe, expect, it } from 'vitest'
import { systems } from './systems'
import { schemaFor } from './pageSchemas'

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
      const schema = schemaFor('malaysia', page)
      for (const filter of schema.filters.slice(1)) {
        expect(schema.rows.some((row) => row.filter === filter), `${page}/${filter}`).toBe(true)
      }
    }
  })
})
