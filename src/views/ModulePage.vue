<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import PatientBanner from '../components/PatientBanner.vue'
import SectionCard from '../components/SectionCard.vue'
import TaskList from '../components/TaskList.vue'
import Timeline from '../components/Timeline.vue'
import { useDemoStore } from '../stores/demo'
import { systems } from '../config/systems'

const route = useRoute()
const store = useDemoStore()
const message = ref('')
const system = computed(() => route.meta.system)
const page = computed(() => route.meta.page)
const config = computed(() => systems[system.value])

const pageContent = computed(() => {
  const map = {
    patient: {
      records: ['我的医疗资料', '查看、补充和下载跨境医疗档案', '上传新资料', 'uploadDocument'],
      plan: ['治疗方案', '查看专家意见、医院方案与费用预估', '确认已阅读方案', 'confirmPlan'],
      travel: ['赴华行程', '签证、航班、接送、入院和陪同安排', '确认行程', 'confirmTravel'],
      followup: ['归国随访', '查看五阶段随访、用药提醒与应急入口', '确认本周随访', 'completeFollowup'],
    },
    malaysia: {
      leads: ['线索管理', '承接 Facebook、TikTok、转介绍和 WhatsApp 咨询', '新建咨询线索', 'createLead'],
      cases: ['患者与 Case', '患者档案、阶段、负责人和资料完整度', '提交主案例', 'submitCase'],
      documents: ['资料与签约', '双语咨询表、合同、授权和医疗资料检查', '补齐并锁定资料', 'lockDocuments'],
      tasks: ['跨国协同', '查看中国运营退回项、SLA和交接记录', '完成首个待办', 'completeMalaysiaTask'],
      resources: ['本地资源', '医院、检验、康复、药房和保险资源网络', '预约首次复查', 'bookLocalResource'],
    },
    china: {
      intake: ['病例接收', '接收马来团队提交的 Case，核验授权与资料版本', '确认接收病例', 'acceptChinaCase'],
      records: ['诊疗资料中心', '原始资料、翻译件、结构化摘要和版本管理', '发布中文摘要', 'publishSummary'],
      experts: ['专家协调', '选择专家、设置 SLA、安排 MDT 和意见回收', '分配专家', 'assignExpert'],
      hospitals: ['医院匹配', '按病种、专家、床位、费用和国际服务能力匹配', '发送承接申请', 'requestHospital'],
      handoff: ['跨国交接', '患者、马来团队、中国团队和医院的交接清单', '完成赴华交接', 'completeHandoff'],
    },
    expert: {
      queue: ['待评审病例', '按紧急度、资料完整度和截止时间排序', '接收主案例', 'claimReview'],
      case: ['病例详情', '结构化摘要、原始病历、影像和检查缺口', '提交评审意见', 'finishReview'],
      mdt: ['MDT 会诊', '参会专家、议题、会议记录和结论确认', '完成 MDT', 'finishMdt'],
      history: ['历史评审', '查看意见版本、复查解读和修改留痕', '复制历史意见', 'copyReview'],
    },
    hospital: {
      intake: ['接诊申请', '审核患者信息、专家意见、预计日期和费用', '确认承接', 'acceptHospital'],
      schedule: ['床位与日程', '预留床位、检查、手术和出院计划', '确认日程', 'confirmSchedule'],
      inpatient: ['在院管理', '入院检查、治疗节点、病情沟通和家属同步', '推进到术后', 'advanceTreatment'],
      billing: ['费用管理', '预估、预付款、账单和保险材料状态', '登记预付款', 'recordPayment'],
      discharge: ['出院交接', '双语出院资料、带药、复查计划和归国交接', '完成出院交接', 'completeDischarge'],
    },
    health: {
      followups: ['随访计划', '按五阶段动态生成频次、项目、角色和提醒', '生成五阶段计划', 'generateFollowup'],
      medication: ['用药管理', '方案、提醒、依从性、副作用和续药', '确认今日用药', 'confirmMedication'],
      rehab: ['康复与护理', '康复评估、训练、营养、生命体征与护理记录', '完成康复评估', 'completeRehab'],
      alerts: ['预警与应急', '高危指标、分级响应、专家复评和事件复盘', '升级首个预警', 'escalateAlert'],
      quality: ['服务质控', '随访完成率、归档率、满意度和应急响应率', '生成质控报告', 'generateQuality'],
    },
  }
  return map[system.value]?.[page.value] || [route.meta.title, '业务功能演示页面', '执行操作', 'generic']
})

