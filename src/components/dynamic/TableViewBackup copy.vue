<!--TableViewBasic - Improved Version-->

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
    validator: (items) => Array.isArray(items),
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
    validator: (value) => value > 0,
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
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
  emptyMessage: {
    type: String,
    default: 'Data not found.',
  },
  searchableColumns: {
    type: Array,
    default: null, // null means search all columns
  },
})

const emit = defineEmits(['update:currentPage', 'update:searchQuery', 'sort-change'])

// Utility functions
const debounce = (func, wait) => {
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

// Reactive state
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const currentPage = ref(1)
const sortOrder = ref('asc')
const sortColumn = ref('')
const selectedPerPage = ref(props.itemsPerPage)
const jumpToPageInput = ref('')
const localLoading = ref(false)

// Computed properties
const perPage = computed(() => selectedPerPage.value)

const headers = computed(() => {
  if (props.tHeader) return props.tHeader
  if (props.items.length === 0) return []
  return Object.keys(props.items[0])
})

const keys = computed(() => {
  if (props.tKey) return props.tKey
  if (props.items.length === 0) return []
  return Object.keys(props.items[0])
})

const searchableKeys = computed(() => {
  return props.searchableColumns || keys.value
})

const filteredItems = computed(() => {
  if (props.loading || props.error || props.items.length === 0) {
    return []
  }

  if (!debouncedSearchQuery.value.trim()) {
    return props.items
  }

  const query = debouncedSearchQuery.value.toLowerCase().trim()

  return props.items.filter((item) =>
    searchableKeys.value.some((key) => {
      const value = item[key]
      return value != null && String(value).toLowerCase().includes(query)
    }),
  )
})

const sortedItems = computed(() => {
  if (!sortColumn.value) return [...filteredItems.value]

  return [...filteredItems.value].sort((a, b) => {
    const aVal = a[sortColumn.value]
    const bVal = b[sortColumn.value]

    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    // Handle different data types
    let comparison = 0
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal
    } else {
      comparison = String(aVal).localeCompare(String(bVal), 'id-ID', {
        numeric: true,
        sensitivity: 'base',
      })
    }

    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})

const totalPages = computed(() => {
  if (filteredItems.value.length === 0) return 1
  return Math.ceil(filteredItems.value.length / perPage.value)
})

const startItem = computed(() => {
  if (filteredItems.value.length === 0) return 0
  return (currentPage.value - 1) * perPage.value + 1
})

const endItem = computed(() =>
  Math.min(currentPage.value * perPage.value, filteredItems.value.length),
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return sortedItems.value.slice(start, start + perPage.value)
})

const canGoToPrevious = computed(() => currentPage.value > 1)
const canGoToNext = computed(() => currentPage.value < totalPages.value)

// Watchers
const debouncedSearch = debounce((newValue) => {
  debouncedSearchQuery.value = newValue
  emit('update:searchQuery', newValue)
}, 300) // Reduced debounce time for better UX

watch(searchQuery, debouncedSearch)

watch([debouncedSearchQuery, sortColumn, sortOrder, selectedPerPage], () => {
  currentPage.value = 1
  jumpToPageInput.value = ''
})

watch(currentPage, (newPage) => {
  emit('update:currentPage', newPage)
})

// Methods
const toggleSort = (column) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'asc'
  }

  emit('sort-change', {
    column: sortColumn.value,
    order: sortOrder.value,
  })
}

const goToPage = (page) => {
  const targetPage = Math.max(1, Math.min(page, totalPages.value))
  if (targetPage !== currentPage.value) {
    currentPage.value = targetPage
    jumpToPageInput.value = ''
  }
}

const nextPage = () => {
  if (canGoToNext.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (canGoToPrevious.value) {
    currentPage.value--
  }
}

const goToFirstPage = () => goToPage(1)
const goToLastPage = () => goToPage(totalPages.value)

const jumpToPage = () => {
  const pageNum = parseInt(jumpToPageInput.value)
  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages.value) {
    goToPage(pageNum)
  }
}

const getRowNumber = (index) => {
  return (currentPage.value - 1) * perPage.value + index + 1
}

const formatValue = (value, key) => {
  if (value == null) return '-'

  if (typeof value === 'number') {
    const lowerKey = key.toLowerCase()
    if (lowerKey.includes('price') || lowerKey.includes('margin') || lowerKey.includes('amount')) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(value)
    }
  }

  return String(value)
}

