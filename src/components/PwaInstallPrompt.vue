<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({ variant: { type: String, default: 'icon' } })

const deferredPrompt = ref(null)
const showSheet = ref(false)
const installed = ref(false)
const copied = ref(false)
const online = ref(navigator.onLine)
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
const isSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent)

const statusLabel = computed(() => {
  if (!online.value) return '当前离线'
  if (installed.value) return '已安装到桌面'
  return '安全连接'
})

function syncInstalled() {
  installed.value = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function captureInstall(event) {
  event.preventDefault()
  deferredPrompt.value = event
}

function updateOnline() {
  online.value = navigator.onLine
}

async function requestInstall() {
  if (installed.value) return
  if (deferredPrompt.value) {
    await deferredPrompt.value.prompt()
    const choice = await deferredPrompt.value.userChoice
    if (choice.outcome === 'accepted') installed.value = true
    deferredPrompt.value = null
    return
  }
  showSheet.value = true
}

async function copyLink() {
  await navigator.clipboard?.writeText(window.location.href)
  copied.value = true
  window.setTimeout(() => { copied.value = false }, 1800)
}

onMounted(() => {
  syncInstalled()
  window.addEventListener('beforeinstallprompt', captureInstall)
  window.addEventListener('appinstalled', syncInstalled)
  window.addEventListener('online', updateOnline)
  window.addEventListener('offline', updateOnline)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', captureInstall)
  window.removeEventListener('appinstalled', syncInstalled)
  window.removeEventListener('online', updateOnline)
  window.removeEventListener('offline', updateOnline)
})
</script>

<template>
  <button
    v-if="variant === 'entry' && !installed"
    class="care-entry-install"
    type="button"
    @click="requestInstall"
  >
    <span>↓</span>
    安装到手机桌面
  </button>
  <button
    v-else-if="variant === 'icon' && !installed"
    class="pwa-install-icon"
    type="button"
    title="安装 AGH Care"
    aria-label="安装 AGH Care"
    @click="requestInstall"
  >
    <span>↓</span>
  </button>
  <span v-else-if="variant === 'icon'" class="pwa-connection" :class="{ offline: !online }">
    <i></i>{{ statusLabel }}
  </span>

  <Teleport to="body">
    <div v-if="showSheet" class="pwa-sheet-backdrop" @click.self="showSheet = false">
      <section class="pwa-install-sheet" role="dialog" aria-modal="true" aria-labelledby="pwa-install-title">
        <header>
          <img src="/icons/icon-192.png" alt="AGH Care" />
          <div><small>INSTALL AGH CARE</small><h2 id="pwa-install-title">添加到苹果手机桌面</h2></div>
          <button type="button" aria-label="关闭" @click="showSheet = false">×</button>
        </header>
        <p v-if="isIOS && !isSafari" class="pwa-browser-note">请先使用 Safari 打开当前页面，再按以下步骤安装。</p>
        <div class="pwa-install-steps">
          <article><span>1</span><div><b>点击 Safari 底部的分享按钮</b><small>图标是一个向上箭头的方框</small></div><i>⇧</i></article>
          <article><span>2</span><div><b>选择“添加到主屏幕”</b><small>在分享菜单中向下滑动即可找到</small></div><i>＋</i></article>
          <article><span>3</span><div><b>确认名称并点击“添加”</b><small>桌面将出现 AGH Care 图标</small></div><i>✓</i></article>
        </div>
        <p class="pwa-privacy-note">安装不会复制患者资料到手机相册或其他应用。退出账号后仍需重新登录。</p>
        <button class="pwa-copy-link" type="button" @click="copyLink">{{ copied ? '链接已复制' : '复制当前安全链接' }}</button>
      </section>
    </div>
  </Teleport>
</template>
