<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import WorkflowPatientQueue from '../components/WorkflowPatientQueue.vue'
import { workflowQueueFor } from '../config/workflowQueues'
import { useDemoStore } from '../stores/demo'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()
const page = computed(() => route.meta.page)
const isFollowup = computed(() => page.value === 'followups')
const isVisit = computed(() => page.value === 'home-visits')
const hasSelectedCase = computed(() => typeof route.query.case === 'string' && Boolean(store.state.cases[route.query.case]))
const patientQueue = computed(() => workflowQueueFor('health', page.value, store.state))
const activeFollowupStage = computed(() => store.activeFollowup.stages.find((stage) => stage.status === 'active'))
const dietContextCopy = computed(() => store.activePatient.caseId === 'AGH-MY-2026-0012'
  ? '结合体重、术后恢复和来曲唑治疗特点'
  : '结合治疗阶段、营养状态和近期症状')
const rehabMetricLabel = computed(() => store.activePatient.caseId === 'AGH-MY-2026-0012' ? '肩关节前屈 °' : '活动耐力评分')
const message = ref('')
const messageOk = ref(true)
const accessOpen = ref(false)
const accessPurpose = ref('制定术后健康管理方案')
const secondFactor = ref('889102')
const session = ref(null)

const emptyVisit = {
  id: '',
  checklist: [
    { id: 'vitals', label: '测量生命体征', done: false },
    { id: 'wound', label: '检查伤口与疼痛', done: false },
    { id: 'medication', label: '核对用药', done: false },
    { id: 'rehab', label: '评估康复动作', done: false },
  ],
  observations: '',
  riskLevel: 'normal',
  vitals: { bloodPressure: '', heartRate: '', oxygen: '', temperature: '', weight: '' },
  woundPain: { woundStatus: '愈合良好', redness: '无', exudate: '无', painScore: 0, notes: '' },
  medicationReview: { medication: '', takenToday: false, adherence: '良好', sideEffects: '', notes: '' },
  rehabAssessment: { shoulderFlexion: '', walkMinutes: '', movementQuality: '动作顺畅', completedSets: '', notes: '' },
  videoRecordings: [],
}
const visit = computed(() => store.activeHomeVisits[0] || emptyVisit)
const activeCapture = ref('vitals')
const observations = ref(visit.value.observations || '')
const riskLevel = ref(visit.value.riskLevel || 'normal')
const vitals = ref({ ...visit.value.vitals })
const woundPain = ref({ ...visit.value.woundPain })
const medicationReview = ref({ ...visit.value.medicationReview })
const rehabAssessment = ref({ ...visit.value.rehabAssessment })

const monthlyGoal = ref('')
const monthlyDietPrinciples = ref([])
const monthlyDiet = ref([])
const monthlySymptomAdjustments = ref([])
const monthlyExercisePrinciples = ref([])
const monthlyExerciseStages = ref([])
const monthlyExercise = ref([])
const monthlySafetyRules = ref([])
const monthlyMonth = ref('')

const recordingStatus = ref('idle')
const recordingSeconds = ref(0)
let recordingTimer = null

