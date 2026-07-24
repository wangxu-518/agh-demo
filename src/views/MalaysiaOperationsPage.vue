<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import WorkflowPatientQueue from '../components/WorkflowPatientQueue.vue'
import { workflowQueueFor } from '../config/workflowQueues'
import { useDemoStore } from '../stores/demo'
import { formatDateTime } from '../utils/format'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()
const page = computed(() => route.meta.page)
const hasSelectedCase = computed(() => typeof route.query.case === 'string' && Boolean(store.state.cases[route.query.case]))
const patientQueue = computed(() => workflowQueueFor('malaysia', page.value, store.state))
const message = ref('')
const messageOk = ref(true)
const reportEditing = ref(false)
const reportSummary = ref(store.activeAiStructuring?.reportSummary || '')
const consultationDate = ref(store.activeConsultation?.date?.slice(0, 16) || '')
const contactChannels = computed(() => store.activePatient?.contactChannels || [])
const deliveryRecords = computed(() => store.activeCommunications.deliveries || [])

const pageCopy = computed(() => ({
  cases: ['Patient record', '患者全景档案', '统一查看咨询、病案、协同、行程与术后状态'],
  documents: ['Collection workspace', '资料采集工作台', '归类、查缺、核验和合并重复资料'],
  tasks: ['AI structuring', 'AI 病案整理', 'AI 先生成草稿，由马来运营人员校对确认'],
  resources: ['Screening & consultation', '初筛与面诊协同', '指派AGH牵头专家、协调面诊，并跟进专家确认的接诊团队'],
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

const confirmationCopy = computed(() => ({
  not_sent: ['尚未发送患者', 'neutral'],
  pending: ['等待患者确认', 'pending'],
  confirmed: ['患者已确认', 'done'],
}[store.activeAiStructuring.patientConfirmation.status] || ['AI 整理中', 'neutral']))

const bodyMarkers = computed(() => {
  if (store.activePatient.caseId === 'AGH-MY-2026-0012') return [
    { position: 'chest-left', tone: 'diagnosis', label: '乳腺术后', detail: '当前处于归国恢复期' },
    { position: 'shoulder-right', tone: 'rehab', label: '上肢康复', detail: '活动度持续改善' },
    { position: 'waist-left', tone: 'record', label: '健康方案', detail: '饮食与运动已制定' },
  ]
  return [
    { position: 'chest-right', tone: 'diagnosis', label: '肺腺癌 IIIB期', detail: '病理 + PET-CT 支持' },
    { position: 'head-left', tone: 'record', label: '5 份档案资料', detail: '4 类资料已核验' },
    { position: 'waist-right', tone: 'missing', label: '缺少 1 项', detail: store.activeAiStructuring.missingItems[0] },
  ]
})

function channelInitial(channel) {
  return { whatsapp: 'W', patient: 'P', email: '@' }[channel.id] || channel.label.slice(0, 1)
}

function deliveryTypeLabel(type) {
  return { report: '病案报告', care_plan: '饮食运动', followup: '随访计划' }[type] || '患者通知'
}

watch(() => store.state.activeCaseId, () => {
  reportSummary.value = store.activeAiStructuring?.reportSummary || ''
  reportEditing.value = false
  consultationDate.value = store.activeConsultation?.date?.slice(0, 16) || ''
})

function selectCase(caseId) {
  store.setActiveCase(caseId)
  router.replace({ path: route.path, query: { case: caseId } })
}

function backToQueue() {
  message.value = ''
  router.replace({ path: route.path })
}

watch(() => route.query.case, (caseId) => {
  if (typeof caseId === 'string') store.setActiveCase(caseId)
}, { immediate: true })

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

function saveReportRevision() {
  const result = store.reviseAiReport({ summary: reportSummary.value, actor: 'Aisyah Rahman' })
  show(result)
  if (result.ok) reportEditing.value = false
}

function sendForConfirmation() {
  show(store.sendAiReportToPatient({ actor: 'Aisyah Rahman' }))
}

function confirmAndSend() {
  if (store.activeAiStructuring.status === 'ready_to_confirm') {
    const confirmed = store.confirmAiStructuring({ actor: 'Aisyah Rahman' })
    if (!confirmed.ok) return show(confirmed)
  }
  sendForConfirmation()
}

function downloadReport() {
  const patient = store.activePatient
  const report = store.activeAiStructuring
  const sourceRows = store.activeDocuments.map((document) =>
    `<tr><td>${document.type}</td><td>${document.name}</td><td>${document.source}</td><td>v${document.version}</td></tr>`,
  ).join('')
  const timelineRows = report.timeline.map((item) =>
    `<tr><td>${item.date}</td><td>${item.title}</td><td>${item.source}</td></tr>`,
  ).join('')
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${report.reportTitle}</title><style>body{font-family:Arial,"Microsoft YaHei",sans-serif;color:#1d2a3d;max-width:900px;margin:40px auto;line-height:1.7}header{border-bottom:3px solid #0d7c73;padding-bottom:20px}h1{font-size:26px}small{color:#6e7b8f}section{margin-top:28px}h2{font-size:17px;color:#0d7c73}table{width:100%;border-collapse:collapse}th,td{padding:10px;border:1px solid #dfe5eb;text-align:left;font-size:13px}th{background:#f2f7f6}.notice{padding:14px;background:#fff7e8;border-left:4px solid #dd8a28}</style></head><body><header><small>AGH · STRUCTURED MEDICAL RECORD</small><h1>${report.reportTitle}</h1><p>${patient.name} · ${patient.englishName}　${patient.caseId}　报告版本 v${report.reportVersion}</p></header><section><h2>一、患者概况</h2><p>${patient.age}岁，${patient.city}，主要诊断：<b>${patient.diagnosis}</b></p></section><section><h2>二、结构化病情摘要</h2><p>${report.reportSummary}</p></section><section><h2>三、病程时间线与出处</h2><table><tr><th>时间</th><th>医疗事件</th><th>资料出处</th></tr>${timelineRows}</table></section><section><h2>四、原始资料索引</h2><table><tr><th>类型</th><th>文件</th><th>来源</th><th>版本</th></tr>${sourceRows}</table></section><section><h2>五、待补资料</h2><div class="notice">${report.missingItems.join('、') || '无'}</div></section><p><small>本报告由 AI 辅助整理并经运营人员校对，仅用于跨境医疗资料沟通，不构成临床诊断或治疗建议。</small></p></body></html>`
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${patient.name}-结构化病案-v${report.reportVersion}.html`
  anchor.click()
  URL.revokeObjectURL(url)
  show({ ok: true, message: '完整报告已下载，可打开后打印为 PDF' })
}

function bookZoomMeeting() {
  show(store.scheduleConsultation({
    actor: 'Aisyah Rahman',
    date: consultationDate.value,
    mode: 'Zoom 视频面诊',
    location: 'AGH 吉隆坡咨询中心 · 3F 远程诊室',
  }))
}

function simulateZoomTranscript() {
  show(store.completeZoomConsultation({ actor: 'Zoom Cloud Recording' }))
}

function analyzeTranscript() {
  show(store.appendConsultationMinutesToRecord({ actor: 'Aisyah Rahman' }))
}

function markJourney(item) {
  const next = item.status === 'completed' ? 'planned' : 'completed'
  show(store.updateJourneyItem({ id: item.id, status: next, actor: 'Aisyah Rahman' }))
}

function assignAghExpert(expert) {
  show(store.assignExpert({
    expert: expert.id,
    specialty: expert.specialty,
    actor: 'Aisyah Rahman',
  }))
}
</script>

<template>
  <div class="ops-page">
    <PageHeader :eyebrow="pageCopy[0]" :title="pageCopy[1]" :subtitle="pageCopy[2]">
      <button v-if="hasSelectedCase" class="secondary-button detail-queue-back" @click="backToQueue">← 返回患者队列</button>
      <button v-if="hasSelectedCase && page === 'documents'" class="primary-button" @click="addDemoDocument">上传补充资料</button>
      <button v-if="hasSelectedCase && page === 'tasks'" class="secondary-button" @click="downloadReport">下载完整报告</button>
      <button v-if="hasSelectedCase && page === 'tasks' && store.activeAiStructuring.patientConfirmation.status === 'not_sent'" class="primary-button" @click="confirmAndSend">发送给患者确认</button>
      <button v-if="hasSelectedCase && page === 'resources' && store.activeConsultation.meeting.status === 'not_booked'" class="primary-button" @click="bookZoomMeeting">创建 Zoom 会议</button>
      <button v-if="hasSelectedCase && page === 'leads'" class="primary-button" @click="show(store.completeHandoff({ note: '演示：跨境交接清单已确认' }))">确认跨境交接</button>
    </PageHeader>

    <div v-if="message" :class="messageOk ? 'action-success' : 'form-error'">{{ message }}</div>

    <WorkflowPatientQueue
      v-if="!hasSelectedCase"
      :queue="patientQueue"
      :title="`${pageCopy[1]}患者队列`"
      subtitle="按当前业务节点查看全部患者，选择后进入具体办理页面"
      action-label="进入办理"
      @select="selectCase"
    />

    <section v-if="hasSelectedCase" class="case-context-bar">
      <div class="case-context-main">
        <span class="case-avatar">{{ store.activePatient.avatar }}</span>
        <div><b>{{ store.activePatient.name }} · {{ store.activePatient.englishName }}</b><small>{{ store.activePatient.caseId }} · {{ store.activePatient.diagnosis }}</small></div>
      </div>
      <div class="case-context-meta"><span>完整度 <b>{{ store.activePatient.completeness }}%</b></span><span>负责人 <b>{{ store.activePatient.owner }}</b></span><span class="status-pill pending">{{ store.activePatient.phaseLabel }}</span></div>
      <select :value="store.activePatient.caseId" @change="selectCase($event.target.value)">
        <option v-for="patient in store.state.patients" :key="patient.caseId" :value="patient.caseId">{{ patient.name }} · {{ patient.caseId }}</option>
      </select>
    </section>

    <template v-if="hasSelectedCase && page === 'cases'">
      <section class="patient-story-layout">
        <div class="patient-visual-panel">
          <div class="patient-photo-stage">
            <img v-if="store.activePatient.portrait" :src="store.activePatient.portrait" :alt="`${store.activePatient.name}演示肖像`" />
            <div v-else class="portrait-fallback">{{ store.activePatient.avatar }}</div>
            <div v-for="marker in bodyMarkers" :key="marker.label" :class="['body-marker', marker.position, marker.tone]">
              <i></i><div><b>{{ marker.label }}</b><small>{{ marker.detail }}</small></div>
            </div>
          </div>
          <footer><span>虚构演示患者</span><b>{{ store.activePatient.name }} · {{ store.activePatient.age }}岁</b><small>{{ store.activePatient.city }} · {{ store.activePatient.phone }}</small></footer>
        </div>
        <div class="patient-story-content">
          <header>
            <div><span>PATIENT 360° PROFILE</span><h2>{{ store.activePatient.diagnosis }}</h2><p>{{ store.activePatient.diagnosisEn }}</p></div>
            <div class="completeness-orbit"><strong>{{ store.activePatient.completeness }}%</strong><small>档案完整度</small></div>
          </header>
          <section class="patient-facts">
            <div><span>病例编号</span><b>{{ store.activePatient.caseId }}</b></div>
            <div><span>当前阶段</span><b>{{ store.activePatient.phaseLabel }}</b></div>
            <div><span>语言</span><b>{{ store.activePatient.language === 'zh' ? '中文' : 'English' }}</b></div>
            <div><span>负责人</span><b>{{ store.activePatient.owner }}</b></div>
          </section>
          <section class="record-constellation">
            <header><div><h3>档案资料星图</h3><p>每一项都能追溯来源与版本</p></div><b>{{ store.activeDocuments.length }} 份资料</b></header>
            <div><article v-for="document in store.activeDocuments" :key="document.id"><span>{{ document.type.slice(0,1) }}</span><div><b>{{ document.type }}</b><small>{{ document.source }} · v{{ document.version }}</small></div></article></div>
          </section>
          <section class="missing-focus">
            <div><span>!</span><div><b>进入下一流程前仍需补齐</b><p>{{ store.activeAiStructuring.missingItems.join('、') || '资料已齐备' }}</p></div></div>
            <button class="secondary-button" @click="message='已向患者发送补资料提醒';messageOk=true">发送补充提醒</button>
          </section>
          <section class="profile-flow">
            <div v-for="(step,index) in ['资料采集','AI报告','患者确认','专家面诊','治疗行程']" :key="step" :class="{ done:index < 2, active:index === 2 }"><span>{{ index < 2 ? '✓' : index + 1 }}</span><b>{{ step }}</b></div>
          </section>
        </div>
      </section>
      <div class="grid-2 patient-detail-lower">
        <SectionCard title="最近业务动态" subtitle="所有端的动作统一回到患者时间线">
          <div class="ops-timeline"><div v-for="event in store.activeEvents.slice(0, 5)" :key="event.id"><i></i><div><b>{{ event.title }}</b><p>{{ event.detail }}</p><small>{{ event.actor }} · {{ formatDateTime(event.at) }}</small></div></div></div>
        </SectionCard>
        <SectionCard title="联系与患者触达" subtitle="已核验渠道用于报告、方案与随访消息">
          <div class="patient-contact-summary">
            <div class="contact-channel-list">
              <article v-for="channel in contactChannels" :key="channel.id" class="contact-channel-row">
                <span :class="`channel-${channel.id}`">{{ channelInitial(channel) }}</span>
                <div>
                  <b>{{ channel.label }} <em v-if="channel.preferred">首选</em></b>
                  <small>{{ channel.value }}</small>
                </div>
                <i :class="{ pending: channel.status.includes('待') }">{{ channel.status }}</i>
              </article>
            </div>
            <div class="contact-preference">
              <span>适合联系时段</span>
              <b>{{ store.activePatient.preferredContactWindow }}</b>
              <small>{{ store.activePatient.language === 'zh' ? '中文沟通' : 'English preferred' }}</small>
            </div>
            <div class="delivery-history">
              <header><div><b>最近推送</b><small>发送结果自动回写患者档案</small></div><span>{{ deliveryRecords.length }} 条</span></header>
              <article v-for="delivery in deliveryRecords.slice(0, 3)" :key="delivery.id" class="delivery-record">
                <span>{{ deliveryTypeLabel(delivery.type) }}</span>
                <div><b>{{ delivery.title }}</b><small>{{ delivery.channels.join(' · ') }} · {{ formatDateTime(delivery.sentAt) }}</small></div>
                <i>{{ delivery.status }}</i>
              </article>
              <div v-if="!deliveryRecords.length" class="empty-state">尚无推送记录，发送报告、方案或随访计划后将在此回写。</div>
            </div>
          </div>
        </SectionCard>
      </div>
    </template>

    <template v-else-if="hasSelectedCase && page === 'documents'">
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

    <template v-else-if="hasSelectedCase && page === 'tasks'">
      <section :class="['report-send-hub', confirmationCopy[1]]">
        <span class="report-send-icon">P</span>
        <div>
          <small>REPORT DELIVERY</small>
          <h2>将完整报告发送给患者核对</h2>
          <p>患者将在手机端看到病情摘要、时间线和资料出处；确认后才能进入面诊安排。</p>
        </div>
        <button v-if="store.activeAiStructuring.patientConfirmation.status === 'not_sent'" class="primary-button" @click="confirmAndSend">
          {{ store.activeAiStructuring.status === 'ready_to_confirm' ? '校对并发送患者' : '发送给患者确认' }}
        </button>
        <button v-else-if="store.activeAiStructuring.patientConfirmation.status === 'pending'" disabled>已发送 · 等待患者确认</button>
        <strong v-else>✓ 患者已确认</strong>
      </section>
      <div class="report-studio">
        <aside class="report-rail">
          <div class="report-patient-mini"><img v-if="store.activePatient.portrait" :src="store.activePatient.portrait" /><span v-else>{{ store.activePatient.avatar }}</span><div><b>{{ store.activePatient.name }}</b><small>{{ store.activePatient.caseId }}</small></div></div>
          <nav>
            <button class="active"><span>01</span><div><b>完整报告</b><small>当前 v{{ store.activeAiStructuring.reportVersion }}</small></div></button>
            <button><span>02</span><div><b>原始资料</b><small>{{ store.activeDocuments.length }} 份来源</small></div></button>
            <button><span>03</span><div><b>修改记录</b><small>{{ store.activeAiStructuring.revisions.length }} 个历史版本</small></div></button>
          </nav>
          <section>
            <h3>报告可信度</h3>
            <strong>{{ store.activeAiStructuring.confidence }}%</strong>
            <div><i :style="{width:`${store.activeAiStructuring.confidence}%`}"></i></div>
            <p>AI 完成归类和结构化，医疗事实仍需运营人员与患者共同确认。</p>
          </section>
        </aside>

        <main class="medical-report-paper">
          <header>
            <div><span>AGH · STRUCTURED MEDICAL RECORD</span><h1>{{ store.activeAiStructuring.reportTitle }}</h1><p>{{ store.activePatient.name }} · {{ store.activePatient.englishName }}　{{ store.activePatient.caseId }}</p></div>
            <div class="report-version"><b>v{{ store.activeAiStructuring.reportVersion }}</b><small>生成于 {{ store.activeAiStructuring.confirmedAt ? formatDateTime(store.activeAiStructuring.confirmedAt) : '今日' }}</small></div>
          </header>
          <section class="report-overview">
            <div><span>主要诊断</span><strong>{{ store.activePatient.diagnosis }}</strong></div>
            <div><span>资料范围</span><strong>{{ store.activeAiStructuring.sourceCount }} 份原始资料</strong></div>
            <div><span>报告状态</span><strong>{{ confirmationCopy[0] }}</strong></div>
          </section>
          <section class="report-section">
            <div class="report-section-number">01</div>
            <div><header><h2>结构化病情摘要</h2><button @click="reportEditing=!reportEditing">{{ reportEditing ? '取消修改' : '二次修改' }}</button></header>
              <textarea v-if="reportEditing" v-model="reportSummary" rows="6"></textarea>
              <p v-else class="report-narrative">{{ store.activeAiStructuring.reportSummary }}</p>
              <button v-if="reportEditing" class="primary-button" @click="saveReportRevision">保存为新版本</button>
            </div>
          </section>
          <section class="report-section">
            <div class="report-section-number">02</div>
            <div><header><h2>关键医疗字段</h2><span>字段均显示来源置信度</span></header>
              <div class="report-field-grid"><article v-for="field in store.activeAiStructuring.extractedFields" :key="field.label"><span>{{ field.label }}</span><b>{{ field.value }}</b><small>AI 置信度 {{ field.confidence }}%</small></article></div>
            </div>
          </section>
          <section class="report-section">
            <div class="report-section-number">03</div>
            <div><header><h2>病程时间线与资料出处</h2><span>时间、事件、来源三者对应</span></header>
              <div class="source-timeline"><article v-for="item in store.activeAiStructuring.timeline" :key="item.date"><time>{{ item.date }}</time><i></i><div><b>{{ item.title }}</b><span>{{ item.source }}</span></div></article></div>
            </div>
          </section>
          <section class="report-section">
            <div class="report-section-number">04</div>
            <div><header><h2>原始资料索引</h2><span>支持回到原件核对</span></header>
              <table class="report-source-table"><thead><tr><th>资料</th><th>来源</th><th>版本</th><th>状态</th></tr></thead><tbody><tr v-for="document in store.activeDocuments" :key="document.id"><td><b>{{ document.name }}</b><small>{{ document.type }}</small></td><td>{{ document.source }}</td><td>v{{ document.version }}</td><td><span>已归档</span></td></tr></tbody></table>
            </div>
          </section>
          <section v-for="appendix in store.activeAiStructuring.reportAppendices" :key="`${appendix.meetingId}-${appendix.occurredAt}`" class="report-section report-appendix">
            <div class="report-section-number">AI</div>
            <div>
              <header><h2>{{ appendix.title }}</h2><span>{{ appendix.source }}</span></header>
              <p class="report-narrative">{{ appendix.summary }}</p>
              <div class="appendix-grid">
                <article><span>专家共识</span><b v-for="item in appendix.decisions" :key="item">{{ item }}</b></article>
                <article><span>后续行动</span><b v-for="item in appendix.actions" :key="item">{{ item }}</b></article>
              </div>
            </div>
          </section>
          <section class="report-missing"><span>待补充</span><b>{{ store.activeAiStructuring.missingItems.join('、') }}</b><p>补充后可再次生成报告新版本，并重新发送患者确认。</p></section>
          <footer>本报告由 AI 辅助整理并经运营人员校对，仅用于跨境医疗资料沟通，不构成临床诊断或治疗建议。</footer>
        </main>

        <aside class="confirmation-panel">
          <header><span>CONFIRMATION GATE</span><h2>患者确认门槛</h2></header>
          <div :class="['confirmation-state', confirmationCopy[1]]"><i></i><b>{{ confirmationCopy[0] }}</b><small>报告 v{{ store.activeAiStructuring.reportVersion }}</small></div>
          <ol>
            <li :class="{done:store.activeAiStructuring.status !== 'ready_to_confirm'}"><span>1</span><div><b>运营人工校对</b><small>{{ store.activeAiStructuring.confirmedBy || '待完成' }}</small></div></li>
            <li :class="{done:store.activeAiStructuring.patientConfirmation.sentAt}"><span>2</span><div><b>发送给患者</b><small>{{ store.activeAiStructuring.patientConfirmation.sentAt ? formatDateTime(store.activeAiStructuring.patientConfirmation.sentAt) : '待发送' }}</small></div></li>
            <li :class="{done:store.activeAiStructuring.patientConfirmation.status === 'confirmed'}"><span>3</span><div><b>患者确认</b><small>{{ store.activeAiStructuring.patientConfirmation.confirmedBy || '下一流程锁定中' }}</small></div></li>
          </ol>
          <button v-if="store.activeAiStructuring.patientConfirmation.status === 'not_sent'" class="primary-button full-button" @click="confirmAndSend">
            {{ store.activeAiStructuring.status === 'ready_to_confirm' ? '校对并发送患者' : '发送给患者确认' }}
          </button>
          <button v-else-if="store.activeAiStructuring.patientConfirmation.status === 'pending'" class="primary-button full-button" disabled>等待患者确认</button>
          <div v-else class="report-unlocked">✓ 下一流程已解锁</div>
          <p>规则：没有患者确认，不能进入初筛、面诊和医院协调。</p>
          <button class="download-report-button" @click="downloadReport">↓ 下载完整报告</button>
        </aside>
      </div>
    </template>

    <template v-else-if="hasSelectedCase && page === 'resources'">
      <section class="zoom-command-center">
        <header>
          <div><span>ZOOM CONSULTATION FLOW</span><h2>专家视频面诊协调中心</h2><p>马来团队统一协调患者与专家时间、创建会议、分发邀请并归档会后纪要。</p></div>
          <div class="zoom-brand"><b>zoom</b><small>演示接口</small></div>
        </header>
        <div class="zoom-flow">
          <div :class="{done:true}"><span>1</span><b>患者确认报告</b><small>{{ store.activeAiStructuring.patientConfirmation.status === 'confirmed' ? '已确认' : '待确认' }}</small></div>
          <div :class="{done:store.activeConsultation.timeCoordination.patient.status === 'confirmed' && store.activeConsultation.timeCoordination.expert.status === 'confirmed'}"><span>2</span><b>三方确认时间</b><small>患者 + AGH牵头专家 + 马来团队</small></div>
          <div :class="{done:store.activeConsultation.meeting.status !== 'not_booked'}"><span>3</span><b>创建并分发 Zoom</b><small>{{ store.activeConsultation.meeting.status === 'not_booked' ? '待创建' : '邀请已发送' }}</small></div>
          <div :class="{done:store.activeConsultation.recording.transcriptStatus === 'ready'}"><span>4</span><b>录制与转写</b><small>{{ store.activeConsultation.recording.transcriptStatus === 'ready' ? '转写已就绪' : '会后生成' }}</small></div>
          <div :class="{done:store.activeConsultation.aiMinutes.status === 'added_to_record'}"><span>5</span><b>AI回填档案</b><small>{{ store.activeConsultation.aiMinutes.status === 'added_to_record' ? '已写入报告' : '待人工审核' }}</small></div>
        </div>
      </section>

      <div class="zoom-workspace">
        <main>
          <section class="coordination-board">
            <header><div><span>01 · TIME COORDINATION</span><h3>三方时间确认</h3></div><strong>双方已确认</strong></header>
            <div class="coordination-people">
              <article><span class="person-avatar patient">林</span><div><small>患者</small><b>{{ store.activePatient.name }}</b><em>✓ 已确认时间</em></div></article>
              <article><span class="person-avatar expert">{{ store.activeConsultation.expert.slice(0, 1) }}</span><div><small>AGH牵头专家</small><b>{{ store.activeConsultation.expert }}</b><em>✓ 已确认时间</em></div></article>
              <label><small>面诊时间</small><input v-model="consultationDate" type="datetime-local" /></label>
            </div>
          </section>

          <section class="zoom-meeting-card">
            <div class="zoom-meeting-main">
              <span class="zoom-camera">Z</span>
              <div><small>02 · ZOOM MEETING</small><h3>{{ store.activeConsultation.meeting.status === 'not_booked' ? '等待创建视频会议' : '专家远程面诊会议' }}</h3><p>{{ store.activeConsultation.expert }} · AGH内部评审</p></div>
              <button v-if="store.activeConsultation.meeting.status === 'not_booked'" class="primary-button" @click="bookZoomMeeting">创建会议并分发</button>
              <span v-else class="zoom-booked">✓ 已预定</span>
            </div>
            <div v-if="store.activeConsultation.meeting.status !== 'not_booked'" class="zoom-meeting-detail">
              <div><span>会议时间</span><b>{{ formatDateTime(store.activeConsultation.date) }}</b></div>
              <div><span>Meeting ID</span><b>{{ store.activeConsultation.meeting.meetingId }}</b></div>
              <div><span>Passcode</span><b>{{ store.activeConsultation.meeting.passcode }}</b></div>
              <div><span>录制设置</span><b>云录制 + 转写</b></div>
            </div>
            <div class="invitation-distribution">
              <article v-for="invitation in store.activeConsultation.invitations" :key="invitation.recipient">
                <span>{{ invitation.recipient === '患者' ? 'P' : 'MD' }}</span>
                <div><b>{{ invitation.recipient }}邀请</b><small>{{ invitation.channel }}</small></div>
                <em>{{ invitation.status === 'sent' ? '✓ 已分发' : '待分发' }}</em>
              </article>
            </div>
            <div class="recording-consent"><span>REC</span><p><b>录制知情同意</b>会议开始前向患者和专家展示录制及AI转写说明，双方同意后才启动。</p><em>{{ store.activeConsultation.recording.consentStatus === 'confirmed' ? '双方已同意' : '会议前确认' }}</em></div>
          </section>
        </main>

        <aside class="ai-minutes-panel">
          <header><span>03 · POST-MEETING AI</span><h3>会后纪要与档案回填</h3></header>
          <div v-if="store.activeConsultation.meeting.status === 'not_booked'" class="minutes-empty"><span>AI</span><b>等待会议创建</b><p>会议完成后，Zoom转写将进入这里。</p></div>
          <div v-else-if="store.activeConsultation.recording.transcriptStatus !== 'ready'" class="minutes-processing">
            <div class="recording-wave"><i></i><i></i><i></i><i></i><i></i></div>
            <b>Zoom 云录制已配置</b><p>演示时点击下方按钮，模拟会议结束及转写回调。</p>
            <button class="primary-button full-button" @click="simulateZoomTranscript">模拟会议结束并获取纪要</button>
          </div>
          <template v-else>
            <div class="transcript-source"><span>VTT</span><div><b>会议转写已就绪</b><small>{{ store.activeConsultation.recording.transcriptSource }}</small></div><em>✓</em></div>
            <blockquote>{{ store.activeConsultation.transcript.text }}</blockquote>
            <div v-if="store.activeConsultation.aiMinutes.status === 'added_to_record'" class="ai-analysis-result">
              <span>AI分析已归档</span><h4>{{ store.activeConsultation.aiMinutes.summary }}</h4>
              <p>报告已更新为 v{{ store.activeAiStructuring.reportVersion }}，可重新发送患者确认。</p>
            </div>
            <button v-else class="primary-button full-button" @click="analyzeTranscript">AI分析并写入患者档案</button>
          </template>
          <footer>Demo 使用模拟 Zoom 回调与种子纪要，不连接真实 Zoom、录音或大模型服务。</footer>
        </aside>
      </div>

      <div class="grid-2 consultation-support">
        <SectionCard title="面诊议程" subtitle="会议中共享患者已确认的结构化病案">
          <div class="check-list"><div v-for="item in store.activeConsultation.agenda" :key="item" class="check-item"><span class="check-mark">✓</span>{{ item }}</div></div>
        </SectionCard>
        <SectionCard title="AGH牵头专家" subtitle="马来团队只负责从公司内部专家中指派">
          <button v-for="expert in store.state.aghExperts" :key="expert.id" class="candidate-row" :class="{ selected: store.activeReview.expert === expert.name }" :disabled="store.activeReview.status !== 'unassigned'" @click="assignAghExpert(expert)">
            <span>AGH</span><div><b>{{ expert.name }}</b><small>{{ expert.specialty }} · {{ expert.role }}</small></div><strong>{{ store.activeReview.expert === expert.name ? '牵头' : expert.availability }}</strong>
          </button>
        </SectionCard>
        <SectionCard title="接诊团队决策" subtitle="医院与医生必须由专家评审或MDT会审人工确认">
          <div v-if="store.activeReview.receivingTeamDecision.status === 'confirmed'" class="team-decision-summary">
            <span>已确认</span>
            <h3>{{ store.activeReview.receivingTeamDecision.hospital }}</h3>
            <p>{{ store.activeReview.receivingTeamDecision.department }} · {{ store.activeReview.receivingTeamDecision.doctor }}</p>
            <small>{{ store.activeReview.receivingTeamDecision.source }} · {{ store.activeReview.receivingTeamDecision.decidedBy }}</small>
          </div>
          <div v-else class="empty-state">当前仅准备候选团队资料，不排序、不打分。等待 AGH 专家完成评审或会审后作出选择。</div>
        </SectionCard>
      </div>
    </template>

    <template v-else-if="hasSelectedCase">
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
