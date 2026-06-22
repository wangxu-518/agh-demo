<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import StatCard from '../components/StatCard.vue'
import TaskList from '../components/TaskList.vue'
import Timeline from '../components/Timeline.vue'
import { schemaFor } from '../config/pageSchemas'
import { formFor } from '../config/actionForms'
import { canPerformAction } from '../config/permissions'
import { useDemoStore } from '../stores/demo'
import { formatDateTime, formatMoney, relativeDue } from '../utils/format'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()
const activeFilter = ref('全部')
const search = ref('')
const showModal = ref(false)
const message = ref('')
const messageOk = ref(true)
const selectedTask = ref(null)
const showTaskModal = ref(false)
const actionPayload = ref({})
const taskComment = ref('')
const mdtNotes = ref('')
const selectedAction = ref('')
const activeDirectory = ref('患者基本资料')
const system = computed(() => route.meta.system)
const page = computed(() => route.meta.page)
const schema = computed(() => schemaFor(system.value, page.value, store.state))
const effectiveAction = computed(() => selectedAction.value || schema.value.primary[1])
const actionForm = computed(() => formFor(effectiveAction.value))
const extraActions = computed(() => {
  if (schema.value.type === 'case-list') return []
  if (system.value === 'expert' && page.value === 'queue') return [
    ['要求补资料', 'requestMoreDocuments'], ['拒绝评审', 'rejectReview'],
  ]
  if (system.value === 'hospital' && page.value === 'intake') return [['无法承接', 'rejectHospital']]
  if (system.value === 'hospital' && page.value === 'billing') return [['登记退款', 'recordRefund']]
  if (system.value === 'health' && page.value === 'alerts') return [['关闭预警', 'closeAlert']]
  if (system.value === 'malaysia' && page.value === 'documents') return [['撤回授权', 'revokeConsent']]
  return []
})
const allowedExtraActions = computed(() => extraActions.value.filter(([, action]) => isActionAllowed(action)))
const canRunPrimaryAction = computed(() => isActionAllowed(schema.value.primary?.[1]))
const handoffChecklist = [
  ['患者身份与联系方式', 'identity'],
  ['双语病历及影像', 'records'],
  ['专家治疗建议', 'review'],
  ['医院接诊确认', 'hospital'],
  ['费用及付款说明', 'billing'],
  ['签证航班与接送', 'travel'],
  ['带药与用药说明', 'medication'],
  ['归国复查计划', 'followup'],
]
const handoffState = computed(() => ({
  identity: true,
  records: store.activeDocuments.length >= 4,
  review: store.activeReview.status === 'completed',
  hospital: store.activeTreatment.status === 'accepted',
  billing: store.activeBilling.patientConfirmed,
  travel: store.activeTravel.patientConfirmed && store.activeTravel.hospitalConfirmed,
  medication: store.activeTreatment.dischargeChecklist.medication,
  followup: store.activeTreatment.dischargeChecklist.followup,
}))
const matchingPatients = computed(() => store.state.patients.map((patient) => {
  const currentCase = store.state.cases[patient.caseId]
  return {
    ...patient,
    reviewStatus: currentCase.review.status,
    matchingStatus: currentCase.hospitalMatching?.status || 'not_started',
    candidateCount: currentCase.hospitalMatching?.candidates.length || 0,
    selectedHospital: currentCase.hospitalMatching?.candidates.find((item) => item.id === currentCase.hospitalMatching.selectedHospitalId)?.name || '',
  }
}))
const hospitalCandidates = computed(() => store.activeHospitalMatching?.candidates || [])
const canRequestHospital = computed(() => store.activeReview.status === 'completed' && ['ready', 'rejected'].includes(store.activeHospitalMatching?.status))
const prefix = computed(() => ({ china: 'china-ops', health: 'health-management' }[system.value] || system.value))
const filteredRows = computed(() => (schema.value.rows || []).filter((row) => {
  const firstFilter = schema.value.filters?.[0]
  const matchesFilter = !row.filter || activeFilter.value === firstFilter || activeFilter.value === row.filter
  return matchesFilter && row.cells.join(' ').toLowerCase().includes(search.value.toLowerCase())
}))
const malaysiaTasks = computed(() => store.state.tasks.filter(task => task.to === system.value))
const tasksByColumn = computed(() => ({
  待处理: malaysiaTasks.value.filter(task => task.status === 'pending'),
  处理中: malaysiaTasks.value.filter(task => task.status === 'processing'),
  等待对方: malaysiaTasks.value.filter(task => task.status === 'blocked'),
  已完成: malaysiaTasks.value.filter(task => task.status === 'done'),
}))

