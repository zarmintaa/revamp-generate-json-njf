<!-- /components/common/skeleton/SkeletonLoader.vue -->

<template>
  <div class="skeleton-wrapper">
    <div
      class="skeleton"
      :class="[`skeleton-${variant}`, { 'skeleton-animated': animated }]"
      :style="customStyle"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'rectangular', 'circular', 'rounded'].includes(value),
  },
  width: {
    type: [String, Number],
    default: undefined,
  },
  height: {
    type: [String, Number],
    default: undefined,
  },
  animated: {
    type: Boolean,
    default: true,
  },
})

const customStyle = computed(() => {
  const styles = {}

  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  if (props.height) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  return styles
})
</script>

<style scoped>
.skeleton-wrapper {
  display: inline-block;
  width: 100%;
}

.skeleton {
  background-color: #e2e8f0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton-animated {
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-text {
  height: 1rem;
  margin-bottom: 0.5rem;
}

.skeleton-text:last-child {
  margin-bottom: 0;
}

.skeleton-rectangular {
  height: 2rem;
}

.skeleton-circular {
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
}

.skeleton-rounded {
  border-radius: 8px;
  height: 2rem;
}

@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
