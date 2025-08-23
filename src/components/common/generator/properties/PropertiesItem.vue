<script setup>
const { inputProperties, inputPropertiesError, inputLabel } = defineProps({
  inputProperties: String,
  inputPropertiesError: String,
  inputLabel: String,
})
</script>

<template>
  <div class="mb-2">
    <strong>{{ inputLabel }} : </strong>
    <span>
      {{ inputProperties || inputPropertiesError }}
    </span>
  </div>
</template>

<style scoped></style>
