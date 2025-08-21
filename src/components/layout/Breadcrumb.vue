<!-- components/ui/BreadcrumbDinamis.vue -->
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const segments = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  const result = []
  let pathAcc = ''

  parts.forEach((part, index) => {
    pathAcc += `/${part}`

    // Improved label formatting
    const label = part
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    result.push({
      label,
      path: index < parts.length - 1 ? pathAcc : null, // last item = active
      isActive: index === parts.length - 1,
    })
  })

  return result
})

// Improved navigation with error handling
function navigateTo(path) {
  if (path && path !== route.path) {
    try {
      router.push(path)
    } catch (error) {
      console.warn('Navigation failed:', error)
    }
  }
}

// Handle keyboard navigation for accessibility
function handleKeydown(event, path) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    navigateTo(path)
  }
}
</script>

<template>
  <nav aria-label="breadcrumb" class="mb-3">
    <ol class="breadcrumb custom-breadcrumb">
      <!-- Home item -->
      <li class="breadcrumb-item">
        <a
          href="#"
          @click.prevent="navigateTo('/')"
          @keydown="handleKeydown($event, '/')"
          role="button"
          tabindex="0"
          :class="{ active: route.path === '/' }"
        >
          <i class="bi bi-house-door-fill me-1" aria-hidden="true"></i>
          <span>Home</span>
        </a>
      </li>

      <!-- Dynamic segments -->
      <li
        v-for="(seg, index) in segments"
        :key="`${seg.path || 'active'}-${index}`"
        :class="{ active: seg.isActive }"
        :aria-current="seg.isActive ? 'page' : undefined"
        class="breadcrumb-item"
      >
        <template v-if="seg.path">
          <a
            href="#"
            @click.prevent="navigateTo(seg.path)"
            @keydown="handleKeydown($event, seg.path)"
            role="button"
            tabindex="0"
            :title="`Navigate to ${seg.label}`"
          >
            {{ seg.label }}
          </a>
        </template>
        <template v-else>
          <span :title="seg.label">{{ seg.label }}</span>
        </template>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.custom-breadcrumb {
  background-color: transparent;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  margin-bottom: 0;
}

.custom-breadcrumb .breadcrumb-item {
  display: flex;
  align-items: center;
}

.custom-breadcrumb .breadcrumb-item a {
  text-decoration: none;
  color: #0d6efd;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  display: inline-flex;
  align-items: center;
}

.custom-breadcrumb .breadcrumb-item a:hover,
.custom-breadcrumb .breadcrumb-item a:focus {
  color: #0a58ca;
  background-color: rgba(13, 110, 253, 0.1);
  outline: none;
}

.custom-breadcrumb .breadcrumb-item a:focus-visible {
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
}

.custom-breadcrumb .breadcrumb-item.active a,
.custom-breadcrumb .breadcrumb-item.active span {
  font-weight: 600;
  color: #495057;
  cursor: default;
}

.custom-breadcrumb .breadcrumb-item.active a:hover {
  background-color: transparent;
  color: #495057;
}

/* Responsive design */
@media (max-width: 576px) {
  .custom-breadcrumb {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }

  .custom-breadcrumb .breadcrumb-item {
    max-width: 120px;
    overflow: hidden;
  }

  .custom-breadcrumb .breadcrumb-item span,
  .custom-breadcrumb .breadcrumb-item a {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* Dark mode support */
/* @media (prefers-color-scheme: dark) {
  .custom-breadcrumb .breadcrumb-item a {
    color: #6ea8fe;
  }
  
  .custom-breadcrumb .breadcrumb-item a:hover,
  .custom-breadcrumb .breadcrumb-item a:focus {
    color: #9ec5fe;
    background-color: rgba(110, 168, 254, 0.1);
  }
  
  .custom-breadcrumb .breadcrumb-item.active a,
  .custom-breadcrumb .breadcrumb-item.active span {
    color: #adb5bd;
  }
} */
</style>
