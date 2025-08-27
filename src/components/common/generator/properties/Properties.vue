<script setup>
const { title } = defineProps({
  title: String,
})

</script>

<template>
  <div class="card">
    <div class="card-header">
      <div>{{title ?? "Setting Properties"}}</div>
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
