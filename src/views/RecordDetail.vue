<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PatientBanner from '../components/PatientBanner.vue'
import SectionCard from '../components/SectionCard.vue'
import Timeline from '../components/Timeline.vue'
import { systems } from '../config/systems'
import { schemaFor } from '../config/pageSchemas'
import { useDemoStore } from '../stores/demo'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()
const note = ref('')
const saved = ref(false)
const patientDraft = ref({})
const attachmentName = ref('')
const businessMessage = ref('')
const reviewDraft = ref('')
const mdtDraft = ref('')
const paymentAmount = ref(50000)
const dischargeDraft = ref({})
const system = computed(() => route.meta.system)
const source = computed(() => route.query.source || systems[system.value].nav[0][0])
const schema = computed(() => schemaFor(system.value, source.value, store.state))
const record = computed(() => schema.value?.rows?.find(row => row.id === route.params.id))
const document = computed(() => store.state.documents.find(doc => doc.id === route.params.id))
const task = computed(() => store.state.tasks.find(item => item.id === route.params.id))
const patient = computed(() => {
  const direct = store.state.patients.find(item => item.caseId === route.params.id || item.id === route.params.id)
  if (direct) return direct
  if (['cases','intake','queue','case','mdt','handoff','schedule','inpatient','billing','discharge','followups'].includes(source.value)) {
    return store.state.patients.find(item => record.value?.cells.includes(item.caseId) || record.value?.cells.includes(item.name))
  }
  return null
})
const caseId = computed(() => patient.value?.caseId || document.value?.caseId || task.value?.caseId || store.state.activeCaseId)
const currentCase = computed(() => store.caseById(caseId.value))
const kind = computed(() => {
  if (document.value) return 'document'
  if (source.value === 'leads') return 'lead'
  if (source.value === 'resources') return 'resource'
  if (task.value) return 'task'
  if (patient.value) return 'patient'
  return 'business'
})
const title = computed(() => {
  if (kind.value === 'document') return document.value.name
  if (kind.value === 'lead') return `${record.value?.cells[0]}的咨询线索`
  if (kind.value === 'resource') return record.value?.cells[0]
  if (kind.value === 'task') return task.value.title
  if (kind.value === 'patient') {
    const pageTitle = schema.value?.title || '患者'
    return `${patient.value.name} · ${pageTitle.endsWith('详情') ? pageTitle : `${pageTitle}详情`}`
  }
  return `${schema.value?.title || '业务'}详情`
})
const fieldPairs = computed(() => {
  if (record.value) return schema.value.columns.map((label, index) => [label, record.value.cells[index]])
  if (document.value) return [
    ['文件名称', document.value.name], ['资料类型', document.value.type],
    ['文件语言', document.value.language], ['文件来源', document.value.source],
    ['核验状态', document.value.medicalVerification], ['翻译状态', document.value.translationStatus],
    ['版本', `v${document.value.version}`], ['下载次数', document.value.downloadCount],
  ]
  if (task.value) return [
    ['任务编号', task.value.id], ['任务内容', task.value.title], ['负责人', task.value.owner],
    ['截止时间', task.value.dueAt], ['优先级', task.value.priority], ['状态', task.value.status],
  ]
  return []
})

watch(patient, (value) => {
  patientDraft.value = value ? {
    name: value.name, caseId: value.caseId, phaseLabel: value.phaseLabel,
    owner: value.owner, phone: value.phone, completeness: value.completeness,
  } : {}
  if (value) {
    store.setActiveCase(value.caseId)
    reviewDraft.value = store.caseById(value.caseId).review.recommendation
    mdtDraft.value = store.caseById(value.caseId).review.mdtConclusion || ''
    dischargeDraft.value = { ...store.caseById(value.caseId).treatment.dischargeChecklist }
  }
}, { immediate: true })

function runAction(action, payload = {}) {
  const result = store.performAction(action, payload, caseId.value)
  businessMessage.value = result.message
  return result
}

function saveReview() {
  runAction('finishReview', { recommendation: reviewDraft.value })
}

function saveMdt() {
  runAction('finishMdt', { conclusion: mdtDraft.value })
}

function recordPayment() {
  runAction('recordPayment', { amount: paymentAmount.value, method: 'bank_transfer' })
}

function completeDischarge() {
  runAction('completeDischarge', { checklist: { ...dischargeDraft.value }, note: '出院资料已核验并交付' })
}

function saveResult() {
  if (patient.value) store.updatePatient(patient.value.caseId, patientDraft.value)
  if (note.value.trim()) store.saveCaseNote(caseId.value, note.value)
  saved.value = true
}

function addAttachment() {
  const name = attachmentName.value.trim() || `业务附件-${new Date().toISOString().slice(0, 10)}.pdf`
  const result = store.addAttachment(caseId.value, { name })
  attachmentName.value = ''
  saved.value = result.ok
}

