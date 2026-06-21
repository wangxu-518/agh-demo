<script setup>
import PageHeader from '../components/PageHeader.vue'
import SectionCard from '../components/SectionCard.vue'
import StatCard from '../components/StatCard.vue'
import { useDemoStore } from '../stores/demo'
const store = useDemoStore()
</script>
<template>
  <PageHeader eyebrow="Post-return care workspace" title="归国全生命周期健康管理中心" subtitle="五阶段服务计划连接健康管家、中马医生、本地医护、检验、康复与药房">
    <button class="secondary-button">创建随访任务</button>
    <button class="primary-button" @click="store.generateFollowup()">生成五阶段计划</button>
  </PageHeader>
  <div class="stats-grid">
    <StatCard label="今日随访" value="16" note="完成率 81%" icon="✓" />
    <StatCard label="用药待确认" value="5" note="2例超过2小时" icon="Rx" tone="orange" />
    <StatCard label="本周复查" value="9" note="检验机构已预约" icon="Lab" tone="green" />
    <StatCard label="高危预警" :value="store.state.alerts.filter(a => a.status === 'open').length" note="需立即分级响应" icon="!" tone="red" />
  </div>
  <div class="grid-2">
    <SectionCard title="重点患者五阶段计划" :subtitle="store.state.followup.generated ? '计划已生成并同步' : '从待制定计划列表进入'">
      <div class="stage-list">
        <div v-for="(stage, i) in store.state.followup.stages" :key="stage.id" class="stage-card" :class="{active:stage.status==='active'}">
          <div class="stage-number">{{ i + 1 }}</div>
          <div><h4>{{ stage.name }} <small style="font-weight:400">{{ stage.period }}</small></h4><p>{{ stage.frequency }} · {{ stage.owner }}</p><div class="stage-items"><span v-for="item in stage.items" :key="item">{{ item }}</span></div></div>
          <span class="status-pill" :class="stage.status === 'active' ? 'done' : 'pending'">{{ stage.status === 'active' ? '进行中' : '待启动' }}</span>
        </div>
      </div>
    </SectionCard>
    <div>
      <SectionCard title="高危预警中心" subtitle="分级、升级、复盘全程留痕">
        <div v-for="alert in store.state.alerts" :key="alert.id" class="alert-card">
          <div style="display:flex;justify-content:space-between;gap:10px"><h4>{{ alert.patient }} · {{ alert.type }}</h4><span class="status-pill" :class="alert.status">{{ alert.status === 'escalated' ? '已升级' : '待处理' }}</span></div>
          <p>{{ alert.detail }}</p>
          <button v-if="alert.status === 'open'" class="primary-button danger-button" @click="store.escalateAlert(alert.id)">升级专家复评</button>
        </div>
      </SectionCard>
      <SectionCard title="服务质控" subtitle="参考归国服务SOP">
        <div class="info-list">
          <div class="info-row"><span>随访按时完成率</span><b style="color:#1d9f79">98.6%</b></div>
          <div class="info-row"><span>24小时记录归档率</span><b>100%</b></div>
          <div class="info-row"><span>患者满意度</span><b>96.2%</b></div>
          <div class="info-row"><span>应急15分钟响应率</span><b style="color:#1d9f79">100%</b></div>
        </div>
      </SectionCard>
    </div>
  </div>
  <SectionCard title="专业服务工作台">
    <div class="grid-3">
      <div v-for="item in [
        ['健康管家','随访排期、沟通、理赔、应急首接','18项待办'],
        ['本地医护','生命体征、护理、用药副作用','7项待办'],
        ['检验中心','项目确认、预约、采样与结果','4项待办'],
        ['康复师','评估、训练、营养和效果复盘','6项待办'],
        ['药房对接','供应、冷链、依从性和药品安全','3项待办'],
        ['医疗质控组','疑难病例、事件复盘、服务抽检','2项待办'],
      ]" :key="item[0]" class="system-card" style="min-height:135px">
        <h3>{{ item[0] }}</h3><p>{{ item[1] }}</p><footer><span>{{ item[2] }}</span><b>打开工作台 →</b></footer>
      </div>
    </div>
  </SectionCard>
</template>
