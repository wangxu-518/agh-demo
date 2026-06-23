<script setup>
import { computed, ref } from 'vue'
import { systems } from '../config/systems'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const visitorName = ref('')
const visitorPhone = ref('')
const error = ref('')
const isVerified = computed(() => auth.isPortalVerified())
const isAdmin = computed(() => auth.isPortalAdmin())
const loginHistory = computed(() => auth.portalHistory.slice(0, 8))

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

function submitPortalLogin() {
  error.value = ''
  const result = auth.loginWithContact(visitorName.value, visitorPhone.value)
  if (result.ok) return
  error.value = result.reason === 'invalid_name'
    ? '请输入真实姓名，至少 2 个字符。'
    : '请输入有效的中国大陆手机号。'
}

function logoutPortal() {
  auth.logoutPortal()
  error.value = ''
}

function openSystem(key) {
  window.open(`/${prefixes[key]}/login`, '_blank', 'noopener,noreferrer')
}

function formatTime(value) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function historyLabel(item) {
  if (item.type === 'system_login') return `进入${item.systemName}`
  return '手机号登录 Portal'
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

    <section v-if="!isVerified" class="portal-content portal-auth-content">
      <form class="portal-auth-card" @submit.prevent="submitPortalLogin">
        <div>
          <p class="eyebrow">CONTACT LOGIN</p>
          <h2>填写姓名和手机号后进入演示门户</h2>
          <p>系统会校验手机号格式并记录登录人，避免外部人员随意打开演示系统。</p>
        </div>
        <label>姓名<input v-model="visitorName" autocomplete="name" placeholder="请输入真实姓名" /></label>
        <label>手机号<input v-model="visitorPhone" autocomplete="tel" inputmode="tel" placeholder="请输入中国大陆手机号" /></label>
        <p v-if="error" class="form-error">{{ error }}</p>
        <button class="primary-button portal-auth-submit" type="submit">登录 Portal</button>
      </form>
    </section>

    <section v-else class="portal-content">
      <div class="portal-section-title">
        <div>
          <p class="eyebrow">SYSTEM PORTAL</p>
          <h2>六个独立子系统</h2>
          <span class="portal-user">当前登录人：{{ auth.portalSession.name }} · {{ auth.maskPhone(auth.portalSession.phone) }}</span>
        </div>
        <p><button class="ghost-button" type="button" @click="logoutPortal">退出入口验证</button></p>
      </div>
      <div class="portal-grid">
        <button
          v-for="(system, key) in systems"
          :key="key"
          class="portal-system-card"
          :style="{ '--portal-color': system.color }"
          type="button"
          @click="openSystem(key)"
        >
          <div class="portal-system-icon">{{ system.icon }}</div>
          <div class="portal-system-copy">
            <span>{{ system.en }}</span>
            <h3>{{ system.name }}</h3>
            <p>{{ descriptions[key] }}</p>
          </div>
          <div class="portal-system-footer">
            <span>账号由管理员分配</span>
            <b>进入登录 →</b>
          </div>
        </button>
      </div>
      <section v-if="isAdmin" class="portal-history">
        <header>
          <div><p class="eyebrow">LOGIN HISTORY</p><h2>登录历史</h2></div>
          <button class="ghost-button" type="button" @click="auth.clearPortalHistory()">清空记录</button>
        </header>
        <div v-if="loginHistory.length" class="portal-history-list">
          <div v-for="item in loginHistory" :key="item.id" class="portal-history-row">
            <span>{{ formatTime(item.at) }}</span>
            <b>{{ item.nickname }}</b>
            <em>{{ item.company }}</em>
            <strong>{{ historyLabel(item) }}</strong>
          </div>
        </div>
        <p v-else class="portal-history-empty">暂无登录记录</p>
      </section>
      <footer class="portal-footer">
        <span>匿名化演示数据 · 不用于真实医疗诊断</span>
        <span>AGH Cross-border Oncology Demo</span>
      </footer>
    </section>
  </main>
</template>
