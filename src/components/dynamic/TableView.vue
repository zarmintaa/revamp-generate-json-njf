<!--TableView-->
<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { usePagination } from '@/composables/usePagination'
import TablePagination from '@/components/common/pagination/TablePagination.vue'
import SkeletonLoader from '@/components/common/skeleton/SkeletonLoader.vue' // Import komponen skeleton

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  tHeader: {
    type: Array,
    default: null,
  },
  tKey: {
    type: Array,
    default: null,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  columnLinks: {
    type: Object,
    default: null,
  },
  onRowClick: {
    type: Function,
    default: null,
  },
  enableKeyboardNavigation: {
    type: Boolean,
    default: false,
  },
})

// debounce function
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Search and sorting state
const debouncedSearchQuery = ref('')
const searchQuery = ref('')
const sortOrder = ref('asc')
const sortColumn = ref('')
const localLoading = ref(true)

// Computed properties for table structure
const headers = computed(() => props.tHeader ?? Object.keys(props.items[0] ?? {}))
const keys = computed(() => props.tKey ?? Object.keys(props.items[0] ?? {}))

// Filtered and sorted items
const filteredItems = computed(() => {
  if (props.loading || props.error) return []
  if (!debouncedSearchQuery.value) return props.items
  return props.items.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchQuery.value.toLowerCase()),
    ),
  )
})

const sortedItems = computed(() => {
  const data = [...filteredItems.value]
  if (sortColumn.value) {
    return data.sort((a, b) => {
      const aVal = a[sortColumn.value]
      const bVal = b[sortColumn.value]
      if (aVal == null || bVal == null) return 0
      return sortOrder.value === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1
    })
  }
  return data
})

// Use pagination composable
const {
  currentPage,
  itemsPerPage: paginationItemsPerPage,
  totalPages,
  paginatedData: paginatedItems,
  paginationSummary,
  pages,
  setPage,
  nextPage,
  prevPage,
  setItemsPerPage,
  resetPagination,
} = usePagination(sortedItems, {
  defaultItemsPerPage: props.itemsPerPage,
})

// Watch for debounced search
watch(
  searchQuery,
  debounce((newValue) => {
    debouncedSearchQuery.value = newValue
  }, 500),
)

watch(
  () => props.items,
  () => {
    if (props.items.length > 0) {
      localLoading.value = false
    }
  },
  { immediate: true },
)

// Update local loading state
const showLoadingOnPageChange = ref(false) // Tambahkan flag

watch(
  [sortedItems, currentPage, paginationItemsPerPage],
  () => {
    if (showLoadingOnPageChange.value) {
      localLoading.value = true
      setTimeout(() => {
        localLoading.value = false
      }, 100)
    }
  },
  { immediate: true },
)

// Reset pagination when search/sort changes
watch([searchQuery, sortColumn, sortOrder], () => {
  resetPagination()
})

// Sorting functions
function toggleSort(column) {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'asc'
  }
}

// Utility functions
function getRowNumber(index) {
  return (currentPage.value - 1) * paginationItemsPerPage.value + index + 1
}

function formatValue(value, key) {
  if (
    (typeof value === 'number' && key.toLowerCase().includes('price')) ||
    (typeof value === 'number' && key.toLowerCase().includes('margin'))
  ) {
    return `Rp ${value.toLocaleString('id-ID')}`
  }
  return value || '-'
}

// Keyboard navigation
function handleKeyNavigation(event) {
  if (
    !props.enableKeyboardNavigation ||
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLSelectElement
  ) {
    return
  }

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      prevPage()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextPage()
      break
    case 'Home':
      event.preventDefault()
      setPage(1)
      break
    case 'End':
      event.preventDefault()
      setPage(totalPages.value)
      break
  }
}

// Pagination event handlers
const handleSetPage = (page) => setPage(page)
const handleNextPage = () => nextPage()
const handlePrevPage = () => prevPage()
const handleSetItemsPerPage = (items) => setItemsPerPage(items)

onMounted(() => {
  if (props.enableKeyboardNavigation) {
    document.addEventListener('keydown', handleKeyNavigation)
  }
})

onUnmounted(() => {
  if (props.enableKeyboardNavigation) {
    document.removeEventListener('keydown', handleKeyNavigation)
  }
})
</script>