watch(page, () => {
  activeFilter.value = schema.value.filters?.[0] || '全部'
  search.value = ''
}, { immediate: true })

function openRecord(row) {
  if (store.state.cases[row.id]) store.setActiveCase(row.id)
  router.push({ path: `/${prefix.value}/record/${row.id}`, query: { source: page.value } })
}
function startAction(action = '', defaults = {}) {
  selectedAction.value = action
  if (!isActionAllowed(effectiveAction.value)) {
    message.value = '当前角色没有执行该操作的权限'
    messageOk.value = false
    return
  }
  actionPayload.value = { ...defaults }
  if (effectiveAction.value === 'finishReview') actionPayload.value.recommendation = store.activeReview.recommendation
  if (effectiveAction.value === 'finishMdt') actionPayload.value.conclusion = mdtNotes.value
  if (effectiveAction.value === 'publishSummary') actionPayload.value.summary = store.activeReview.summary
  if (['escalateAlert', 'closeAlert'].includes(effectiveAction.value)) actionPayload.value.alertId = store.state.alerts.find((alert) => alert.status !== 'closed')?.id
  if (effectiveAction.value === 'completeDischarge') {
    actionPayload.value = { ...store.activeTreatment.dischargeChecklist }
  }
  showModal.value = true
}

function isActionAllowed(action) {
  return canPerformAction(store.state.permissions, system.value, action)
}

function selectMatchingPatient(caseId) {
  store.setActiveCase(caseId)
  message.value = ''
  messageOk.value = true
}

function requestCandidate(candidate) {
  startAction('requestHospital', {
    caseId: store.activePatient.caseId,
    hospitalId: candidate.id,
    hospital: candidate.name,
    department: candidate.department,
    doctor: candidate.expert,
  })
}

function matchingStatusLabel(status) {
  return {
    waiting_review: '待专家意见',
    ready: '可选择医院',
    requested: '等待医院响应',
    accepted: '医院已承接',
    completed: '已完成治疗',
    rejected: '需重新匹配',
  }[status] || status
}

function candidateActionLabel(candidate) {
  if (candidate.status === 'accepted') return '已确认承接'
  if (candidate.status === 'completed') return '已完成治疗'
  if (candidate.status === 'requested') return '已发送申请'
  if (candidate.status === 'rejected') return '本次申请被拒'
  return '选择并发送申请'
}
function confirmAction() {
  const payload = effectiveAction.value === 'completeDischarge'
    ? { note: actionPayload.value.note, checklist: {
      summary: !!actionPayload.value.summary,
      imaging: !!actionPayload.value.imaging,
      medication: !!actionPayload.value.medication,
      followup: !!actionPayload.value.followup,
      patientSigned: !!actionPayload.value.patientSigned,
    } }
    : actionPayload.value
  payload.__system = system.value
  const result = store.performAction(effectiveAction.value, payload)
  message.value = result.message
  messageOk.value = result.ok
  showModal.value = false
}
function beginTask(task) {
  selectedTask.value = task
  taskComment.value = ''
  showTaskModal.value = true
}
function confirmTask() {
  const result = store.startTask(selectedTask.value.id, { comment: taskComment.value })
  message.value = result.message
  messageOk.value = result.ok
  showTaskModal.value = false
}
</script>

