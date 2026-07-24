<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import { useDemoStore } from '../stores/demo'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()
const page = computed(() => route.meta.page)
const isVisit = computed(() => page.value === 'home-visits')
const message = ref('')
const messageOk = ref(true)
const accessOpen = ref(false)
const accessPurpose = ref('制定术后健康管理方案')
const secondFactor = ref('889102')
const session = ref(null)
const observations = ref('')
const riskLevel = ref('normal')
const vitals = ref({})

if (!store.activeDomesticReference?.chinaCaseId) store.setActiveCase('AGH-MY-2026-0012')

const visit = computed(() => store.activeHomeVisits[0])
vitals.value = { ...visit.value.vitals }

function show(result) {
  message.value = result.message
  messageOk.value = result.ok
}

function openRecords() {
  const result = store.requestDomesticAccess({
    purpose: accessPurpose.value,
    secondFactor: secondFactor.value,
    actor: 'Farah Lim',
  })
  show(result)
  if (result.ok) {
    session.value = result.session
    accessOpen.value = true
  }
}

function closeRecords() {
  if (session.value) show(store.closeDomesticAccess(session.value.id, 'Farah Lim'))
  accessOpen.value = false
  session.value = null
}

function toggleCheck(id) {
  const item = visit.value.checklist.find((entry) => entry.id === id)
  item.done = !item.done
  store.saveHomeVisit({ id: visit.value.id, checklist: visit.value.checklist })
}

function submitVisit() {
  show(store.saveHomeVisit({
    id: visit.value.id,
    checklist: visit.value.checklist,
    vitals: vitals.value,
    observations: observations.value,
    riskLevel: riskLevel.value,
    submit: true,
    actor: 'Farah Lim',
  }))
}
</script>

