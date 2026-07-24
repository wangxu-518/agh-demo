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
const patientQueue = computed(() => workflowQueueFor('expert', page.value, store.state))
const activeTab = ref('病案摘要')
const note = ref('')
const message = ref('')
const messageOk = ref(true)
const selectedTeamId = ref('')
const teamRationale = ref('')
const canSelectReceivingTeam = computed(() => store.activeReview.status === 'completed' || Boolean(store.activeReview.mdtCompletedAt))

watch([() => route.query.case, page], ([caseId]) => {
  if (typeof caseId !== 'string' || !store.setActiveCase(caseId)) return
  activeTab.value = '病案摘要'
  note.value = page.value === 'mdt' ? (store.activeReview.mdtConclusion || '') : (store.activeReview.recommendation || '')
  selectedTeamId.value = store.activeReview.receivingTeamDecision?.hospitalId || ''
  teamRationale.value = store.activeReview.receivingTeamDecision?.rationale || ''
}, { immediate: true })

function openCase(caseId) {
  store.setActiveCase(caseId)
  router.replace({ path: route.path, query: { case: caseId } })
}

function backToQueue() {
  message.value = ''
  router.replace({ path: route.path })
}

function finish() {
  const result = page.value === 'mdt'
    ? store.performAction('finishMdt', { conclusion: note.value || '建议补充关键检查后，由多学科会审确认治疗路径。', actor: 'AGH MDT会审组', __system: 'expert' })
    : store.finishReview({ recommendation: note.value || '建议赴华完成补充检查后，由胸外科与肿瘤内科联合评估治疗路径。' })
  message.value = result.message
  messageOk.value = result.ok
}

function confirmReceivingTeam() {
  const result = store.selectReceivingTeam({
    hospitalId: selectedTeamId.value,
    rationale: teamRationale.value,
    source: page.value === 'mdt' ? 'MDT会审' : '专家评审',
    actor: page.value === 'mdt' ? 'AGH MDT会审组' : store.activeReview.expert,
  })
  message.value = result.message
  messageOk.value = result.ok
}

function openZoomMeeting() {
  message.value = store.activeConsultation.meeting.status === 'completed'
    ? 'Zoom 会议记录已打开（Demo 不加载真实录制）'
    : 'Zoom 面诊入口已打开（Demo 不跳转真实会议）'
}

</script>

