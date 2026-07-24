<script setup>
import { ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import { useDemoStore } from '../stores/demo'

const store = useDemoStore()
const activeTab = ref('病案摘要')
const note = ref('')
const message = ref('')

function finish() {
  const result = store.finishReview({ recommendation: note.value || '建议赴华完成补充检查后，由胸外科与肿瘤内科联合评估治疗路径。' })
  message.value = result.message
}
</script>

<template>
  <div class="shared-case-page">
    <PageHeader eyebrow="Consultation shared record" title="面诊共享病案" subtitle="专家面诊时共享同一份结构化病案、原始资料索引与患者选择">
      <button class="secondary-button">发起补资料</button><button class="primary-button" @click="finish">提交专家意见</button>
    </PageHeader>
    <div v-if="message" class="action-success">{{ message }}</div>
    <section class="shared-case-banner">
      <div><span>{{ store.activePatient.avatar }}</span><div><b>{{ store.activePatient.name }} · {{ store.activePatient.englishName }}</b><small>{{ store.activePatient.caseId }} · {{ store.activePatient.diagnosis }}</small></div></div>
      <div><span>面诊状态</span><b>{{ store.activeConsultation.status === 'completed' ? '已完成' : '即将开始' }}</b></div>
      <button class="primary-button">进入视频面诊</button>
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
        <SectionCard title="专家意见" subtitle="提交后回到马来运营端继续协调">
          <textarea v-model="note" rows="9" placeholder="输入评审意见、建议检查和治疗路径"></textarea>
          <button class="primary-button full-button" @click="finish">签署并提交</button>
        </SectionCard>
        <SectionCard title="面诊议程"><div class="check-list"><div v-for="item in store.activeConsultation.agenda" :key="item" class="check-item"><span class="check-mark">✓</span>{{ item }}</div></div></SectionCard>
      </aside>
    </div>
  </div>
</template>
