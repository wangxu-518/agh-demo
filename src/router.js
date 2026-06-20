import { createRouter, createWebHistory } from 'vue-router'
import DemoCenter from './views/DemoCenter.vue'
import PatientPortal from './views/PatientPortal.vue'
import MalaysiaWorkspace from './views/MalaysiaWorkspace.vue'
import ChinaOpsWorkspace from './views/ChinaOpsWorkspace.vue'
import ExpertWorkspace from './views/ExpertWorkspace.vue'
import HospitalWorkspace from './views/HospitalWorkspace.vue'
import HealthWorkspace from './views/HealthWorkspace.vue'
import LegacyView from './views/LegacyView.vue'

export const routes = [
  { path: '/', redirect: '/demo' },
  { path: '/demo', component: DemoCenter, meta: { title: '演示中心', icon: '✦' } },
  { path: '/patient', component: PatientPortal, meta: { title: '患者端', icon: '⌁', patient: true } },
  { path: '/malaysia', component: MalaysiaWorkspace, meta: { title: '马来服务端', icon: 'MY' } },
  { path: '/china-ops', component: ChinaOpsWorkspace, meta: { title: '中国运营端', icon: 'CN' } },
  { path: '/expert', component: ExpertWorkspace, meta: { title: '专家端', icon: 'MD' } },
  { path: '/hospital', component: HospitalWorkspace, meta: { title: '医院承接端', icon: 'H' } },
  { path: '/health-management', component: HealthWorkspace, meta: { title: '归国健康管理端', icon: '♥' } },
  { path: '/legacy', component: LegacyView, meta: { title: '旧版参考', icon: '↗', hidden: true } },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
