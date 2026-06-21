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
function act(action) { message.value = store.performAction(action) }
</script>

<template>
  <div class="patient-mobile-page">
    <header class="patient-page-heading"><p>{{ titles[page][1] }}</p><h1>{{ titles[page][0] }}</h1></header>
    <div v-if="message" class="patient-toast">✓ {{ message }}</div>

    <template v-if="page === 'records'">
      <section class="patient-summary-card"><div><small>资料完整度</small><strong>{{ store.activePatient.completeness }}%</strong></div><div class="patient-ring"><span>{{ store.activeDocuments.length }}</span><small>份文件</small></div></section>
      <section class="patient-mobile-section"><div class="section-heading"><h2>我的文件</h2><button @click="act('uploadDocument')">＋ 上传</button></div>
        <button v-for="doc in store.activeDocuments" :key="doc.id" class="patient-file-card" @click="router.push(`/patient/detail/${doc.id}?type=record`)">
          <span class="patient-file-icon">PDF</span><div><b>{{ doc.name }}</b><small>{{ doc.type }} · v{{ doc.version }}</small><em>{{ doc.status === 'verified' ? '已核验' : '已翻译' }}</em></div><i>›</i>
        </button>
      </section>
      <section class="patient-help-card"><b>资料安全吗？</b><p>文件采用角色授权访问，所有查看和修改都会留下记录。</p></section>
    </template>

    <template v-else-if="page === 'plan'">
      <section class="patient-plan-status"><span>专家评审中</span><h2>{{ store.activePatient.diagnosis }}</h2><p>评审专家：{{ store.state.review.expert }}</p><div><i></i><b>预计 {{ store.state.review.meetingAt }} 完成</b></div></section>
      <section class="patient-mobile-section"><h2>推荐治疗路径</h2><div class="patient-path"><div v-for="(item,i) in ['补充关键检查','多学科专家会诊','确定治疗方案','医院接诊与入院']" :key="item"><span>{{ i+1 }}</span><b>{{ item }}</b><small>{{ i===0?'进行中':'待上一阶段完成' }}</small></div></div></section>
      <section class="patient-mobile-section"><h2>医院方案</h2><button class="patient-hospital-card" @click="router.push('/patient/detail/hospital-plan?type=plan')"><span>H</span><div><b>{{ store.state.treatment.hospital }}</b><small>{{ store.state.treatment.department }} · {{ store.state.treatment.doctor }}</small><em>费用预估 {{ store.state.treatment.estimatedCost }}</em></div><i>›</i></button></section>
      <button class="patient-primary-action" @click="act('confirmPlan')">确认已阅读方案</button>
    </template>

    <template v-else-if="page === 'travel'">
      <section class="patient-trip-card"><small>预计赴华日期</small><h2>2026年6月27日</h2><p>吉隆坡 → 广州 · 双语协调员全程协助</p></section>
      <section class="patient-mobile-section"><h2>行程安排</h2><div class="patient-journey">
        <button v-for="(item,i) in store.state.treatment.schedule" :key="item.date" @click="router.push(`/patient/detail/travel-${i}?type=travel`)"><span>{{ i+1 }}</span><div><small>{{ item.date }}</small><b>{{ item.title }}</b><em>{{ i===0?'资料已准备':'待确认' }}</em></div><i>›</i></button>
      </div></section>
      <section class="patient-contact-strip"><span>☎</span><div><b>行程协调员 Aisyah</b><small>如需变更航班或接送，请联系我们</small></div><button>联系</button></section>
      <button class="patient-primary-action" @click="act('confirmTravel')">确认全部行程</button>
    </template>

    <template v-else>
      <section class="patient-followup-hero"><span>全周期健康管理</span><h2>陪伴治疗后的每一个阶段</h2><p>复查、用药、康复、营养和紧急医疗协助</p></section>
      <section class="patient-mobile-section"><h2>五阶段随访计划</h2><div class="patient-stage-list">
        <button v-for="(stage,i) in store.state.followup.stages" :key="stage.id" @click="router.push(`/patient/detail/${stage.id}?type=followup`)"><span>{{ i+1 }}</span><div><b>{{ stage.name }}</b><small>{{ stage.period }} · {{ stage.frequency }}</small><em>{{ stage.owner }}</em></div><i>›</i></button>
      </div></section>
      <section class="patient-reminder"><span>Rx</span><div><b>今日用药提醒</b><small>请在晚餐后确认服药</small></div><button>确认</button></section>
      <button class="patient-primary-action" @click="act('completeFollowup')">确认本周随访</button>
    </template>
  </div>
</template>
