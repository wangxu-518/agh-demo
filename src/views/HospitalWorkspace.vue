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
const queue = computed(() => workflowQueueFor('hospital', 'inpatient', store.state))

function openCase(caseId) {
  store.setActiveCase(caseId)
  router.push({ path: '/hospital/inpatient', query: { case: caseId } })
}
</script>

<template>
  <div>
    <PageHeader eyebrow="Hospital intake workspace" title="国内医院国际患者承接中心" subtitle="从患者队列进入接诊、在院治疗、资料上传与出院交接">
      <button class="secondary-button" @click="router.push('/hospital/schedule')">床位与日程</button>
      <button class="primary-button" @click="router.push('/hospital/intake')">查看接诊申请</button>
    </PageHeader>

    <WorkflowPatientQueue
      :queue="queue"
      title="在院与待入院患者"
      subtitle="按治疗状态查看患者，选择后进入在院管理和治疗资料上传"
      action-label="进入在院管理"
      @select="openCase"
    />

    <div class="grid-2" style="margin-top:16px">
      <SectionCard title="医院待办" subtitle="跨患者任务按优先级与SLA排序"><TaskList system="hospital" /></SectionCard>
      <SectionCard title="承接边界">
        <div class="notice">列表展示跨境医疗协同状态；最终治疗方案、床位和费用仍以患者到院后的医院确认结果为准。</div>
      </SectionCard>
    </div>
  </div>
</template>
