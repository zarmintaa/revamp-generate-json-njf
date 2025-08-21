<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div" class="toast-wrapper">
        <div
          v-for="toast in toasts"
          v-show="toast.show"
          :key="toast.id"
          :class="['toast-item', `toast-${toast.type}`]"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div class="toast-content">
            <div class="toast-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <template v-if="toast.type === 'success'">
                  <path d="m9 12 2 2 4-4"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </template>
                <template v-else-if="toast.type === 'error'">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </template>
                <template v-else-if="toast.type === 'warning'">
                  <path
                    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                  ></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </template>
                <template v-else>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </template>
              </svg>
            </div>
            <div class="toast-text">
              <div class="toast-title">{{ toast.title }}</div>
              <div class="toast-message">{{ toast.message }}</div>
            </div>
            <button
              type="button"
              class="toast-close"
              @click="removeToast(toast.id)"
              aria-label="Close"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="toast-progress" v-if="toast.duration">
            <div
              class="toast-progress-bar"
              :style="{ animationDuration: `${toast.duration}ms` }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toast-item {
  pointer-events: auto;
  min-width: 320px;
  max-width: 480px;
  background: white;
  border-radius: 12px;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  gap: 0.75rem;
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-bottom: 0.25rem;
  color: #1f2937;
}

.toast-message {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #6b7280;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.15s ease;
  margin-top: -2px;
}

.toast-close:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: rgba(0, 0, 0, 0.05);
}

.toast-progress-bar {
  height: 100%;
  width: 100%;
  transform-origin: left;
  animation: toast-progress linear forwards;
}

/* Toast Type Variants */
.toast-success .toast-icon {
  color: #059669;
}
.toast-success .toast-progress-bar {
  background-color: #059669;
}

.toast-error .toast-icon {
  color: #dc2626;
}
.toast-error .toast-progress-bar {
  background-color: #dc2626;
}

.toast-warning .toast-icon {
  color: #d97706;
}
.toast-warning .toast-progress-bar {
  background-color: #d97706;
}

.toast-info .toast-icon {
  color: #2563eb;
}
.toast-info .toast-progress-bar {
  background-color: #2563eb;
}

/* Animations */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes toast-progress {
  to {
    transform: scaleX(0);
  }
}

/* Dark mode support
@media (prefers-color-scheme: dark) {
  .toast-item {
    background: #1f2937;
    border-color: #374151;
  }
  
  .toast-title {
    color: #f9fafb;
  }
  
  .toast-message {
    color: #d1d5db;
  }
  
  .toast-close {
    color: #9ca3af;
  }
  
  .toast-close:hover {
    color: #d1d5db;
    background-color: #374151;
  }
  
  .toast-progress {
    background-color: rgba(255, 255, 255, 0.1);
  }
} */

/* Responsive */
@media (max-width: 640px) {
  .toast-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }

  .toast-item {
    min-width: auto;
    max-width: none;
  }
}
</style>
