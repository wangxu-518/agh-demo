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
    <PageHeader eyebrow="AGH Medical Advisory Board" title="AGH专家评审与 MDT 中心" subtitle="三位AGH内部专家牵头评审，并在结论形成后人工决定医院与接诊医生">
      <button class="secondary-button" @click="router.push('/expert/mdt')">查看 MDT 队列</button>
      <button class="primary-button" @click="router.push('/expert/queue')">全部待评审病例</button>
    </PageHeader>

    <WorkflowPatientQueue
      :queue="queue"
      title="我的病例队列"
      subtitle="按风险、资料完整度和评审状态排序；牵头专家为AGH内部角色，不代表任何医院医生"
      action-label="开始评审"
      @select="openCase"
    />

    <div class="grid-2" style="margin-top:16px">
      <SectionCard title="我的评审任务" subtitle="任务与患者病例分别保留状态"><TaskList system="expert" /></SectionCard>
      <SectionCard title="工作提示" subtitle="病例上下文由用户选择决定">
        <div class="notice">评审系统不自动匹配医院。AGH牵头专家先形成评审或MDT结论，再从候选接诊团队中人工确认医院、科室和负责医生；马来团队随后只负责发送承接申请。</div>
      </SectionCard>
    </div>
  </div>
</template>
