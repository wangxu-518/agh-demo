import { describe, expect, it } from 'vitest'
import featureList from '../../feature_list.json'

const validClasses = new Set(['A', 'B', 'C'])
const validStatuses = new Set(['continue', 'limited', 'paused'])

describe('commercial scope governance', () => {
  it('requires phase, quote basis and scope classification for every feature', () => {
    for (const feature of featureList.features) {
      expect(feature.phase, `${feature.id}/phase`).toBeTruthy()
      expect(feature.quote_basis, `${feature.id}/quote_basis`).toBeTruthy()
      expect(validClasses.has(feature.scope_class), `${feature.id}/scope_class`).toBe(true)
      expect(validStatuses.has(feature.scope_status), `${feature.id}/scope_status`).toBe(true)
    }
  })

  it('requires a depth limit for every B-class feature', () => {
    for (const feature of featureList.features.filter((item) => item.scope_class === 'B')) {
      expect(feature.scope_status, feature.id).toBe('limited')
      expect(feature.scope_limit, `${feature.id}/scope_limit`).toBeTruthy()
    }
  })

  it('prevents C-class add-ons from entering active development', () => {
    for (const feature of featureList.features.filter((item) => item.scope_class === 'C')) {
      expect(feature.scope_status, feature.id).toBe('paused')
      expect(feature.status, feature.id).not.toBe('implemented')
    }
  })

  it('records the exclusions explicitly stated in the quoted proposal', () => {
    const exclusions = featureList.scope_governance.excluded_addons.join(' ')
    for (const excluded of ['HIS', 'EMR', 'LIS', 'PACS', '原生iOS/Android App', '大模型Token']) {
      expect(exclusions).toContain(excluded)
    }
  })
})
