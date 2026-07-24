<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import { useDemoStore } from '../stores/demo'

const router = useRouter()
const store = useDemoStore()
const activeStage = ref('all')
const message = ref('')

const stages = [
  { id: 'pre-return', name: '归国前准备', short: '返程前', period: '治疗结束前 3 天', focus: '档案归集、用药培训、返程交接' },
  { id: 'adaptation', name: '归国适应期', short: '1-7 天', period: '归国后 1-7 天', focus: '每日联系、伤口、用药与生命体征' },
  { id: 'short', name: '短期康复期', short: '1-3 月', period: '归国后 1-3 个月', focus: '康复训练、复查、营养和心理支持' },
  { id: 'stable', name: '中期稳定期', short: '3-12 月', period: '归国后 3-12 个月', focus: '复发预警、影像复查和生活方式管理' },
  { id: 'long', name: '长期随访期', short: '1 年+', period: '归国 1 年以上', focus: '年度筛查、慢病管理和生活质量' },
]

const patients = [
  {
    id: 'CARE-0012', caseId: 'AGH-MY-2026-0012', name: '王美玲', englishName: 'Ong Mei Ling',
    avatar: '王', portrait: '/patients/ong-mei-ling.png', diagnosis: '乳腺癌术后', stage: 'adaptation',
    day: '术后第 12 天', risk: 'normal', riskLabel: '恢复稳定', owner: 'Farah Lim',
    location: 'Johor Bahru', score: 82, taskType: 'home', taskLabel: '明日 10:00 上门家访',
    metrics: [{ label: '疼痛', value: '2/10' }, { label: '活动度', value: '78%' }, { label: '用药', value: '75%' }],
    next: '检查伤口、核对用药并完成上肢活动评估', target: 'home-visits',
  },
  {
    id: 'CARE-0007', caseId: 'AGH-MY-2026-0007', name: '黄丽珍', englishName: 'Wong Lai Zhen',
    avatar: '黄', diagnosis: '卵巢癌术后复查异常', stage: 'short',
    day: '术后第 46 天', risk: 'critical', riskLabel: '高危预警', owner: 'Farah Lim',
    location: 'Kuching', score: 58, taskType: 'alert', taskLabel: '12 小时内专家复评',
    metrics: [{ label: 'CA-125', value: '↑ 连续2次' }, { label: '症状', value: '腹胀' }, { label: '复查', value: '逾期' }],
    next: '联系患者确认症状，调取中国复查资料并升级专家', target: 'alerts',
  },
  {
    id: 'CARE-0034', name: '李秀梅', englishName: 'Lee Siew Mei',
    avatar: '李', diagnosis: '结直肠癌术后', stage: 'pre-return',
    day: '预计 3 天后返马', risk: 'medium', riskLabel: '待交接', owner: 'Aina',
    location: 'Kuala Lumpur', score: 76, taskType: 'handoff', taskLabel: '今日 16:00 出院交接',
    metrics: [{ label: '出院资料', value: '4/6' }, { label: '用药培训', value: '待完成' }, { label: '航班', value: '已确认' }],
    next: '补齐出院小结与双语用药单，确认本地首访资源',
  },
  {
    id: 'CARE-0041', name: '陈玉莲', englishName: 'Tan Geok Lian',
    avatar: '陈', diagnosis: '甲状腺癌术后', stage: 'short',
    day: '术后第 35 天', risk: 'normal', riskLabel: '康复进行中', owner: 'Mei Ting',
    location: 'Penang', score: 88, taskType: 'rehab', taskLabel: '今日康复评估',
    metrics: [{ label: '切口', value: '良好' }, { label: '声音', value: '改善中' }, { label: '运动', value: '达标' }],
    next: '完成颈肩活动评估并更新下周训练强度',
  },
  {
    id: 'CARE-0056', name: '林爱玲', englishName: 'Lim Ai Ling',
    avatar: '林', diagnosis: '肺癌术后', stage: 'stable',
    day: '术后第 168 天', risk: 'medium', riskLabel: '本月待复查', owner: 'Hui Min',
    location: 'Kuala Lumpur', score: 79, taskType: 'review', taskLabel: '本周影像复查',
    metrics: [{ label: '肺功能', value: '82%' }, { label: '步行', value: '6,420步' }, { label: '复查', value: '3天后' }],
    next: '确认CT预约与报告回传方式，复核持续咳嗽情况',
  },
  {
    id: 'CARE-0063', name: '吴淑芬', englishName: 'Goh Su Fen',
    avatar: '吴', diagnosis: '乳腺癌长期随访', stage: 'long',
    day: '术后第 428 天', risk: 'normal', riskLabel: '长期稳定', owner: 'Nurul',
    location: 'Malacca', score: 93, taskType: 'annual', taskLabel: '下月年度筛查',
    metrics: [{ label: '依从性', value: '96%' }, { label: '体重', value: '稳定' }, { label: '生活质量', value: '良好' }],
    next: '确认年度乳腺影像、骨密度及内分泌用药评估',
  },
]

const visiblePatients = computed(() => activeStage.value === 'all'
  ? patients
  : patients.filter((patient) => patient.stage === activeStage.value))

const currentStage = computed(() => stages.find((stage) => stage.id === activeStage.value))
const openAlerts = computed(() => store.state.alerts.filter((alert) => alert.status !== 'closed').length)

