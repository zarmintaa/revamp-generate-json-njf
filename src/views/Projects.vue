<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const title = route.meta?.title || 'Projects'
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title fw-medium mb-4">{{ title }}</h5>
      <p class="mb-0">This is a Projects Task page</p>
    </div>
  </div>
</template>
