<script setup>
import { ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import TaskList from '../components/TaskList.vue'
import { useDemoStore } from '../stores/demo'
const store = useDemoStore()
const tab = ref('summary')
const reviewText = ref(store.activeReview.recommendation || '建议完善 EBUS 纵隔淋巴结取样、肺功能和分子检测；根据结果由胸外科、肿瘤内科及放疗科 MDT 制定综合治疗方案。')
</script>
<template>
  <PageHeader eyebrow="Expert review workspace" title="专家评审与 MDT 中心" subtitle="标准化病例摘要、原始资料和多学科意见集中呈现">
    <button class="secondary-button" @click="store.performAction('finishMdt', { conclusion: reviewText })">形成 MDT 结论</button>
    <button class="primary-button" @click="store.finishReview({ recommendation: reviewText })">提交评审意见</button>
  </PageHeader>
  <div class="grid-2">
    <SectionCard title="病例工作区" :subtitle="`评审版本 v${store.activeReview.version}`">
      <div class="tabs">
        <button v-for="item in ['summary','records','imaging','history']" :key="item" class="tab-button" :class="{active:tab===item}" @click="tab=item">{{ {summary:'病例摘要',records:'病历资料',imaging:'影像摘要',history:'历史评审'}[item] }}</button>
      </div>
      <template v-if="tab === 'summary'">
        <div class="grid-equal">
          <div class="info-list">
            <div class="info-row"><span>患者</span><b>{{ store.activePatient.name }}，{{ store.activePatient.age }}岁</b></div>
            <div class="info-row"><span>诊断</span><b>{{ store.activePatient.diagnosis }}</b></div>
            <div class="info-row"><span>体能状态</span><b>ECOG 1</b></div>
            <div class="info-row"><span>既往治疗</span><b>尚未开始系统治疗</b></div>
          </div>
          <div class="info-list">
            <div class="info-row"><span>病灶</span><b>右上肺 3.2cm</b></div>
            <div class="info-row"><span>淋巴结</span><b>纵隔 4R / 7组可疑</b></div>
            <div class="info-row"><span>远处转移</span><b>未见明确证据</b></div>
            <div class="info-row"><span>资料完整度</span><b>{{ store.activePatient.completeness }}%</b></div>
          </div>
        </div>
        <div class="notice" style="margin-top:16px">{{ store.activeReview.summary }}</div>
        <label style="display:block;margin-top:16px;font-size:11px;font-weight:600">专家评审意见</label>
        <textarea v-model="reviewText" style="width:100%;min-height:110px;margin-top:7px;border:1px solid #dfe6ef;border-radius:10px;padding:11px;resize:vertical"></textarea>
      </template>
      <template v-else-if="tab === 'records'">
        <div v-for="doc in store.activeDocuments" :key="doc.id" class="mobile-row"><div class="mobile-row-icon">PDF</div><div class="mobile-row-copy"><b>{{ doc.name }}</b><small>{{ doc.type }} · {{ doc.source }} · v{{ doc.version }}</small></div><b>查看</b></div>
      </template>
      <template v-else-if="tab === 'imaging'">
        <div class="notice">PET-CT：右肺上叶后段高代谢结节，SUVmax 9.8；4R及7组淋巴结代谢增高。未见明确远处脏器转移。</div>
        <div style="height:240px;margin-top:14px;border-radius:12px;background:radial-gradient(circle at 58% 42%,#f29d64 0 2%,#202a38 3% 7%,#0c1017 8% 100%);display:grid;place-items:center;color:#ffffff88;font-size:11px">匿名化影像预览 · DEMO</div>
      </template>
      <template v-else>
        <div class="timeline-item"><span class="timeline-dot expert"></span><div><b>v1 初步意见</b><p>建议补充关键检查后进入MDT。</p><small>张建国 · 近期更新</small></div></div>
      </template>
    </SectionCard>
    <div>
      <SectionCard title="我的评审任务" subtitle="按优先级和SLA排序"><TaskList system="expert" /></SectionCard>
      <SectionCard title="MDT 会议信息">
        <div class="info-list">
          <div class="info-row"><span>时间</span><b>{{ store.activeReview.meetingAt || '待安排' }}</b></div>
          <div class="info-row"><span>参与科室</span><b>胸外 / 肿瘤内 / 放疗</b></div>
          <div class="info-row"><span>跨境参会</span><b>马来医生、健康顾问</b></div>
          <div class="info-row"><span>状态</span><span class="status-pill pending">待召开</span></div>
        </div>
      </SectionCard>
    </div>
  </div>
</template>