function stageCount(stageId) {
  return patients.filter((patient) => patient.stage === stageId).length
}

function openPatient(patient) {
  if (patient.caseId) store.setActiveCase(patient.caseId)
  if (patient.target === 'alerts') return router.push('/health-management/alerts')
  if (patient.target === 'home-visits') return router.push('/health-management/home-visits')
  message.value = `${patient.name}的${patient.taskLabel}已打开（Demo 展示）`
}

function openCarePlan(patient) {
  if (patient.caseId) {
    store.setActiveCase(patient.caseId)
    router.push('/health-management/followups')
  } else {
    message.value = `${patient.name}的阶段方案已打开（Demo 展示）`
  }
}
</script>

<template>
  <div class="health-card-workspace">
    <PageHeader eyebrow="Post-operative care command" title="术后患者健康管理工作台" subtitle="按管理阶段查看患者、风险、今日任务和下一步行动">
      <button class="secondary-button" @click="router.push('/health-management/home-visits')">家访任务</button>
      <button class="primary-button" @click="router.push('/health-management/alerts')">处理高危预警</button>
    </PageHeader>

    <div v-if="message" class="action-success">{{ message }}</div>

    <section class="care-command-strip">
      <div><span>在管患者</span><strong>{{ patients.length }}</strong><small>覆盖五个管理阶段</small></div>
      <div><span>今日需跟进</span><strong>4</strong><small>家访、复查、康复与交接</small></div>
      <div><span>高危预警</span><strong>{{ openAlerts }}</strong><small>1 位需 12 小时内响应</small></div>
      <div><span>平均恢复指数</span><strong>81</strong><small>较上周提升 4 分</small></div>
    </section>

    <section class="care-stage-switcher">
      <button :class="{ active: activeStage === 'all' }" @click="activeStage = 'all'">
        <span>ALL</span><b>全部患者</b><small>{{ patients.length }} 人</small>
      </button>
      <button v-for="(stage, index) in stages" :key="stage.id" :class="{ active: activeStage === stage.id }" @click="activeStage = stage.id">
        <span>0{{ index + 1 }}</span><b>{{ stage.name }}</b><small>{{ stage.short }} · {{ stageCount(stage.id) }} 人</small>
      </button>
    </section>

    <section class="care-roster-heading">
      <div>
        <span>{{ currentStage ? currentStage.period : 'ALL CARE STAGES' }}</span>
        <h2>{{ currentStage ? currentStage.name : '全部术后患者' }}</h2>
        <p>{{ currentStage ? currentStage.focus : '从返程准备到长期随访，按阶段组织健康管理工作。' }}</p>
      </div>
      <div class="care-legend"><span><i class="normal"></i>稳定</span><span><i class="medium"></i>关注</span><span><i class="critical"></i>高危</span></div>
    </section>

    <section class="care-patient-grid">
      <article v-for="patient in visiblePatients" :key="patient.id" :class="['care-patient-card', patient.risk]">
        <header>
          <div class="care-patient-identity">
            <img v-if="patient.portrait" :src="patient.portrait" :alt="`${patient.name}演示肖像`" />
            <span v-else>{{ patient.avatar }}</span>
            <div><small>{{ stages.find((stage) => stage.id === patient.stage)?.name }}</small><h3>{{ patient.name }}</h3><p>{{ patient.englishName }}</p></div>
          </div>
          <em>{{ patient.riskLabel }}</em>
        </header>

        <div class="care-card-diagnosis"><span>{{ patient.day }}</span><b>{{ patient.diagnosis }}</b><small>{{ patient.location }} · {{ patient.owner }}</small></div>

        <div class="care-score-line">
          <div><strong>{{ patient.score }}</strong><span>恢复指数</span></div>
          <div><i :style="{ width: `${patient.score}%` }"></i></div>
        </div>

        <div class="care-card-metrics">
          <div v-for="metric in patient.metrics" :key="metric.label"><span>{{ metric.label }}</span><b>{{ metric.value }}</b></div>
        </div>

        <section :class="['care-next-task', patient.taskType]">
          <span>{{ patient.taskType === 'alert' ? '!' : 'NEXT' }}</span>
          <div><b>{{ patient.taskLabel }}</b><p>{{ patient.next }}</p></div>
        </section>

        <footer>
          <button @click="openCarePlan(patient)">健康方案</button>
          <button class="primary" @click="openPatient(patient)">{{ patient.taskType === 'alert' ? '立即处理' : patient.taskType === 'home' ? '进入家访' : '打开患者' }}</button>
        </footer>
      </article>
    </section>

    <section v-if="!visiblePatients.length" class="empty-state">当前阶段暂无患者</section>

    <section class="care-today-queue">
      <header><div><span>TODAY'S PRIORITIES</span><h2>今日优先工作</h2></div><b>按风险与时限排序</b></header>
      <div>
        <button v-for="(item, index) in patients.slice(0, 4)" :key="item.id" @click="openPatient(item)">
          <span>{{ index + 1 }}</span><div><small>{{ item.taskLabel }}</small><b>{{ item.name }} · {{ item.diagnosis }}</b></div><em :class="item.risk">{{ item.riskLabel }}</em><i>打开 →</i>
        </button>
      </div>
    </section>
  </div>
</template>
