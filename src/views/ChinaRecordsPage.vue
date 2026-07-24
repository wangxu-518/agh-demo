<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import { useDemoStore } from '../stores/demo'
import { formatDateTime } from '../utils/format'

const route = useRoute()
const store = useDemoStore()
const page = computed(() => route.meta.page)
const records = computed(() => store.state.chinaDomain.medicalRecords)
const audits = computed(() => store.state.chinaDomain.accessAudits)
</script>

<template>
  <div class="records-center">
    <PageHeader eyebrow="China medical data domain" :title="page === 'handoff' ? '访问审计' : page === 'intake' ? '国内治疗时间轴' : '国内诊疗资料'" subtitle="仅展示国内医院上传的诊疗数据，不承担患者运营、专家安排或跨境协调" />
    <div class="domain-boundary-banner"><b>中国境内医疗数据域</b><span>资料正文保留在境内；外部系统仅通过授权会话受控查看，不自动同步或下载。</span></div>

    <SectionCard v-if="page === 'handoff'" title="受控访问记录" subtitle="查看用途、人员、时间与结果全程留痕" flush>
      <div class="table-scroll"><table class="data-table">
        <thead><tr><th>时间</th><th>访问人</th><th>境内病例</th><th>用途</th><th>动作</th><th>结果</th></tr></thead>
        <tbody><tr v-for="audit in audits" :key="audit.id"><td>{{ formatDateTime(audit.at) }}</td><td><b>{{ audit.actor }}</b></td><td>{{ audit.chinaCaseId }}</td><td>{{ audit.purpose }}</td><td>{{ audit.action }}</td><td><span class="status-pill done">{{ audit.result }}</span></td></tr></tbody>
      </table></div>
    </SectionCard>

    <SectionCard v-else-if="page === 'intake'" title="治疗资料时间轴" subtitle="按境内诊疗发生时间汇总">
      <div class="medical-timeline"><div v-for="record in records" :key="record.id"><time>{{ record.occurredAt }}</time><i></i><article><span>{{ record.type }}</span><h3>{{ record.title }}</h3><p>{{ record.hospital }} · {{ record.stage }}</p></article></div></div>
    </SectionCard>

    <SectionCard v-else title="境内资料库" :subtitle="`${records.length} 份资料 · 由医院端上传`" flush>
      <div class="records-toolbar"><input placeholder="搜索境内病例号、医院或资料名称" /><select><option>全部资料类型</option><option>手术记录</option><option>病理报告</option><option>康复方案</option></select></div>
      <div class="record-library">
        <article v-for="record in records" :key="record.id">
          <span class="record-type">{{ record.type.slice(0, 1) }}</span>
          <div><small>{{ record.chinaCaseId }} · {{ record.hospital }}</small><h3>{{ record.title }}</h3><p>{{ record.summary }}</p><footer><span>{{ record.occurredAt }}</span><b>{{ record.stage }}</b></footer></div>
        </article>
      </div>
    </SectionCard>
  </div>
</template>
