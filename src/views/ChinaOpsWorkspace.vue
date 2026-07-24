<script setup>
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import StatCard from '../components/StatCard.vue'
import { useDemoStore } from '../stores/demo'
const store = useDemoStore()
</script>
<template>
  <PageHeader eyebrow="China medical data workspace" title="中国诊疗资料中心" subtitle="医院资料境内留存 · 只读展示 · 所有访问均留痕" />
  <div class="stats-grid">
    <StatCard label="国内诊疗资料" value="8" note="主案例已归档 5 份" icon="档" />
    <StatCard label="治疗阶段" value="4/6" note="手术与康复资料已更新" icon="期" tone="green" />
    <StatCard label="今日受控访问" value="6" note="全部通过授权校验" icon="审" tone="orange" />
    <StatCard label="异常访问" value="0" note="只读与水印策略生效" icon="安" tone="green" />
  </div>
  <div class="grid-2">
    <SectionCard title="最新国内资料" subtitle="医院上传后保存在中国数据域">
      <div class="info-list">
        <div class="info-row"><span>手术记录</span><b>胸腔镜右肺上叶切除术 · 已归档</b></div>
        <div class="info-row"><span>术后病理</span><b>病理报告 v1 · 已审核</b></div>
        <div class="info-row"><span>康复方案</span><b>呼吸训练与活动分级 · 已发布</b></div>
        <div class="info-row"><span>出院资料</span><b>出院小结与复查计划 · 待签收</b></div>
      </div>
    </SectionCard>
    <SectionCard title="数据边界" subtitle="该端不承担患者运营或医疗协调">
      <div class="check-list">
        <div class="check-item"><span class="check-mark">✓</span>国内病历正文和附件不进入马来数据域</div>
        <div class="check-item"><span class="check-mark">✓</span>马来端只保存资料状态与受控入口</div>
        <div class="check-item"><span class="check-mark">✓</span>查看前校验授权、身份、用途和有效期</div>
        <div class="check-item"><span class="check-mark">✓</span>页面只读、水印展示并记录审计日志</div>
      </div>
    </SectionCard>
  </div>
  <SectionCard title="当前患者国内治疗摘要" subtitle="仅展示医院已审核并允许查看的内容">
    <div class="grid-3">
      <div class="info-row"><span>患者</span><b>{{ store.activePatient.name }} · {{ store.activePatient.caseId }}</b></div>
      <div class="info-row"><span>治疗医院</span><b>{{ store.activeTreatment.hospital || '待医院上传' }}</b></div>
      <div class="info-row"><span>最近更新</span><b>今天 09:36 · 医院端</b></div>
    </div>
  </SectionCard>
</template>
