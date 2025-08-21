<!-- /views/Members.vue -->

<script setup>
import TableView from '@/components/dynamic/TableView.vue'
import { useTableData } from '@/composables/useTableData'
import { useToast } from '@/composables/useToast'
import { generateGravatarUrl } from '@/utils/image-util'
import { formatReadableDate } from '@/utils/dayjs'
import { inject, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = route.meta?.title || 'Member'
const toast = useToast()
const page = route.fullPath

const supabase = inject('supabase')

const members = ref([])
const isLoading = ref(false)
const error = ref(null)
const isDeleting = ref(false)

const getMembers = async () => {
  isLoading.value = true
  error.value = null
  try {
    const { data: results, error: fetchError } = await supabase
      .from(`${page}`)
      .select('uuid, nik, name, email, team:team_id(name), is_lead, created_at, updated_at')
      .order('updated_at', { ascending: false })

    if (fetchError) throw fetchError

    members.value = results
  } catch (e) {
    error.value = e.message
    console.error('Error fetching members:', e)
    toast.error('Error', e.message, 10000)
  } finally {
    isLoading.value = false
  }
}

const deleteMember = async (memberId, memberName) => {
  const confirmed = confirm(`Apakah Anda yakin ingin menghapus member "${memberName}"?`)
  if (!confirmed) return

  isDeleting.value = true
  try {
    const { error: deleteError } = await supabase.from(`${page}`).delete().eq('uuid', memberId)

    if (deleteError) throw deleteError

    // Remove from local state
    members.value = members.value.filter((member) => member.uuid !== memberId)

    toast.success('Berhasil', `Member "${memberName}" berhasil dihapus`, 5000)
  } catch (e) {
    toast.error('Error', `Gagal menghapus member: ${e.message}`, 8000)
    console.error('Delete error:', e)
  } finally {
    isDeleting.value = false
  }
}

// Members-specific table data transformation configuration
const transformConfig = {
  excludeKeys: ['uuid', 'email', 'avatar'],
  includeKeys: ['name', 'nik', 'team', 'status', 'created', 'updated', 'actions'], // Include actions column
  dataTransformer: (member) => ({
    uuid: member.uuid,
    name: member.name,
    nik: member.nik,
    team: member.team?.name || 'No Team',
    email: member.email,
    status: member.is_lead ? 'Lead' : '-',
    avatar: generateGravatarUrl(member.email),
    created: formatReadableDate(member.created_at, { withTime: true }),
    updated: formatReadableDate(member.updated_at, { withTime: true }),
    actions: null, // Placeholder for actions column
  }),
  headerTransform: (key) => {
    if (key === 'actions') return 'Aksi'
    if (key === 'nik') return 'NIK'
    // Convert underscore to space and Title Case
    return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  },
}

// Use table data composable with members configuration
const { tableItems, rawKeys, headers } = useTableData(members, transformConfig)

// Column links configuration
const columnLinksConfiguration = {
  name: (row) => `/members/${row.uuid}`,
}

// Event handlers
const handleRowClick = (row) => {
  toast.success('Info Klik', `Anda mengklik member: ${row.name}`, 8000)
}

const handleAvatarError = (event) => {
  event.target.src = 'https://www.gravatar.com/avatar/default?s=32&d=identicon&r=g'
}

onMounted(getMembers)
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title fw-medium mb-4">List Members</h5>

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
        <!-- Custom slot for name column with avatar -->
        <template #cell(name)="{ item, value }">
          <div class="d-flex align-items-center gap-2">
            <img
              :src="item.avatar"
              :alt="`${value} avatar`"
              class="rounded-circle"
              style="width: 32px; height: 32px; object-fit: cover"
              @error="handleAvatarError"
            />
            <div class="d-flex flex-column">
              <span class="fw-medium">{{ value }}</span>
              <small class="text-muted">{{ item.email }}</small>
            </div>
          </div>
        </template>

        <!-- Custom slot for actions column -->
        <template #cell(actions)="{ item }">
          <div class="d-flex gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-danger"
              :disabled="isDeleting"
              @click.stop="deleteMember(item.uuid, item.name)"
              title="Hapus Member"
            >
              <i class="ti ti-trash" v-if="!isDeleting"></i>
              <span v-if="isDeleting" class="spinner-border spinner-border-sm" role="status"></span>
              <span class="visually-hidden">Hapus</span>
            </button>
          </div>
        </template>
      </TableView>
    </div>
  </div>
</template>
