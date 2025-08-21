<script setup>
import TableView from '@/components/dynamic/TableView.vue'
import { useTableData } from '@/composables/useTableData'
import { useToast } from '@/composables/useToast'
import { formatReadableDate } from '@/utils/dayjs'
import { inject, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = route.meta?.title || 'Project Status'

const toast = useToast()
const supabase = inject('supabase')

const statuses = ref([])
const isLoading = ref(false)
const error = ref(null)

const getStatuses = async () => {
  try {
    isLoading.value = true
    error.value = null // Reset error state

    const { data, error: fetchError } = await supabase
      .from('project_status')
      .select('uuid, name, created_at, updated_at')
      .order('updated_at', { ascending: false })

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    if (!data || data.length === 0) {
      toast.info('No Data', 'Tidak ada data project type ditemukan')
    }

    statuses.value = data || []
  } catch (e) {
    error.value = e.message
    toast.error('Error Get Types', 'Something went wrong: ' + e.message)
  } finally {
    isLoading.value = false
  }
}

const transformConfig = {
  excludeKeys: ['uuid'],
  includeKeys: ['name', 'created', 'updated'],
  dataTransformer: (type) => ({
    uuid: type.uuid,
    name: type.name,
    created: formatReadableDate(type.created_at, { withTime: true }),
    updated: formatReadableDate(type.updated_at, { withTime: true }),
  }),
}

const { tableItems, rawKeys, headers } = useTableData(statuses, transformConfig)

const columnLinksConfiguration = {
  name: (row) => `/members/${row.uuid}`,
}

// Event handlers
const handleRowClick = (row) => {
  toast.success('Info Klik', `Anda mengklik member: ${row.name}`, 8000)
}

onMounted(getStatuses)
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title fw-medium mb-4">List Project Statuses</h5>

      <TableView
        :items="tableItems"
        :t-key="rawKeys"
        :t-header="headers"
        :items-per-page="10"
        :loading="isLoading"
        :error="error"
        :column-links="columnLinksConfiguration"
        :on-row-click="handleRowClick"
        :enable-keyboard-navigation="true"
      />
    </div>
  </div>
</template>
