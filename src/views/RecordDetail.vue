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
const record = computed(() => schema.value?.rows?.find(row => row.id === route.params.id))
const document = computed(() => store.state.documents.find(doc => doc.id === route.params.id))
const task = computed(() => store.state.tasks.find(item => item.id === route.params.id))
const patient = computed(() => {
  const direct = store.state.patients.find(item => item.caseId === route.params.id || item.id === route.params.id)
  if (direct) return direct
  if (['cases','intake','queue'].includes(source.value)) {
    return store.state.patients.find(item => record.value?.cells.includes(item.caseId) || record.value?.cells.includes(item.name))
  }
  return null
})
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
  if (kind.value === 'patient') return `${patient.value.name} · ${schema.value?.title || '患者'}详情`
  return `${schema.value?.title || '业务'}详情`
})
const fieldPairs = computed(() => {
  if (record.value) return schema.value.columns.map((label, index) => [label, record.value.cells[index]])
  if (document.value) return [
    ['文件名称', document.value.name], ['资料类型', document.value.type],
    ['文件语言', document.value.language], ['文件来源', document.value.source],
    ['核验状态', document.value.status], ['版本', `v${document.value.version}`],
  ]
  if (task.value) return [
    ['任务编号', task.value.id], ['任务内容', task.value.title], ['负责人', task.value.owner],
    ['截止时间', task.value.due], ['优先级', task.value.priority], ['状态', task.value.status],
  ]
  return []
})
</script>

<template>
  <div class="record-detail-page">
    <button class="back-link" @click="router.back()">← 返回{{ schema?.title || '上一页' }}</button>
    <div class="detail-heading">
      <div><p class="eyebrow">{{ schema?.eyebrow || 'BUSINESS RECORD' }}</p><h1>{{ title }}</h1><p>业务记录 {{ route.params.id }} · 所有处理过程均保留操作痕迹</p></div>
      <div><button class="secondary-button">导出资料</button><button class="primary-button" @click="saved=true">保存处理结果</button></div>
    </div>
    <PatientBanner v-if="kind === 'patient'" :patient="patient" />
    <div v-if="saved" class="action-success">✓ 处理结果已保存，并同步相关业务系统</div>

    <template v-if="kind === 'patient'">
      <div class="grid-2 detail-grid">
        <SectionCard title="患者与业务信息"><div class="detail-form"><label>患者姓名<input :value="patient.name" /></label><label>Case ID<input :value="patient.caseId" /></label><label>当前阶段<input :value="patient.phaseLabel" /></label><label>服务负责人<input :value="patient.owner" /></label><label>联系电话<input :value="patient.phone || '+60 12-*** 8861'" /></label><label>资料完整度<input :value="patient.completeness + '%'" /></label></div></SectionCard>
        <SectionCard title="临床摘要"><div class="info-list"><div class="info-row"><span>诊断</span><b>{{ patient.diagnosis }}</b></div><div class="info-row"><span>年龄 / 城市</span><b>{{ patient.age }}岁 · {{ patient.city }}</b></div><div class="info-row"><span>风险等级</span><b>{{ patient.risk }}</b></div><div class="info-row"><span>最近更新</span><b>{{ patient.updatedAt }}</b></div><div class="info-row"><span>数据授权</span><b>{{ patient.consent ? '已授权' : '待签署' }}</b></div></div></SectionCard>
      </div>
    </template>

    <template v-else>
      <div class="grid-2 detail-grid">
        <SectionCard :title="kind === 'lead' ? '线索基本信息' : kind === 'resource' ? '资源机构信息' : kind === 'document' ? '文件与版本信息' : '业务记录信息'">
          <div class="detail-form"><label v-for="[label,value] in fieldPairs" :key="label">{{ label }}<input :value="value" /></label></div>
        </SectionCard>
        <SectionCard :title="kind === 'lead' ? '跟进与转化' : kind === 'resource' ? '合作与预约能力' : kind === 'document' ? '文件处理状态' : '处理状态'">
          <div v-if="kind === 'lead'" class="info-list"><div class="info-row"><span>最近联系</span><b>今天 10:20 · WhatsApp</b></div><div class="info-row"><span>患者需求</span><b>希望获得中国专家第二诊疗意见</b></div><div class="info-row"><span>下一步</span><b>发送双语咨询表并预约视频沟通</b></div><div class="info-row"><span>转化概率</span><b>65%</b></div></div>
          <div v-else-if="kind === 'resource'" class="info-list"><div class="info-row"><span>可预约时段</span><b>周一至周六 09:00–17:00</b></div><div class="info-row"><span>服务语言</span><b>中文 / 英文 / 马来文</b></div><div class="info-row"><span>结算方式</span><b>患者自费 / 合作月结</b></div><div class="info-row"><span>最近服务</span><b>2026-06-18 · 已完成</b></div></div>
          <div v-else-if="kind === 'document'" class="info-list"><div class="info-row"><span>原始文件</span><b>已归档且不可覆盖</b></div><div class="info-row"><span>中文翻译</span><b>{{ document.status === 'translated' ? '已完成' : '无需翻译' }}</b></div><div class="info-row"><span>医学核验</span><b>李雯 · 2026-06-20</b></div><div class="info-row"><span>授权范围</span><b>运营、专家及接诊医院</b></div></div>
          <div v-else class="notice">该业务记录已进入处理流程，可在下方补充备注和附件。</div>
        </SectionCard>
      </div>
    </template>

    <div class="grid-2 detail-grid">
      <SectionCard title="处理记录与备注"><textarea v-model="note" class="review-editor" :placeholder="kind === 'lead' ? '记录沟通结果、患者关注点及下一次跟进计划' : kind === 'resource' ? '记录合作沟通、预约要求和服务反馈' : '录入业务备注、处理意见或交接要求'"></textarea><div class="detail-actions"><button class="secondary-button">添加附件</button><button class="primary-button" @click="saved=true">保存备注</button></div></SectionCard>
      <SectionCard title="操作时间线"><Timeline /></SectionCard>
    </div>
  </div>
</template>
