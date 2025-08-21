// composables/useLoading.js
import { ref, getCurrentInstance } from 'vue'

const loadingInstance = ref(null)

export function useLoading() {
  const setLoadingInstance = (instance) => {
    loadingInstance.value = instance
  }

  const start = () => {
    if (loadingInstance.value) {
      loadingInstance.value.start()
    }
  }

  const finish = () => {
    if (loadingInstance.value) {
      loadingInstance.value.finish()
    }
  }

  const set = (value) => {
    if (loadingInstance.value) {
      loadingInstance.value.set(value)
    }
  }

  return {
    setLoadingInstance,
    start,
    finish,
    set,
  }
}