<template>
  <div :class="{ 'patient-module-page': system === 'patient' }">
    <PageHeader :eyebrow="schema.eyebrow" :title="schema.title" :subtitle="schema.description">
      <button v-for="[label,action] in allowedExtraActions" :key="action" class="secondary-button" @click="startAction(action)">{{ label }}</button>
      <button v-if="!['comparison','case-list'].includes(schema.type) && canRunPrimaryAction" class="primary-button" @click="startAction()">{{ schema.primary[0] }}</button>
    </PageHeader>
    <div v-if="message" :class="messageOk ? 'action-success' : 'form-error'">{{ messageOk ? '✓' : '!' }} {{ message }}</div>

    <div v-if="schema.metrics" class="stats-grid compact-stats">
      <StatCard v-for="([label,value], index) in schema.metrics" :key="label" :label="label" :value="value" :icon="String(index + 1)" />
    </div>

    <template v-if="schema.type === 'table' || schema.type === 'case-list'">
      <SectionCard :title="schema.title + '列表'" subtitle="支持搜索、筛选、打开详情并继续办理" flush>
        <div class="business-toolbar">
          <div class="filter-tabs"><button v-for="filter in schema.filters" :key="filter" :class="{ active: activeFilter === filter }" @click="activeFilter = filter">{{ filter }}</button></div>
          <input v-model="search" placeholder="搜索患者、Case ID 或业务字段" />
        </div>
        <div class="table-scroll"><table class="data-table actionable-table">
          <thead><tr><th v-for="column in schema.columns" :key="column">{{ column }}</th><th>操作</th></tr></thead>
          <tbody><tr v-for="row in filteredRows" :key="row.id" @click="openRecord(row)">
            <td v-for="(cell,index) in row.cells" :key="index"><b v-if="index===0">{{ cell }}</b><span v-else>{{ cell }}</span></td>
            <td><button class="mini-button" @click.stop="openRecord(row)">{{ schema.type === 'case-list' ? '进入办理' : '查看详情' }}</button></td>
          </tr></tbody>
        </table></div>
      </SectionCard>
    </template>

    <template v-else-if="schema.type === 'files' || schema.type === 'documents'">
      <div class="grid-2 business-doc-layout">
        <SectionCard title="资料目录" subtitle="按病历目录管理原件、译文、版本与授权">
          <div class="record-tree">
            <button v-for="(group,index) in ['患者基本资料','病理与诊断','影像资料','检验报告','治疗记录','合同与授权']" :key="group" :class="{ active: activeDirectory === group }" @click="activeDirectory=group">▸ {{ group }} <span>{{ [2,4,3,5,2,3][index] }}</span></button>
          </div>
        </SectionCard>
        <SectionCard :title="system === 'china' ? '医疗文件列表' : '患者资料列表'" subtitle="点击记录查看对应对象及版本信息">
          <div v-if="system === 'china'" v-for="doc in store.state.documents" :key="doc.id" class="document-row" @click="router.push(`/${prefix}/record/${doc.id}?source=${page}`)">
            <div class="file-icon">PDF</div><div><b>{{ doc.name }}</b><small>{{ doc.type }} · {{ doc.language }} · {{ doc.source }}</small></div>
            <span class="status-pill done">{{ doc.status }}</span><button class="mini-button" @click.stop="router.push(`/${prefix}/record/${doc.id}?source=${page}`)">查看详情</button>
          </div>
          <div v-else v-for="patient in store.state.patients" :key="patient.id" class="document-row" @click="router.push(`/${prefix}/record/${patient.caseId}?source=${page}`)">
            <div class="file-icon">{{ patient.avatar }}</div><div><b>{{ patient.name }} · {{ patient.caseId }}</b><small>{{ patient.diagnosis }} · 负责人 {{ patient.owner }}</small></div>
            <span class="status-pill" :class="patient.completeness===100?'done':'pending'">{{ patient.completeness }}%</span><button class="mini-button" @click.stop="router.push(`/${prefix}/record/${patient.caseId}?source=${page}`)">查看资料</button>
          </div>
        </SectionCard>
      </div>
      <SectionCard v-if="schema.type === 'documents'" title="资料完整性与签约状态">
        <div class="completion-grid">
          <div v-for="item in [['身份信息','100%'],['癌症咨询表','100%'],['医疗资料','86%'],['服务合同','已签署'],['数据授权','已签署'],['费用确认','待确认']]" :key="item[0]"><span>{{ item[0] }}</span><b>{{ item[1] }}</b></div>
        </div>
      </SectionCard>
    </template>

    <template v-else-if="schema.type === 'tasks'">
      <div class="kanban-board">
        <SectionCard v-for="status in ['待处理','处理中','等待对方','已完成']" :key="status" :title="status">
          <div v-for="task in tasksByColumn[status]" :key="task.id" class="kanban-card">
            <small>{{ task.id }} · {{ relativeDue(task.dueAt) }}</small><b>{{ task.title }}</b><span>{{ task.owner }}</span><button class="mini-button" @click="status === '已完成' ? openRecord({id:task.id}) : beginTask(task)">{{ status === '已完成' ? '查看记录' : status === '处理中' ? '继续处理' : '开始处理' }}</button>
          </div>
          <div v-if="!tasksByColumn[status].length" class="empty-state">暂无任务</div>
        </SectionCard>
      </div>
    </template>

    <template v-else-if="schema.type === 'plan' || schema.type === 'review'">
      <div class="grid-2">
        <SectionCard title="临床摘要与评审结论">
          <div class="clinical-summary"><h3>{{ store.activePatient.diagnosis }}</h3><p>{{ store.activeReview.summary }}</p>
            <div class="info-list"><div class="info-row"><span>评审专家</span><b>{{ store.activeReview.expert || '待分配' }}</b></div><div class="info-row"><span>评审状态</span><b>{{ store.activeReview.status }}</b></div><div class="info-row"><span>MDT时间</span><b>{{ formatDateTime(store.activeReview.meetingAt) }}</b></div></div>
          </div>
        </SectionCard>
        <SectionCard title="推荐治疗路径">
          <ol class="treatment-path"><li>补充 EBUS 纵隔淋巴结取样</li><li>完成基因检测与肺功能评估</li><li>胸外科、肿瘤内科、放疗科 MDT</li><li>根据分期确定手术或综合治疗</li></ol>
          <div class="notice">{{ store.activeReview.recommendation || '专家评审中，正式意见将在完成后展示。' }}</div>
        </SectionCard>
      </div>
      <SectionCard title="医院与费用方案"><div class="completion-grid"><div><span>推荐医院</span><b>{{ store.activeTreatment.hospital || '待匹配' }}</b></div><div><span>接诊科室</span><b>{{ store.activeTreatment.department || '待确认' }}</b></div><div><span>主诊医生</span><b>{{ store.activeTreatment.doctor || '待确认' }}</b></div><div><span>费用预估</span><b>{{ store.activeTreatment.estimatedCost }}</b></div></div></SectionCard>
    </template>

    <template v-else-if="schema.type === 'journey' || schema.type === 'calendar'">
      <div class="schedule-board">
        <div v-for="item in store.activeTreatment.schedule" :key="item.id" class="schedule-day"><span>{{ item.date }}</span><b>{{ item.title }}</b><small>{{ schema.type === 'calendar' ? '国际医疗中心 · 胸外科' : '专车及双语陪同已安排' }}</small><button class="mini-button" @click="router.push(`/${prefix}/record/${item.id}?source=${page}`)">查看安排</button></div>
      </div>
      <SectionCard title="协调信息"><div class="completion-grid"><div><span>预计入院</span><b>{{ store.activeTreatment.admissionDate || '待确认' }}</b></div><div><span>床位</span><b>{{ store.activeTreatment.bed }}</b></div><div><span>接送</span><b>白云机场专车</b></div><div><span>陪同</span><b>{{ store.activeTravel.coordinator }}</b></div></div></SectionCard>
    </template>

    <template v-else-if="schema.type === 'stages'">
      <div class="stage-list">
        <div v-for="(stage,i) in store.activeFollowup.stages" :key="stage.id" class="stage-card" :class="{active:stage.status==='active'}"><div class="stage-number">{{ i+1 }}</div><div><h4>{{ stage.name }}</h4><p>{{ stage.period }} · {{ stage.frequency }} · {{ stage.owner }}</p><div class="stage-items"><span v-for="item in stage.items" :key="item">{{ item }}</span></div></div><button class="mini-button" @click="router.push(`/${prefix}/record/${stage.id}?source=${page}`)">查看计划</button></div>
      </div>
    </template>

    <template v-else-if="schema.type === 'comparison'">
      <div class="hospital-match-layout">
        <SectionCard title="待匹配患者" subtitle="先选择患者，再比较该病例专属候选医院">
          <div class="matching-patient-list">
            <button v-for="patient in matchingPatients" :key="patient.caseId" :class="{ active: patient.caseId === store.activePatient.caseId }" @click="selectMatchingPatient(patient.caseId)">
              <span class="small-avatar">{{ patient.avatar }}</span>
              <div><b>{{ patient.name }}</b><small>{{ patient.caseId }} · {{ patient.diagnosis }}</small></div>
              <em>{{ patient.selectedHospital || `${patient.candidateCount} 家候选` }}</em>
              <i>{{ matchingStatusLabel(patient.matchingStatus) }}</i>
            </button>
          </div>
        </SectionCard>
        <div class="matching-case-panel">
          <SectionCard title="当前匹配病例" subtitle="候选医院只对当前 Case 生效">
            <div class="matching-case-summary">
              <div><span class="small-avatar">{{ store.activePatient.avatar }}</span><div><h3>{{ store.activePatient.name }} · {{ store.activePatient.caseId }}</h3><p>{{ store.activePatient.diagnosis }} · 专家 {{ store.activeReview.expert || '待分配' }}</p></div></div>
              <div><span>专家意见</span><b>{{ store.activeReview.status }}</b></div>
              <div><span>匹配状态</span><b>{{ matchingStatusLabel(store.activeHospitalMatching.status) }}</b></div>
              <div><span>当前选择</span><b>{{ matchingPatients.find((item) => item.caseId === store.activePatient.caseId)?.selectedHospital || '尚未发送承接申请' }}</b></div>
            </div>
            <div v-if="store.activeReview.status !== 'completed'" class="action-warning">专家正式意见尚未签署。当前候选及评分仅供预匹配，暂不能发送承接申请。</div>
          </SectionCard>
          <div v-if="hospitalCandidates.length" class="hospital-comparison">
            <article v-for="candidate in hospitalCandidates" :key="candidate.id" :class="{ recommended: candidate.rank === 1, selected: candidate.id === store.activeHospitalMatching.selectedHospitalId }">
              <header><span>{{ candidate.recommendation }}</span><strong>{{ candidate.score }}<small>匹配分</small></strong></header>
              <h3>{{ candidate.name }}</h3>
              <p>{{ candidate.department }} · {{ candidate.expert }} · {{ candidate.internationalService }}</p>
              <div class="match-reasons"><b>匹配依据</b><span v-for="reason in candidate.matchReasons" :key="reason">✓ {{ reason }}</span></div>
              <ul>
                <li>专科能力：{{ candidate.capability.join(' / ') }}</li>
                <li>床位状态：{{ candidate.bedStatus }}</li>
                <li>预计费用：{{ formatMoney(candidate.costMin) }}–{{ formatMoney(candidate.costMax) }}</li>
                <li>响应时效：{{ candidate.responseHours }} 小时</li>
              </ul>
              <div v-if="candidate.constraints.length" class="match-constraints"><b>限制条件</b><span v-for="item in candidate.constraints" :key="item">{{ item }}</span></div>
              <footer>
                <span>{{ candidate.status }}</span>
                <button class="primary-button" :disabled="!canRequestHospital || candidate.status === 'rejected' || !isActionAllowed('requestHospital')" @click="requestCandidate(candidate)">
                  {{ candidateActionLabel(candidate) }}
                </button>
              </footer>
            </article>
          </div>
          <SectionCard v-else title="暂无候选医院">
            <div class="empty-state">该患者尚未完成专家评审或医院匹配规则尚未生成。</div>
          </SectionCard>
        </div>
      </div>
    </template>

    <template v-else-if="schema.type === 'checklist'">
      <div class="grid-2">
        <SectionCard title="交接清单" subtitle="全部完成后才能进入下一业务阶段">
          <label v-for="[label,key] in handoffChecklist" :key="key" class="real-check"><input type="checkbox" :checked="handoffState[key]" disabled /> <span>{{ label }}</span><small>{{ handoffState[key] ? '已完成' : '待处理' }}</small></label>
        </SectionCard>
        <SectionCard title="责任人与交付物"><div class="info-list"><div class="info-row"><span>中国运营</span><b>李雯 · 总协调</b></div><div class="info-row"><span>医院协调</span><b>刘敏 · 国际医疗中心</b></div><div class="info-row"><span>马来服务</span><b>Aisyah · 患者沟通</b></div><div class="info-row"><span>健康管理</span><b>Farah · 归国承接</b></div></div><Timeline /></SectionCard>
      </div>
    </template>

    <template v-else-if="schema.type === 'meeting'">
      <div class="grid-2"><SectionCard title="会议议程"><div class="meeting-agenda"><b>15:00–15:10 病例汇报</b><p>中国运营介绍病史、影像与检查缺口</p><b>15:10–15:35 多学科讨论</b><p>胸外科 / 肿瘤内科 / 放疗科发表意见</p><b>15:35–15:45 形成结论</b><p>明确补充检查、治疗路径与医院安排</p></div></SectionCard><SectionCard title="参会专家"><div v-for="person in ['张建国 · 胸外科','周敏 · 肿瘤内科','陈力 · 放疗科','李雯 · 病例协调']" :key="person" class="participant"><span>{{ person.slice(0,1) }}</span><b>{{ person }}</b><em>已确认</em></div></SectionCard></div><SectionCard title="会议记录"><textarea v-model="mdtNotes" class="review-editor" placeholder="记录各学科意见、争议点和最终结论"></textarea></SectionCard>
    </template>

    <template v-else-if="schema.type === 'timeline'">
      <div class="inpatient-flow"><div v-for="(item,i) in ['办理入院与基线评估','完成肺功能及增强CT','MDT复核治疗方案','胸腔镜手术','术后监护与康复','出院评估与交接']" :key="item" :class="{done:i<2,current:i===2}"><i>{{ i<2?'✓':i+1 }}</i><div><b>{{ item }}</b><small>{{ i<2?'已完成':i===2?'当前节点进行中':'待执行' }}</small></div><button class="mini-button" @click="router.push(`/${prefix}/record/treatment-${i}?source=${page}`)">查看记录</button></div></div>
    </template>

    <template v-else-if="schema.type === 'billing'">
      <div class="grid-2"><SectionCard title="费用汇总"><div class="billing-total"><small>当前费用预估</small><strong>{{ store.activeTreatment.estimatedCost }}</strong><span>已付款 {{ formatMoney(store.activeBilling.paid, store.activeBilling.currency) }}</span></div><div class="info-list"><div v-for="item in store.activeBilling.items" :key="item.id" class="info-row"><span>{{ item.name }}</span><b>{{ formatMoney(item.amountMin) }}–{{ formatMoney(item.amountMax) }}</b></div></div></SectionCard><SectionCard title="付款与保险"><div class="payment-step"><b>1. 费用预估确认</b><span>{{ store.activeBilling.patientConfirmed ? '患者已确认' : '待患者确认' }}</span></div><div class="payment-step"><b>2. 付款记录</b><span>{{ store.activeBilling.payments.length }} 笔</span></div><div class="payment-step"><b>3. 正式账单</b><span>出院前生成</span></div><div class="payment-step"><b>4. 保险理赔材料</b><span>{{ store.activeBilling.insuranceStatus }}</span></div></SectionCard></div>
    </template>

    <template v-else-if="schema.type === 'alerts'">
      <div class="alert-workbench"><article v-for="alert in store.state.alerts" :key="alert.id" :class="alert.severity"><header><span>{{ alert.severity==='critical'?'高危':'关注' }}</span><b>{{ alert.type }}</b><small>{{ alert.createdAt }}</small></header><h3>{{ alert.patient }} · {{ alert.caseId }}</h3><p>{{ alert.detail }}</p><footer><span>状态：{{ alert.status }}</span><button class="mini-button" @click="router.push(`/${prefix}/record/${alert.id}?source=${page}`)">进入处置</button></footer></article></div>
    </template>

    <template v-else-if="schema.type === 'quality'">
      <div class="quality-grid"><article v-for="item in [['随访按时完成率','93','目标 ≥90'],['医疗资料归档率','98','目标 ≥95'],['高危预警响应率','100','目标 100'],['患者服务满意度','96','目标 ≥92'],['跨端任务SLA','94','目标 ≥90'],['用药依从率','91','目标 ≥90']]" :key="item[0]"><span>{{ item[0] }}</span><strong>{{ item[1] }}%</strong><div><i :style="{width:item[1]+'%'}"></i></div><small>{{ item[2] }}</small></article></div><SectionCard title="本月质控问题"><table class="data-table"><thead><tr><th>问题</th><th>涉及环节</th><th>责任人</th><th>整改期限</th><th>状态</th></tr></thead><tbody><tr><td>2例随访记录逾期归档</td><td>短期康复期</td><td>Farah</td><td>明天</td><td>整改中</td></tr><tr><td>1例出院资料缺英文版</td><td>医院交接</td><td>刘敏</td><td>今天</td><td>待复核</td></tr></tbody></table></SectionCard>
    </template>

    <div v-if="showModal" class="business-modal-backdrop" @click.self="showModal=false">
      <form class="business-modal" @submit.prevent="confirmAction">
        <header><div><small>{{ schema.eyebrow }}</small><h2>{{ actionForm.title }}</h2><p>{{ store.activePatient.name }} · {{ store.activePatient.caseId }}</p></div><button type="button" @click="showModal=false">×</button></header>
        <div class="modal-fields">
          <label v-for="field in actionForm.fields" :key="field.name" :class="{ wide: field.type === 'textarea', 'check-field': field.type === 'checkbox' }">
            <template v-if="field.type === 'checkbox'">
              <input v-model="actionPayload[field.name]" type="checkbox" />
              <span>{{ field.label }}</span>
            </template>
            <template v-else>
              {{ field.label }}
              <textarea v-if="field.type === 'textarea'" v-model="actionPayload[field.name]" :required="field.required" :placeholder="field.placeholder"></textarea>
              <select v-else-if="field.type === 'select'" v-model="actionPayload[field.name]" :required="field.required">
                <option value="">请选择</option>
                <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
              </select>
              <input v-else v-model="actionPayload[field.name]" :type="field.type" :required="field.required" :placeholder="field.placeholder" :min="field.min" :readonly="field.readonly" />
            </template>
          </label>
        </div>
        <footer><button type="button" class="secondary-button" @click="showModal=false">取消</button><button class="primary-button" type="submit">确认提交</button></footer>
      </form>
    </div>
    <div v-if="showTaskModal" class="business-modal-backdrop" @click.self="showTaskModal=false">
      <form class="business-modal" @submit.prevent="confirmTask"><header><div><small>CROSS-BORDER TASK</small><h2>开始处理跨国协同任务</h2></div><button type="button" @click="showTaskModal=false">×</button></header><div class="modal-fields"><label class="wide">任务<input :value="selectedTask?.title" readonly /></label><label>任务编号<input :value="selectedTask?.id" readonly /></label><label>截止时间<input :value="formatDateTime(selectedTask?.dueAt)" readonly /></label><label class="wide">处理说明<textarea v-model="taskComment" required placeholder="填写联系患者、补充资料或回复中方团队的处理计划"></textarea></label></div><footer><button type="button" class="secondary-button" @click="showTaskModal=false">取消</button><button class="primary-button" type="submit">确认开始处理</button></footer></form>
    </div>
  </div>
</template>
