// composables/useLayout.ts
import { ref, onMounted, onUnmounted } from 'vue'

// Buat state sebagai singleton agar sama di semua komponen
const isMiniSidebar = ref(false)
const isShowSidebar = ref(false)

export const useLayout = () => {
  // Fungsi untuk mengecek lebar layar dan mengatur state isMiniSidebar
  const checkSidebarType = () => {
    if (window.innerWidth < 1199) {
      isMiniSidebar.value = true
    } else {
      isMiniSidebar.value = false
      // Saat layar besar, pastikan sidebar mobile selalu tertutup
      isShowSidebar.value = false
    }
  }

  // Fungsi ini HANYA untuk toggle di layar kecil (mobile)
  const toggleShowSidebar = () => {
    isShowSidebar.value = !isShowSidebar.value
  }

  // Fungsi ini HANYA untuk toggle di layar besar (desktop)
  const toggleMiniSidebar = () => {
    // Hanya bekerja jika layar tidak kecil
    if (window.innerWidth >= 1199) {
      isMiniSidebar.value = !isMiniSidebar.value
    }
  }

  onMounted(() => {
    window.addEventListener('resize', checkSidebarType)
    checkSidebarType()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkSidebarType)
  })

  return {
    isMiniSidebar,
    isShowSidebar,
    toggleShowSidebar,
    toggleMiniSidebar,
  }
}
