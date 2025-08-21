import { ref, reactive } from 'vue'

// Global state untuk toast
const toastState = reactive({
  toasts: [],
})

export const useToast = () => {
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

  const addToast = (toast) => {
    const newToast = {
      id: generateId(),
      show: true,
      ...toast,
    }

    toastState.toasts.push(newToast)

    // Auto remove after duration
    setTimeout(() => {
      removeToast(newToast.id)
    }, toast.duration)

    return newToast.id
  }

  const removeToast = (id) => {
    const index = toastState.toasts.findIndex((t) => t.id === id)
    if (index > -1) {
      toastState.toasts[index].show = false
      // Remove from array after animation
      setTimeout(() => {
        const currentIndex = toastState.toasts.findIndex((t) => t.id === id)
        if (currentIndex > -1) {
          toastState.toasts.splice(currentIndex, 1)
        }
      }, 300)
    }
  }

  const success = (title, message, duration = 5000) => {
    return addToast({ title, message, type: 'success', duration })
  }

  const error = (title, message, duration = 5000) => {
    return addToast({ title, message, type: 'error', duration })
  }

  const warning = (title, message, duration = 5000) => {
    return addToast({ title, message, type: 'warning', duration })
  }

  const info = (title, message, duration = 5000) => {
    return addToast({ title, message, type: 'info', duration })
  }

  return {
    toasts: toastState.toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
