// LoadingIndicator.vue
<template>
  <div
    v-if="isLoading"
    class="loading-indicator"
    :style="{
      '--progress': `${progress}%`,
      '--color': color,
      '--height': height,
      '--duration': `${duration}ms`,
    }"
  >
    <div class="loading-bar"></div>
  </div>
</template>

<script>
export default {
  name: 'LoadingIndicator',
  props: {
    color: {
      type: String,
      default: '#00dc82',
    },
    height: {
      type: String,
      default: '3px',
    },
    duration: {
      type: Number,
      default: 2000,
    },
    throttle: {
      type: Number,
      default: 200,
    },
  },
  data() {
    return {
      isLoading: false,
      progress: 0,
      intervalId: null,
      timeoutId: null,
    }
  },
  methods: {
    start() {
      this.clear()

      // Throttle untuk mencegah loading indicator muncul terlalu cepat
      this.timeoutId = setTimeout(() => {
        this.isLoading = true
        this.progress = 0
        this.increase()
      }, this.throttle)
    },

    increase() {
      this.intervalId = setInterval(() => {
        if (this.progress < 90) {
          // Mulai cepat, kemudian melambat
          const increment = Math.random() * 15
          this.progress = Math.min(this.progress + increment, 90)
        }
      }, 100)
    },

    finish() {
      this.clear()

      if (this.isLoading) {
        this.progress = 100

        // Tunggu animasi selesai sebelum menyembunyikan
        setTimeout(() => {
          this.isLoading = false
          this.progress = 0
        }, 100)
      }
    },

    clear() {
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
        this.timeoutId = null
      }
    },

    set(value) {
      this.progress = Math.max(0, Math.min(100, value))
    },
  },

  beforeUnmount() {
    this.clear()
  },
}
</script>

<style scoped>
.loading-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--height);
  z-index: 999999;
  pointer-events: none;
}

.loading-bar {
  height: 100%;
  background-color: var(--color);
  width: var(--progress);
  transition: width 0.1s ease;
  transform-origin: left;
}

.loading-bar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 5px;
  background: linear-gradient(to right, transparent, var(--color));
  transform: rotate(3deg) translate(0px, -4px);
  box-shadow: 0 0 10px var(--color);
}

/* Animasi shimmer effect */
.loading-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
