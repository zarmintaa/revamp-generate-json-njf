<template>
  <div
    v-if="isOpen"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="iconClass" class="me-2"></i>
            {{ title }}
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="$emit('cancel')"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body">
          <p class="mb-0">{{ message }}</p>
          <div v-if="details" class="mt-3 p-3 bg-light rounded">
            <small class="text-muted">{{ details }}</small>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-light" @click="$emit('cancel')" :disabled="loading">
            Cancel
          </button>
          <button
            type="button"
            :class="confirmButtonClass"
            @click="$emit('confirm')"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isOpen" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Confirm Action',
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?',
  },
  details: {
    type: String,
    default: null,
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  type: {
    type: String,
    default: 'danger',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['confirm', 'cancel'])

const iconClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'ti ti-alert-triangle text-danger'
    case 'warning':
      return 'ti ti-alert-circle text-warning'
    case 'info':
      return 'ti ti-info-circle text-info'
    case 'success':
      return 'ti ti-check-circle text-success'
    default:
      return 'ti ti-alert-triangle text-danger'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'btn btn-danger'
    case 'warning':
      return 'btn btn-warning'
    case 'info':
      return 'btn btn-info'
    case 'success':
      return 'btn btn-success'
    default:
      return 'btn btn-danger'
  }
})
</script>

<style scoped></style>
