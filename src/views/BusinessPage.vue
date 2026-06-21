<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import PatientBanner from '../components/PatientBanner.vue'
import SectionCard from '../components/SectionCard.vue'
import StatCard from '../components/StatCard.vue'
import TaskList from '../components/TaskList.vue'
import Timeline from '../components/Timeline.vue'
import { schemaFor } from '../config/pageSchemas'
import { useDemoStore } from '../stores/demo'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()
const activeFilter = ref('全部')
const search = ref('')
const showModal = ref(false)
const message = ref('')
const system = computed(() => route.meta.system)
const page = computed(() => route.meta.page)
const schema = computed(() => schemaFor(system.value, page.value))
const prefix = computed(() => ({ china: 'china-ops', health: 'health-management' }[system.value] || system.value))
const filteredRows = computed(() => (schema.value.rows || []).filter((row) => row.cells.join(' ').toLowerCase().includes(search.value.toLowerCase())))

function openRecord(row) {
  router.push({ path: `/${prefix.value}/record/${row.id}`, query: { source: page.value } })
}
function startAction() {
  showModal.value = true
}
function confirmAction() {
  message.value = store.performAction(schema.value.primary[1])
  showModal.value = false
}
</script>

<template>
  <div :class="{ 'patient-module-page': system === 'patient' }">
    <PageHeader :eyebrow="schema.eyebrow" :title="schema.title" :subtitle="schema.description">
      <button class="primary-button" @click="startAction">{{ schema.primary[0] }}</button>
    </PageHeader>
    <PatientBanner v-if="system !== 'patient'" />
    <div v-if="message" class="action-success">✓ {{ message }}</div>

    <div v-if="schema.metrics" class="stats-grid compact-stats">
      <StatCard v-for="([label,value], index) in schema.metrics" :key="label" :label="label" :value="value" :icon="String(index + 1)" />
    </div>

    <template v-if="schema.type === 'table'">
      <SectionCard :title="schema.title + '列表'" subtitle="支持搜索、筛选、打开详情并继续办理" flush>
        <div class="business-toolbar">
          <div class="filter-tabs"><button v-for="filter in schema.filters" :key="filter" :class="{ active: activeFilter === filter }" @click="activeFilter = filter">{{ filter }}</button></div>
          <input v-model="search" placeholder="搜索患者、Case ID 或业务字段" />
        </div>
        <div class="table-scroll"><table class="data-table actionable-table">
          <thead><tr><th v-for="column in schema.columns" :key="column">{{ column }}</th><th>操作</th></tr></thead>
          <tbody><tr v-for="row in filteredRows" :key="row.id" @click="openRecord(row)">
            <td v-for="(cell,index) in row.cells" :key="index"><b v-if="index===0">{{ cell }}</b><span v-else>{{ cell }}</span></td>
            <td><button class="mini-button" @click.stop="openRecord(row)">查看详情</button></td>
          </tr></tbody>
        </table></div>
      </SectionCard>
    </template>

    <template v-else-if="schema.type === 'files' || schema.type === 'documents'">
      <div class="grid-2 business-doc-layout">
        <SectionCard title="资料目录" subtitle="按病历目录管理原件、译文、版本与授权">
          <div class="record-tree">
            <button v-for="(group,index) in ['患者基本资料','病理与诊断','影像资料','检验报告','治疗记录','合同与授权']" :key="group">▸ {{ group }} <span>{{ [2,4,3,5,2,3][index] }}</span></button>
          </div>
        </SectionCard>
        <SectionCard title="文件列表" subtitle="点击文件查看预览及版本信息">
          <div v-for="doc in store.activeDocuments" :key="doc.id" class="document-row" @click="router.push(`/${prefix}/record/${doc.id}?source=${page}`)">
            <div class="file-icon">PDF</div><div><b>{{ doc.name }}</b><small>{{ doc.type }} · {{ doc.language }} · {{ doc.source }}</small></div>
            <span class="status-pill done">{{ doc.status }}</span><button class="mini-button">预览</button>
          </div>
        </SectionCard>
      </div>
      <SectionCard v-if="schema.type === 'documents'" title="资料完整性与签约状态">
        <div class="completion-grid">
          <div v-for="item in [['身份信息','100%'],['癌症咨询表','100%'],['医疗资料','86%'],['服务合同','已签署'],['数据授权','已签署'],['费用确认','待确认']]" :key="item[0]"><span>{{ item[0] }}</span><b>{{ item[1] }}</b></div>
        </div>
      </SectionCard>
    </template>

    <template v-else-if="schema.type === 'tasks'">
      <div class="kanban-board">
        <SectionCard v-for="status in ['待处理','处理中','等待对方','已完成']" :key="status" :title="status">
          <div v-for="(task,i) in store.state.tasks.filter(t => t.to === system).slice(0,status==='待处理'?3:1)" :key="task.id + status" class="kanban-card">
            <small>{{ task.id }} · {{ task.due }}</small><b>{{ task.title }}</b><span>{{ task.owner }}</span><button class="mini-button" @click="store.completeTask(task.id)">{{ status === '已完成' ? '查看记录' : '开始处理' }}</button>
          </div>
        </SectionCard>
      </div>
    </template>

    <template v-else-if="schema.type === 'plan' || schema.type === 'review'">
      <div class="grid-2">
        <SectionCard title="临床摘要与评审结论">
          <div class="clinical-summary"><h3>{{ store.activePatient.diagnosis }}</h3><p>{{ store.state.review.summary }}</p>
            <div class="info-list"><div class="info-row"><span>评审专家</span><b>{{ store.state.review.expert }}</b></div><div class="info-row"><span>评审状态</span><b>{{ store.state.review.status }}</b></div><div class="info-row"><span>MDT时间</span><b>{{ store.state.review.meetingAt }}</b></div></div>
          </div>
        </SectionCard>
        <SectionCard title="推荐治疗路径">
          <ol class="treatment-path"><li>补充 EBUS 纵隔淋巴结取样</li><li>完成基因检测与肺功能评估</li><li>胸外科、肿瘤内科、放疗科 MDT</li><li>根据分期确定手术或综合治疗</li></ol>
          <div class="notice">{{ store.state.review.recommendation || '专家评审中，正式意见将在完成后展示。' }}</div>
        </SectionCard>
      </div>
      <SectionCard title="医院与费用方案"><div class="completion-grid"><div><span>推荐医院</span><b>{{ store.state.treatment.hospital }}</b></div><div><span>接诊科室</span><b>{{ store.state.treatment.department }}</b></div><div><span>主诊医生</span><b>{{ store.state.treatment.doctor }}</b></div><div><span>费用预估</span><b>{{ store.state.treatment.estimatedCost }}</b></div></div></SectionCard>
    </template>

    <template v-else-if="schema.type === 'journey' || schema.type === 'calendar'">
      <div class="schedule-board">
        <div v-for="item in store.state.treatment.schedule" :key="item.date" class="schedule-day"><span>{{ item.date }}</span><b>{{ item.title }}</b><small>{{ schema.type === 'calendar' ? '国际医疗中心 · 胸外科' : '专车及双语陪同已安排' }}</small><button class="mini-button" @click="router.push(`/${prefix}/record/${item.date}?source=${page}`)">查看安排</button></div>
      </div>
      <SectionCard title="协调信息"><div class="completion-grid"><div><span>预计入院</span><b>{{ store.state.treatment.admissionDate }}</b></div><div><span>床位</span><b>{{ store.state.treatment.bed }}</b></div><div><span>接送</span><b>白云机场专车</b></div><div><span>陪同</span><b>中英双语协调员</b></div></div></SectionCard>
    </template>

    <template v-else-if="schema.type === 'stages'">
      <div class="stage-list">
        <div v-for="(stage,i) in store.state.followup.stages" :key="stage.id" class="stage-card" :class="{active:stage.status==='active'}"><div class="stage-number">{{ i+1 }}</div><div><h4>{{ stage.name }}</h4><p>{{ stage.period }} · {{ stage.frequency }} · {{ stage.owner }}</p><div class="stage-items"><span v-for="item in stage.items" :key="item">{{ item }}</span></div></div><button class="mini-button" @click="router.push(`/${prefix}/record/${stage.id}?source=${page}`)">查看计划</button></div>
      </div>
    </template>

    <template v-else-if="schema.type === 'comparison'">
      <div class="hospital-comparison"><article v-for="(hospital,i) in ['广州医科大学附属第一医院','中山大学肿瘤防治中心','南方医科大学南方医院']" :key="hospital" :class="{recommended:i===0}"><span v-if="i===0">首选推荐</span><h3>{{ hospital }}</h3><p>肺癌多学科诊疗 · 国际医疗服务 · 双语协调</p><ul><li>专家匹配：{{ ['张建国 主任','周敏 教授','陈力 主任'][i] }}</li><li>床位：{{ ['可预留','3日内确认','有床位'][i] }}</li><li>预计费用：{{ ['18–23万','20–26万','16–22万'][i] }}</li><li>响应时效：{{ ['24小时','48小时','24小时'][i] }}</li></ul><button class="secondary-button" @click="router.push(`/${prefix}/record/HOS-${i+1}?source=${page}`)">查看医院方案</button></article></div>
    </template>

    <template v-else-if="schema.type === 'checklist'">
      <div class="grid-2">
        <SectionCard title="交接清单" subtitle="全部完成后才能进入下一业务阶段">
          <label v-for="(item,i) in ['患者身份与联系方式','双语病历及影像','专家治疗建议','医院接诊确认','费用及付款说明','签证航班与接送','带药与用药说明','归国复查计划']" :key="item" class="real-check"><input type="checkbox" :checked="i<5" /> <span>{{ item }}</span><small>{{ i<5?'已完成':'待处理' }}</small></label>
        </SectionCard>
        <SectionCard title="责任人与交付物"><div class="info-list"><div class="info-row"><span>中国运营</span><b>李雯 · 总协调</b></div><div class="info-row"><span>医院协调</span><b>刘敏 · 国际医疗中心</b></div><div class="info-row"><span>马来服务</span><b>Aisyah · 患者沟通</b></div><div class="info-row"><span>健康管理</span><b>Farah · 归国承接</b></div></div><Timeline /></SectionCard>
      </div>
    </template>

    <template v-else-if="schema.type === 'meeting'">
      <div class="grid-2"><SectionCard title="会议议程"><div class="meeting-agenda"><b>15:00–15:10 病例汇报</b><p>中国运营介绍病史、影像与检查缺口</p><b>15:10–15:35 多学科讨论</b><p>胸外科 / 肿瘤内科 / 放疗科发表意见</p><b>15:35–15:45 形成结论</b><p>明确补充检查、治疗路径与医院安排</p></div></SectionCard><SectionCard title="参会专家"><div v-for="person in ['张建国 · 胸外科','周敏 · 肿瘤内科','陈力 · 放疗科','李雯 · 病例协调']" :key="person" class="participant"><span>{{ person.slice(0,1) }}</span><b>{{ person }}</b><em>已确认</em></div></SectionCard></div><SectionCard title="会议记录"><textarea class="review-editor" placeholder="记录各学科意见、争议点和最终结论"></textarea></SectionCard>
    </template>

    <template v-else-if="schema.type === 'timeline'">
      <div class="inpatient-flow"><div v-for="(item,i) in ['办理入院与基线评估','完成肺功能及增强CT','MDT复核治疗方案','胸腔镜手术','术后监护与康复','出院评估与交接']" :key="item" :class="{done:i<2,current:i===2}"><i>{{ i<2?'✓':i+1 }}</i><div><b>{{ item }}</b><small>{{ i<2?'已完成':i===2?'今日 15:00 进行中':'待执行' }}</small></div><button class="mini-button">查看记录</button></div></div>
    </template>

    <template v-else-if="schema.type === 'billing'">
      <div class="grid-2"><SectionCard title="费用汇总"><div class="billing-total"><small>当前费用预估</small><strong>{{ store.state.treatment.estimatedCost }}</strong><span>已付款 ¥{{ store.state.treatment.paid.toLocaleString() }}</span></div><div class="info-list"><div class="info-row"><span>检查费用</span><b>¥18,500</b></div><div class="info-row"><span>手术及住院</span><b>¥148,000–188,000</b></div><div class="info-row"><span>药品及其他</span><b>¥13,500–23,500</b></div></div></SectionCard><SectionCard title="付款与保险"><div class="payment-step"><b>1. 费用预估确认</b><span>已发送患者</span></div><div class="payment-step"><b>2. 预付款</b><span>待支付 ¥50,000</span></div><div class="payment-step"><b>3. 正式账单</b><span>出院前生成</span></div><div class="payment-step"><b>4. 保险理赔材料</b><span>待准备</span></div></SectionCard></div>
    </template>

    <template v-else-if="schema.type === 'alerts'">
      <div class="alert-workbench"><article v-for="alert in store.state.alerts" :key="alert.id" :class="alert.severity"><header><span>{{ alert.severity==='critical'?'高危':'关注' }}</span><b>{{ alert.type }}</b><small>{{ alert.createdAt }}</small></header><h3>{{ alert.patient }} · {{ alert.caseId }}</h3><p>{{ alert.detail }}</p><footer><span>状态：{{ alert.status }}</span><button class="mini-button" @click="router.push(`/${prefix}/record/${alert.id}?source=${page}`)">进入处置</button></footer></article></div>
    </template>

    <template v-else-if="schema.type === 'quality'">
      <div class="quality-grid"><article v-for="item in [['随访按时完成率','93','目标 ≥90'],['医疗资料归档率','98','目标 ≥95'],['高危预警响应率','100','目标 100'],['患者服务满意度','96','目标 ≥92'],['跨端任务SLA','94','目标 ≥90'],['用药依从率','91','目标 ≥90']]" :key="item[0]"><span>{{ item[0] }}</span><strong>{{ item[1] }}%</strong><div><i :style="{width:item[1]+'%'}"></i></div><small>{{ item[2] }}</small></article></div><SectionCard title="本月质控问题"><table class="data-table"><thead><tr><th>问题</th><th>涉及环节</th><th>责任人</th><th>整改期限</th><th>状态</th></tr></thead><tbody><tr><td>2例随访记录逾期归档</td><td>短期康复期</td><td>Farah</td><td>6月22日</td><td>整改中</td></tr><tr><td>1例出院资料缺英文版</td><td>医院交接</td><td>刘敏</td><td>今日</td><td>待复核</td></tr></tbody></table></SectionCard>
    </template>

    <div v-if="showModal" class="business-modal-backdrop" @click.self="showModal=false">
      <form class="business-modal" @submit.prevent="confirmAction"><header><div><small>{{ schema.eyebrow }}</small><h2>{{ schema.primary[0] }}</h2></div><button type="button" @click="showModal=false">×</button></header><div class="modal-fields"><label>当前患者<input :value="store.activePatient.name + ' · ' + store.activePatient.caseId" readonly /></label><label>处理负责人<select><option>当前演示用户</option><option>李雯</option><option>Aisyah</option><option>刘协调员</option></select></label><label class="wide">处理说明<textarea placeholder="填写本次操作说明、交接要求或备注"></textarea></label><label>计划完成时间<input type="datetime-local" /></label><label>优先级<select><option>普通</option><option>高</option><option>紧急</option></select></label></div><footer><button type="button" class="secondary-button" @click="showModal=false">取消</button><button class="primary-button" type="submit">确认提交</button></footer></form>
    </div>
  </div>
</template>
