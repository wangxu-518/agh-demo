<script setup>
defineProps({
  eyebrow: String,
  title: String,
  subtitle: String,
})
</script>

<template>
  <div class="page-header">
    <div>
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
    <div class="page-actions"><slot /></div>
  </div>
</template>
