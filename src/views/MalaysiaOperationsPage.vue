<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import { useDemoStore } from '../stores/demo'
import { formatDateTime } from '../utils/format'

const route = useRoute()
const store = useDemoStore()
const page = computed(() => route.meta.page)
const message = ref('')
const messageOk = ref(true)
const decision = ref(store.activeConsultation?.options?.[0]?.title || '')

const pageCopy = computed(() => ({
  cases: ['Patient record', '患者全景档案', '统一查看咨询、病案、协同、行程与术后状态'],
  documents: ['Collection workspace', '资料采集工作台', '归类、查缺、核验和合并重复资料'],
  tasks: ['AI structuring', 'AI 病案整理', 'AI 先生成草稿，由马来运营人员校对确认'],
  resources: ['Screening & consultation', '初筛与面诊协同', '完成初筛、安排专家与医院，并记录患者选择'],
  leads: ['Treatment journey', '治疗行程与跨境交接', '管理赴华前、在华治疗和归国交接的每个节点'],
})[page.value])

const collectionGroups = computed(() => {
  const groups = ['病理报告', '影像资料', '检验报告', '咨询表', '授权书']
  return groups.map((type) => ({
    type,
    documents: store.activeDocuments.filter((document) => document.type === type),
    required: true,
  }))
})

const timeline = computed(() => [
  ...store.activeTreatment.schedule.map((item) => ({ ...item, owner: '医院端' })),
  ...store.activeTravel.itinerary.map((item) => ({ ...item, owner: '马来运营端' })),
].sort((a, b) => String(a.date).localeCompare(String(b.date))))

function selectCase(caseId) {
  store.setActiveCase(caseId)
  decision.value = store.activeConsultation?.options?.[0]?.title || ''
}

function show(result) {
  message.value = result.message
  messageOk.value = result.ok
}

function addDemoDocument() {
  show(store.uploadDocument({
    name: `最新肿瘤标志物-${new Date().toISOString().slice(0, 10)}.pdf`,
    type: '检验报告',
    language: 'en',
    source: '患者 WhatsApp',
  }))
}

function confirmAi() {
  show(store.confirmAiStructuring({ actor: 'Aisyah Rahman' }))
}

function scheduleConsultation() {
  show(store.scheduleConsultation({
    actor: 'Aisyah Rahman',
    mode: '视频面诊',
    location: 'AGH 吉隆坡咨询中心 · 3F 远程诊室',
  }))
}

function saveDecision() {
  show(store.recordConsultationDecision({
    actor: 'Aisyah Rahman',
    decision: decision.value,
    notes: '患者及家属已了解方案差异、预计费用与赴华准备事项。',
  }))
}

function markJourney(item) {
  const next = item.status === 'completed' ? 'planned' : 'completed'
  show(store.updateJourneyItem({ id: item.id, status: next, actor: 'Aisyah Rahman' }))
}
</script>

