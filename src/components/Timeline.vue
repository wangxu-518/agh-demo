<script setup>
import { useDemoStore } from '../stores/demo'
const store = useDemoStore()
</script>
<template>
  <div class="timeline">
    <div v-for="event in store.state.events" :key="event.id" class="timeline-item">
      <span class="timeline-dot" :class="event.system"></span>
      <div><b>{{ event.title }}</b><p>{{ event.detail }}</p><small>{{ event.at }} · {{ event.actor }}</small></div>
    </div>
  </div>
</template>
