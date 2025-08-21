import { computed } from 'vue'

export const useTableData = (rawData, transformConfig = {}) => {
  const {
    excludeKeys = [],
    includeKeys = [],
    headerTransform = (key) =>
      key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    dataTransformer = null,
  } = transformConfig

  // Transform raw data into table items
  const tableItems = computed(() => {
    if (!rawData.value || !Array.isArray(rawData.value)) return []

    return rawData.value.map((item) => {
      if (dataTransformer && typeof dataTransformer === 'function') {
        return dataTransformer(item)
      }
      return item
    })
  })

  // Extract keys from data, applying include/exclude filters
  const rawKeys = computed(() => {
    if (!tableItems.value || tableItems.value.length === 0) {
      return includeKeys.length > 0 ? includeKeys : []
    }

    const keys = Object.keys(tableItems.value[0] || {})

    // Apply include filter first if provided
    const filteredKeys =
      includeKeys.length > 0 ? keys.filter((key) => includeKeys.includes(key)) : keys

    // Then apply exclude filter
    return filteredKeys.filter((key) => !excludeKeys.includes(key))
  })

  // Transform keys into headers
  const headers = computed(() => rawKeys.value.map((key) => headerTransform(key)))

  return {
    tableItems,
    rawKeys,
    headers,
  }
}
