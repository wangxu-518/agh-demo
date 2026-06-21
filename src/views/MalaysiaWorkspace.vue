<script setup>
import { ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import StatCard from '../components/StatCard.vue'
import TaskList from '../components/TaskList.vue'
import { useDemoStore } from '../stores/demo'
const store = useDemoStore()
const tab = ref('crm')
const showPatientForm = ref(false)
const patientForm = ref({ name: '', phone: '', diagnosis: '', city: '', source: 'WhatsApp', owner: 'Aisyah' })
const formMessage = ref('')

function createPatient() {
  const result = store.createPatient(patientForm.value)
  formMessage.value = result.message
  if (result.ok) {
    showPatientForm.value = false
    patientForm.value = { name: '', phone: '', diagnosis: '', city: '', source: 'WhatsApp', owner: 'Aisyah' }
  }
}
</script>
<template>
  <PageHeader eyebrow="Malaysia service workspace" title="马来服务团队工作台" subtitle="从广告线索到签约、资料收集和中国团队交接">
    <button class="secondary-button" @click="showPatientForm=true">＋ 新建患者</button>
    <button class="primary-button" @click="formMessage=store.submitCase().message">提交中国运营审核</button>
  </PageHeader>
  <div v-if="formMessage" class="action-success">{{ formMessage }}</div>
  <div class="stats-grid">
    <StatCard label="今日新线索" value="12" note="Facebook 占58%" icon="+" />
    <StatCard label="待补资料" value="7" note="2例今天到期" icon="▤" tone="orange" />
    <StatCard label="本月签约" value="18" note="转化率 31.6%" icon="✓" tone="green" />
    <StatCard label="需关注患者" value="3" note="含1例高风险" icon="!" tone="red" />
  </div>
  <div class="grid-2">
    <SectionCard title="患者 CRM" subtitle="线索、签约与Case状态统一管理" flush>
      <div class="tabs" style="margin:0;padding:0 14px">
        <button v-for="item in ['crm','documents','contract','resources']" :key="item" class="tab-button" :class="{active:tab===item}" @click="tab=item">{{ {crm:'患者列表',documents:'资料完整性',contract:'合同与授权',resources:'本地资源'}[item] }}</button>
      </div>
      <table class="data-table">
        <thead><tr><th>患者 / CASE</th><th>诊断</th><th>阶段</th><th>完整度</th><th>负责人</th></tr></thead>
        <tbody><tr v-for="patient in store.state.patients" :key="patient.id" @click="store.setActiveCase(patient.caseId)">
          <td><div class="table-patient"><div class="small-avatar">{{ patient.avatar }}</div><div><b>{{ patient.name }}</b><small>{{ patient.caseId }}</small></div></div></td>
          <td>{{ patient.diagnosis }}</td><td><span class="status-pill" :class="patient.risk">{{ patient.phaseLabel }}</span></td>
          <td><b>{{ patient.completeness }}%</b></td><td>{{ patient.owner }}</td>
        </tr></tbody>
      </table>
    </SectionCard>
    <SectionCard title="我的跨端待办" subtitle="完成后自动同步其他工作台"><TaskList system="malaysia" /></SectionCard>
  </div>
  <SectionCard title="主案例交接检查清单" subtitle="满足交接门槛后方可进入中国运营">
    <div class="grid-3">
      <div class="check-list">
        <div class="check-item"><span class="check-mark">✓</span>双语癌症咨询表</div>
        <div class="check-item"><span class="check-mark">✓</span>患者身份及联系方式</div>
        <div class="check-item"><span class="check-mark">✓</span>跨境数据授权书</div>
      </div>
      <div class="check-list">
        <div class="check-item"><span class="check-mark">✓</span>病理与影像资料</div>
        <div class="check-item"><span class="check-mark">✓</span>既往治疗记录</div>
        <div class="check-item"><span class="check-mark">!</span>最新肿瘤标志物待补</div>
      </div>
      <div class="notice">系统会在提交时生成中国运营任务，并锁定当前资料版本。后续补充资料以新版本追加，不覆盖原始医疗记录。</div>
    </div>
  </SectionCard>
  <div v-if="showPatientForm" class="business-modal-backdrop" @click.self="showPatientForm=false">
    <form class="business-modal" @submit.prevent="createPatient">
      <header><div><small>PATIENT INTAKE</small><h2>建立患者档案</h2></div><button type="button" @click="showPatientForm=false">×</button></header>
      <div class="modal-fields">
        <label>患者姓名<input v-model="patientForm.name" required /></label>
        <label>联系电话<input v-model="patientForm.phone" required /></label>
        <label>所在城市<input v-model="patientForm.city" /></label>
        <label>线索来源<select v-model="patientForm.source"><option>WhatsApp</option><option>Facebook</option><option>TikTok</option><option>患者转介绍</option></select></label>
        <label class="wide">初步诊断或病情描述<textarea v-model="patientForm.diagnosis" required></textarea></label>
      </div>
      <footer><button type="button" class="secondary-button" @click="showPatientForm=false">取消</button><button class="primary-button" type="submit">建立档案</button></footer>
    </form>
  </div>
</template>
