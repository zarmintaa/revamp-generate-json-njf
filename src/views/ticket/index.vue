<script setup>
import TableView from '@/components/dynamic/TableView.vue'
import { useTableData } from '@/composables/useTableData'
import { formatReadableDate } from '@/utils/dayjs'
import { computed, inject, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = route.meta?.title || 'Ticket'
const page = route.name

const supabase = inject('supabase')

const tickets = ref(null)
const isLoading = ref(false)
const error = ref(null)

const getTickets = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('ticket')
      .select('uuid, name, updated_at, created_at')
      .order('updated_at', { ascending: false })

    if (error) throw error
    tickets.value = data
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

const transformConfig = {
  excludedKeys: ['uuid'],
  includeKeys: ['name', 'created', 'updated'],
  dataTransformer: (ticket) => {
    return {
      uuid: ticket.uuid,
      name: ticket.name,
      created: formatReadableDate(ticket.created_at, { withTime: true }),
      updated: formatReadableDate(ticket.updated_at, {
        withTime: true,
      }),
    }
  },
}

const { tableItems, rawKeys, headers } = useTableData(tickets, transformConfig)

const columnLinksConfiguration = {
  name: (row) => `/${page}/${row.uuid}`, // Menggunakan 'name' yang ada di data
}

// Fix: Handle row click dengan parameter yang benar
const handleRowClick = (row) => {
  toast.success('Info Klik', `Anda mengklik team: ${row.name} (Lead: ${row.lead})`, 8000)
  // router.push(`/teams/${row.uuid}`)
}

onMounted(getTickets)
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title fw-medium mb-4">Current Tickets</h5>

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
