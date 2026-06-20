<script setup>
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import PatientBanner from '../components/PatientBanner.vue'
import SectionCard from '../components/SectionCard.vue'
import Timeline from '../components/Timeline.vue'
import { useDemoStore } from '../stores/demo'
import { useI18n } from '../i18n'

const store = useDemoStore()
const { lang } = useI18n()
const systems = [
  { path: '/patient', icon: 'P', title: '患者端', en: 'Patient Portal', color: '#2264e5', tint: '#edf3ff', desc: '咨询、资料、方案、赴华行程、治疗进度与归国随访' },
  { path: '/malaysia', icon: 'MY', title: '马来服务端', en: 'Malaysia Service', color: '#7554c7', tint: '#f2edff', desc: '线索CRM、签约、资料完整性、Case提交与本地协调' },
  { path: '/china-ops', icon: 'CN', title: '中国运营端', en: 'China Operations', color: '#e18332', tint: '#fff3e8', desc: '病历整理翻译、专家分配、医院匹配与跨国交接' },
  { path: '/expert', icon: 'MD', title: '专家端', en: 'Expert Review', color: '#d94c5b', tint: '#feedef', desc: '病例阅读、MDT、治疗建议、复查解读与历史版本' },
  { path: '/hospital', icon: 'H', title: '医院承接端', en: 'Hospital Intake', color: '#1493a3', tint: '#e8f8fa', desc: '预约、床位、检查、治疗日程、费用和出院资料' },
  { path: '/health-management', icon: '♥', title: '归国健康管理端', en: 'Post-return Care', color: '#1b9873', tint: '#e9f8f2', desc: '五阶段计划、随访、用药、康复、检验、应急与质控' },
]
const journey = ['咨询建档', '资料签约', '专家评审', '医院承接', '在华治疗', '归国管理']
</script>

<template>
  <PageHeader eyebrow="Unified demonstration workspace" title="跨境肿瘤全链路演示中心" subtitle="同一患者、同一 Case ID、同一协同时间线，贯穿中马六个业务子系统">
    <RouterLink class="primary-button" to="/patient">开始患者旅程 →</RouterLink>
  </PageHeader>

  <div class="stats-grid">
    <StatCard label="演示子系统" value="6" note="独立角色工作台" icon="▦" />
    <StatCard label="患者案例" :value="store.state.patients.length" note="1条主线＋3条辅助" icon="◎" tone="green" />
    <StatCard label="跨端待办" :value="store.state.tasks.filter(t => t.status !== 'done').length" note="任务实时联动" icon="✓" tone="orange" />
    <StatCard label="开放预警" :value="store.state.alerts.filter(a => a.status === 'open').length" note="高危事件需闭环" icon="!" tone="red" />
  </div>

  <PatientBanner />

  <SectionCard title="主线案例演示进度" subtitle="点击任一子系统进入相应角色工作台">
    <div class="mobile-progress">
      <div v-for="(step, index) in journey" :key="step" class="mobile-step" :class="{ done: index * 17 < store.progress, active: index * 17 <= store.progress && (index + 1) * 17 >= store.progress }">
        <i></i>{{ lang === 'zh' ? step : ['Inquiry','Documents','Review','Hospital','Treatment','Follow-up'][index] }}
      </div>
    </div>
  </SectionCard>

  <div class="grid-2">
    <div>
      <div class="system-grid">
        <RouterLink v-for="system in systems" :key="system.path" :to="system.path" class="system-card" :style="{ '--card-color': system.color, '--card-tint': system.tint }">
          <div class="system-icon">{{ system.icon }}</div>
          <h3>{{ lang === 'zh' ? system.title : system.en }}</h3>
          <p>{{ system.desc }}</p>
          <footer><span>{{ system.path }}</span><b>进入工作台 →</b></footer>
        </RouterLink>
      </div>
    </div>
    <SectionCard title="实时协同时间线" subtitle="关键操作自动写入审计事件">
      <Timeline />
    </SectionCard>
  </div>
</template>