<template>
  <div class="ops-page">
    <PageHeader :eyebrow="pageCopy[0]" :title="pageCopy[1]" :subtitle="pageCopy[2]">
      <button v-if="page === 'documents'" class="primary-button" @click="addDemoDocument">上传补充资料</button>
      <button v-if="page === 'tasks'" class="primary-button" @click="confirmAi">人工确认病案</button>
      <button v-if="page === 'resources'" class="primary-button" @click="scheduleConsultation">确认面诊安排</button>
      <button v-if="page === 'leads'" class="primary-button" @click="show(store.completeHandoff({ note: '演示：跨境交接清单已确认' }))">确认跨境交接</button>
    </PageHeader>

    <div v-if="message" :class="messageOk ? 'action-success' : 'form-error'">{{ message }}</div>

    <section class="case-context-bar">
      <div class="case-context-main">
        <span class="case-avatar">{{ store.activePatient.avatar }}</span>
        <div><b>{{ store.activePatient.name }} · {{ store.activePatient.englishName }}</b><small>{{ store.activePatient.caseId }} · {{ store.activePatient.diagnosis }}</small></div>
      </div>
      <div class="case-context-meta"><span>完整度 <b>{{ store.activePatient.completeness }}%</b></span><span>负责人 <b>{{ store.activePatient.owner }}</b></span><span class="status-pill pending">{{ store.activePatient.phaseLabel }}</span></div>
      <select :value="store.activePatient.caseId" @change="selectCase($event.target.value)">
        <option v-for="patient in store.state.patients" :key="patient.caseId" :value="patient.caseId">{{ patient.name }} · {{ patient.caseId }}</option>
      </select>
    </section>

    <template v-if="page === 'cases'">
      <div class="ops-summary-grid">
        <SectionCard title="患者概况" subtitle="马来运营端主档">
          <div class="detail-grid">
            <div><span>城市</span><b>{{ store.activePatient.city }}</b></div>
            <div><span>首选语言</span><b>{{ store.activePatient.language === 'zh' ? '中文' : 'English' }}</b></div>
            <div><span>联系电话</span><b>{{ store.activePatient.phone }}</b></div>
            <div><span>来源</span><b>{{ store.activePatient.source }}</b></div>
          </div>
        </SectionCard>
        <SectionCard title="当前业务状态" subtitle="从咨询到健康管理的统一进度">
          <div class="flow-strip">
            <span v-for="(step,index) in ['资料采集','AI整理','初筛面诊','治疗行程','术后管理']" :key="step" :class="{ active: index < 3 }">{{ index + 1 }}<b>{{ step }}</b></span>
          </div>
        </SectionCard>
      </div>
      <div class="grid-2">
        <SectionCard title="最近业务动态" subtitle="各端动作统一回写患者时间线">
          <div class="ops-timeline"><div v-for="event in store.activeEvents.slice(0, 6)" :key="event.id"><i></i><div><b>{{ event.title }}</b><p>{{ event.detail }}</p><small>{{ event.actor }} · {{ formatDateTime(event.at) }}</small></div></div></div>
        </SectionCard>
        <SectionCard title="国内诊疗资料引用" subtitle="马来端不存储境内医疗内容">
          <div v-if="store.activeDomesticReference.chinaCaseId" class="domain-reference">
            <div><span>中国域病例号</span><b>{{ store.activeDomesticReference.chinaCaseId }}</b></div>
            <div><span>资料状态</span><b>{{ store.activeDomesticReference.availableCount }} 份 · {{ store.activeDomesticReference.treatmentStage }}</b></div>
            <p>仅保存状态和受控入口。查看正文需要用途登记、二次验证并生成审计记录。</p>
          </div>
          <div v-else class="empty-state">尚未形成中国境内诊疗资料</div>
        </SectionCard>
      </div>
    </template>

    <template v-else-if="page === 'documents'">
      <div class="collection-layout">
        <SectionCard title="采集清单" :subtitle="`${store.activeDocuments.length} 份有效资料 · 自动识别 1 组重复版本`">
          <div class="collection-list">
            <div v-for="group in collectionGroups" :key="group.type" class="collection-row">
              <span class="collection-icon">{{ group.type.slice(0, 1) }}</span>
              <div><b>{{ group.type }}</b><small v-if="group.documents.length">{{ group.documents.map(item => `${item.name} v${item.version}`).join('、') }}</small><small v-else>待患者补充</small></div>
              <span :class="['status-pill', group.documents.length ? 'done' : 'pending']">{{ group.documents.length ? '已采集' : '缺失' }}</span>
            </div>
          </div>
        </SectionCard>
        <div>
          <SectionCard title="自动整理建议" subtitle="Demo 模拟识别结果">
            <div class="merge-suggestion"><b>发现重复资料</b><p>“肺穿刺病理报告”存在 2 个版本，建议保留 v2 为主版本，v1 归入历史。</p><button class="secondary-button" @click="message='已合并为同一资料组，历史版本仍可追溯';messageOk=true">合并为资料组</button></div>
          </SectionCard>
          <SectionCard title="资料完整度">
            <div class="completion-meter"><strong>{{ store.activePatient.completeness }}%</strong><div><i :style="{ width: `${store.activePatient.completeness}%` }"></i></div><p>仍需补充：{{ store.activeAiStructuring.missingItems.join('、') }}</p></div>
          </SectionCard>
        </div>
      </div>
    </template>

    <template v-else-if="page === 'tasks'">
      <div class="ai-workbench">
        <aside>
          <h3>资料处理进度</h3>
          <div class="ai-score"><strong>{{ store.activeAiStructuring.confidence }}%</strong><span>综合置信度</span></div>
          <div class="info-list">
            <div class="info-row"><span>来源文件</span><b>{{ store.activeAiStructuring.sourceCount }}</b></div>
            <div class="info-row"><span>已归类</span><b>{{ store.activeAiStructuring.classifiedCount }}</b></div>
            <div class="info-row"><span>重复版本</span><b>{{ store.activeAiStructuring.duplicateCount }}</b></div>
          </div>
          <p class="ai-disclaimer">AI 结果仅作为运营整理草稿，必须人工核对后才能进入初筛与专家协同。</p>
        </aside>
        <main>
          <div class="workbench-heading"><div><span>结构化病案草稿</span><h2>{{ store.activePatient.diagnosis }}</h2></div><span class="status-pill pending">{{ store.activeAiStructuring.status === 'confirmed' ? '已人工确认' : '待人工确认' }}</span></div>
          <section><h3>关键字段</h3><div class="extracted-fields"><label v-for="field in store.activeAiStructuring.extractedFields" :key="field.label"><span>{{ field.label }} · 置信度 {{ field.confidence }}%</span><input :value="field.value" /></label></div></section>
          <section><h3>病情时间线</h3><div class="ops-timeline"><div v-for="item in store.activeAiStructuring.timeline" :key="item.date"><i></i><div><b>{{ item.title }}</b><p>{{ item.source }}</p><small>{{ item.date }}</small></div></div></div></section>
          <section class="missing-strip"><b>待补资料</b><span v-for="item in store.activeAiStructuring.missingItems" :key="item">{{ item }}</span></section>
        </main>
      </div>
    </template>

    <template v-else-if="page === 'resources'">
      <div class="grid-2 consultation-layout">
        <div>
          <SectionCard title="初筛结论" subtitle="马来运营端汇总，不在中国设置运营团队">
            <div class="screening-result"><span class="status-pill done">可进入专家面诊</span><h3>{{ store.activePatient.diagnosis }}</h3><p>资料完整度满足初筛，建议胸外科专家进一步评估，同时补充近 7 日肿瘤标志物。</p></div>
          </SectionCard>
          <SectionCard title="推荐专家与医院">
            <button v-for="candidate in store.activeHospitalMatching.candidates.slice(0, 2)" :key="candidate.id" class="candidate-row">
              <span>{{ candidate.rank }}</span><div><b>{{ candidate.expert }}</b><small>{{ candidate.name }} · {{ candidate.department }}</small></div><strong>{{ candidate.score }}%</strong>
            </button>
          </SectionCard>
        </div>
        <SectionCard title="面诊安排" subtitle="面诊画面将共享结构化病案">
          <div class="consultation-card">
            <span>{{ store.activeConsultation.mode }}</span>
            <h2>{{ formatDateTime(store.activeConsultation.date) }}</h2>
            <p>{{ store.activeConsultation.expert }} · {{ store.activeConsultation.hospital }}</p>
            <p>{{ store.activeConsultation.location }}</p>
          </div>
          <h4 class="subheading">面诊议程</h4>
          <div class="check-list"><div v-for="item in store.activeConsultation.agenda" :key="item" class="check-item"><span class="check-mark">✓</span>{{ item }}</div></div>
          <label class="decision-field">患者选择<select v-model="decision"><option v-for="option in store.activeConsultation.options" :key="option.id">{{ option.title }}</option></select></label>
          <button class="primary-button full-button" @click="saveDecision">记录面诊结论</button>
        </SectionCard>
      </div>
    </template>

    <template v-else>
      <div class="journey-board">
        <SectionCard title="治疗行程总览" subtitle="马来运营端统筹患者、专家、医院及跨境交接">
          <div class="journey-timeline">
            <button v-for="(item,index) in timeline" :key="item.id" :class="{ done: item.status === 'completed' }" @click="markJourney(item)">
              <span>{{ item.status === 'completed' ? '✓' : index + 1 }}</span>
              <div><small>{{ item.date }} · {{ item.owner }}</small><b>{{ item.title }}</b><em>{{ item.status }}</em></div>
              <i>更新</i>
            </button>
          </div>
        </SectionCard>
        <SectionCard title="跨境交接清单" subtitle="确认后推送患者端与医院端">
          <div class="handoff-grid">
            <label v-for="item in ['护照与签证','航班与接送','入院与床位','费用与支付','双语病案','陪诊联系人','出院资料','归国随访']" :key="item"><input type="checkbox" checked /> <span>{{ item }}</span></label>
          </div>
          <div class="notice">演示说明：本页面展示流程状态联动，不连接航司、支付、医院 HIS 或真实消息服务。</div>
        </SectionCard>
      </div>
    </template>
  </div>
</template>
