<!-- /views/Teams.vue -->

<script setup>
import TableView from '@/components/dynamic/TableView.vue'
import { useTableData } from '@/composables/useTableData'
import { useToast } from '@/composables/useToast'
import { formatReadableDate } from '@/utils/dayjs'
import { generateGravatarUrl } from '@/utils/image-util'
import { inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const title = route.meta?.title || 'Teams'
const toast = useToast()

const supabase = inject('supabase')

const teams = ref([])
const isLoading = ref(false)
const error = ref(null)

const getTeams = async () => {
  isLoading.value = true
  try {
    const { data: results, error: fetchError } = await supabase
      .from('team')
      .select('uuid, name, lead:lead_id(name, email), created_at, updated_at')
      .order('updated_at', { ascending: false })

    if (fetchError) throw fetchError

    teams.value = results
    // console.log('Raw teams data:', results) // Debug log
  } catch (e) {
    error.value = e.message
    console.error('Error fetching teams:', e)
  } finally {
    isLoading.value = false
  }
}

const transformConfig = {
  excludeKeys: ['uuid', 'leadEmail', 'leadAvatar'], // Fixed: excludedKeys -> excludeKeys
  includeKeys: ['name', 'lead', 'created', 'updated'],
  dataTransformer: (team) => {
    return {
      uuid: team.uuid,
      name: team.name,
      lead: team.lead?.name || 'No Lead', // Safe access with fallback
      leadEmail: team.lead?.email || '',
      leadAvatar: generateGravatarUrl(team.lead?.email),
      created: formatReadableDate(team.created_at, { withTime: true }),
      updated: formatReadableDate(team.updated_at, { withTime: true }),
    }
  },
}

const { tableItems, rawKeys, headers } = useTableData(teams, transformConfig)

// Column links configuration
const columnLinksConfiguration = {
  name: (row) => `/teams/${row.uuid}`,
}

// Event handlers
const handleRowClick = (row) => {
  toast.success('Info Klik', `Anda mengklik team: ${row.name} (Lead: ${row.lead})`, 8000)
  // router.push(`/teams/${row.uuid}`)
}

const handleAvatarError = (event) => {
  // Fallback to default avatar on error
  event.target.src = 'https://www.gravatar.com/avatar/default?s=32&d=identicon&r=g'
}

onMounted(getTeams)
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h2 class="card-title fw-medium mb-3">Current Teams</h2>

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
      >
        <!-- Custom slot for lead column with avatar -->
        <template #cell(lead)="{ item, value }">
          <div class="d-flex align-items-center gap-2">
            <img
              :src="item.leadAvatar"
              :alt="`${value} avatar`"
              class="rounded-circle"
              style="width: 32px; height: 32px; object-fit: cover"
              @error="handleAvatarError"
            />
            <div class="d-flex flex-column">
              <span class="fw-medium">{{ value }}</span>
              <small class="text-muted">{{ item.leadEmail }}</small>
            </div>
          </div>
        </template>
      </TableView>
    </div>
  </div>
</template>