// Keyboard navigation
const handleKeyNavigation = (event) => {
  if (
    !props.enableKeyboardNavigation ||
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLSelectElement ||
    event.target instanceof HTMLTextAreaElement
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
      goToFirstPage()
      break
    case 'End':
      event.preventDefault()
      goToLastPage()
      break
    case '/':
      event.preventDefault()
      // Focus on search input
      nextTick(() => {
        const searchInput = document.querySelector('input[type="text"]')
        if (searchInput) {
          searchInput.focus()
        }
      })
      break
  }
}

// Lifecycle
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
  <div class="table-view-basic">
    <!-- Search and Controls -->
    <div class="table-controls">
      <div class="search-container">
        <input
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          class="form-control search-input"
          type="text"
          :disabled="loading"
        />
        <div v-if="searchQuery" class="search-results-info">
          {{ filteredItems.length }} of {{ items.length }} items
        </div>
      </div>

      <div class="controls-right">
        <select v-model="selectedPerPage" class="form-select per-page-select" :disabled="loading">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Table Container -->
    <div class="table-container">
      <div class="table-scroll">
        <table class="table table-hover">
          <thead class="table-header">
            <tr>
              <th v-if="!loading && !error" class="row-number-header">#</th>
              <th
                v-for="(header, idx) in headers"
                :key="`header-${idx}`"
                class="sortable-header"
                :class="{ sorted: sortColumn === keys[idx] }"
                :title="`Sort by ${header}`"
                @click="toggleSort(keys[idx])"
              >
                <div class="header-content">
                  <span>{{ header }}</span>
                  <span v-if="sortColumn === keys[idx]" class="sort-indicator">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            <!-- Loading State -->
            <template v-if="loading">
              <tr v-for="n in perPage" :key="`skeleton-${n}`" class="skeleton-row">
                <td class="skeleton-cell">
                  <div class="skeleton-content" />
                </td>
                <td v-for="(key, idx) in keys" :key="`skeleton-${n}-${idx}`" class="skeleton-cell">
                  <div class="skeleton-content" />
                </td>
              </tr>
            </template>

            <!-- Error State -->
            <template v-else-if="error">
              <tr>
                <td :colspan="keys.length + 1" class="empty-state-cell">
                  <div class="empty-state error-state">
                    <div class="empty-icon">🚫</div>
                    <div class="empty-message">{{ error }}</div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="paginatedItems.length === 0">
              <tr>
                <td :colspan="keys.length + 1" class="empty-state-cell">
                  <div class="empty-state">
                    <div class="empty-icon">
                      {{ debouncedSearchQuery ? '🔍' : '📭' }}
                    </div>
                    <div class="empty-message">
                      {{
                        debouncedSearchQuery
                          ? `No results found for "${debouncedSearchQuery}"`
                          : emptyMessage
                      }}
                    </div>
                    <div v-if="debouncedSearchQuery" class="empty-suggestion">
                      Try adjusting your search terms
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr
                v-for="(item, idx) in paginatedItems"
                :key="`row-${getRowNumber(idx)}`"
                class="data-row"
                :class="{ clickable: onRowClick }"
                @click="onRowClick?.(item)"
              >
                <td class="row-number">
                  {{ getRowNumber(idx) }}
                </td>
                <td
                  v-for="key in keys"
                  :key="`cell-${key}`"
                  :title="String(item[key] || '')"
                  class="data-cell"
                >
                  <slot :name="`cell(${key})`" :item="item" :value="item[key]" :index="idx">
                    <div class="cell-content">
                      <template v-if="columnLinks?.[key]">
                        <router-link :to="columnLinks[key](item)" class="cell-link" @click.stop>
                          {{ formatValue(item[key], key) }}
                        </router-link>
                      </template>
                      <template v-else>
                        {{ formatValue(item[key], key) }}
                      </template>
                    </div>
                  </slot>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && !error && filteredItems.length > 0" class="pagination-container">
      <!-- Pagination Info -->
      <div class="pagination-info">
        <span class="items-info">
          Showing {{ startItem.toLocaleString('id-ID') }} to
          {{ endItem.toLocaleString('id-ID') }} of
          {{ filteredItems.length.toLocaleString('id-ID') }} entries
        </span>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="pagination-controls">
        <div class="pagination-buttons">
          <button
            :disabled="!canGoToPrevious"
            class="btn btn-sm btn-outline-primary"
            title="First Page (Home)"
            @click="goToFirstPage"
          >
            ⏮️ First
          </button>

          <button
            :disabled="!canGoToPrevious"
            class="btn btn-sm btn-outline-primary"
            title="Previous Page (←)"
            @click="prevPage"
          >
            ← Prev
          </button>

          <span class="page-indicator"> {{ currentPage }} / {{ totalPages }} </span>

          <button
            :disabled="!canGoToNext"
            class="btn btn-sm btn-outline-primary"
            title="Next Page (→)"
            @click="nextPage"
          >
            Next →
          </button>

          <button
            :disabled="!canGoToNext"
            class="btn btn-sm btn-outline-primary"
            title="Last Page (End)"
            @click="goToLastPage"
          >
            Last ⏭️
          </button>
        </div>

        <!-- Jump to Page -->
        <div v-if="totalPages > 5" class="jump-to-page">
          <input
            v-model="jumpToPageInput"
            :max="totalPages"
            :min="1"
            :placeholder="`1-${totalPages}`"
            class="form-control form-control-sm jump-input"
            type="number"
            @keyup.enter="jumpToPage"
          />
          <button
            :disabled="!jumpToPageInput || jumpToPageInput < 1 || jumpToPageInput > totalPages"
            class="btn btn-sm btn-primary"
            @click="jumpToPage"
          >
            Go
          </button>
        </div>
      </div>
    </div>

    <!-- Keyboard Navigation Hint -->
    <div v-if="enableKeyboardNavigation && totalPages > 1" class="keyboard-hint">
      <small class="text-muted">
        💡 Keyboard: ← → (navigate), Home/End (first/last), / (search)
      </small>
    </div>
  </div>