const recordingTime = computed(() => {
  const minutes = String(Math.floor(recordingSeconds.value / 60)).padStart(2, '0')
  const seconds = String(recordingSeconds.value % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})

const captureCopy = {
  vitals: ['生命体征采集', '记录血压、心率、血氧、体温和体重'],
  wound: ['伤口与疼痛评估', '记录伤口状态、红肿渗液和疼痛评分'],
  medication: ['用药核对', '核对药品、今日服药、依从性和副作用'],
  rehab: ['康复动作评估', '记录关节活动、步行时长和动作完成质量'],
}

function loadMonthlyPlan() {
  const monthly = store.activeHealthPlan.monthlyPlan
  monthlyGoal.value = monthly.goal
  monthlyDietPrinciples.value = JSON.parse(JSON.stringify(monthly.dietPrinciples || []))
  monthlyDiet.value = JSON.parse(JSON.stringify(monthly.diet))
  monthlySymptomAdjustments.value = JSON.parse(JSON.stringify(monthly.symptomAdjustments || []))
  monthlyExercisePrinciples.value = JSON.parse(JSON.stringify(monthly.exercisePrinciples || []))
  monthlyExerciseStages.value = JSON.parse(JSON.stringify(monthly.exerciseStages || []))
  monthlyExercise.value = JSON.parse(JSON.stringify(monthly.exercise))
  monthlySafetyRules.value = JSON.parse(JSON.stringify(monthly.safetyRules || []))
  monthlyMonth.value = monthly.month
}

function loadVisit() {
  observations.value = visit.value.observations || ''
  riskLevel.value = visit.value.riskLevel || 'normal'
  vitals.value = { ...visit.value.vitals }
  woundPain.value = { ...visit.value.woundPain }
  medicationReview.value = { ...visit.value.medicationReview }
  rehabAssessment.value = { ...visit.value.rehabAssessment }
  activeCapture.value = 'vitals'
}

function openCase(caseId) {
  store.setActiveCase(caseId)
  router.replace({ path: route.path, query: { case: caseId } })
}

function backToQueue() {
  clearInterval(recordingTimer)
  recordingTimer = null
  recordingStatus.value = 'idle'
  message.value = ''
  router.replace({ path: route.path })
}

watch(() => route.query.case, (caseId) => {
  if (typeof caseId === 'string') store.setActiveCase(caseId)
}, { immediate: true })

watch(() => store.state.activeCaseId, () => {
  loadMonthlyPlan()
  loadVisit()
}, { immediate: true })

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

function generateMonthlyPlan() {
  show(store.generateMonthlyHealthPlan({ month: monthlyMonth.value, actor: 'Farah Lim' }))
  loadMonthlyPlan()
}

function saveMonthlyPlan() {
  show(store.reviseMonthlyHealthPlan({
    goal: monthlyGoal.value,
    dietPrinciples: monthlyDietPrinciples.value,
    diet: monthlyDiet.value,
    symptomAdjustments: monthlySymptomAdjustments.value,
    exercisePrinciples: monthlyExercisePrinciples.value,
    exerciseStages: monthlyExerciseStages.value,
    exercise: monthlyExercise.value,
    safetyRules: monthlySafetyRules.value,
    actor: 'Farah Lim',
  }))
  loadMonthlyPlan()
}

function publishMonthlyPlan() {
  show(store.publishHealthPlan({ actor: 'Farah Lim' }))
}

function selectCapture(id) {
  activeCapture.value = id
}

function saveCapture(id = activeCapture.value) {
  const checklist = visit.value.checklist.map((item) => ({ ...item, done: item.id === id ? true : item.done }))
  const result = store.saveHomeVisit({
    id: visit.value.id,
    checklist,
    vitals: vitals.value,
    woundPain: woundPain.value,
    medicationReview: medicationReview.value,
    rehabAssessment: rehabAssessment.value,
    observations: observations.value,
    riskLevel: riskLevel.value,
    actor: 'Farah Lim',
  })
  show(result)
}

function startRecording() {
  recordingStatus.value = 'recording'
  recordingSeconds.value = 0
  clearInterval(recordingTimer)
  recordingTimer = setInterval(() => { recordingSeconds.value += 1 }, 1000)
  message.value = '家访视频开始录制（Demo 模拟）'
  messageOk.value = true
}

function stopRecording() {
  clearInterval(recordingTimer)
  recordingTimer = null
  recordingStatus.value = 'recorded'
  const duration = Math.max(recordingSeconds.value, 8)
  recordingSeconds.value = duration
  show(store.saveHomeVisit({
    id: visit.value.id,
    videoRecording: {
      id: `HVR-${Date.now()}`,
      name: `家访现场视频-${new Date().toISOString().slice(0, 10)}.mp4`,
      duration,
      createdAt: new Date().toISOString(),
      recordedBy: 'Farah Lim',
      status: 'ready',
    },
    actor: 'Farah Lim',
  }))
}

function submitVisit() {
  show(store.saveHomeVisit({
    id: visit.value.id,
    checklist: visit.value.checklist,
    vitals: vitals.value,
    woundPain: woundPain.value,
    medicationReview: medicationReview.value,
    rehabAssessment: rehabAssessment.value,
    observations: observations.value,
    riskLevel: riskLevel.value,
    submit: true,
    actor: 'Farah Lim',
  }))
}

onBeforeUnmount(() => clearInterval(recordingTimer))
</script>

<template>
  <div :class="['health-care-page', { 'pad-visit-mode': isVisit && hasSelectedCase }]">
    <template v-if="!hasSelectedCase">
      <PageHeader
        :eyebrow="isFollowup ? 'FOLLOW-UP PATIENT QUEUE' : 'HOME VISIT PATIENT QUEUE'"
        :title="isFollowup ? '随访计划患者队列' : '家访执行患者队列'"
        :subtitle="isFollowup ? '按康复阶段、计划状态和风险选择患者，再进入月度方案' : '按预约、执行进度和风险选择患者，再进入Pad现场采集'"
      />
      <WorkflowPatientQueue
        :queue="patientQueue"
        :title="isFollowup ? '在管随访患者' : '待执行家访患者'"
        subtitle="王美玲为全流程演示主案例，其他患者保留各自独立的业务状态"
        :action-label="isFollowup ? '打开方案' : '进入家访'"
        @select="openCase"
      />
    </template>

    <template v-else-if="isFollowup">
      <PageHeader eyebrow="AI monthly care plan" title="随访计划与月度方案" subtitle="根据患者康复阶段，由AI生成月度饮食运动方案，健康管家修改后推送患者">
        <button class="secondary-button detail-queue-back" @click="backToQueue">← 返回患者队列</button>
        <button class="secondary-button" @click="openRecords">查看方案依据</button>
        <button class="secondary-button" @click="generateMonthlyPlan">AI重新生成</button>
        <button class="primary-button" @click="publishMonthlyPlan">推送给患者</button>
      </PageHeader>
      <div v-if="message" :class="messageOk ? 'action-success' : 'form-error'">{{ message }}</div>

      <section class="followup-stage-ribbon">
        <div v-for="(stage, index) in store.activeFollowup.stages" :key="stage.id" :class="{ active: stage.status === 'active', done: stage.status === 'completed' }">
          <span>{{ stage.status === 'completed' ? '✓' : index + 1 }}</span>
          <div><b>{{ stage.name }}</b><small>{{ stage.period }}</small></div>
        </div>
      </section>

      <section class="monthly-plan-hero">
        <div class="monthly-patient">
          <img :src="store.activePatient.portrait" :alt="`${store.activePatient.name}演示肖像`" />
          <div><span>MONTHLY RECOVERY PLAN</span><h2>{{ store.activePatient.name }} · {{ monthlyMonth }} 月度方案</h2><p>{{ store.activePatient.diagnosis }} · {{ activeFollowupStage?.name || '待制定阶段' }}</p></div>
        </div>
        <div class="monthly-ai-state"><span>AI</span><div><b>AGH Care AI 已生成</b><small>{{ store.activeHealthPlan.monthlyPlan.generatedAt.slice(0, 10) }} · v{{ store.activeHealthPlan.monthlyPlan.version }}</small></div></div>
        <div class="monthly-status"><small>当前状态</small><b>{{ store.activeHealthPlan.monthlyPlan.status === 'published' ? '已推送患者' : store.activeHealthPlan.monthlyPlan.status === 'edited' ? '人工已修改' : '等待审核' }}</b></div>
      </section>

      <section class="clinical-basis-grid">
        <article v-for="item in store.activeHealthPlan.monthlyPlan.clinicalBasis" :key="item.label">
          <span>{{ item.label }}</span><b>{{ item.value }}</b><small>{{ item.note }}</small>
        </article>
      </section>

      <div class="monthly-plan-layout">
        <main class="monthly-plan-editor">
          <section class="monthly-goal">
            <header><div><span>01</span><h3>本月康复目标</h3></div><em>支持二次修改</em></header>
            <textarea v-model="monthlyGoal" rows="2"></textarea>
          </section>

          <section class="monthly-editor-section diet">
            <header><div><span>02</span><h3>饮食核心原则与定量目标</h3></div><small>{{ dietContextCopy }}</small></header>
            <div class="monthly-edit-card-grid">
              <label v-for="(item, index) in monthlyDietPrinciples" :key="index">
                <span>原则 {{ index + 1 }}</span>
                <input v-model="item.title" />
                <input v-model="item.target" />
                <textarea v-model="item.detail" rows="3"></textarea>
              </label>
            </div>
          </section>

          <section class="monthly-editor-section diet schedule">
            <header><div><span>03</span><h3>一日饮食执行表</h3></div><small>餐次、定量目标和具体食物均可修改</small></header>
            <div class="monthly-editor-table">
              <div class="editor-table-head"><span>时间/餐次</span><span>定量目标</span><span>执行建议</span></div>
              <label v-for="(item, index) in monthlyDiet" :key="index">
                <input v-model="item.title" />
                <input v-model="item.target" />
                <textarea v-model="item.note" rows="2"></textarea>
              </label>
            </div>
          </section>

          <section class="monthly-editor-section adjustments">
            <header><div><span>04</span><h3>症状与治疗相关调整</h3></div><small>出现异常时按条件调整，不自行停药</small></header>
            <div class="monthly-edit-card-grid compact">
              <label v-for="(item, index) in monthlySymptomAdjustments" :key="index">
                <span>调整 {{ index + 1 }}</span>
                <input v-model="item.title" />
                <textarea v-model="item.detail" rows="3"></textarea>
              </label>
            </div>
          </section>

          <section class="monthly-editor-section exercise">
            <header><div><span>05</span><h3>运动核心原则</h3></div><small>从术后早期逐步达到长期运动目标</small></header>
            <div class="monthly-edit-card-grid">
              <label v-for="(item, index) in monthlyExercisePrinciples" :key="index">
                <span>原则 {{ index + 1 }}</span>
                <input v-model="item.title" />
                <input v-model="item.target" />
                <textarea v-model="item.detail" rows="3"></textarea>
              </label>
            </div>
          </section>

          <section class="monthly-editor-section exercise stages">
            <header><div><span>06</span><h3>分阶段康复方案</h3></div><small>根据伤口、活动度和医疗团队确认逐级进阶</small></header>
            <div class="monthly-stage-editors">
              <label v-for="(item, index) in monthlyExerciseStages" :key="index">
                <span>阶段 {{ index + 1 }}</span>
                <input v-model="item.title" />
                <input v-model="item.condition" />
                <textarea v-model="item.plan" rows="4"></textarea>
              </label>
            </div>
          </section>

          <section class="monthly-editor-section exercise schedule">
            <header><div><span>07</span><h3>一日运动执行表</h3></div><small>按频次、时长和安全强度执行</small></header>
            <div class="monthly-editor-table">
              <div class="editor-table-head"><span>时间/运动</span><span>频次目标</span><span>安全强度</span></div>
              <label v-for="(item, index) in monthlyExercise" :key="index">
                <input v-model="item.title" />
                <input v-model="item.target" />
                <textarea v-model="item.intensity" rows="2"></textarea>
              </label>
            </div>
          </section>

          <section class="monthly-editor-section safety">
            <header><div><span>08</span><h3>暂停与预警条件</h3></div><small>用于患者自查和家访人员现场判断</small></header>
            <div class="monthly-edit-card-grid compact">
              <label v-for="(item, index) in monthlySafetyRules" :key="index">
                <span>安全 {{ index + 1 }}</span>
                <input v-model="item.title" />
                <textarea v-model="item.detail" rows="3"></textarea>
              </label>
            </div>
          </section>

          <footer class="monthly-editor-actions">
            <span>全部字段支持二次修改；保存后形成新版本，需再次审核才能推送患者。</span>
            <button class="primary-button" @click="saveMonthlyPlan">保存为新版本</button>
          </footer>
        </main>

        <aside class="monthly-plan-aside">
          <SectionCard title="AI生成依据" subtitle="来源与人工修改均留痕">
            <div class="ai-source-stack">
              <div v-for="record in store.activeChinaRecords.slice(0, 3)" :key="record.id"><span>{{ record.type.slice(0, 1) }}</span><div><b>{{ record.title }}</b><small>{{ record.occurredAt }} · 中国诊疗资料中心</small></div></div>
              <div><span>访</span><div><b>最近家访记录</b><small>疼痛 2/10 · 活动度 78%</small></div></div>
            </div>
          </SectionCard>
          <SectionCard title="版本与推送">
            <div class="monthly-version">
              <strong>v{{ store.activeHealthPlan.monthlyPlan.version }}</strong>
              <div><b>{{ store.activeHealthPlan.monthlyPlan.status === 'published' ? '患者已收到' : '待推送' }}</b><small>{{ store.activeHealthPlan.monthlyPlan.revisions.length }} 个历史版本</small></div>
            </div>
            <div v-if="store.activeHealthPlan.pushBatches.length" class="push-status"><b>已推送患者端与家访 Pad</b><small>{{ store.activeHealthPlan.approvedAt }}</small></div>
            <button class="primary-button full-button" @click="publishMonthlyPlan">审核并推送患者</button>
          </SectionCard>
          <SectionCard title="本月监测">
            <div class="monitor-list"><span v-for="item in store.activeHealthPlan.monitoring" :key="item">✓ {{ item }}</span></div>
          </SectionCard>
        </aside>
      </div>
    </template>

    <template v-else-if="isVisit">
      <header class="pad-header">
        <div><button class="secondary-button detail-queue-back" @click="backToQueue">← 返回家访队列</button><span>HOME VISIT · PAD MODE</span><h1>家访执行</h1></div>
        <div class="pad-patient"><span>{{ store.activePatient.avatar }}</span><div><b>{{ store.activePatient.name }}</b><small>{{ store.activePatient.caseId }} · {{ store.activePatient.diagnosis }}</small></div></div>
        <button class="secondary-button" @click="openRecords">查看国内资料</button>
      </header>
      <div v-if="message" :class="messageOk ? 'action-success' : 'form-error'">{{ message }}</div>

      <section class="visit-video-recorder">
        <div :class="['video-visit-preview', recordingStatus]">
          <img v-if="store.activePatient.portrait" :src="store.activePatient.portrait" :alt="`${store.activePatient.name}家访录制演示`" />
          <span v-else class="video-patient-fallback">{{ store.activePatient.avatar }}</span>
          <div class="video-grid-overlay"></div>
          <span v-if="recordingStatus === 'recording'" class="recording-indicator"><i></i> REC {{ recordingTime }}</span>
          <span v-else class="camera-ready">VIDEO VISIT RECORD</span>
          <footer><b>{{ store.activePatient.name }} · 家访现场</b><small>仅在患者知情同意后录制</small></footer>
        </div>
        <div class="video-recorder-control">
          <span>VIDEO EVIDENCE</span><h2>家访视频记录</h2><p>用于记录伤口观察、用药核对和康复动作。正式系统需取得患者授权并加密保存。</p>
          <div class="video-consent"><i>✓</i><div><b>患者已同意本次录制</b><small>用途：术后健康管理与医疗质控</small></div></div>
          <button v-if="recordingStatus !== 'recording'" class="record-button" @click="startRecording"><i></i>{{ recordingStatus === 'recorded' ? '重新录制' : '开始录制' }}</button>
          <button v-else class="stop-record-button" @click="stopRecording"><i></i>停止并保存 {{ recordingTime }}</button>
          <div v-if="visit.videoRecordings.length" class="recorded-file"><span>MP4</span><div><b>{{ visit.videoRecordings[0].name }}</b><small>{{ visit.videoRecordings[0].duration }}秒 · 已保存到患者档案</small></div><em>✓</em></div>
        </div>
      </section>

      <div class="pad-progress"><div><span :style="{ width: `${visit.checklist.filter(item => item.done).length / visit.checklist.length * 100}%` }"></span></div><b>{{ visit.checklist.filter(item => item.done).length }}/{{ visit.checklist.length }} 已完成</b></div>
      <main class="pad-visit-grid enhanced">
        <section class="pad-checklist">
          <h2>现场采集项目</h2>
          <button v-for="(item,index) in visit.checklist" :key="item.id" :class="{ done: item.done, active: activeCapture === item.id }" @click="selectCapture(item.id)">
            <span>{{ item.done ? '✓' : index + 1 }}</span><b>{{ item.label }}</b><small>{{ item.done ? '已保存采集结果' : '点击进入采集' }}</small>
          </button>
        </section>

        <section class="pad-capture-panel">
          <header><div><span>{{ activeCapture.toUpperCase() }} COLLECTION</span><h2>{{ captureCopy[activeCapture][0] }}</h2><p>{{ captureCopy[activeCapture][1] }}</p></div><em>{{ visit.checklist.find(item => item.id === activeCapture)?.done ? '已完成' : '待采集' }}</em></header>

          <div v-if="activeCapture === 'vitals'" class="capture-form">
            <div class="vitals-grid">
              <label>血压 mmHg<input v-model="vitals.bloodPressure" inputmode="numeric" /></label>
              <label>心率 bpm<input v-model="vitals.heartRate" inputmode="numeric" /></label>
              <label>血氧 %<input v-model="vitals.oxygen" inputmode="numeric" /></label>
              <label>体温 ℃<input v-model="vitals.temperature" inputmode="decimal" /></label>
              <label>体重 kg<input v-model="vitals.weight" inputmode="decimal" /></label>
            </div>
          </div>

          <div v-else-if="activeCapture === 'wound'" class="capture-form">
            <div class="capture-grid">
              <label>伤口状态<select v-model="woundPain.woundStatus"><option>愈合良好</option><option>轻微红肿</option><option>疑似感染</option></select></label>
              <label>红肿<select v-model="woundPain.redness"><option>无</option><option>轻微</option><option>明显</option></select></label>
              <label>渗液<select v-model="woundPain.exudate"><option>无</option><option>少量</option><option>较多</option></select></label>
              <label class="pain-range">疼痛评分 <b>{{ woundPain.painScore }}/10</b><input v-model.number="woundPain.painScore" type="range" min="0" max="10" /></label>
            </div>
            <label class="capture-notes">伤口与疼痛备注<textarea v-model="woundPain.notes" rows="4" placeholder="记录伤口颜色、温度、牵拉感及疼痛发生场景"></textarea></label>
            <button class="capture-photo-button">＋ 拍摄伤口照片（Demo）</button>
          </div>

          <div v-else-if="activeCapture === 'medication'" class="capture-form">
            <div class="capture-grid">
              <label>当前药物<input v-model="medicationReview.medication" /></label>
              <label>依从性<select v-model="medicationReview.adherence"><option>良好</option><option>偶尔漏服</option><option>依从性较差</option></select></label>
              <label>副作用<input v-model="medicationReview.sideEffects" /></label>
              <label class="capture-checkbox"><input v-model="medicationReview.takenToday" type="checkbox" /> 今日已按时服药</label>
            </div>
            <label class="capture-notes">用药核对备注<textarea v-model="medicationReview.notes" rows="4" placeholder="记录药盒数量、服药时间、漏服原因及处理建议"></textarea></label>
          </div>

          <div v-else class="capture-form">
            <div class="capture-grid">
              <label>{{ rehabMetricLabel }}<input v-model="rehabAssessment.shoulderFlexion" inputmode="numeric" /></label>
              <label>连续步行 分钟<input v-model="rehabAssessment.walkMinutes" inputmode="numeric" /></label>
              <label>完成组数<input v-model="rehabAssessment.completedSets" inputmode="numeric" /></label>
              <label>动作质量<select v-model="rehabAssessment.movementQuality"><option>动作顺畅</option><option>轻微受限</option><option>明显受限</option></select></label>
            </div>
            <label class="capture-notes">康复动作观察<textarea v-model="rehabAssessment.notes" rows="4" placeholder="记录动作代偿、疼痛、疲劳程度及下阶段调整建议"></textarea></label>
            <button class="capture-photo-button">▶ 录制康复动作片段（Demo）</button>
          </div>

          <button class="primary-button save-capture-button" @click="saveCapture()">保存并完成本项</button>
        </section>
      </main>

      <section class="visit-submit-panel">
        <label>综合观察记录<textarea v-model="observations" rows="4" placeholder="汇总本次家访发现、患者主诉和后续安排"></textarea></label>
        <div><span>风险分级</span><div class="risk-segments">
          <button :class="{ active: riskLevel === 'normal' }" @click="riskLevel='normal'">正常</button>
          <button :class="{ active: riskLevel === 'medium' }" @click="riskLevel='medium'">需关注</button>
          <button :class="{ active: riskLevel === 'high' }" @click="riskLevel='high'">高风险</button>
        </div></div>
        <button class="primary-button pad-submit" @click="submitVisit">提交完整家访记录</button>
      </section>
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
