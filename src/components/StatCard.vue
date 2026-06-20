<script setup>
defineProps({ label: String, value: [String, Number], note: String, tone: { type: String, default: 'blue' }, icon: String })
</script>
<template>
  <div class="stat-card">
    <div class="stat-icon" :class="tone">{{ icon }}</div>
    <div><p>{{ label }}</p><strong>{{ value }}</strong><small>{{ note }}</small></div>
  </div>
</template>