<template>
  <div>
    <!-- Search and Controls -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <input v-model="searchQuery" class="form-control w-100" placeholder="Search..." type="text" />
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <div class="table-scroll">
        <table class="table table-hover">
          <thead>
            <tr>
              <th v-if="!props.loading && !localLoading && !props.error">No</th>
              <th
                v-for="(header, idx) in headers"
                :key="header"
                :title="`Sort by ${header}`"
                class="user-select-none"
                style="min-width: 150px; cursor: pointer"
                @click="toggleSort(keys[idx])"
              >
                {{ header }}
                <span v-if="sortColumn === keys[idx]" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- SKELETON using SkeletonLoader Component -->
            <template v-if="props.loading || localLoading">
              <tr v-for="n in paginationItemsPerPage || 5" :key="'skeleton-' + n">
                <!-- No column skeleton -->
                <td>
                  <SkeletonLoader variant="text" width="30px" height="16px" />
                </td>
                <!-- Data columns skeleton -->
                <td v-for="(key, keyIndex) in keys" :key="key + n">
                  <SkeletonLoader
                    variant="text"
                    :width="getSkeletonWidth(keyIndex)"
                    height="16px"
                  />
                </td>
              </tr>
            </template>

            <!-- ERROR -->
            <template v-else-if="props.error">
              <tr>
                <td :colspan="keys.length + 1" class="text-center py-4 text-danger">
                  <div class="empty-state">
                    <div class="emoji">🚫</div>
                    <div class="message">{{ props.error }}</div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- NO DATA -->
            <template v-else-if="paginatedItems.length === 0">
              <tr>
                <td :colspan="keys.length + 1" class="text-center py-4 text-muted">
                  <div class="empty-state">
                    <div class="emoji">📭</div>
                    <div class="message">
                      {{
                        debouncedSearchQuery
                          ? `There no data with name '${debouncedSearchQuery}' .`
                          : 'Data not found.'
                      }}
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- DATA -->
            <template v-else>
              <tr
                v-for="(item, idx) in paginatedItems"
                :key="idx"
                :style="{ cursor: props.onRowClick ? 'pointer' : 'default' }"
                class="clickable-row"
                @click="props.onRowClick?.(item)"
              >
                <td class="fw-medium">{{ getRowNumber(idx) }}</td>
                <td
                  v-for="key in keys"
                  :key="key"
                  :title="item[key] || '-'"
                  class="text-truncate fw-medium"
                  style="max-width: 400px"
                >
                  <slot :name="`cell(${key})`" :item="item" :value="item[key]">
                    <span class="text-truncate d-block">
                      <template v-if="props.columnLinks && props.columnLinks[key]">
                        <router-link
                          :to="props.columnLinks[key](item)"
                          class="text-primary text-decoration-none"
                          @click.stop
                        >
                          {{ formatValue(item[key], key) }}
                        </router-link>
                      </template>
                      <template v-else>
                        {{ formatValue(item[key], key) }}
                      </template>
                    </span>
                  </slot>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination Component -->
    <TablePagination
      v-if="!props.loading && !props.error && filteredItems.length > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      :items-per-page="paginationItemsPerPage"
      :pagination-summary="paginationSummary"
      :pages="pages"
      :items-per-page-options="[5, 10, 20, 30, 50]"
      @set-page="handleSetPage"
      @next-page="handleNextPage"
      @prev-page="handlePrevPage"
      @set-items-per-page="handleSetItemsPerPage"
    />

    <!-- Keyboard Navigation Hint -->
    <div v-if="props.enableKeyboardNavigation && totalPages > 1" class="keyboard-hint">
      <small class="text-muted"> 💡 Use arrow keys (← →), Home, and End for navigation </small>
    </div>
  </div>
</template>

<script>
// Method untuk menentukan lebar skeleton berdasarkan kolom
function getSkeletonWidth(columnIndex) {
  // Variasi lebar skeleton untuk membuat tampilan lebih natural
  const widths = ['80px', '120px', '100px', '90px', '110px', '85px', '95px']
  return widths[columnIndex % widths.length] || '100px'
}
</script>

<style scoped>
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.table-wrapper {
  max-height: 400px;
  overflow-y: auto;
}

.table-scroll {
  overflow-x: auto;
  min-width: 100%;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6c757d;
}

.empty-state .emoji {
  font-size: 2rem;
}

.empty-state .message {
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 20px;
  flex-wrap: wrap;
}

.pagination-info {
  flex: 1;
  text-align: left;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}

.page-info {
  padding: 0 1rem;
  font-weight: 500;
  color: #495057;
}

.jump-to-page-compact {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.keyboard-hint {
  text-align: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f0f0f0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }

  .pagination-info {
    text-align: center;
  }

  .pagination-controls {
    gap: 0.5rem;
  }

  .jump-to-page-compact {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
