import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import PortalView from './views/PortalView.vue'
import SystemLayout from './components/SystemLayout.vue'
import PatientPortal from './views/PatientPortal.vue'
import MalaysiaWorkspace from './views/MalaysiaWorkspace.vue'
import ChinaOpsWorkspace from './views/ChinaOpsWorkspace.vue'
import ExpertWorkspace from './views/ExpertWorkspace.vue'
import HospitalWorkspace from './views/HospitalWorkspace.vue'
import HealthWorkspace from './views/HealthWorkspace.vue'
import BusinessPage from './views/BusinessPage.vue'
import RecordDetail from './views/RecordDetail.vue'
import { systems, systemFromPath } from './config/systems'
import { useAuthStore } from './stores/auth'

const prefixes = { patient: 'patient', malaysia: 'malaysia', china: 'china-ops', expert: 'expert', hospital: 'hospital', health: 'health-management' }
const dashboards = { patient: PatientPortal, malaysia: MalaysiaWorkspace, china: ChinaOpsWorkspace, expert: ExpertWorkspace, hospital: HospitalWorkspace, health: HealthWorkspace }

const routes = [
  { path: '/', redirect: '/portal' },
  { path: '/portal', component: PortalView, meta: { public: true, title: '系统入口' } },
]
for (const [system, config] of Object.entries(systems)) {
  const prefix = prefixes[system]
  routes.push({
    path: `/${prefix}/login`,
    component: LoginView,
    meta: { system, public: true, title: `${config.short}登录` },
  })
  routes.push({
    path: `/${prefix}`,
    component: SystemLayout,
    meta: { system },
    children: [
      ...config.nav.map(([page, title]) => ({
      path: page,
      component: page === 'home' || page === 'dashboard' ? dashboards[system] : BusinessPage,
      meta: { system, page, title },
      })),
      { path: 'record/:id', component: RecordDetail, meta: { system, title: '业务详情' } },
    ],
  })
}

const router = createRouter({ history: createWebHistory(), routes, scrollBehavior: () => ({ top: 0 }) })
router.beforeEach((to) => {
  const system = to.meta.system || systemFromPath(to.path)
  if (!system || to.meta.public) return true
  const auth = useAuthStore()
  if (!auth.isLoggedIn(system)) return `/${prefixes[system]}/login`
  return true
})
export default router
