<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDemoStore } from '../stores/demo'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()
const page = computed(() => route.meta.page)
const message = ref('')
const titles = {
  records: ['医疗资料','安全查看、上传与管理您的医疗文件'],
  plan: ['治疗方案','专家意见、医院安排与费用说明'],
  travel: ['赴华行程','从出发到入院的每一步安排'],
  followup: ['归国随访','五阶段健康管理与复查提醒'],
}
function act(action) {
  const defaults = {
    uploadDocument: { name: `患者补充资料-${new Date().toISOString().slice(0, 10)}.pdf`, type: '检验报告', language: 'zh', source: '患者上传' },
    confirmMedication: { note: '患者确认按计划服药，暂无明显不适' },
    completeFollowup: { note: '患者完成本周健康问卷与电话随访' },
  }
  message.value = store.performAction(action, defaults[action] || {}).message
}

function contactCoordinator() {
  message.value = store.sendMessage(store.activePatient.caseId, {
    channel: 'in_app', from: 'patient', to: 'malaysia', actor: store.activePatient.name,
    text: '患者请求行程协调员联系，需确认航班或接送安排。',
  }).message
}

function confirmMedicalReport() {
  message.value = store.confirmAiReportByPatient({
    actor: store.activePatient.name,
    note: '本人已核对基本信息、病程时间和资料出处，确认无误。',
  }).message
}

function openZoomMeeting() {
  message.value = 'Zoom 面诊入口已打开（Demo 不跳转真实会议）'
}
</script>

