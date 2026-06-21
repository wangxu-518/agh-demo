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
const account = ref(config.value.account)
const password = ref(config.value.password)
const error = ref('')

function submit() {
  if (auth.login(system.value, account.value, password.value)) router.push(config.value.home)
  else error.value = '账号或密码错误，请使用页面提供的演示账号'
}
function quickLogin() {
  auth.demoLogin(system.value)
  router.push(config.value.home)
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
        <p>输入演示账号进入独立业务系统</p>
        <label>账号<input v-model="account" autocomplete="username" /></label>
        <label>密码<input v-model="password" type="password" autocomplete="current-password" /></label>
        <p v-if="error" class="form-error">{{ error }}</p>
        <button class="primary-button login-submit" type="submit">登录系统</button>
        <button class="secondary-button login-submit" type="button" @click="quickLogin">一键进入演示</button>
        <div class="demo-credential">
          <b>演示账号</b><span>{{ config.account }}</span><span>密码：{{ config.password }}</span>
        </div>
      </form>
    </section>
  </main>
</template>
