// TheSidebar.vue

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
// Import komponen anak yang akan digunakan di template
import SidebarMenuItem from './SidebarMenuItem.vue'
import SidebarLogoHeader from './SidebarLogoHeader.vue'
import { sideBarItem } from './item'

// Buat composable sederhana untuk menggantikan useLayout dari Nuxt
const showSidebar = ref(true)
const toggleShowSidebar = () => {
  showSidebar.value = !showSidebar.value
}

// Provide layout functions jika komponen lain membutuhkannya
provide('layout', {
  showSidebar,
  toggleShowSidebar,
})

const route = useRoute()

const menuItems = ref(sideBarItem)

// State untuk semua submenu yang terbuka
const openSubmenus = ref({})

function handleMenuClick(menuTitle) {
  openSubmenus.value[menuTitle] = !openSubmenus.value[menuTitle]
}

// Gunakan 'provide' untuk mengirim state ke semua komponen anak tanpa prop drilling
provide('openSubmenus', openSubmenus)
provide('handleMenuClick', handleMenuClick)

// Fungsi untuk mengecek semua level anak secara rekursif
function isAnyChildActive(item) {
  if (!item.children) return false
  return item.children.some((child) => {
    if (child.to && route.path.startsWith(child.to)) {
      return true
    }
    // Cek rekursif ke level selanjutnya
    return isAnyChildActive(child)
  })
}

onMounted(() => {
  menuItems.value.forEach((item) => {
    if (isAnyChildActive(item)) {
      openSubmenus.value[item.title] = true
      // Logika rekursif untuk membuka semua parent
      const openParents = (currentItem) => {
        if (!currentItem.children) return
        currentItem.children.forEach((child) => {
          if (isAnyChildActive(child)) {
            openSubmenus.value[child.title] = true
            openParents(child) // Lanjutkan ke level berikutnya
          }
        })
      }
      openParents(item)
    }
  })
})

// Export functions jika diperlukan oleh komponen lain
defineExpose({
  toggleShowSidebar,
  showSidebar,
})
</script>

<template>
  <aside class="left-sidebar">
    <div>
      <SidebarLogoHeader />

      <nav class="sidebar-nav scroll-sidebar" data-simplebar="">
        <ul id="sidebarnav">
          <SidebarMenuItem
            v-for="(item, index) in menuItems"
            :key="index"
            :item="item"
            :level="1"
          />
        </ul>
      </nav>
    </div>
  </aside>
</template>

<style>
/* Style untuk panah (tidak berubah) */
.sidebar-nav .has-arrow.is-open::after {
  transform: rotate(-135deg);
}

/* ================================================================
  ## SOLUSI FINAL UNTUK INDENTASI & STYLE ACTIVE ##
================================================================ */

/*
  FIX 1: Indentasi Skalabel pada <li>
  Kita terapkan padding pada <li> menggunakan data-level.
  Ini akan menggeser seluruh baris item, termasuk background saat aktif.
*/
.sidebar-item[data-level='2'] {
  padding-left: 20px;
}
.sidebar-item[data-level='3'] {
  padding-left: 35px;
}
.sidebar-item[data-level='4'] {
  padding-left: 50px;
}
/* Anda bisa menambah level 5, 6, dst. jika perlu */

/*
  FIX 2: Paksa ukuran ikon untuk SEMUA submenu
  Ini tidak berubah dan tetap diperlukan untuk mengatasi style tema.
*/
.sidebar-item .has-arrow .d-flex > .ti {
  font-size: 21px !important;
}

/*
  FIX 3: Menjaga padding internal link tetap konsisten
  Dengan indentasi sudah dihandle oleh <li>, kita hanya perlu memastikan
  semua link punya padding internal yang sama, baik saat aktif maupun tidak.
  Ini membuat background biru terlihat penuh dan rapi.
*/
.sidebar-link {
  padding-right: 15px;
  /* padding-left diatur oleh indentasi <li> */
}
</style>
