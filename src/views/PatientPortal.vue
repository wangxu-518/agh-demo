<script setup>
import { computed } from 'vue'
import { useDemoStore } from '../stores/demo'
const store = useDemoStore()
const lang = computed(() => store.state.language)
const steps = computed(() => lang.value === 'zh' ? ['咨询','评审','承接','治疗','随访'] : ['Inquiry','Review','Intake','Care','Follow-up'])
</script>

<template>
  <div class="mobile-hero">
    <small>{{ lang === 'zh' ? '下午好' : 'Good afternoon' }}</small>
    <h1>{{ store.activePatient.name }}</h1>
    <p>{{ lang === 'zh' ? '您的跨境医疗服务正在有序推进' : 'Your cross-border care journey is progressing' }}</p>
  </div>
  <div class="mobile-card">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><b style="font-size:12px">{{ lang === 'zh' ? '当前进度' : 'Current progress' }}</b><p style="font-size:9px;color:#69788f;margin:3px 0 0">{{ store.activePatient.caseId }}</p></div>
      <span class="status-pill blue">{{ store.activePatient.phaseLabel }}</span>
    </div>
    <div class="mobile-progress">
      <div v-for="(step, i) in steps" :key="step" class="mobile-step" :class="{ done: i < 2, active: i === 2 }"><i></i>{{ step }}</div>
    </div>
  </div>

  <div class="mobile-card">
    <div class="mobile-grid">
      <div class="mobile-action"><span>▤</span>{{ lang === 'zh' ? '医疗资料' : 'Records' }}</div>
      <div class="mobile-action"><span>✚</span>{{ lang === 'zh' ? '治疗方案' : 'Plan' }}</div>
      <div class="mobile-action"><span>✈</span>{{ lang === 'zh' ? '赴华行程' : 'Travel' }}</div>
      <div class="mobile-action"><span>♥</span>{{ lang === 'zh' ? '随访计划' : 'Follow-up' }}</div>
    </div>
  </div>

  <section class="mobile-section">
    <header><h3>{{ lang === 'zh' ? '我的治疗方案' : 'My treatment plan' }}</h3><a>{{ lang === 'zh' ? '查看全部' : 'View all' }}</a></header>
    <div class="mobile-list-card">
      <div class="mobile-row">
        <div class="mobile-row-icon">MD</div>
        <div class="mobile-row-copy"><b>{{ store.state.review.status === 'completed' ? '专家评审意见已出具' : '专家评审进行中' }}</b><small>{{ store.state.review.expert }} · {{ store.state.review.meetingAt }}</small></div>
        <b>›</b>
      </div>
      <div class="mobile-row">
        <div class="mobile-row-icon">H</div>
        <div class="mobile-row-copy"><b>{{ store.state.treatment.hospital }}</b><small>{{ store.state.treatment.department }} · {{ store.state.treatment.doctor }}</small></div>
        <b>›</b>
      </div>
    </div>
  </section>

  <section class="mobile-section">
    <header><h3>{{ lang === 'zh' ? '近期事项' : 'Upcoming' }}</h3></header>
    <div class="mobile-list-card">
      <div class="mobile-row">
        <div class="mobile-row-icon">✓</div>
        <div class="mobile-row-copy"><b>{{ lang === 'zh' ? '跨境数据授权已签署' : 'Data consent signed' }}</b><small>{{ lang === 'zh' ? '中马团队按角色授权访问' : 'Role-based access enabled' }}</small></div>
        <span class="status-pill done">{{ lang === 'zh' ? '完成' : 'Done' }}</span>
      </div>
      <div class="mobile-row">
        <div class="mobile-row-icon">▣</div>
        <div class="mobile-row-copy"><b>{{ lang === 'zh' ? '补充肿瘤标志物报告' : 'Upload tumor marker report' }}</b><small>{{ lang === 'zh' ? '请于今天18:00前上传' : 'Due today at 18:00' }}</small></div>
        <button class="mini-button">{{ lang === 'zh' ? '上传' : 'Upload' }}</button>
      </div>
    </div>
  </section>

  <div class="emergency">
    <span style="font-size:23px">✚</span>
    <div><strong>{{ lang === 'zh' ? '7×24小时医疗协助' : '24/7 Medical Assistance' }}</strong><small>{{ lang === 'zh' ? '如有突发不适，请立即联系健康管家' : 'Contact your care manager for urgent help' }}</small></div>
  </div>
</template>
