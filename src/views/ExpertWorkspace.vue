<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import TaskList from '../components/TaskList.vue'
import WorkflowPatientQueue from '../components/WorkflowPatientQueue.vue'
import { workflowQueueFor } from '../config/workflowQueues'
import { useDemoStore } from '../stores/demo'

const router = useRouter()
const store = useDemoStore()
const queue = computed(() => workflowQueueFor('expert', 'case', store.state))

function openCase(caseId) {
  store.setActiveCase(caseId)
  router.push({ path: '/expert/case', query: { case: caseId } })
}
</script>

<template>
  <div>
    <PageHeader eyebrow="Expert review workspace" title="专家评审与 MDT 中心" subtitle="先从评审队列选择患者，再进入结构化病案、原始资料和专家意见">
      <button class="secondary-button" @click="router.push('/expert/mdt')">查看 MDT 队列</button>
      <button class="primary-button" @click="router.push('/expert/queue')">全部待评审病例</button>
    </PageHeader>

    <WorkflowPatientQueue
      :queue="queue"
      title="我的病例队列"
      subtitle="按风险、资料完整度和评审状态排序，王美玲是演示主案例而非唯一病例"
      action-label="开始评审"
      @select="openCase"
    />

    <div class="grid-2" style="margin-top:16px">
      <SectionCard title="我的评审任务" subtitle="任务与患者病例分别保留状态"><TaskList system="expert" /></SectionCard>
      <SectionCard title="工作提示" subtitle="病例上下文由用户选择决定">
        <div class="notice">进入病例前不会自动沿用其他模块的当前患者。提交专家意见、查看面诊纪要和完成 MDT 均在具体患者详情中执行。</div>
      </SectionCard>
    </div>
  </div>
</template>
