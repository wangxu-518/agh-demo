<script setup>
defineProps({ title: String, subtitle: String, flush: Boolean })
</script>
<template>
  <section class="section-card" :class="{ flush }">
    <header v-if="title">
      <div><h3>{{ title }}</h3><p v-if="subtitle">{{ subtitle }}</p></div>
      <slot name="action" />
    </header>
    <div class="section-body"><slot /></div>
  </section>
</template>
