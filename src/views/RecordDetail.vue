<script setup>
import { computed, ref } from 'vue'
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
const system = computed(() => route.meta.system)
const source = computed(() => route.query.source || systems[system.value].nav[0][0])
const schema = computed(() => schemaFor(system.value, source.value))
</script>

<template>
  <div class="record-detail-page">
    <button class="back-link" @click="router.back()">← 返回{{ schema?.title || '上一页' }}</button>
    <div class="detail-heading"><div><p class="eyebrow">{{ schema?.eyebrow || 'BUSINESS RECORD' }}</p><h1>{{ schema?.title }}详情</h1><p>业务记录 {{ route.params.id }} · 所有处理过程均保留操作痕迹</p></div><div><button class="secondary-button">导出资料</button><button class="primary-button" @click="saved=true">保存处理结果</button></div></div>
    <PatientBanner />
    <div v-if="saved" class="action-success">✓ 处理结果已保存，并同步相关业务系统</div>
    <div class="grid-2 detail-grid">
      <SectionCard title="基本信息"><div class="detail-form"><label>业务编号<input :value="route.params.id" /></label><label>当前状态<select><option>处理中</option><option>待补充</option><option>已完成</option></select></label><label>患者姓名<input :value="store.activePatient.name" /></label><label>Case ID<input :value="store.activePatient.caseId" /></label><label>责任人<input value="当前演示用户" /></label><label>计划完成时间<input type="date" value="2026-06-24" /></label></div></SectionCard>
      <SectionCard title="临床与业务摘要"><div class="info-list"><div class="info-row"><span>诊断</span><b>{{ store.activePatient.diagnosis }}</b></div><div class="info-row"><span>当前阶段</span><b>{{ store.activePatient.phaseLabel }}</b></div><div class="info-row"><span>资料完整度</span><b>{{ store.activePatient.completeness }}%</b></div><div class="info-row"><span>专家</span><b>{{ store.state.review.expert }}</b></div><div class="info-row"><span>医院</span><b>{{ store.state.treatment.hospital }}</b></div></div></SectionCard>
    </div>
    <div class="grid-2 detail-grid">
      <SectionCard title="处理记录与备注"><textarea v-model="note" class="review-editor" placeholder="录入沟通记录、医学备注、处理意见或交接要求"></textarea><div class="detail-actions"><button class="secondary-button">添加附件</button><button class="primary-button" @click="saved=true">保存备注</button></div></SectionCard>
      <SectionCard title="操作时间线"><Timeline /></SectionCard>
    </div>
  </div>
</template>
