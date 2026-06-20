<script setup>
const legacyUrl = '/legacy/index.html'
</script>
<template>
  <div style="height:calc(100vh - 124px);background:#fff;border:1px solid #e4eaf2;border-radius:14px;overflow:hidden">
    <iframe :src="legacyUrl" title="旧版单页 Demo" style="width:100%;height:100%;border:0"></iframe>
  </div>
</template>
