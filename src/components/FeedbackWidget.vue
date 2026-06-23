<script setup>
import { computed, ref } from 'vue'
import { FEEDBACK_PRIORITIES, FEEDBACK_TYPES, useFeedbackStore } from '../stores/feedback'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const feedback = useFeedbackStore()
const open = ref(false)
const type = ref(FEEDBACK_TYPES[0])
const priority = ref(FEEDBACK_PRIORITIES[0])
const content = ref('')
const message = ref('')
const submitting = ref(false)
const canShow = computed(() => auth.isPortalVerified())

function resetForm() {
  type.value = FEEDBACK_TYPES[0]
  priority.value = FEEDBACK_PRIORITIES[0]
  content.value = ''
}

function errorText(reason) {
  const labels = {
    invalid_type: '请选择反馈类型',
    invalid_priority: '请选择重要程度',
    content_too_short: '意见内容至少 5 个字',
    content_too_long: '意见内容不能超过 1000 字',
    not_verified: '请先登录 Portal 后再提交反馈',
    network_error: '反馈提交失败，请稍后再试',
  }
  return labels[reason] || reason || '反馈提交失败，请稍后再试'
}

async function submit() {
  message.value = ''
  submitting.value = true
  const result = await feedback.submitFeedback({
    type: type.value,
    priority: priority.value,
    content: content.value,
  }, auth)
  submitting.value = false
  if (!result.ok) {
    message.value = errorText(result.reason)
    return
  }
  resetForm()
  open.value = false
  message.value = '已收到，谢谢反馈'
  window.setTimeout(() => {
    if (message.value === '已收到，谢谢反馈') message.value = ''
  }, 2600)
}
</script>

<template>
  <div v-if="canShow" class="feedback-widget">
    <button class="feedback-fab" type="button" @click="open = true">反馈</button>
    <p v-if="message && !open" class="feedback-toast">{{ message }}</p>

    <div v-if="open" class="business-modal-backdrop" @click.self="open = false">
      <form class="business-modal feedback-modal" @submit.prevent="submit">
        <header>
          <div>
            <small>DEMO FEEDBACK</small>
            <h2>意见反馈</h2>
          </div>
          <button type="button" aria-label="关闭反馈表单" @click="open = false">×</button>
        </header>
        <div class="modal-fields">
          <label>反馈类型
            <select v-model="type">
              <option v-for="item in FEEDBACK_TYPES" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>重要程度
            <select v-model="priority">
              <option v-for="item in FEEDBACK_PRIORITIES" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label class="wide">意见内容
            <textarea v-model="content" maxlength="1000" required placeholder="请直接写下建议、问题或看不理解的地方"></textarea>
          </label>
          <p v-if="message" class="form-error wide">{{ message }}</p>
        </div>
        <footer>
          <button class="secondary-button" type="button" @click="open = false">取消</button>
          <button class="primary-button" type="submit" :disabled="submitting">{{ submitting ? '提交中' : '提交反馈' }}</button>
        </footer>
      </form>
    </div>
  </div>
</template>
