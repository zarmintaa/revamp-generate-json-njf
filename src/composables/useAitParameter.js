// src/composables/useAitParameter.js

import { ref, inject, computed } from 'vue'

export function useAitParameter() {
  const supabase = inject('supabase')

  // Reactive state
  const headers = ref([])
  const details = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed untuk data yang sudah di-join
  const fullAitParameters = computed(() => {
    return headers.value.map((header) => ({
      ...header,
      details: details.value.filter((detail) => detail.aitCode === header.aitCode),
    }))
  })

  // Helper function untuk handle error
  const handleError = (err, operation) => {
    console.error(`Error in ${operation}:`, err)
    error.value = err.message || `Error occurred during ${operation}`
    return null
  }

  // ==================== HEADER OPERATIONS ====================

  // Get all headers
  const getAllHeaders = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('ait_parameter_header')
        .select('*')
        .order('event', { ascending: true })

      if (err) throw err

      headers.value = data || []
      return data.map((ait) => {
        return {
          id: ait.id,
          event: ait.event,
          aitCode: ait.aitcode,
          description: ait.description,
          created_at: ait.created_at,
          updated_at: ait.updated_at,
        }
      })
    } catch (err) {
      return handleError(err, 'getAllHeaders')
    } finally {
      loading.value = false
    }
  }

  // Get header by aitCode
  const getHeaderByCode = async (aitCode) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('ait_parameter_header')
        .select('*')
        .eq('aitcode', aitCode)
        .single()

      if (err) throw err
      return data
    } catch (err) {
      return handleError(err, 'getHeaderByCode')
    } finally {
      loading.value = false
    }
  }

  // Create new header
  const createHeader = async (headerData) => {
    try {
      loading.value = true
      error.value = null

      // Pastikan data memiliki struktur yang benar
      const dataToInsert = {
        event: headerData.event,
        aitCode: headerData.aitCode,
        description: headerData.description || null,
      }

      const { data, error: err } = await supabase
        .from('ait_parameter_header')
        .insert([dataToInsert])
        .select()
        .single()

      if (err) throw err

      // Update local state
      headers.value.push(data)
      return data
    } catch (err) {
      return handleError(err, 'createHeader')
    } finally {
      loading.value = false
    }
  }

  // Update header
  const updateHeader = async (aitCode, updates) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('ait_parameter_header')
        .update(updates)
        .eq('aitcode', aitCode)
        .select()
        .single()

      if (err) throw err

      // Update local state
      const index = headers.value.findIndex((h) => h.aitCode === aitCode)
      if (index !== -1) {
        headers.value[index] = data
      }

      return data
    } catch (err) {
      return handleError(err, 'updateHeader')
    } finally {
      loading.value = false
    }
  }

  // Delete header (will cascade delete details)
  const deleteHeader = async (aitCode) => {
    try {
      loading.value = true
      error.value = null

      const { error: err } = await supabase
        .from('ait_parameter_header')
        .delete()
        .eq('aitcode', aitCode)

      if (err) throw err

      // Update local state
      headers.value = headers.value.filter((h) => h.aitCode !== aitCode)
      details.value = details.value.filter((d) => d.aitCode !== aitCode)

      return true
    } catch (err) {
      return handleError(err, 'deleteHeader')
    } finally {
      loading.value = false
    }
  }

  // ==================== DETAIL OPERATIONS ====================

  // Get all details
  const getAllDetails = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('ait_parameter_detail')
        .select('*')
        .order('aitcode', { ascending: true })
        .order('linegt', { ascending: true })

      if (err) throw err

      details.value = data || []
      return data.map((ait) => {
        return {
          id: ait.id,
          aitCode: ait.aitcode,
          amountType: ait.amountType,
          isOptional: ait.isoptional,
          lineGt: ait.linegt,
          created_at: ait.created_at,
          updated_at: ait.updated_at,
        }
      })
    } catch (err) {
      return handleError(err, 'getAllDetails')
    } finally {
      loading.value = false
    }
  }

  // Get details by aitCode
  const getDetailsByCode = async (aitCode) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('ait_parameter_detail')
        .select('*')
        .eq('aitcode', aitCode)
        .order('linegt', { ascending: true })

      if (err) throw err
      return data || []
    } catch (err) {
      return handleError(err, 'getDetailsByCode')
    } finally {
      loading.value = false
    }
  }

  // Create new detail
  const createDetail = async (detailData) => {
    try {
      loading.value = true
      error.value = null

      // Pastikan data memiliki struktur yang benar
      const dataToInsert = {
        aitCode: detailData.aitCode,
        lineGt: detailData.lineGt,
        amountType: detailData.amountType,
        isOptional: detailData.isOptional || false,
      }

      const { data, error: err } = await supabase
        .from('ait_parameter_detail')
        .insert([dataToInsert])
        .select()
        .single()

      if (err) throw err

      // Update local state
      details.value.push(data)
      return data
    } catch (err) {
      return handleError(err, 'createDetail')
    } finally {
      loading.value = false
    }
  }

  // Create multiple details at once
  const createMultipleDetails = async (detailsData) => {
    try {
      loading.value = true
      error.value = null

      const dataToInsert = detailsData.map((detail) => ({
        aitCode: detail.aitCode,
        lineGt: detail.lineGt,
        amountType: detail.amountType,
        isOptional: detail.isOptional || false,
      }))

      const { data, error: err } = await supabase
        .from('ait_parameter_detail')
        .insert(dataToInsert)
        .select()

      if (err) throw err

      // Update local state
      details.value.push(...data)
      return data
    } catch (err) {
      return handleError(err, 'createMultipleDetails')
    } finally {
      loading.value = false
    }
  }

  // Update detail
  const updateDetail = async (id, updates) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('ait_parameter_detail')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      // Update local state
      const index = details.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        details.value[index] = data
      }

      return data
    } catch (err) {
      return handleError(err, 'updateDetail')
    } finally {
      loading.value = false
    }
  }

  // Delete detail
  const deleteDetail = async (id) => {
    try {
      loading.value = true
      error.value = null

      const { error: err } = await supabase.from('ait_parameter_detail').delete().eq('id', id)

      if (err) throw err

      // Update local state
      details.value = details.value.filter((d) => d.id !== id)

      return true
    } catch (err) {
      return handleError(err, 'deleteDetail')
    } finally {
      loading.value = false
    }
  }

  // Delete all details for specific aitCode
  const deleteDetailsByCode = async (aitCode) => {
    try {
      loading.value = true
      error.value = null

      const { error: err } = await supabase
        .from('ait_parameter_detail')
        .delete()
        .eq('aitcode', aitCode)

      if (err) throw err

      // Update local state
      details.value = details.value.filter((d) => d.aitCode !== aitCode)

      return true
    } catch (err) {
      return handleError(err, 'deleteDetailsByCode')
    } finally {
      loading.value = false
    }
  }

  // ==================== COMPLEX OPERATIONS ====================

  // Get full AIT parameter with details (optimized single query)
  const getFullAitParameter = async (aitCode = null) => {
    try {
      loading.value = true
      error.value = null

      let query = supabase
        .from('ait_parameter_header')
        .select(
          `
          *,
          ait_parameter_detail(*)
        `,
        )
        .order('event', { ascending: true })

      if (aitCode) {
        query = query.eq('aitcode', aitCode)
      }

      const { data, error: err } = await query

      if (err) throw err

      return data || []
    } catch (err) {
      return handleError(err, 'getFullAitParameter')
    } finally {
      loading.value = false
    }
  }

  // Bulk create AIT parameter (header + details dalam satu transaksi)
  const createFullAitParameter = async (headerData, detailsData) => {
    try {
      loading.value = true
      error.value = null

      // Insert header first
      const headerToInsert = {
        event: headerData.event,
        aitCode: headerData.aitCode,
        description: headerData.description || null,
      }

      const { data: headerResult, error: headerErr } = await supabase
        .from('ait_parameter_header')
        .insert([headerToInsert])
        .select()
        .single()

      if (headerErr) throw headerErr

      // Insert details with aitCode
      const detailsWithCode = detailsData.map((detail) => ({
        aitCode: headerData.aitCode,
        lineGt: detail.lineGt,
        amountType: detail.amountType,
        isOptional: detail.isOptional || false,
      }))

      const { data: detailsResult, error: detailsErr } = await supabase
        .from('ait_parameter_detail')
        .insert(detailsWithCode)
        .select()

      if (detailsErr) {
        // Rollback header jika detail gagal
        await supabase.from('ait_parameter_header').delete().eq('aitcode', headerData.aitCode)
        throw detailsErr
      }

      // Update local state
      headers.value.push(headerResult)
      details.value.push(...detailsResult)

      return {
        header: headerResult,
        details: detailsResult,
      }
    } catch (err) {
      return handleError(err, 'createFullAitParameter')
    } finally {
      loading.value = false
    }
  }

  // Search AIT parameters
  const searchAitParameters = async (searchTerm) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('ait_parameter_header')
        .select(
          `
          *,
          ait_parameter_detail(*)
        `,
        )
        .or(
          `event.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,aitCode.ilike.%${searchTerm}%`,
        )

      if (err) throw err

      return data || []
    } catch (err) {
      return handleError(err, 'searchAitParameters')
    } finally {
      loading.value = false
    }
  }

  // Get unique events
  const getUniqueEvents = computed(() => {
    const events = [...new Set(headers.value.map((header) => header.event))]
    return events.sort()
  })

  // Get headers by event
  const getHeadersByEvent = (event) => {
    return headers.value.filter((header) => header.event === event)
  }

  // Validate aitCode exists
  const isValidAitCode = (aitCode) => {
    return headers.value.some((header) => header.aitCode === aitCode)
  }

  // Get parameter statistics
  const getParameterStats = computed(() => {
    const totalHeaders = headers.value.length
    const totalDetails = details.value.length
    const uniqueEvents = getUniqueEvents.value.length

    const detailsByCode = {}
    details.value.forEach((detail) => {
      if (!detailsByCode[detail.aitCode]) {
        detailsByCode[detail.aitCode] = 0
      }
      detailsByCode[detail.aitCode]++
    })

    return {
      totalHeaders,
      totalDetails,
      uniqueEvents,
      averageDetailsPerHeader: totalHeaders > 0 ? (totalDetails / totalHeaders).toFixed(1) : 0,
      detailsByCode,
    }
  })

  // ==================== UTILITY FUNCTIONS ====================

  // Reset state
  const resetState = () => {
    headers.value = []
    details.value = []
    error.value = null
    loading.value = false
  }

  // Load all data (header + detail)
  const loadAllData = async () => {
    try {
      loading.value = true
      error.value = null

      await Promise.all([getAllHeaders(), getAllDetails()])

      console.log('AIT Parameters loaded:', {
        headers: headers.value,
        details: details.value,
      })
    } catch (err) {
      handleError(err, 'loadAllData')
    } finally {
      loading.value = false
    }
  }

  // Refresh data from database
  const refreshData = async () => {
    resetState()
    await loadAllData()
  }

  return {
    // State
    headers,
    details,
    loading,
    error,
    fullAitParameters,

    // Header operations
    getAllHeaders,
    getHeaderByCode,
    createHeader,
    updateHeader,
    deleteHeader,

    // Detail operations
    getAllDetails,
    getDetailsByCode,
    createDetail,
    createMultipleDetails,
    updateDetail,
    deleteDetail,
    deleteDetailsByCode,

    // Complex operations
    getFullAitParameter,
    createFullAitParameter,
    searchAitParameters,

    // Computed properties
    getUniqueEvents,
    getParameterStats,

    // Utility functions
    getHeadersByEvent,
    isValidAitCode,
    resetState,
    loadAllData,
    refreshData,
  }
}
