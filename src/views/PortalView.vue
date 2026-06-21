<script setup>
import { systems } from '../config/systems'

const prefixes = {
  patient: 'patient',
  malaysia: 'malaysia',
  china: 'china-ops',
  expert: 'expert',
  hospital: 'hospital',
  health: 'health-management',
}

const descriptions = {
  patient: '查询医疗资料、治疗方案、赴华行程与归国随访',
  malaysia: '管理咨询线索、患者签约、资料与跨国协同',
  china: '完成病例整理、专家协调、医院匹配与赴华交接',
  expert: '处理病例评审、MDT 会诊与复查意见',
  hospital: '管理接诊、床位日程、在院治疗、费用与出院',
  health: '执行五阶段随访、用药、康复、预警与服务质控',
}
</script>

<template>
  <main class="portal-page">
    <header class="portal-header">
      <div class="portal-brand"><span>AGH</span><b>International Cancer Care</b></div>
      <div class="portal-heading">
        <p class="eyebrow">CROSS-BORDER ONCOLOGY DEMO</p>
        <h1>跨境肿瘤医疗协同平台</h1>
        <p>请选择需要演示的独立业务系统。每个系统拥有独立登录、业务页面和角色权限。</p>
      </div>
      <div class="portal-case"><span>演示范围</span><b>咨询 · 评审 · 治疗 · 归国健康管理</b></div>
    </header>

    <section class="portal-content">
      <div class="portal-section-title">
        <div><p class="eyebrow">SYSTEM PORTAL</p><h2>六个独立子系统</h2></div>
        <p>所有演示账号密码均为 <b>123456</b></p>
      </div>
      <div class="portal-grid">
        <a
          v-for="(system, key) in systems"
          :key="key"
          class="portal-system-card"
          :style="{ '--portal-color': system.color }"
          :href="`/${prefixes[key]}/login`"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="portal-system-icon">{{ system.icon }}</div>
          <div class="portal-system-copy">
            <span>{{ system.en }}</span>
            <h3>{{ system.name }}</h3>
            <p>{{ descriptions[key] }}</p>
          </div>
          <div class="portal-system-footer">
            <span>{{ system.account }}</span>
            <b>进入登录 →</b>
          </div>
        </a>
      </div>
      <footer class="portal-footer">
        <span>匿名化演示数据 · 不用于真实医疗诊断</span>
        <span>AGH Cross-border Oncology Demo</span>
      </footer>
    </section>
  </main>
</template>
