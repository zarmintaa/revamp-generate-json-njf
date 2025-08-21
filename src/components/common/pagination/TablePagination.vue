<!-- components/common/pagination/TablePagination.vue -->

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true,
  },
  paginationSummary: {
    type: String,
    required: true,
  },
  pages: {
    type: Array,
    required: true,
  },
  itemsPerPageOptions: {
    type: Array,
    default: () => [10, 20, 30, 50],
  },
})

const emit = defineEmits(['setPage', 'nextPage', 'prevPage', 'setItemsPerPage'])

const handleItemsPerPageChange = (event) => {
  const target = event.target
  emit('setItemsPerPage', Number(target.value))
}

const setPage = (page) => {
  emit('setPage', page)
}

const nextPage = () => {
  emit('nextPage')
}

const prevPage = () => {
  emit('prevPage')
}
</script>

<template>
  <div
    class="card-footer bg-white d-flex flex-wrap align-items-center justify-content-between gap-3 py-2"
  >
    <!-- Pagination Summary -->
    <div class="text-muted small">
      {{ paginationSummary }}
    </div>

    <!-- Pagination Controls -->
    <nav aria-label="Page navigation" v-if="totalPages > 1">
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button type="button" class="page-link" @click="prevPage" :disabled="currentPage === 1">
            <i class="ti ti-chevron-left"></i>
          </button>
        </li>

        <li
          v-for="(page, index) in pages"
          :key="index"
          class="page-item"
          :class="{
            active: page === currentPage,
            disabled: page === '...',
          }"
        >
          <button v-if="page === '...'" type="button" class="page-link ellipsis" disabled>
            {{ page }}
          </button>
          <button v-else type="button" class="page-link" @click="setPage(page)">
            {{ page }}
          </button>
        </li>

        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            type="button"
            class="page-link"
            @click="nextPage"
            :disabled="currentPage === totalPages"
          >
            <i class="ti ti-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Items Per Page Selector -->
    <div class="d-flex align-items-center gap-2">
      <span class="text-muted small">Per Page:</span>
      <select
        class="form-select form-select-sm"
        :value="itemsPerPage"
        @change="handleItemsPerPageChange"
        style="width: 75px"
      >
        <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>
  </div>
</template>
