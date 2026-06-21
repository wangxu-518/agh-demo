<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDemoStore } from '../stores/demo'
const route = useRoute()
const router = useRouter()
const store = useDemoStore()
const type = computed(() => route.query.type)
const doc = computed(() => store.activeDocuments.find(item => item.id === route.params.id))
const stage = computed(() => store.state.followup.stages.find(item => item.id === route.params.id))
</script>
<template>
  <div class="patient-mobile-detail">
    <header><button @click="router.back()">←</button><b>{{ type==='record'?'资料详情':type==='plan'?'医院方案':type==='travel'?'行程安排':'随访计划' }}</b><i></i></header>
    <main v-if="type==='record'"><div class="mobile-detail-file">PDF</div><h1>{{ doc?.name }}</h1><p>{{ doc?.type }} · {{ doc?.source }} · v{{ doc?.version }}</p><section><h2>文件状态</h2><div class="mobile-detail-row"><span>核验状态</span><b>已完成医学核验</b></div><div class="mobile-detail-row"><span>文件语言</span><b>{{ doc?.language }}</b></div><div class="mobile-detail-row"><span>授权范围</span><b>患者本人及诊疗团队</b></div></section><button class="patient-primary-action">预览文件</button></main>
    <main v-else-if="type==='plan'"><div class="mobile-detail-logo">H</div><h1>{{ store.state.treatment.hospital }}</h1><p>国际医疗中心 · {{ store.state.treatment.department }}</p><section><h2>接诊信息</h2><div class="mobile-detail-row"><span>主诊专家</span><b>{{ store.state.treatment.doctor }}</b></div><div class="mobile-detail-row"><span>预计入院</span><b>{{ store.state.treatment.admissionDate }}</b></div><div class="mobile-detail-row"><span>费用预估</span><b>{{ store.state.treatment.estimatedCost }}</b></div><div class="mobile-detail-row"><span>床位</span><b>{{ store.state.treatment.bed }}</b></div></section><section class="mobile-detail-note"><b>温馨提示</b><p>最终诊疗安排以到院检查和 MDT 结论为准。</p></section></main>
    <main v-else-if="type==='travel'"><div class="mobile-detail-logo">✈</div><h1>赴华服务安排</h1><p>专人负责接送、翻译和入院协调</p><section><h2>服务详情</h2><div class="mobile-detail-row"><span>集合地点</span><b>吉隆坡国际机场 T1</b></div><div class="mobile-detail-row"><span>广州接机</span><b>白云机场国际到达厅</b></div><div class="mobile-detail-row"><span>协调员</span><b>Aisyah / 李雯</b></div><div class="mobile-detail-row"><span>紧急电话</span><b>+60 3-8899 2026</b></div></section></main>
    <main v-else><div class="mobile-detail-logo">♥</div><h1>{{ stage?.name }}</h1><p>{{ stage?.period }} · {{ stage?.frequency }}</p><section><h2>本阶段服务</h2><div v-for="item in stage?.items" :key="item" class="mobile-service-item"><span>✓</span><b>{{ item }}</b></div></section><section><h2>责任团队</h2><div class="mobile-detail-row"><span>主要负责人</span><b>{{ stage?.owner }}</b></div><div class="mobile-detail-row"><span>异常响应</span><b>15分钟内联系</b></div></section></main>
  </div>
</template>