<template>
  <div :class="['health-care-page', { 'pad-visit-mode': isVisit }]">
    <template v-if="!isVisit">
      <PageHeader eyebrow="Personalized care plan" title="个性化健康方案" subtitle="受控参考国内诊疗资料后，由健康管理团队人工制定并推送患者">
        <button class="secondary-button" @click="openRecords">受控查看国内资料</button>
        <button class="primary-button" @click="show(store.publishHealthPlan({ actor: 'Farah Lim' }))">审核并发布方案</button>
      </PageHeader>
      <div v-if="message" :class="messageOk ? 'action-success' : 'form-error'">{{ message }}</div>
      <section class="health-visual-dashboard">
        <div class="health-human-panel">
          <header><span>RECOVERY BODY MAP</span><h2>术后恢复人体图</h2><p>把方案放回患者身体上，而不是只看表格。</p></header>
          <div class="health-portrait-stage">
            <img :src="store.activePatient.portrait" :alt="`${store.activePatient.name}演示肖像`" />
            <button class="health-hotspot breast"><i></i><span><b>手术区域</b><small>伤口恢复良好</small></span></button>
            <button class="health-hotspot shoulder"><i></i><span><b>上肢活动</b><small>每日 2 组训练</small></span></button>
            <button class="health-hotspot nutrition"><i></i><span><b>营养状态</b><small>蛋白 70-80g/日</small></span></button>
          </div>
          <footer><div><b>{{ store.activePatient.name }}</b><small>{{ store.activePatient.age }}岁 · {{ store.activePatient.diagnosis }}</small></div><span class="status-pill done">恢复稳定</span></footer>
        </div>
        <div class="health-overview">
          <header><div><span>PERSONALIZED CARE</span><h2>{{ store.activePatient.name }}的健康管理方案</h2><p>根据中国手术资料与康复方案，由 Farah Lim 人工制定。</p></div><div class="care-score"><strong>82</strong><small>恢复指数</small></div></header>
          <section class="care-vitals">
            <article><span>伤口</span><b>恢复良好</b><small>无渗液、轻微牵拉感</small></article>
            <article><span>疼痛</span><b>2 / 10</b><small>活动后轻微</small></article>
            <article><span>活动度</span><b>78%</b><small>较上周 +9%</small></article>
            <article><span>营养</span><b>稳定</b><small>体重 58.4kg</small></article>
          </section>
          <button class="china-surgery-entry" @click="openRecords">
            <span>CN</span><div><small>中国诊疗资料中心</small><b>调用手术资料与康复方案</b><p>{{ store.activeDomesticReference.chinaCaseId }} · {{ store.activeDomesticReference.availableCount }} 份境内资料</p></div><i>受控打开 →</i>
          </button>
          <section class="care-next-action"><span>下一次家访</span><b>{{ visit.scheduledAt.slice(0,10) }} · {{ visit.visitor }}</b><button @click="router.push('/health-management/home-visits')">进入 Pad 模式</button></section>
        </div>
      </section>
      <div class="health-plan-layout enhanced">
        <main>
          <section class="plan-band">
            <header><div><span>01</span><h2>饮食建议</h2></div><b>根据术后恢复阶段</b></header>
            <div class="plan-items"><article v-for="item in store.activeHealthPlan.diet" :key="item.title"><h3>{{ item.title }}</h3><strong>{{ item.target }}</strong><p>{{ item.note }}</p></article></div>
          </section>
          <section class="plan-band">
            <header><div><span>02</span><h2>运动与康复</h2></div><b>循序渐进，症状优先</b></header>
            <div class="plan-items"><article v-for="item in store.activeHealthPlan.exercise" :key="item.title"><h3>{{ item.title }}</h3><strong>{{ item.target }}</strong><p>{{ item.intensity }}</p></article></div>
          </section>
          <section class="plan-band">
            <header><div><span>03</span><h2>监测与复查</h2></div><b>异常自动进入预警</b></header>
            <div class="monitor-list"><span v-for="item in store.activeHealthPlan.monitoring" :key="item">✓ {{ item }}</span></div>
          </section>
        </main>
        <aside>
          <SectionCard title="方案来源" subtitle="人工参考资料留痕">
            <div class="plan-source-list"><div v-for="record in store.activeChinaRecords.slice(0,3)" :key="record.id"><span>{{ record.type.slice(0,1) }}</span><div><b>{{ record.title }}</b><small>{{ record.occurredAt }} · {{ record.hospital }}</small></div></div></div>
          </SectionCard>
          <SectionCard title="推送状态">
            <div v-if="store.activeHealthPlan.pushBatches.length" class="push-status"><b>已推送患者端与家访 Pad</b><small>{{ store.activeHealthPlan.approvedAt }}</small></div>
            <div v-else class="empty-state">方案审核发布后显示推送结果</div>
          </SectionCard>
        </aside>
      </div>
    </template>

    <template v-else>
      <header class="pad-header">
        <div><span>HOME VISIT · PAD MODE</span><h1>家访执行</h1></div>
        <div class="pad-patient"><span>{{ store.activePatient.avatar }}</span><div><b>{{ store.activePatient.name }}</b><small>{{ store.activePatient.caseId }} · {{ store.activePatient.diagnosis }}</small></div></div>
        <button class="secondary-button" @click="openRecords">查看国内资料</button>
      </header>
      <div v-if="message" :class="messageOk ? 'action-success' : 'form-error'">{{ message }}</div>
      <div class="pad-progress"><div><span :style="{ width: `${visit.checklist.filter(item => item.done).length / visit.checklist.length * 100}%` }"></span></div><b>{{ visit.checklist.filter(item => item.done).length }}/{{ visit.checklist.length }} 已完成</b></div>
      <main class="pad-visit-grid">
        <section class="pad-checklist">
          <h2>现场检查</h2>
          <button v-for="(item,index) in visit.checklist" :key="item.id" :class="{ done: item.done }" @click="toggleCheck(item.id)">
            <span>{{ item.done ? '✓' : index + 1 }}</span><b>{{ item.label }}</b><small>{{ item.done ? '已完成' : '点击记录完成' }}</small>
          </button>
        </section>
        <section class="pad-notes">
          <h2>生命体征</h2>
          <div class="vitals-grid">
            <label>血压 mmHg<input v-model="vitals.bloodPressure" inputmode="numeric" /></label>
            <label>心率 bpm<input v-model="vitals.heartRate" inputmode="numeric" /></label>
            <label>血氧 %<input v-model="vitals.oxygen" inputmode="numeric" /></label>
            <label>体温 ℃<input v-model="vitals.temperature" inputmode="decimal" /></label>
          </div>
          <h2>观察记录</h2>
          <textarea v-model="observations" rows="7" placeholder="记录生命体征、伤口、疼痛、用药和康复动作情况"></textarea>
          <h2>风险分级</h2>
          <div class="risk-segments">
            <button :class="{ active: riskLevel === 'normal' }" @click="riskLevel='normal'">正常</button>
            <button :class="{ active: riskLevel === 'medium' }" @click="riskLevel='medium'">需关注</button>
            <button :class="{ active: riskLevel === 'high' }" @click="riskLevel='high'">高风险</button>
          </div>
          <button class="primary-button pad-submit" @click="submitVisit">提交家访记录</button>
          <p>高风险记录提交后会自动进入健康管理预警中心。</p>
        </section>
      </main>
    </template>

    <div v-if="accessOpen" class="controlled-view-overlay">
      <div class="controlled-view">
        <header><div><span>中国境内资料 · 受控查看</span><h2>{{ store.activePatient.name }} · {{ store.activeDomesticReference.chinaCaseId }}</h2></div><button class="ghost-button" @click="closeRecords">关闭会话</button></header>
        <div class="controlled-security"><span>二次验证已通过</span><span>用途：{{ accessPurpose }}</span><span>10 分钟后自动结束</span><b>{{ session?.watermark }}</b></div>
        <main><article v-for="record in store.activeChinaRecords" :key="record.id"><div><span>{{ record.type }}</span><small>{{ record.occurredAt }} · {{ record.hospital }}</small></div><h3>{{ record.title }}</h3><p>{{ record.summary }}</p><footer>{{ record.stage }} · 仅限屏幕受控查看</footer></article></main>
        <div class="controlled-watermark">{{ session?.watermark }}</div>
      </div>
    </div>
  </div>
</template>