function exportRecord() {
  const data = {
    patient: patient.value || null,
    case: store.caseById(caseId.value),
    documents: store.state.documents.filter((item) => item.caseId === caseId.value),
    tasks: store.state.tasks.filter((item) => item.caseId === caseId.value),
    events: store.state.events.filter((item) => item.caseId === caseId.value),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = `${caseId.value}-record.json`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="record-detail-page">
    <button class="back-link" @click="router.back()">← 返回{{ schema?.title || '上一页' }}</button>
    <div class="detail-heading">
      <div><p class="eyebrow">{{ schema?.eyebrow || 'BUSINESS RECORD' }}</p><h1>{{ title }}</h1><p>业务记录 {{ route.params.id }} · 所有处理过程均保留操作痕迹</p></div>
      <div><button class="secondary-button" @click="exportRecord">导出资料</button><button class="primary-button" @click="saveResult">保存处理结果</button></div>
    </div>
    <PatientBanner v-if="kind === 'patient'" :patient="patient" />
    <div v-if="saved" class="action-success">✓ 处理结果已保存，并同步相关业务系统</div>
    <div v-if="businessMessage" class="action-success">{{ businessMessage }}</div>

    <template v-if="kind === 'patient'">
      <template v-if="source === 'case'">
        <div class="grid-2 detail-grid">
          <SectionCard title="结构化临床摘要">
            <div class="info-list">
              <div class="info-row"><span>诊断</span><b>{{ patient.diagnosis }}</b></div>
              <div class="info-row"><span>评审专家</span><b>{{ currentCase.review.expert || '待分配' }}</b></div>
              <div class="info-row"><span>评审状态</span><b>{{ currentCase.review.status }}</b></div>
              <div class="info-row"><span>意见版本</span><b>v{{ currentCase.review.version }}</b></div>
            </div>
            <div class="notice" style="margin-top:14px">{{ currentCase.review.summary || '尚未形成结构化病例摘要。' }}</div>
          </SectionCard>
          <SectionCard title="病例资料与检查缺口">
            <div v-for="doc in store.state.documents.filter(item => item.caseId === caseId && !item.voidedAt)" :key="doc.id" class="document-row">
              <div class="file-icon">PDF</div><div><b>{{ doc.name }}</b><small>{{ doc.type }} · v{{ doc.version }} · {{ doc.medicalVerification }}</small></div>
            </div>
            <div v-if="!store.state.documents.some(item => item.caseId === caseId && !item.voidedAt)" class="empty-state">暂无已归档资料</div>
          </SectionCard>
        </div>
        <SectionCard title="专家评审意见" subtitle="编辑内容只影响当前患者 Case">
          <textarea v-model="reviewDraft" class="review-editor" placeholder="填写检查建议、分期判断、治疗路径、风险及复评条件"></textarea>
          <div class="detail-actions"><button class="secondary-button" @click="runAction('requestMoreDocuments', { items: '请补充最新检查资料', owner: patient.owner })">要求补资料</button><button class="primary-button" @click="saveReview">提交并签署意见</button></div>
        </SectionCard>
      </template>

      <template v-else-if="source === 'mdt'">
        <div class="grid-2 detail-grid">
          <SectionCard title="MDT 会议信息"><div class="info-list"><div class="info-row"><span>患者</span><b>{{ patient.name }} · {{ patient.caseId }}</b></div><div class="info-row"><span>会议时间</span><b>{{ currentCase.review.meetingAt || '待安排' }}</b></div><div class="info-row"><span>牵头专家</span><b>{{ currentCase.review.expert || '待分配' }}</b></div><div class="info-row"><span>参会科室</span><b>{{ currentCase.review.specialty || '待确定' }} / 肿瘤内科 / 放疗科</b></div></div></SectionCard>
          <SectionCard title="讨论依据"><div class="notice">{{ currentCase.review.summary || patient.diagnosis }}</div><div class="info-list" style="margin-top:12px"><div class="info-row"><span>医疗文件</span><b>{{ store.state.documents.filter(item => item.caseId === caseId).length }} 份</b></div><div class="info-row"><span>专家意见版本</span><b>v{{ currentCase.review.version }}</b></div></div></SectionCard>
        </div>
        <SectionCard title="MDT 会议记录与结论"><textarea v-model="mdtDraft" class="review-editor" placeholder="记录各学科意见、争议点和最终结论"></textarea><div class="detail-actions"><button class="primary-button" @click="saveMdt">确认 MDT 结论</button></div></SectionCard>
      </template>

      <template v-else-if="source === 'handoff'">
        <SectionCard title="赴华交接清单" subtitle="当前清单仅对应本患者">
          <div class="completion-grid">
            <div><span>专家意见</span><b>{{ currentCase.review.status === 'completed' ? '已完成' : '待完成' }}</b></div>
            <div><span>医院承接</span><b>{{ currentCase.treatment.status === 'accepted' ? '已确认' : '待确认' }}</b></div>
            <div><span>费用确认</span><b>{{ currentCase.billing.patientConfirmed ? '已确认' : '待确认' }}</b></div>
            <div><span>患者行程</span><b>{{ currentCase.travel.patientConfirmed ? '已确认' : '待确认' }}</b></div>
            <div><span>医院行程</span><b>{{ currentCase.travel.hospitalConfirmed ? '已确认' : '待确认' }}</b></div>
            <div><span>交接状态</span><b>{{ currentCase.travel.status }}</b></div>
          </div>
          <div class="detail-actions"><button class="primary-button" @click="runAction('completeHandoff', { note: '当前病例赴华交接完成' })">完成该患者交接</button></div>
        </SectionCard>
      </template>

      <template v-else-if="source === 'schedule'">
        <SectionCard title="患者床位与诊疗日程" :subtitle="`${currentCase.treatment.hospital} · ${currentCase.treatment.department}`">
          <div class="schedule-board"><div v-for="item in currentCase.treatment.schedule" :key="item.id" class="schedule-day"><span>{{ item.date }}</span><b>{{ item.title }}</b><small>{{ item.status }}</small></div></div>
          <div class="completion-grid"><div><span>床位</span><b>{{ currentCase.treatment.bed }}</b></div><div><span>入院日期</span><b>{{ currentCase.treatment.admissionDate }}</b></div></div>
          <div class="detail-actions"><button class="primary-button" @click="runAction('confirmSchedule', { note: '当前患者日程已确认' })">确认该患者日程</button></div>
        </SectionCard>
      </template>

      <template v-else-if="source === 'inpatient'">
        <SectionCard title="在院治疗进度">
          <div class="inpatient-flow"><div v-for="(item,index) in currentCase.treatment.schedule" :key="item.id" :class="{ done:item.status==='done', current:item.status==='confirmed' }"><i>{{ item.status === 'done' ? '✓' : index + 1 }}</i><div><b>{{ item.title }}</b><small>{{ item.date }} · {{ item.status }}</small></div></div></div>
          <div class="detail-actions"><button class="primary-button" @click="runAction('advanceTreatment', { status: 'post_operation', scheduleId: 'operation', note: '患者进入术后恢复' })">推进至术后恢复</button></div>
        </SectionCard>
      </template>

      <template v-else-if="source === 'billing'">
        <div class="grid-2 detail-grid">
          <SectionCard title="费用预估"><div class="billing-total"><small>当前版本 v{{ currentCase.billing.estimateVersion }}</small><strong>{{ currentCase.treatment.estimatedCost }}</strong><span>已付款 {{ currentCase.billing.currency }} {{ currentCase.billing.paid.toLocaleString() }}</span></div><div class="info-list"><div v-for="item in currentCase.billing.items" :key="item.id" class="info-row"><span>{{ item.name }}</span><b>{{ item.amountMin.toLocaleString() }}–{{ item.amountMax.toLocaleString() }}</b></div></div></SectionCard>
          <SectionCard title="付款与保险"><div class="info-list"><div class="info-row"><span>患者确认</span><b>{{ currentCase.billing.patientConfirmed ? '已确认' : '待确认' }}</b></div><div class="info-row"><span>保险状态</span><b>{{ currentCase.billing.insuranceStatus }}</b></div><div class="info-row"><span>付款笔数</span><b>{{ currentCase.billing.payments.length }}</b></div><div class="info-row"><span>退款笔数</span><b>{{ currentCase.billing.refunds.length }}</b></div></div><label class="payment-input">本次付款金额<input v-model.number="paymentAmount" type="number" min="1" /></label><div class="detail-actions"><button class="primary-button" @click="recordPayment">登记该患者付款</button></div></SectionCard>
        </div>
      </template>

      <template v-else-if="source === 'discharge'">
        <SectionCard title="出院交接清单" subtitle="勾选结果只保存到当前患者 Case">
          <div class="discharge-check-grid">
            <label><input v-model="dischargeDraft.summary" type="checkbox" /> 双语出院小结</label>
            <label><input v-model="dischargeDraft.imaging" type="checkbox" /> 影像与病理资料</label>
            <label><input v-model="dischargeDraft.medication" type="checkbox" /> 带药和用药告知</label>
            <label><input v-model="dischargeDraft.followup" type="checkbox" /> 归国复查计划</label>
            <label><input v-model="dischargeDraft.patientSigned" type="checkbox" /> 患者签收确认</label>
          </div>
          <div class="detail-actions"><button class="primary-button" @click="completeDischarge">完成该患者出院交接</button></div>
        </SectionCard>
      </template>

      <template v-else-if="source === 'followups'">
        <SectionCard title="五阶段随访计划" :subtitle="`计划状态：${currentCase.followup.status}`">
          <div class="stage-list"><div v-for="(stage,index) in currentCase.followup.stages" :key="stage.id" class="stage-card" :class="{ active: stage.status === 'active' }"><div class="stage-number">{{ index + 1 }}</div><div><h4>{{ stage.name }}</h4><p>{{ stage.period }} · {{ stage.frequency }} · {{ stage.owner }}</p><div class="stage-items"><span v-for="item in stage.items" :key="item">{{ item }}</span></div></div><span class="status-pill">{{ stage.status }}</span></div></div>
          <div class="detail-actions"><button v-if="!currentCase.followup.generated" class="primary-button" @click="runAction('generateFollowup', { note: '为当前患者生成五阶段计划' })">生成该患者计划</button></div>
        </SectionCard>
      </template>

      <div class="grid-2 detail-grid">
        <SectionCard title="患者与业务信息"><div class="detail-form"><label>患者姓名<input v-model="patientDraft.name" /></label><label>Case ID<input v-model="patientDraft.caseId" readonly /></label><label>当前阶段<input v-model="patientDraft.phaseLabel" readonly /></label><label>服务负责人<input v-model="patientDraft.owner" /></label><label>联系电话<input v-model="patientDraft.phone" /></label><label>资料完整度<input v-model.number="patientDraft.completeness" type="number" min="0" max="100" /></label></div></SectionCard>
        <SectionCard title="临床摘要"><div class="info-list"><div class="info-row"><span>诊断</span><b>{{ patient.diagnosis }}</b></div><div class="info-row"><span>年龄 / 城市</span><b>{{ patient.age }}岁 · {{ patient.city }}</b></div><div class="info-row"><span>风险等级</span><b>{{ patient.risk }}</b></div><div class="info-row"><span>最近更新</span><b>{{ patient.updatedAt }}</b></div><div class="info-row"><span>数据授权</span><b>{{ store.caseById(patient.caseId).consent.status }}</b></div></div></SectionCard>
      </div>
    </template>

    <template v-else>
      <div class="grid-2 detail-grid">
        <SectionCard :title="kind === 'lead' ? '线索基本信息' : kind === 'resource' ? '资源机构信息' : kind === 'document' ? '文件与版本信息' : '业务记录信息'">
          <div class="detail-form"><label v-for="[label,value] in fieldPairs" :key="label">{{ label }}<input :value="value" /></label></div>
        </SectionCard>
        <SectionCard :title="kind === 'lead' ? '跟进与转化' : kind === 'resource' ? '合作与预约能力' : kind === 'document' ? '文件处理状态' : '处理状态'">
          <div v-if="kind === 'lead'" class="info-list"><div class="info-row"><span>最近联系</span><b>今天 10:20 · WhatsApp</b></div><div class="info-row"><span>患者需求</span><b>希望获得中国专家第二诊疗意见</b></div><div class="info-row"><span>下一步</span><b>发送双语咨询表并预约视频沟通</b></div><div class="info-row"><span>转化概率</span><b>65%</b></div></div>
          <div v-else-if="kind === 'resource'" class="info-list"><div class="info-row"><span>可预约时段</span><b>周一至周六 09:00–17:00</b></div><div class="info-row"><span>服务语言</span><b>中文 / 英文 / 马来文</b></div><div class="info-row"><span>结算方式</span><b>患者自费 / 合作月结</b></div><div class="info-row"><span>最近服务</span><b>近一周内 · 已完成</b></div></div>
          <div v-else-if="kind === 'document'" class="info-list"><div class="info-row"><span>原始文件</span><b>已归档且不可覆盖</b></div><div class="info-row"><span>中文翻译</span><b>{{ document.status === 'translated' ? '已完成' : '无需翻译' }}</b></div><div class="info-row"><span>医学核验</span><b>李雯 · 当前版本已核验</b></div><div class="info-row"><span>授权范围</span><b>运营、专家及接诊医院</b></div></div>
          <div v-else class="notice">该业务记录已进入处理流程，可在下方补充备注和附件。</div>
        </SectionCard>
      </div>
    </template>

    <div class="grid-2 detail-grid">
      <SectionCard title="处理记录与备注"><textarea v-model="note" class="review-editor" :placeholder="kind === 'lead' ? '记录沟通结果、患者关注点及下一次跟进计划' : kind === 'resource' ? '记录合作沟通、预约要求和服务反馈' : '录入业务备注、处理意见或交接要求'"></textarea><div class="detail-actions"><input v-model="attachmentName" placeholder="附件名称" /><button class="secondary-button" @click="addAttachment">添加附件</button><button class="primary-button" @click="saveResult">保存备注</button></div></SectionCard>
      <SectionCard title="操作时间线"><Timeline /></SectionCard>
    </div>
  </div>
</template>
