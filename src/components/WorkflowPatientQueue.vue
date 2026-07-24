<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  queue: { type: Object, required: true },
  title: { type: String, default: '患者业务队列' },
  subtitle: { type: String, default: '先选择患者，再进入具体业务详情' },
  actionLabel: { type: String, default: '进入详情' },
})

const emit = defineEmits(['select'])
const search = ref('')
const activeFilter = ref('全部')

watch(() => props.title, () => {
  search.value = ''
  activeFilter.value = '全部'
})

const visibleRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return props.queue.rows.filter((row) => {
    const filterMatches = activeFilter.value === '全部' || row.status === activeFilter.value
    const searchMatches = !keyword || [
      row.name, row.englishName, row.caseId, row.diagnosis, row.owner, row.status,
      row.primaryValue, row.secondaryValue, row.nextAction,
    ].some((value) => String(value || '').toLowerCase().includes(keyword))
    return filterMatches && searchMatches
  })
})

function displayDate(value) {
  if (!value) return '近期更新'
  return String(value).replace('T', ' ').slice(0, 16)
}
</script>

<template>
  <section class="workflow-queue">
    <div class="workflow-queue-metrics">
      <article v-for="metric in queue.metrics" :key="metric.label">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <small>{{ metric.note }}</small>
      </article>
    </div>

    <section class="workflow-queue-panel">
      <header>
        <div>
          <span>WORKFLOW PATIENT QUEUE</span>
          <h2>{{ title }}</h2>
          <p>{{ subtitle }}</p>
        </div>
        <label class="workflow-search">
          <span>⌕</span>
          <input v-model="search" aria-label="搜索患者" placeholder="搜索患者、Case ID、诊断或负责人" />
        </label>
      </header>

      <div class="workflow-filter-tabs">
        <button v-for="filter in queue.filters" :key="filter" :class="{ active: activeFilter === filter }" @click="activeFilter = filter">
          {{ filter }}
          <small>{{ filter === '全部' ? queue.rows.length : queue.rows.filter((row) => row.status === filter).length }}</small>
        </button>
      </div>

      <div class="workflow-queue-columns" aria-hidden="true">
        <span>患者与诊断</span><span>当前节点</span><span>业务信息</span><span>负责人 / 更新</span><span>操作</span>
      </div>

      <div class="workflow-queue-rows">
        <article
          v-for="row in visibleRows"
          :key="row.caseId"
          :class="['workflow-patient-row', row.tone]"
          tabindex="0"
          @click="emit('select', row.caseId)"
          @keydown.enter="emit('select', row.caseId)"
        >
          <div class="workflow-patient-identity">
            <img v-if="row.portrait" :src="row.portrait" :alt="`${row.name}演示肖像`" />
            <span v-else>{{ row.avatar }}</span>
            <div>
              <div><b>{{ row.name }}</b><em v-if="row.featured">演示主案例</em></div>
              <small>{{ row.englishName }} · {{ row.caseId }}</small>
              <p>{{ row.diagnosis }}</p>
            </div>
          </div>

          <div class="workflow-node-state">
            <span :class="['workflow-status', row.tone]">{{ row.status }}</span>
            <small>{{ row.phaseLabel }}</small>
            <i :class="row.risk">{{ row.risk === 'critical' ? '高风险' : row.risk === 'high' ? '需关注' : '常规' }}</i>
          </div>

          <div class="workflow-row-summary">
            <div><span>{{ row.primaryLabel }}</span><b>{{ row.primaryValue }}</b></div>
            <div><span>{{ row.secondaryLabel }}</span><b>{{ row.secondaryValue }}</b></div>
            <p>{{ row.nextAction }}</p>
          </div>

          <div class="workflow-row-owner">
            <b>{{ row.owner }}</b>
            <small>{{ displayDate(row.updatedAt) }}</small>
          </div>

          <button class="workflow-open-button" @click.stop="emit('select', row.caseId)">
            {{ actionLabel }} <span>→</span>
          </button>
        </article>
      </div>

      <div v-if="!visibleRows.length" class="workflow-empty">没有符合当前筛选条件的患者</div>
    </section>
  </section>
</template>
