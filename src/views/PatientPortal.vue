<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDemoStore } from '../stores/demo'

const router = useRouter()
const store = useDemoStore()

const phaseIndex = computed(() => ({
  lead: 0,
  review: 1,
  planning: 1,
  treatment: 2,
  followup: 3,
}[store.activePatient.phase] ?? 0))

const nextAction = computed(() => {
  if (store.activeAiStructuring.patientConfirmation.status === 'pending') {
    return { eyebrow: '需要您确认', title: '核对AI整理后的完整病案', note: '确认时间线与资料出处后，专家评审才能继续', label: '现在核对', path: '/patient/records' }
  }
  if (store.activePatient.phase === 'followup') {
    return { eyebrow: '本周健康任务', title: '完成用药与康复随访', note: '预计用时3分钟，结果将同步给健康管家', label: '开始随访', path: '/patient/followup' }
  }
  if (store.activeTravel.itinerary.length) {
    return { eyebrow: '行程待确认', title: '核对赴华航班与接送安排', note: '协调员已准备入境、接送与入院信息', label: '查看行程', path: '/patient/travel' }
  }
  return { eyebrow: '专家评审进行中', title: '等待AGH专家形成医学意见', note: '完成后将由专家人工确认接诊医院与医生', label: '查看进度', path: '/patient/plan' }
})

const quickActions = [
  { icon: '▤', title: '医疗资料', note: '查看与上传', path: '/patient/records' },
  { icon: '+', title: '治疗方案', note: '专家意见', path: '/patient/plan' },
  { icon: '↗', title: '赴华行程', note: '航班与接送', path: '/patient/travel' },
  { icon: '♥', title: '归国随访', note: '康复与用药', path: '/patient/followup' },
]

const journeyStages = ['资料与确认', '专家评审', '赴华治疗', '归国管理']

function go(path) {
  router.push(path)
}
</script>

<template>
  <div class="care-dashboard">
    <section class="care-patient-hero">
      <div class="care-greeting"><small>WELCOME BACK</small><p>您好，{{ store.activePatient.name }}</p></div>
      <div class="care-patient-identity">
        <img v-if="store.activePatient.portrait" :src="store.activePatient.portrait" :alt="store.activePatient.name" />
        <span v-else>{{ store.activePatient.avatar }}</span>
        <div><em>{{ store.activePatient.phaseLabel }}</em><h1>{{ store.activePatient.englishName }}</h1><p>{{ store.activePatient.diagnosis }}</p></div>
      </div>
      <div class="care-case-line"><span>服务编号</span><b>{{ store.activePatient.caseId }}</b><i></i><span>健康管家</span><b>{{ store.activePatient.owner }}</b></div>
    </section>

    <section class="care-next-action">
      <header><span>{{ nextAction.eyebrow }}</span><i>下一步</i></header>
      <h2>{{ nextAction.title }}</h2>
      <p>{{ nextAction.note }}</p>
      <button type="button" @click="go(nextAction.path)">{{ nextAction.label }} <span>›</span></button>
    </section>

    <section class="care-journey-progress">
      <header><h2>我的服务进度</h2><span>{{ store.activePatient.completeness }}% 资料完整</span></header>
      <div>
        <article v-for="(stage, index) in journeyStages" :key="stage" :class="{ done: index < phaseIndex, active: index === phaseIndex }">
          <i>{{ index < phaseIndex ? '✓' : index + 1 }}</i><span>{{ stage }}</span>
        </article>
      </div>
    </section>

    <section class="care-dashboard-section">
      <header><h2>常用服务</h2></header>
      <div class="care-quick-grid">
        <button v-for="item in quickActions" :key="item.path" type="button" @click="go(item.path)">
          <span>{{ item.icon }}</span><div><b>{{ item.title }}</b><small>{{ item.note }}</small></div><i>›</i>
        </button>
      </div>
    </section>

    <section class="care-dashboard-section">
      <header><h2>最新动态</h2><button type="button" @click="go('/patient/records')">查看全部</button></header>
      <div class="care-update-list">
        <article>
          <span class="blue">AI</span>
          <div><b>结构化病案 v{{ store.activeAiStructuring.reportVersion }}</b><small>{{ store.activeAiStructuring.patientConfirmation.status === 'confirmed' ? '您已确认资料准确' : '等待您核对时间与出处' }}</small></div>
          <em>{{ store.activeAiStructuring.patientConfirmation.status === 'confirmed' ? '已确认' : '待处理' }}</em>
        </article>
        <article>
          <span class="red">MD</span>
          <div><b>AGH专家评审</b><small>{{ store.activeReview.expert || '牵头专家待指派' }}</small></div>
          <em>{{ store.activeReview.status === 'completed' ? '已完成' : '进行中' }}</em>
        </article>
        <article>
          <span class="green">24h</span>
          <div><b>健康管家在线</b><small>{{ store.activePatient.owner }} · {{ store.activePatient.preferredContactWindow }}</small></div>
          <em>可联系</em>
        </article>
      </div>
    </section>

    <section class="care-coordinator-card">
      <div><span>{{ store.activePatient.owner.slice(0, 1) }}</span><div><small>YOUR CARE COORDINATOR</small><b>{{ store.activePatient.owner }}</b><p>治疗与行程问题可通过WhatsApp联系</p></div></div>
      <a href="https://wa.me/60388992026" target="_blank" rel="noreferrer">联系</a>
    </section>

    <footer class="care-dashboard-footer">匿名化演示 · 紧急情况请联系当地医院或急救服务</footer>
  </div>
</template>
