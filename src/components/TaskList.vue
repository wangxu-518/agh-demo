<script setup>
import { useDemoStore } from '../stores/demo'
defineProps({ system: String })
const store = useDemoStore()
</script>
<template>
  <div class="task-list">
    <div v-for="task in store.state.tasks.filter(t => !system || t.to === system)" :key="task.id" class="task-row">
      <span class="priority-dot" :class="task.priority"></span>
      <div class="task-copy"><b>{{ task.title }}</b><small>{{ task.id }} · 负责人 {{ task.owner }} · {{ task.due }}</small></div>
      <span class="status-pill" :class="task.status">{{ task.status === 'done' ? '已完成' : task.status === 'blocked' ? '等待中' : '待处理' }}</span>
      <button v-if="task.status !== 'done'" class="mini-button" @click="store.completeTask(task.id)">完成</button>
    </div>
    <div v-if="!store.state.tasks.filter(t => !system || t.to === system).length" class="empty-state">暂无待办</div>
  </div>
</template>
