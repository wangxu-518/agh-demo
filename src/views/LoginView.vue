<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { systems } from '../config/systems'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const system = computed(() => route.meta.system)
const config = computed(() => systems[system.value])
const credentials = auth.credentialsForSystem(system.value)
const account = ref(credentials.account)
const password = ref(credentials.password)
const error = ref('')

function submit() {
  if (auth.login(system.value, account.value, password.value)) router.push(config.value.home)
  else error.value = '账号或密码错误，请联系管理员确认演示账号'
}
</script>

<template>
  <main class="login-page" :style="{ '--system-color': config.color }">
    <section class="login-story">
      <div class="login-brand"><span>{{ config.icon }}</span><b>AGH International Care</b></div>
      <div>
        <p class="eyebrow">Independent demo system</p>
        <h1>{{ config.name }}</h1>
        <p>{{ config.en }}</p>
        <div class="login-flow">
          <span>患者唯一ID</span><i>→</i><span>角色授权</span><i>→</i><span>任务交接</span><i>→</i><span>全程留痕</span>
        </div>
      </div>
      <small>本系统为匿名化业务演示，不用于真实诊疗。</small>
    </section>
    <section class="login-panel">
      <form class="login-card" @submit.prevent="submit">
        <div class="login-icon">{{ config.icon }}</div>
        <h2>登录{{ config.short }}</h2>
        <p>已通过 Portal 姓名手机号登录，系统已带出本端演示账号</p>
        <label>账号<input v-model="account" autocomplete="username" readonly /></label>
        <label>密码<input v-model="password" type="text" autocomplete="current-password" readonly /></label>
        <p v-if="error" class="form-error">{{ error }}</p>
        <button class="primary-button login-submit" type="submit">进入系统</button>
      </form>
    </section>
  </main>
</template>