<template>
  <div class="shared-case-page">
    <PageHeader eyebrow="AGH Medical Advisory Review" :title="page === 'mdt' ? 'AGH MDT 会审' : 'AGH 专家评审'" subtitle="AGH内部专家负责牵头评审，并在结论形成后人工决定医院与接诊医生">
      <button v-if="hasSelectedCase" class="secondary-button detail-queue-back" @click="backToQueue">← 返回患者队列</button>
      <button v-if="hasSelectedCase" class="secondary-button">发起补资料</button>
      <button v-if="hasSelectedCase" class="primary-button" @click="finish">{{ page === 'mdt' ? '确认会审结论' : '提交专家意见' }}</button>
    </PageHeader>
    <div v-if="message" :class="messageOk ? 'action-success' : 'form-error'">{{ message }}</div>
    <WorkflowPatientQueue
      v-if="!hasSelectedCase"
      :queue="patientQueue"
      :title="page === 'mdt' ? 'MDT会诊患者队列' : '专家病例队列'"
      :subtitle="page === 'mdt' ? '按会议状态选择病例，再进入共享病案和会诊议程' : '按评审状态选择病例，再进入结构化病案详情'"
      :action-label="page === 'mdt' ? '进入会诊' : '进入病例'"
      @select="openCase"
    />
    <template v-else>
    <section class="shared-case-banner">
      <div><span>{{ store.activePatient.avatar }}</span><div><b>{{ store.activePatient.name }} · {{ store.activePatient.englishName }}</b><small>{{ store.activePatient.caseId }} · {{ store.activePatient.diagnosis }}</small></div></div>
      <div><span>AGH牵头专家</span><b>{{ store.activeReview.expert || '待指派' }}</b></div>
      <button class="primary-button" @click="openZoomMeeting">{{ store.activeConsultation.meeting.status === 'completed' ? '查看会议记录' : '进入 Zoom 面诊' }}</button>
    </section>
    <section v-if="store.activeConsultation.meeting.status !== 'not_booked'" class="expert-zoom-strip">
      <span class="zoom-camera">Z</span>
      <div><small>ZOOM MEETING</small><b>{{ formatDateTime(store.activeConsultation.date) }}</b><p>Meeting ID {{ store.activeConsultation.meeting.meetingId }} · Passcode {{ store.activeConsultation.meeting.passcode }}</p></div>
      <div><small>邀请状态</small><b>已确认参会</b><p>云录制与AI转写将在双方同意后开启</p></div>
      <button @click="openZoomMeeting">{{ store.activeConsultation.meeting.status === 'completed' ? '查看记录' : '进入会议' }}</button>
    </section>
    <div class="shared-case-layout">
      <main>
        <div class="tabs"><button v-for="tab in ['病案摘要','时间线','原始资料','患者选择']" :key="tab" class="tab-button" :class="{ active: activeTab === tab }" @click="activeTab=tab">{{ tab }}</button></div>
        <section v-if="activeTab === '病案摘要'" class="clinical-sheet">
          <header><span>AI 整理 · 人工确认</span><b>置信度 {{ store.activeAiStructuring.confidence }}%</b></header>
          <div v-for="field in store.activeAiStructuring.extractedFields" :key="field.label"><label>{{ field.label }}</label><p>{{ field.value }}</p></div>
          <div><label>待补资料</label><p>{{ store.activeAiStructuring.missingItems.join('、') }}</p></div>
        </section>
        <div v-else-if="activeTab === '时间线'" class="medical-timeline"><div v-for="item in store.activeAiStructuring.timeline" :key="item.date"><time>{{ item.date }}</time><i></i><article><h3>{{ item.title }}</h3><p>{{ item.source }}</p></article></div></div>
        <div v-else-if="activeTab === '原始资料'" class="record-library"><article v-for="document in store.activeDocuments" :key="document.id"><span class="record-type">{{ document.type.slice(0,1) }}</span><div><small>{{ document.type }} · v{{ document.version }}</small><h3>{{ document.name }}</h3><footer><span>{{ document.source }}</span><b>{{ document.medicalVerification }}</b></footer></div></article></div>
        <section v-else class="clinical-sheet"><div><label>患者确认方案</label><p>{{ store.activeConsultation.patientDecision || '待面诊后确认' }}</p></div><div><label>运营备注</label><p>{{ store.activeConsultation.notes || '暂无' }}</p></div></section>
      </main>
      <aside>
        <SectionCard v-if="store.activeConsultation.recording.transcriptStatus === 'ready'" title="会后 AI 纪要" subtitle="来源为 Zoom 会议转写">
          <div class="expert-minutes-summary">
            <span>{{ store.activeConsultation.aiMinutes.status === 'added_to_record' ? '已写入患者档案' : '等待马来团队审核' }}</span>
            <p>{{ store.activeConsultation.aiMinutes.summary || store.activeConsultation.transcript.text }}</p>
          </div>
        </SectionCard>
        <SectionCard :title="page === 'mdt' ? 'MDT会审结论' : '专家意见'" subtitle="此处只形成医学评审结论，不自动匹配医院">
          <textarea v-model="note" rows="9" :placeholder="page === 'mdt' ? '记录各专家意见、争议点和最终会审结论' : '输入评审意见、建议检查和治疗路径'"></textarea>
          <button class="primary-button full-button" @click="finish">{{ page === 'mdt' ? '确认会审结论' : '签署并提交' }}</button>
        </SectionCard>
        <SectionCard title="面诊议程"><div class="check-list"><div v-for="item in store.activeConsultation.agenda" :key="item" class="check-item"><span class="check-mark">✓</span>{{ item }}</div></div></SectionCard>
      </aside>
    </div>
    <SectionCard title="医院与接诊医生决策" subtitle="候选团队无自动排序和评分，必须由AGH专家评审或MDT会审后人工选择">
      <div class="receiving-team-workspace">
        <div class="receiving-team-options">
          <label v-for="candidate in store.activeHospitalMatching.candidates" :key="candidate.id" :class="['receiving-team-choice', { selected: selectedTeamId === candidate.id, rejected: candidate.status === 'rejected' }]">
            <input v-model="selectedTeamId" type="radio" name="receiving-team" :value="candidate.id" :disabled="!canSelectReceivingTeam || candidate.status === 'rejected'" />
            <span>H</span>
            <div>
              <b>{{ candidate.name }}</b>
              <strong>{{ candidate.department }} · {{ candidate.doctor }}</strong>
              <small>{{ candidate.capability.join(' / ') }}</small>
              <em v-if="candidate.constraints.length">{{ candidate.constraints.join('；') }}</em>
            </div>
            <i>{{ candidate.status === 'rejected' ? '已拒绝' : selectedTeamId === candidate.id ? '当前选择' : '待专家选择' }}</i>
          </label>
        </div>
        <div class="receiving-team-decision">
          <span>DECISION RECORD</span>
          <h3>{{ canSelectReceivingTeam ? '记录专业选择依据' : '评审结论尚未形成' }}</h3>
          <p v-if="!canSelectReceivingTeam">完成专家评审或MDT会审后，才可确认由哪个医院、科室和医生负责。</p>
          <textarea v-else v-model="teamRationale" rows="5" placeholder="结合病种、治疗路径、医院能力和医生经验，说明选择依据"></textarea>
          <button class="primary-button full-button" :disabled="!canSelectReceivingTeam" @click="confirmReceivingTeam">确认接诊团队</button>
          <small v-if="store.activeReview.receivingTeamDecision.status === 'confirmed'">已由 {{ store.activeReview.receivingTeamDecision.decidedBy }} 通过{{ store.activeReview.receivingTeamDecision.source }}确认</small>
        </div>
      </div>
    </SectionCard>
    </template>
  </div>
</template>
