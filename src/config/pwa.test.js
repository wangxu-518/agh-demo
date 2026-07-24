import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const manifest = JSON.parse(readFileSync(resolve(root, 'public/manifest.webmanifest'), 'utf8'))

describe('AGH Care PWA', () => {
  it('defines an installable standalone patient experience', () => {
    expect(manifest.name).toBe('AGH Care 患者服务')
    expect(manifest.start_url).toBe('/care?source=pwa')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#1f5fd6')
  })

  it('provides standard, Apple and maskable app icons', () => {
    const icons = [
      'public/icons/apple-touch-icon-180.png',
      'public/icons/icon-192.png',
      'public/icons/icon-512.png',
      'public/icons/icon-maskable-512.png',
    ]
    expect(icons.every((file) => existsSync(resolve(root, file)))).toBe(true)
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true)
  })

  it('links Apple and PWA metadata from the application shell', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf8')
    expect(html).toContain('rel="manifest"')
    expect(html).toContain('apple-mobile-web-app-capable')
    expect(html).toContain('apple-touch-icon')
  })

  it('keeps medical records out of the offline shell cache', () => {
    const worker = readFileSync(resolve(root, 'public/sw.js'), 'utf8')
    expect(worker).toContain('/offline.html')
    expect(worker).not.toContain('/patient/records')
    expect(worker).not.toContain('/patient/plan')
  })

  it('exposes a dedicated public care entry route', () => {
    const router = readFileSync(resolve(root, 'src/router.js'), 'utf8')
    expect(router).toContain("path: '/care'")
    expect(router).toContain('component: CareEntry')
  })

  it('uses the patient home as an AGH trust and service entry', () => {
    const home = readFileSync(resolve(root, 'src/views/PatientPortal.vue'), 'utf8')
    const entry = readFileSync(resolve(root, 'src/views/CareEntry.vue'), 'utf8')
    expect(home).toContain('AGH International Care')
    expect(home).toContain('合作医疗机构')
    expect(home).toContain('AGH肿瘤专家团队')
    expect(home).toContain('查看我的服务')
    expect(entry).toContain('<PatientPortal entry-mode />')
    expect(entry).not.toContain('standalone) enterCare')
  })

  it('defines a real-phone readability baseline for patient pages', () => {
    const styles = readFileSync(resolve(root, 'src/styles.css'), 'utf8')
    expect(styles).toContain('/* Patient mobile readability baseline */')
    expect(styles).toContain('.patient-page-heading p { font-size: 13px;')
    expect(styles).toContain('.patient-bottom-nav a {')
    expect(styles).toContain('min-height: 46px;')
  })
})
