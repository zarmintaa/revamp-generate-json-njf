<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'

const { toggleShowSidebar } = useLayout()
</script>

<template>
  <div class="brand-logo d-flex align-items-center justify-content-between">
    <router-link to="/public" class="text-nowrap logo-img">
      <!--      <img src="/images/logos/logo.svg" alt="Logo" />-->
      <img src="@/assets/images/logos/nuxt-cat-icon.svg" alt="Logo" />
      <!--      <img src="/images/logos/logo-adira.png" alt="Logo" width="120" />-->
    </router-link>
    <div
      class="close-btn d-xl-none d-block sidebartoggler cursor-pointer"
      @click="toggleShowSidebar"
    >
      <i class="ti ti-x fs-6"></i>
    </div>
  </div>
</template>

<style scoped></style>
