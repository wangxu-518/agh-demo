<script setup>
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import StatCard from '../components/StatCard.vue'
import TaskList from '../components/TaskList.vue'
import { useDemoStore } from '../stores/demo'
const store = useDemoStore()
</script>
<template>
  <PageHeader eyebrow="Hospital intake workspace" title="国内医院国际患者承接中心" subtitle="从接诊评估到床位、检查、治疗、费用和出院交接">
    <button class="primary-button" @click="store.acceptHospital({ bed: '胸外科 8F-12（预留）' })">确认承接并预留床位</button>
  </PageHeader>
  <div class="stats-grid">
    <StatCard label="待确认接诊" value="4" note="1例高优先级" icon="H" />
    <StatCard label="本周入院" value="7" note="国际患者" icon="▣" tone="green" />
    <StatCard label="床位预留" value="5" note="胸外科2张" icon="B" tone="orange" />
    <StatCard label="待交付出院资料" value="3" note="需双语版本" icon="↗" tone="red" />
  </div>
  <div class="grid-2">
    <SectionCard title="今日重点承接申请" subtitle="从待接诊队列中选择的高优先级申请">
      <div class="info-list">
        <div class="info-row"><span>推荐科室</span><b>{{ store.activeTreatment.department || '待确认' }}</b></div>
        <div class="info-row"><span>拟接诊医生</span><b>{{ store.activeTreatment.doctor || '待确认' }}</b></div>
        <div class="info-row"><span>计划入院</span><b>{{ store.activeTreatment.admissionDate || '待确认' }}</b></div>
        <div class="info-row"><span>床位</span><b>{{ store.activeTreatment.bed }}</b></div>
        <div class="info-row"><span>费用预估</span><b>{{ store.activeTreatment.estimatedCost }}</b></div>
        <div class="info-row"><span>接诊状态</span><span class="status-pill" :class="store.activeTreatment.status === 'accepted' ? 'done' : 'pending'">{{ store.activeTreatment.status === 'accepted' ? '已承接' : '待确认' }}</span></div>
      </div>
      <div class="notice" style="margin-top:14px">最终治疗方案以患者到院后的检查及 MDT 结论为准。系统不作疗效承诺。</div>
    </SectionCard>
    <SectionCard title="医院待办"><TaskList system="hospital" /></SectionCard>
  </div>
  <SectionCard title="拟定诊疗日程" subtitle="确认承接后同步患者端与中马运营团队">
    <div class="stage-list">
      <div v-for="(item, i) in store.activeTreatment.schedule" :key="item.id" class="stage-card">
        <div class="stage-number">{{ i + 1 }}</div>
        <div><h4>{{ item.title }}</h4><p>{{ item.date }} · 国际医疗中心协调</p></div>
        <span class="status-pill pending">计划中</span>
      </div>
    </div>
  </SectionCard>
  <div class="grid-equal">
    <SectionCard title="出院资料交付清单">
      <div class="check-list">
        <div class="check-item"><span class="check-mark">✓</span>中英双语出院小结</div>
        <div class="check-item"><span class="check-mark">✓</span>影像与病理报告</div>
        <div class="check-item"><span class="check-mark">✓</span>带药清单及用药告知</div>
        <div class="check-item"><span class="check-mark">✓</span>复查周期与高危提示</div>
      </div>
    </SectionCard>
    <SectionCard title="费用状态">
      <div class="info-list">
        <div class="info-row"><span>预估总费用</span><b>{{ store.activeTreatment.estimatedCost }}</b></div>
        <div class="info-row"><span>已支付</span><b>¥{{ store.activeBilling.paid.toLocaleString() }}</b></div>
        <div class="info-row"><span>保险</span><b>商保预授权材料准备中</b></div>
      </div>
    </SectionCard>
  </div>
</template>
