// composables/usePagination.js
import { ref, computed, watch } from 'vue'

/**
 * @typedef {Object} PaginationOptions
 * @property {number} [defaultItemsPerPage=5] - Default number of items per page
 * @property {number} [maxVisiblePages=7] - Maximum number of visible pages in pagination
 */

/**
 * @typedef {Object} PaginationResult
 * @property {import('vue').Ref<number>} currentPage - Current page reactive reference
 * @property {import('vue').Ref<number>} itemsPerPage - Items per page reactive reference
 * @property {import('vue').ComputedRef<number>} totalPages - Total pages computed property
 * @property {import('vue').ComputedRef<any[]>} paginatedData - Paginated data computed property
 * @property {import('vue').ComputedRef<string>} paginationSummary - Pagination summary computed property
 * @property {import('vue').ComputedRef<(number|string)[]>} pages - Pages array computed property
 * @property {function(number): void} setPage - Set current page method
 * @property {function(): void} nextPage - Go to next page method
 * @property {function(): void} prevPage - Go to previous page method
 * @property {function(number): void} setItemsPerPage - Set items per page method
 * @property {function(): void} resetPagination - Reset pagination method
 */

/**
 * Composable for handling pagination logic
 * @param {import('vue').ComputedRef<any[]>} data - Reactive data array
 * @param {PaginationOptions} options - Pagination options
 * @returns {PaginationResult} Pagination state and methods
 */
export function usePagination(data, options = {}) {
  const { defaultItemsPerPage = 5, maxVisiblePages = 5 } = options

  // State
  const currentPage = ref(1)
  const itemsPerPage = ref(defaultItemsPerPage)

  // Computed Properties
  const totalPages = computed(() => {
    const total = Math.ceil(data.value.length / itemsPerPage.value)
    return total > 0 ? total : 1
  })

  const paginatedData = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value
    const endIndex = startIndex + itemsPerPage.value
    return data.value.slice(startIndex, endIndex)
  })

  const paginationSummary = computed(() => {
    const total = data.value.length
    if (total === 0) {
      return 'No results found'
    }
    const startItem = (currentPage.value - 1) * itemsPerPage.value + 1
    const endItem = Math.min(currentPage.value * itemsPerPage.value, total)
    return `Showing ${startItem} to ${endItem} of ${total} results`
  })

  const pages = computed(() => {
    const range = []
    const total = totalPages.value
    const current = currentPage.value

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) {
        range.push(i)
      }
      return range
    }

    const startPage = Math.max(2, current - 1)
    const endPage = Math.min(total - 1, current + 1)

    range.push(1)

    if (startPage > 2) {
      range.push('...')
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i)
    }

    if (endPage < total - 1) {
      range.push('...')
    }

    range.push(total)

    return range
  })

  // Methods
  const setPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const nextPage = () => {
    setPage(currentPage.value + 1)
  }

  const prevPage = () => {
    setPage(currentPage.value - 1)
  }

  const setItemsPerPage = (items) => {
    itemsPerPage.value = items
    currentPage.value = 1 // Reset to first page when changing items per page
  }

  const resetPagination = () => {
    currentPage.value = 1
    itemsPerPage.value = defaultItemsPerPage
  }

  // Watchers
  watch(
    data,
    () => {
      // Reset to first page if current page exceeds total pages
      if (currentPage.value > totalPages.value) {
        currentPage.value = 1
      }
    },
    { deep: true },
  )

  watch(itemsPerPage, () => {
    // Reset to first page when items per page changes
    currentPage.value = 1
  })

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedData,
    paginationSummary,
    pages,
    setPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    resetPagination,
  }
}
