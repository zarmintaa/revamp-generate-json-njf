<script setup>
import { inject, computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
})

const route = useRoute()
const openSubmenus = inject('openSubmenus')
const handleMenuClick = inject('handleMenuClick')

// Logika untuk active state, ini sudah benar.
const isLinkActive = computed(() => {
  return props.item.type === 'link' && props.item.to && route.path === props.item.to
})
</script>

<template>
  <li v-if="item.type === 'caption'" class="nav-small-cap">
    <i class="ti ti-dots nav-small-cap-icon fs-4"></i>
    <span class="hide-menu">{{ item.title }}</span>
  </li>
  <li v-else-if="item.type === 'divider'">
    <span class="sidebar-divider lg"></span>
  </li>

  <li
    v-else-if="item.type === 'link'"
    class="sidebar-item"
    :class="{ active: isLinkActive }"
    :data-level="level"
  >
    <router-link :to="item.to" class="sidebar-link" active-class="active">
      <span v-if="item.icon" class="d-flex">
        <i :class="['ti', item.icon]"></i>
      </span>
      <div v-else-if="level > 1" class="round-16 d-flex align-items-center justify-content-center">
        <i class="ti ti-circle"></i>
      </div>
      <span class="hide-menu">{{ item.title }}</span>
    </router-link>
  </li>

  <li v-else-if="item.type === 'submenu'" class="sidebar-item" :data-level="level">
    <a
      class="sidebar-link has-arrow"
      :class="{ 'is-open': openSubmenus && openSubmenus[item.title] }"
      href="#"
      @click.prevent="handleMenuClick && handleMenuClick(item.title)"
    >
      <span v-if="item.icon" class="d-flex">
        <i :class="['ti', item.icon]"></i>
      </span>
      <div v-else-if="level > 1" class="round-16 d-flex align-items-center justify-content-center">
        <i class="ti ti-circle"></i>
      </div>
      <span class="hide-menu">{{ item.title }}</span>
    </a>
    <ul
      aria-expanded="false"
      class="collapse first-level"
      :class="{ in: openSubmenus && openSubmenus[item.title] }"
    >
      <SidebarMenuItem
        v-for="child in item.children"
        :key="child.title"
        :item="child"
        :level="level + 1"
      />
    </ul>
  </li>
</template>
