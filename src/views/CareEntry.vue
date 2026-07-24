<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PwaInstallPrompt from '../components/PwaInstallPrompt.vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

function enterCare() {
  auth.demoLogin('patient')
  router.push('/patient/home')
}

onMounted(() => {
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  if (standalone) enterCare()
})
</script>

<template>
  <main class="care-entry">
    <section class="care-entry-panel">
      <header><img src="/icons/icon-192.png" alt="AGH Care" /><div><b>AGH Care</b><small>PATIENT SERVICE</small></div></header>
      <div class="care-entry-message">
        <span>跨境治疗 · 归国健康管理</span>
        <h1>您的治疗旅程，清晰地放在手中</h1>
        <p>安全查看医疗资料、专家方案、赴华行程和康复随访。</p>
      </div>
      <div class="care-entry-trust"><span><i></i>匿名化演示数据</span><span><i></i>加密连接</span></div>
      <button class="care-entry-primary" type="button" @click="enterCare">进入患者服务</button>
      <PwaInstallPrompt variant="entry" />
      <small class="care-entry-disclaimer">本Demo不用于真实医疗诊断或紧急医疗服务</small>
    </section>
  </main>
</template>
