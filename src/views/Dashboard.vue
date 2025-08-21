<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import TableView from '@/components/dynamic/TableView.vue'
import ActionCard from '@/components/pages/dashboard/ActionCard.vue'
import TaskActive from '@/components/pages/dashboard/TaskActive.vue'

// --- Data Mentah Produk (sumber kebenaran) ---
const rawProductData = ref<any[]>([])
const isLoading = ref(true)

// --- COMPUTED PROPERTIES DINAMIS UNTUK PRODUK ---

// 1. Format data mentah produk menjadi data yang siap ditampilkan
//    Di sini kita bisa mengubah nama key agar lebih konsisten (misal: camelCase ke snake_case)
//    dan melakukan transformasi data (misal: boolean ke string 'Aktif'/'Non-Aktif')
const tableItems = computed(() => {
  if (!rawProductData.value) return []

  return rawProductData.value.map((product) => ({
    id: product.id, // Simpan ID untuk internal (link/event), tidak akan ditampilkan
    product_name: product.productName,
    category: product.category,
    price: product.price, // Harga sudah dalam format number, akan diformat oleh TableView
    stock: product.stock,
    status: product.isActive ? 'Aktif' : 'Non-Aktif',
  }))
})

// 2. Ambil keys secara dinamis dari data yang telah diformat (kecuali 'id')
const rawKeys = computed(() => {
  if (!tableItems.value || tableItems.value.length === 0) {
    return ['productName', 'category', 'price', 'stock', 'status'] // Biarkan kosong jika tidak ada data
  }
  // Ambil semua keys dari objek pertama, dan buang 'id'
  return Object.keys(tableItems.value[0]).filter((key) => key !== 'id')
})

// 3. Buat headers secara dinamis dari rawKeys
const headers = computed(() =>
  rawKeys.value.map((key) =>
    // Ganti underscore dengan spasi dan ubah menjadi Title Case
    key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
  ),
)

// --- Konfigurasi Tambahan untuk TableView (disesuaikan dengan key baru) ---

// ColumnLinks sekarang merujuk ke 'product_name' dan menggunakan 'id' untuk URL
const columnLinksConfiguration = {
  product_name: (row: any) => `/products/${row.id}`,
}

// onRowClick juga menggunakan data dari `tableItems`
const handleRowClick = (row: any) => {
  alert(`Anda mengklik produk: ${row.product_name}`)
}

// --- Simulasi Fetch Data Produk ---
onMounted(() => {
  setTimeout(() => {
    // Data mentah dari contoh pertama
    rawProductData.value = [
      {
        id: 1,
        productName: 'Laptop Pro X1',
        category: 'Electronics',
        price: 18500000,
        stock: 15,
        isActive: true,
      },
      {
        id: 2,
        productName: 'Ergonomic Office Chair',
        category: 'Furniture',
        price: 2300000,
        stock: 45,
        isActive: true,
      },
      {
        id: 3,
        productName: 'Wireless Mechanical Keyboard',
        category: 'Accessories',
        price: 1200000,
        stock: 75,
        isActive: false,
      },
      {
        id: 4,
        productName: '4K Ultra HD Monitor',
        category: 'Electronics',
        price: 6800000,
        stock: 22,
        isActive: true,
      },
      {
        id: 5,
        productName: 'Noise Cancelling Headphones',
        category: 'Accessories',
        price: 3100000,
        stock: 0,
        isActive: true,
      },
      {
        id: 6,
        productName: 'Standing Desk',
        category: 'Furniture',
        price: 4500000,
        stock: 12,
        isActive: true,
      },
    ]
    isLoading.value = false
  }, 1500)
})
</script>

<template>
  <ActionCard />
  <TaskActive />

  <div class="card">
    <div class="card-body">
      <h5 class="card-title fw-medium mb-2">Product Inventory</h5>
      <p class="mb-4">Displaying current inventory</p>
      <TableView
        :items="tableItems"
        :t-key="rawKeys"
        :t-header="headers"
        :items-per-page="10"
        :loading="isLoading"
        :error="null"
        :column-links="columnLinksConfiguration"
        :on-row-click="handleRowClick"
        :enable-keyboard-navigation="true"
      />
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  background-color: #f7f8fc;
  border-radius: 8px;
}
</style>