<template>
  <div class="patient-mobile-page">
    <header class="patient-page-heading"><p>{{ titles[page][1] }}</p><h1>{{ titles[page][0] }}</h1></header>
    <div v-if="message" class="patient-toast">✓ {{ message }}</div>

    <template v-if="page === 'records'">
      <section class="patient-summary-card"><div><small>资料完整度</small><strong>{{ store.activePatient.completeness }}%</strong></div><div class="patient-ring"><span>{{ store.activeDocuments.length }}</span><small>份文件</small></div></section>
      <section v-if="store.activeAiStructuring.patientConfirmation.status === 'pending'" class="patient-report-confirm">
        <header><span>待确认</span><small>报告 v{{ store.activeAiStructuring.reportVersion }}</small></header>
        <h2>{{ store.activeAiStructuring.reportTitle }}</h2>
        <p>{{ store.activeAiStructuring.reportSummary }}</p>
        <div><span v-for="item in store.activeAiStructuring.timeline" :key="item.date"><b>{{ item.date }}</b>{{ item.title }} · {{ item.source }}</span></div>
        <button @click="confirmMedicalReport">确认资料准确无误</button>
      </section>
      <section v-else-if="store.activeAiStructuring.patientConfirmation.status === 'confirmed'" class="patient-report-confirm confirmed">
        <header><span>已确认</span><small>报告 v{{ store.activeAiStructuring.reportVersion }}</small></header>
        <h2>结构化病案已确认</h2><p>运营团队可以使用这份报告进入初筛与专家面诊流程。</p>
      </section>
      <section class="patient-mobile-section"><div class="section-heading"><h2>我的文件</h2><button @click="act('uploadDocument')">＋ 上传</button></div>
        <button v-for="doc in store.activeDocuments" :key="doc.id" class="patient-file-card" @click="router.push(`/patient/detail/${doc.id}?type=record`)">
          <span class="patient-file-icon">PDF</span><div><b>{{ doc.name }}</b><small>{{ doc.type }} · v{{ doc.version }}</small><em>{{ doc.status === 'verified' ? '已核验' : '已翻译' }}</em></div><i>›</i>
        </button>
      </section>
      <section class="patient-help-card"><b>资料安全吗？</b><p>文件采用角色授权访问，所有查看和修改都会留下记录。</p></section>
    </template>

    <template v-else-if="page === 'plan'">
      <section v-if="store.activeConsultation.meeting.status !== 'not_booked'" class="patient-zoom-invite">
        <header><span>Z</span><div><small>ZOOM EXPERT CONSULTATION</small><h2>专家视频面诊已安排</h2></div><em>已确认</em></header>
        <div><span>面诊时间</span><b>{{ new Date(store.activeConsultation.date).toLocaleString('zh-CN', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) }}</b></div>
        <div><span>专家</span><b>{{ store.activeConsultation.expert }}</b></div>
        <div><span>Meeting ID</span><b>{{ store.activeConsultation.meeting.meetingId }}</b></div>
        <p>进入会议前将再次提示录制与AI转写说明，您同意后才会开始录制。</p>
        <button @click="openZoomMeeting">进入 Zoom 面诊</button>
      </section>
      <section class="patient-plan-status"><span>{{ store.activeReview.status === 'completed' ? '专家意见已完成' : '专家评审中' }}</span><h2>{{ store.activePatient.diagnosis }}</h2><p>AGH牵头专家：{{ store.activeReview.expert || '待指派' }}</p><div><i></i><b>预计 {{ store.activeReview.meetingAt || '待安排' }} 完成</b></div></section>
      <section class="patient-mobile-section">
        <div class="section-heading"><h2>推荐治疗路径</h2><button>专家建议</button></div>
        <div class="patient-path patient-plan-path">
          <div
            v-for="(step,i) in [
              ['补充关键检查', '完善分子检测、肺功能和影像复核', '进行中'],
              ['多学科专家会诊', '胸外科、肿瘤内科和放疗科联合评估', '待安排'],
              ['确认治疗方案', '形成手术/综合治疗路径与费用预估', '待确认'],
              ['医院接诊与入院', '专家确认接诊团队后完成赴华交接', '待启动'],
            ]"
            :key="step[0]"
            :class="{ current: i === 0, upcoming: i > 0 }"
          >
            <span>{{ i+1 }}</span>
            <div>
              <b>{{ step[0] }}</b>
              <small>{{ step[1] }}</small>
              <em>{{ step[2] }}</em>
            </div>
          </div>
        </div>
      </section>
      <section class="patient-mobile-section"><h2>医院方案</h2><button class="patient-hospital-card" @click="router.push('/patient/detail/hospital-plan?type=plan')"><span>H</span><div><b>{{ store.activeTreatment.hospital || '待专家确认医院' }}</b><small>{{ store.activeTreatment.department || '待确认科室' }} · {{ store.activeTreatment.doctor || '待确认医生' }}</small><em>费用预估 {{ store.activeTreatment.estimatedCost }}</em></div><i>›</i></button></section>
      <button class="patient-primary-action" @click="act('confirmPlan')">确认已阅读方案</button>
    </template>

    <template v-else-if="page === 'travel'">
      <section class="patient-trip-card"><small>预计赴华日期</small><h2>{{ store.activeTravel.itinerary[0]?.date || store.activeTreatment.admissionDate || '待确认' }}</h2><p>{{ store.activeTravel.itinerary[0]?.title || '行程待安排' }} · 双语协调员全程协助</p></section>
      <section class="patient-mobile-section"><h2>行程安排</h2><div class="patient-journey">
        <button v-for="(item,i) in store.activeTreatment.schedule" :key="item.id" @click="router.push(`/patient/detail/travel-${i}?type=travel`)"><span>{{ i+1 }}</span><div><small>{{ item.date }}</small><b>{{ item.title }}</b><em>{{ item.status }}</em></div><i>›</i></button>
      </div></section>
      <section class="patient-contact-strip"><span>☎</span><div><b>行程协调员 {{ store.activeTravel.coordinator }}</b><small>如需变更航班或接送，请联系我们</small></div><button @click="contactCoordinator">联系</button></section>
      <button class="patient-primary-action" @click="act('confirmTravel')">确认全部行程</button>
    </template>

    <template v-else>
      <section class="patient-followup-hero"><span>全周期健康管理</span><h2>陪伴治疗后的每一个阶段</h2><p>复查、用药、康复、营养和紧急医疗协助</p></section>
      <section class="patient-mobile-section"><h2>五阶段随访计划</h2><div class="patient-stage-list">
        <button v-for="(stage,i) in store.activeFollowup.stages" :key="stage.id" @click="router.push(`/patient/detail/${stage.id}?type=followup`)"><span>{{ i+1 }}</span><div><b>{{ stage.name }}</b><small>{{ stage.period }} · {{ stage.frequency }}</small><em>{{ stage.owner }}</em></div><i>›</i></button>
      </div></section>
      <section v-if="store.activeHealthPlan.status === 'published'" class="patient-mobile-section">
        <div class="section-heading"><h2>{{ store.activeHealthPlan.monthlyPlan.month }} 月健康方案</h2><button>v{{ store.activeHealthPlan.monthlyPlan.version }}</button></div>
        <div class="patient-plan-goal">
          <span>本月目标</span><p>{{ store.activeHealthPlan.monthlyPlan.goal }}</p>
        </div>
        <div class="patient-plan-group">
          <header><span>饮食</span><div><b>一日饮食执行表</b><small>{{ store.activeHealthPlan.diet.length }} 项具体安排</small></div></header>
          <div class="patient-health-plan">
            <article v-for="item in store.activeHealthPlan.diet" :key="item.title"><span>餐</span><div><b>{{ item.title }} · {{ item.target }}</b><small>{{ item.note }}</small></div></article>
          </div>
        </div>
        <div class="patient-plan-group exercise">
          <header><span>运动</span><div><b>一日运动执行表</b><small>{{ store.activeHealthPlan.exercise.length }} 项分时训练</small></div></header>
          <div class="patient-health-plan">
            <article v-for="item in store.activeHealthPlan.exercise" :key="item.title"><span>动</span><div><b>{{ item.title }} · {{ item.target }}</b><small>{{ item.intensity }}</small></div></article>
          </div>
        </div>
        <div class="patient-plan-group monitoring">
          <header><span>监测</span><div><b>本月自我监测</b><small>异常情况直接联系健康管家</small></div></header>
          <div class="patient-health-plan">
            <article v-for="item in store.activeHealthPlan.monitoring" :key="item"><span>✓</span><div><b>{{ item }}</b></div></article>
          </div>
        </div>
      </section>
      <section class="patient-reminder"><span>Rx</span><div><b>今日用药提醒</b><small>请在晚餐后确认服药</small></div><button @click="act('confirmMedication')">确认</button></section>
      <button class="patient-primary-action" @click="act('completeFollowup')">确认本周随访</button>
    </template>
  </div>
</template>
