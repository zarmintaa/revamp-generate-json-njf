<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', 'show', 'mb-2', 'border-0', 'shadow-lg', toastClass(toast.type)]"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style="min-width: 300px"
      >
        <div class="toast-header">
          <i :class="iconClass(toast.type)" class="me-2"></i>
          <strong class="me-auto">{{ toast.title }}</strong>
          <button
            type="button"
            class="btn-close"
            @click="removeToast(toast.id)"
            aria-label="Close"
          ></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const toastClass = (type) => {
  switch (type) {
    case 'success':
      return 'text-bg-success'
    case 'error':
      return 'text-bg-danger'
    case 'warning':
      return 'text-bg-warning'
    case 'info':
      return 'text-bg-info'
    default:
      return 'text-bg-info'
  }
}

const iconClass = (type) => {
  switch (type) {
    case 'success':
      return 'ti ti-check-circle'
    case 'error':
      return 'ti ti-alert-circle'
    case 'warning':
      return 'ti ti-alert-triangle'
    case 'info':
      return 'ti ti-info-circle'
    default:
      return 'ti ti-info-circle'
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
