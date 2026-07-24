<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import WorkflowPatientQueue from '../components/WorkflowPatientQueue.vue'
import { workflowQueueFor } from '../config/workflowQueues'
import { useDemoStore } from '../stores/demo'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()
const hasSelectedCase = computed(() => typeof route.query.case === 'string' && Boolean(store.state.cases[route.query.case]))
const patientQueue = computed(() => workflowQueueFor('hospital', 'inpatient', store.state))
const message = ref('')
const recordType = ref('治疗记录')

watch(() => route.query.case, (caseId) => {
  if (typeof caseId === 'string') store.setActiveCase(caseId)
}, { immediate: true })

function openCase(caseId) {
  store.setActiveCase(caseId)
  router.replace({ path: route.path, query: { case: caseId } })
}

function backToQueue() {
  message.value = ''
  router.replace({ path: route.path })
}

function upload() {
  const result = store.uploadChinaRecord({
    type: recordType.value,
    title: `${recordType.value}（演示上传）`,
    hospital: store.activeTreatment.hospital || '国内接诊医院',
    stage: store.activeTreatment.status === 'post_operation' ? '术后恢复' : '在院治疗',
    summary: '该资料由医院端在治疗阶段上传，仅保存于中国境内资料库。',
    actor: '刘敏',
  })
  message.value = result.message
}
</script>

<template>
  <div>
    <PageHeader eyebrow="In-treatment documentation" title="治疗阶段资料上传" subtitle="医院在治疗过程中持续上传检查、手术、病理、用药和出院资料">
      <button v-if="hasSelectedCase" class="secondary-button detail-queue-back" @click="backToQueue">← 返回患者队列</button>
      <select v-if="hasSelectedCase" v-model="recordType" class="header-select"><option>治疗记录</option><option>检查报告</option><option>手术记录</option><option>病理报告</option><option>出院小结</option><option>康复方案</option></select>
      <button v-if="hasSelectedCase" class="primary-button" @click="upload">上传资料</button>
    </PageHeader>
    <div v-if="message" class="action-success">{{ message }}</div>
    <WorkflowPatientQueue
      v-if="!hasSelectedCase"
      :queue="patientQueue"
      title="在院患者资料队列"
      subtitle="按治疗状态选择患者，再上传该患者的治疗阶段资料"
      action-label="进入在院档案"
      @select="openCase"
    />
    <div v-else class="grid-2">
      <SectionCard title="住院治疗时间线" subtitle="资料上传后同步更新境内病例状态">
        <div class="medical-timeline"><div v-for="record in store.activeChinaRecords" :key="record.id"><time>{{ record.occurredAt }}</time><i></i><article><span>{{ record.type }}</span><h3>{{ record.title }}</h3><p>{{ record.summary }}</p></article></div></div>
      </SectionCard>
      <div>
        <SectionCard title="境内资料状态">
          <div class="domain-reference"><div><span>境内病例号</span><b>{{ store.activeDomesticReference.chinaCaseId || '上传后生成' }}</b></div><div><span>资料数量</span><b>{{ store.activeDomesticReference.availableCount }} 份</b></div><p>资料正文保留在中国数据域，马来运营端仅能看到状态和受控查看入口。</p></div>
        </SectionCard>
        <SectionCard title="待归档资料">
          <div class="check-list"><div v-for="item in ['每日病程记录','用药清单','出院小结','康复方案']" :key="item" class="check-item"><span class="check-mark">✓</span>{{ item }}</div></div>
        </SectionCard>
      </div>
    </div>
  </div>
</template>
