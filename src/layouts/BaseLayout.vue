<script setup>
import { useLayout } from '@/composables/useLayout'
import TheSidebar from '@/components/layout/sidebar/TheSidebar.vue'
import TheHeader from '@/components/layout/header/TheHeader.vue'
import { RouterView } from 'vue-router'
import LoadingIndicator from '@/components/common/loading/LoadingIndicator.vue'
import { useLoading } from '@/composables/useLoading'
import { onMounted, ref } from 'vue'
import ToastContainer from '@/components/common/toast/ToastContainer.vue'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'

const { isMiniSidebar, isShowSidebar } = useLayout()
const { setLoadingInstance } = useLoading()

// Buat ref untuk loading indicator
const loadingIndicator = ref(null)

onMounted(() => {
  // Set instance loading indicator setelah component mounted
  if (loadingIndicator.value) {
    setLoadingInstance(loadingIndicator.value)
  }
})
</script>

<template>
  <LoadingIndicator
    ref="loadingIndicator"
    color="#00dc82"
    height="3px"
    :duration="2000"
    :throttle="200"
  />
  <div
    class="page-wrapper"
    id="main-wrapper"
    :class="{ 'mini-sidebar': isMiniSidebar, 'show-sidebar': isShowSidebar }"
    data-layout="vertical"
    data-navbarbg="skin6"
    :data-sidebartype="isMiniSidebar ? 'mini-sidebar' : 'full'"
    data-sidebar-position="full"
    data-header-position="fixed"
  >
    <TheSidebar />

    <div class="body-wrapper">
      <TheHeader />

      <div class="body-wrapper-inner">
        <div class="container-fluid">
          <Breadcrumb />
          <RouterView />
        </div>
      </div>
    </div>
  </div>
  <ToastContainer />
</template>

<style scoped></style>