function execute() {
  message.value = store.performAction(pageContent.value[3])
}
</script>

<template>
  <div :class="{ 'patient-module-page': system === 'patient' }">
    <PageHeader :eyebrow="config.en" :title="pageContent[0]" :subtitle="pageContent[1]">
      <button class="primary-button" @click="execute">{{ pageContent[2] }}</button>
    </PageHeader>
    <PatientBanner v-if="system !== 'patient'" />
    <div v-if="message" class="action-success">✓ {{ message }}</div>

    <div v-if="system === 'patient'" class="mobile-list-card">
      <template v-if="page === 'records'">
        <div v-for="doc in store.activeDocuments" :key="doc.id" class="mobile-row"><div class="mobile-row-icon">PDF</div><div class="mobile-row-copy"><b>{{ doc.name }}</b><small>{{ doc.type }} · v{{ doc.version }} · {{ doc.status }}</small></div><button class="mini-button">查看</button></div>
      </template>
      <template v-else-if="page === 'plan'">
        <div class="info-list"><div class="info-row"><span>专家</span><b>{{ store.state.review.expert }}</b></div><div class="info-row"><span>推荐医院</span><b>{{ store.state.treatment.hospital }}</b></div><div class="info-row"><span>方案状态</span><b>{{ store.state.review.status }}</b></div><div class="info-row"><span>费用预估</span><b>{{ store.state.treatment.estimatedCost }}</b></div></div>
      </template>
      <template v-else-if="page === 'travel'">
        <div v-for="item in store.state.treatment.schedule" :key="item.date" class="mobile-row"><div class="mobile-row-icon">✈</div><div class="mobile-row-copy"><b>{{ item.title }}</b><small>{{ item.date }}</small></div><span class="status-pill pending">{{ item.status }}</span></div>
      </template>
      <template v-else>
        <div v-for="(stage, i) in store.state.followup.stages" :key="stage.id" class="mobile-row"><div class="mobile-row-icon">{{ i + 1 }}</div><div class="mobile-row-copy"><b>{{ stage.name }}</b><small>{{ stage.period }} · {{ stage.frequency }}</small></div><span class="status-pill" :class="stage.status === 'active' ? 'done' : 'pending'">{{ stage.status }}</span></div>
      </template>
    </div>

    <div v-else class="grid-2">
      <SectionCard :title="pageContent[0] + '列表'" subtitle="点击记录可切换当前案例或进入详情">
        <table class="data-table"><thead><tr><th>患者 / CASE</th><th>诊断</th><th>阶段</th><th>负责人</th><th>操作</th></tr></thead><tbody>
          <tr v-for="patient in store.state.patients" :key="patient.id"><td><div class="table-patient"><div class="small-avatar">{{ patient.avatar }}</div><div><b>{{ patient.name }}</b><small>{{ patient.caseId }}</small></div></div></td><td>{{ patient.diagnosis }}</td><td><span class="status-pill" :class="patient.risk">{{ patient.phaseLabel }}</span></td><td>{{ patient.owner }}</td><td><button class="mini-button" @click="store.setActiveCase(patient.caseId)">打开</button></td></tr>
        </tbody></table>
      </SectionCard>
      <SectionCard title="当前案例操作记录" subtitle="动作会同步到其他独立系统"><Timeline /></SectionCard>
    </div>
    <SectionCard
      v-if="system !== 'patient' && ['tasks', 'queue', 'intake', 'followups', 'alerts'].includes(page)"
      title="任务队列"
      subtitle="由其他系统动作触发，并按承接角色自动进入本系统"
    >
      <TaskList :system="system" />
    </SectionCard>
  </div>
</template>