</template>

<style scoped>
.table-view-basic {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Controls */
.table-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-container {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.search-input {
  width: 100%;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.search-results-info {
  position: absolute;
  top: 100%;
  left: 0;
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.per-page-select {
  width: auto;
  min-width: 80px;
}

/* Table */
.table-container {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  overflow: hidden;
  background: white;
}

.table-scroll {
  overflow-x: auto;
  max-height: 600px;
}

.table {
  margin-bottom: 0;
}

.table-header {
  background-color: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  min-width: 120px;
}

.sortable-header:hover {
  background-color: #e9ecef;
}

.sortable-header.sorted {
  background-color: #e7f1ff;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.sort-indicator {
  font-size: 0.8em;
  color: #0d6efd;
  font-weight: bold;
}

.row-number-header {
  width: 60px;
  text-align: center;
  background-color: #f8f9fa;
}

/* Rows */
.data-row.clickable {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.data-row.clickable:hover {
  background-color: #f8f9fa;
}

.row-number {
  text-align: center;
  font-weight: 500;
  color: #6c757d;
  font-size: 0.9em;
  width: 60px;
}

.data-cell {
  max-width: 300px;
  position: relative;
}

.cell-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-link {
  color: #0d6efd;
  text-decoration: none;
}

.cell-link:hover {
  color: #0a58ca;
  text-decoration: underline;
}

/* Loading States */
.skeleton-row {
  background-color: #fafafa;
}

.skeleton-cell {
  padding: 0.75rem;
}

.skeleton-content {
  height: 1rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Empty States */
.empty-state-cell {
  padding: 3rem 1rem;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 2.5rem;
  opacity: 0.7;
}

.empty-message {
  font-size: 1.1rem;
  font-weight: 500;
}

.empty-suggestion {
  font-size: 0.9rem;
  opacity: 0.8;
}

.error-state {
  color: #dc3545;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-indicator {
  padding: 0.25rem 0.75rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.jump-to-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.jump-input {
  width: 80px;
}

/* Keyboard Hint */
.keyboard-hint {
  text-align: center;
  padding-top: 0.5rem;
  border-top: 1px solid #f0f0f0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-container {
    flex-direction: column;
    text-align: center;
  }

  .pagination-controls {
    justify-content: center;
    flex-wrap: wrap;
  }

  .pagination-buttons {
    gap: 0.25rem;
  }

  .pagination-buttons .btn {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 576px) {
  .table-scroll {
    font-size: 0.9rem;
  }

  .data-cell {
    max-width: 150px;
  }
}
</style>
