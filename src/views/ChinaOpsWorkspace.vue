<script setup>
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import TaskList from '../components/TaskList.vue'
import { useDemoStore } from '../stores/demo'
const store = useDemoStore()
</script>
<template>
  <PageHeader eyebrow="China operations workspace" title="中国诊疗运营中心" subtitle="完成跨境资料标准化、专家分配、医院匹配和赴华治疗协调">
    <button class="primary-button" @click="store.completeTask('T-102')">确认资料整理完成</button>
  </PageHeader>
  <div class="grid-2">
    <SectionCard title="病例资料中心" subtitle="原始资料、翻译件和结构化摘要分层保存" flush>
      <table class="data-table">
        <thead><tr><th>文件</th><th>类型</th><th>语言</th><th>来源</th><th>状态</th><th>版本</th></tr></thead>
        <tbody><tr v-for="doc in store.activeDocuments" :key="doc.id">
          <td><b>{{ doc.name }}</b></td><td>{{ doc.type }}</td><td>{{ doc.language }}</td><td>{{ doc.source }}</td>
          <td><span class="status-pill done">{{ doc.status === 'translated' ? '已翻译' : '已核验' }}</span></td><td>v{{ doc.version }}</td>
        </tr></tbody>
      </table>
    </SectionCard>
    <SectionCard title="运营待办" subtitle="跨团队任务与SLA"><TaskList system="china" /></SectionCard>
  </div>
  <div class="grid-equal">
    <SectionCard title="重点病例快速处理" subtitle="从待办队列中选择的高优先级病例">
      <div class="info-list">
        <div class="info-row"><span>核心诊断</span><b>{{ store.activePatient.diagnosis }}</b></div>
        <div class="info-row"><span>当前症状</span><b>间断咳嗽、轻度气促，无咯血</b></div>
        <div class="info-row"><span>关键影像</span><b>右上肺 3.2cm 病灶，纵隔淋巴结代谢增高</b></div>
        <div class="info-row"><span>待补项目</span><b style="color:#db4c5b">肿瘤标志物、肺功能、分子检测</b></div>
      </div>
    </SectionCard>
    <SectionCard title="专家与医院匹配" subtitle="基于病种、优先级和档期">
      <div class="info-list">
        <div class="info-row"><span>评审专家</span><b>张建国 主任 · 胸外科</b></div>
        <div class="info-row"><span>MDT团队</span><b>胸外科 / 肿瘤内科 / 放疗科</b></div>
        <div class="info-row"><span>推荐医院</span><b>{{ store.state.treatment.hospital }}</b></div>
        <div class="info-row"><span>预计入院</span><b>{{ store.state.treatment.admissionDate }}</b></div>
      </div>
      <div class="notice" style="margin-top:14px">专家评审完成后，治疗建议将自动生成医院承接任务，并向患者端展示已确认内容。</div>
    </SectionCard>
  </div>
</template>
