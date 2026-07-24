<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import WorkflowPatientQueue from '../components/WorkflowPatientQueue.vue'
import { workflowQueueFor } from '../config/workflowQueues'
import { useDemoStore } from '../stores/demo'

const router = useRouter()
const store = useDemoStore()
const queue = computed(() => workflowQueueFor('china', 'records', store.state))

function openCase(caseId) {
  store.setActiveCase(caseId)
  router.push({ path: '/china-ops/records', query: { case: caseId } })
}
</script>

<template>
  <div>
    <PageHeader eyebrow="China medical data workspace" title="中国诊疗资料中心" subtitle="医院资料境内留存 · 先选境内病例 · 所有访问均留痕">
      <button class="secondary-button" @click="router.push('/china-ops/handoff')">查看访问审计</button>
      <button class="primary-button" @click="router.push('/china-ops/records')">全部境内病例</button>
    </PageHeader>

    <WorkflowPatientQueue
      :queue="queue"
      title="境内诊疗病例"
      subtitle="按患者区分国内检查、手术、病理、康复和出院资料"
      action-label="查看境内资料"
      @select="openCase"
    />

    <SectionCard title="数据边界" subtitle="该端不承担患者运营或医疗协调" style="margin-top:16px">
      <div class="check-list">
        <div class="check-item"><span class="check-mark">✓</span>国内病历正文和附件不进入马来数据域</div>
        <div class="check-item"><span class="check-mark">✓</span>马来端只保存资料状态与受控入口</div>
        <div class="check-item"><span class="check-mark">✓</span>查看前校验授权、身份、用途和有效期</div>
        <div class="check-item"><span class="check-mark">✓</span>页面只读、水印展示并记录审计日志</div>
      </div>
    </SectionCard>
  </div>
</template>
