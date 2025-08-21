<script setup>
import { ref, computed } from 'vue'
import md5 from 'crypto-js/md5'
import TableView from '@/components/dynamic/TableView.vue'
import { useRouter } from 'vue-router'
import placeholderAvatar from '@/assets/images/profile/default-avatar.jpg'

const router = useRouter()

// Data mentah
const performanceData = ref([
  {
    reporter: {
      name: 'Sunil Joshi',
      title: 'Web Designer',
      avatar: null,
      email: 'sunil.joshi@example.com',
    },
    project: 'Taskify UI',
    issueKey: 'TSK-101',
    priority: { text: 'High', color: 'danger' },
    dueDate: '25 July, 2025',
  },
  {
    reporter: {
      name: 'Andrew McDownland',
      title: 'Project Manager',
      avatar: '/images/profile/user-5.jpg',
      email: 'andrew.mcdownland@example.com',
    },
    project: 'API Gateway',
    issueKey: 'TSK-102',
    priority: { text: 'Medium', color: 'warning' },
    dueDate: '28 July, 2025',
  },
  {
    reporter: {
      name: 'Christopher Jamil',
      title: 'SEO Manager',
      avatar: '/images/profile/user-6.jpg',
      email: 'christopher.jamil@example.com',
    },
    project: 'Marketing Campaign',
    issueKey: 'MKT-05',
    priority: { text: 'Low', color: 'info' },
    dueDate: '02 Aug, 2025',
  },
  {
    reporter: {
      name: 'Nirav Joshi',
      title: 'Frontend Engineer',
      avatar: '/images/profile/user-7.jpg',
      email: 'nirac.joshi@example.com',
    },
    project: 'Taskify UI',
    issueKey: 'TSK-105',
    priority: { text: 'High', color: 'danger' },
    dueDate: '30 July, 2025',
  },
  {
    reporter: {
      name: 'Micheal Doe',
      title: 'Content Writer',
      avatar: '/images/profile/user-8.jpg',
      email: 'micheal.doe@example.com',
    },
    project: 'Blog & Documentation',
    issueKey: 'DOC-12',
    priority: { text: 'Medium', color: 'warning' },
    dueDate: '15 Aug, 2025',
  },
  {
    reporter: {
      name: 'Sunil Joshi',
      title: 'Web Designer',
      avatar: null,
      email: 'sunil.joshi@example.com',
    },
    project: 'Taskify UI',
    issueKey: 'TSK-101',
    priority: { text: 'High', color: 'danger' },
    dueDate: '25 July, 2025',
  },
  {
    reporter: {
      name: 'Andrew McDownland',
      title: 'Project Manager',
      avatar: '/images/profile/user-5.jpg',
      email: 'andrew.mcdownland@example.com',
    },
    project: 'API Gateway',
    issueKey: 'TSK-102',
    priority: { text: 'Medium', color: 'warning' },
    dueDate: '28 July, 2025',
  },
  {
    reporter: {
      name: 'Christopher Jamil',
      title: 'SEO Manager',
      avatar: '/images/profile/user-6.jpg',
      email: 'christopher.jamil@example.com',
    },
    project: 'Marketing Campaign',
    issueKey: 'MKT-05',
    priority: { text: 'Low', color: 'info' },
    dueDate: '02 Aug, 2025',
  },
  {
    reporter: {
      name: 'Nirav Joshi',
      title: 'Frontend Engineer',
      avatar: '/images/profile/user-7.jpg',
      email: 'nirac.joshi@example.com',
    },
    project: 'Taskify UI',
    issueKey: 'TSK-105',
    priority: { text: 'High', color: 'danger' },
    dueDate: '30 July, 2025',
  },
  {
    reporter: {
      name: 'Micheal Doe',
      title: 'Content Writer',
      avatar: '/images/profile/user-8.jpg',
      email: 'micheal.doe@example.com',
    },
    project: 'Blog & Documentation',
    issueKey: 'DOC-12',
    priority: { text: 'Medium', color: 'warning' },
    dueDate: '15 Aug, 2025',
  },
  {
    reporter: {
      name: 'Sunil Joshi',
      title: 'Web Designer',
      avatar: null,
      email: 'sunil.joshi@example.com',
    },
    project: 'Taskify UI',
    issueKey: 'TSK-101',
    priority: { text: 'High', color: 'danger' },
    dueDate: '25 July, 2025',
  },
  {
    reporter: {
      name: 'Andrew McDownland',
      title: 'Project Manager',
      avatar: '/images/profile/user-5.jpg',
      email: 'andrew.mcdownland@example.com',
    },
    project: 'API Gateway',
    issueKey: 'TSK-102',
    priority: { text: 'Medium', color: 'warning' },
    dueDate: '28 July, 2025',
  },
  {
    reporter: {
      name: 'Christopher Jamil',
      title: 'SEO Manager',
      avatar: '/images/profile/user-6.jpg',
      email: 'christopher.jamil@example.com',
    },
    project: 'Marketing Campaign',
    issueKey: 'MKT-05',
    priority: { text: 'Low', color: 'info' },
    dueDate: '02 Aug, 2025',
  },
  {
    reporter: {
      name: 'Nirav Joshi',
      title: 'Frontend Engineer',
      avatar: '/images/profile/user-7.jpg',
      email: 'nirac.joshi@example.com',
    },
    project: 'Taskify UI',
    issueKey: 'TSK-105',
    priority: { text: 'High', color: 'danger' },
    dueDate: '30 July, 2025',
  },
  {
    reporter: {
      name: 'Micheal Doe',
      title: 'Content Writer',
      avatar: '/images/profile/user-8.jpg',
      email: 'micheal.doe@example.com',
    },
    project: 'Blog & Documentation',
    issueKey: 'DOC-12',
    priority: { text: 'Medium', color: 'warning' },
    dueDate: '15 Aug, 2025',
  },
  {
    reporter: {
      name: 'Sunil Joshi',
      title: 'Web Designer',
      avatar: null,
      email: 'sunil.joshi@example.com',
    },
    project: 'Taskify UI',
    issueKey: 'TSK-101',
    priority: { text: 'High', color: 'danger' },
    dueDate: '25 July, 2025',
  },
  {
    reporter: {
      name: 'Andrew McDownland',
      title: 'Project Manager',
      avatar: '/images/profile/user-5.jpg',
      email: 'andrew.mcdownland@example.com',
    },
    project: 'API Gateway',
    issueKey: 'TSK-102',
    priority: { text: 'Medium', color: 'warning' },
    dueDate: '28 July, 2025',
  },
  {
    reporter: {
      name: 'Christopher Jamil',
      title: 'SEO Manager',
      avatar: '/images/profile/user-6.jpg',
      email: 'christopher.jamil@example.com',
    },
    project: 'Marketing Campaign',
    issueKey: 'MKT-05',
    priority: { text: 'Low', color: 'info' },
    dueDate: '02 Aug, 2025',
  },
  {
    reporter: {
      name: 'Nirav Joshi',
      title: 'Frontend Engineer',
      avatar: '/images/profile/user-7.jpg',
      email: 'nirac.joshi@example.com',
    },
    project: 'Taskify UI',
    issueKey: 'TSK-105',
    priority: { text: 'High', color: 'danger' },
    dueDate: '30 July, 2025',
  },
  {
    reporter: {
      name: 'Micheal Doe',
      title: 'Content Writer',
      avatar: '/images/profile/user-8.jpg',
      email: 'micheal.doe@example.com',
    },
    project: 'Blog & Documentation',
    issueKey: 'DOC-12',
    priority: { text: 'Medium', color: 'warning' },
    dueDate: '15 Aug, 2025',
  },
  {
    reporter: {
      name: 'Sunil Joshi',
      title: 'Web Designer',
      avatar: null,
      email: 'sunil.joshi@example.com',
    },
    project: 'Taskify UI',
    issueKey: 'TSK-101',
    priority: { text: 'High', color: 'danger' },
    dueDate: '25 July, 2025',
  },
  {
    reporter: {
      name: 'Andrew McDownland',
      title: 'Project Manager',
      avatar: '/images/profile/user-5.jpg',
      email: 'andrew.mcdownland@example.com',
    },
    project: 'API Gateway',
    issueKey: 'TSK-102',
    priority: { text: 'Medium', color: 'warning' },
    dueDate: '28 July, 2025',
  },
  {
    reporter: {
      name: 'Christopher Jamil',
      title: 'SEO Manager',
      avatar: '/images/profile/user-6.jpg',
      email: 'christopher.jamil@example.com',
    },
    project: 'Marketing Campaign',
    issueKey: 'MKT-05',
    priority: { text: 'Low', color: 'info' },
    dueDate: '02 Aug, 2025',
  },
  {
    reporter: {
      name: 'Nirav Joshi',
      title: 'Frontend Engineer',
      avatar: '/images/profile/user-7.jpg',
      email: 'nirac.joshi@example.com',
    },
    project: 'Taskify UI',
    issueKey: 'TSK-105',
    priority: { text: 'High', color: 'danger' },
    dueDate: '30 July, 2025',
  },
  {
    reporter: {
      name: 'Micheal Doe',
      title: 'Content Writer',
      avatar: '/images/profile/user-8.jpg',
      email: 'micheal.doe@example.com',
    },
    project: 'Blog & Documentation',
    issueKey: 'DOC-12',
    priority: { text: 'Medium', color: 'warning' },
    dueDate: '15 Aug, 2025',
  },
  {
    reporter: {
      name: 'Sunil Joshi',
      title: 'Web Designer',
      avatar: null,
      email: 'sunil.joshi@example.com',
    },
    project: 'Taskify UI',
    issueKey: 'TSK-101',
    priority: { text: 'High', color: 'danger' },
    dueDate: '25 July, 2025',
  },
  {
    reporter: {
      name: 'Andrew McDownland',
      title: 'Project Manager',
      avatar: '/images/profile/user-5.jpg',
      email: 'andrew.mcdownland@example.com',
    },
    project: 'API Gateway',
    issueKey: 'TSK-102',
    priority: { text: 'Medium', color: 'warning' },
    dueDate: '28 July, 2025',
  },
  {
    reporter: {
      name: 'Christopher Jamil',
      title: 'SEO Manager',
      avatar: '/images/profile/user-6.jpg',
      email: 'christopher.jamil@example.com',
    },
    project: 'Marketing Campaign',
    issueKey: 'MKT-05',
    priority: { text: 'Low', color: 'info' },
    dueDate: '02 Aug, 2025',
  },
  {
    reporter: {
      name: 'Nirav Joshi',
      title: 'Frontend Engineer',
      avatar: '/images/profile/user-7.jpg',
      email: 'nirac.joshi@example.com',
    },
    project: 'Taskify UI',
    issueKey: 'TSK-105',
    priority: { text: 'High', color: 'danger' },
    dueDate: '30 July, 2025',
  },
  {
    reporter: {
      name: 'Micheal Doe',
      title: 'Content Writer',
      avatar: '/images/profile/user-8.jpg',
      email: 'micheal.doe@example.com',
    },
    project: 'Blog & Documentation',
    issueKey: 'DOC-12',
    priority: { text: 'Medium', color: 'warning' },
    dueDate: '15 Aug, 2025',
  },
])

// --- PERSIAPAN DATA UNTUK TABLEVIEW ---
const tableItems = computed(() => {
  return performanceData.value.map((item) => ({
    // 1. Sertakan objek asli untuk digunakan di dalam slot
    reporter: item.reporter,
    priority: item.priority,

    // 2. Sediakan juga data flat untuk sorting, filtering, dan fallback display
    reporter_name: item.reporter.name, // Key untuk kolom 'Reporter'
    project: item.project,
    issue_key: item.issueKey,
    priority_text: item.priority.text, // Key untuk kolom 'Priority'
    due_date: item.dueDate,
  }))
})

const rawKeys = computed(() => {
  if (!tableItems.value || tableItems.value.length === 0) {
    return ['reporter_name', 'project', 'issue_key', 'priority_text', 'due_date']
  }
  const keys = Object.keys(tableItems.value[0] || {})
  const excludeKeys = ['uuid', 'reporter', 'priority']
  return keys.filter((key) => !excludeKeys.includes(key))
})

const headers = computed(() =>
  rawKeys.value.map((key) => key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())),
)

const columnLinksConfiguration = computed(() => ({
  issue_key: (row) => `#issues/${row.issue_key}`,
}))

const navigateOnClickRow = (row) => {
  router.push(`#list-jira/${row.issue_key}`)
}

// Helper untuk avatar tetap dibutuhkan
// const placeholderAvatar = '@/assets/images/profile/default-avatar.png'
const resolveAvatarUrl = (reporter) => {
  if (reporter.avatar) return reporter.avatar
  if (reporter.email) {
    const hash = md5(reporter.email.trim().toLowerCase()).toString()
    return `https://www.gravatar.com/avatar/${hash}?d=mp&s=80`
  }

  return placeholderAvatar
}

const handleImageError = (event) => {
  const target = event.target
  if (target.src !== placeholderAvatar) target.src = placeholderAvatar
}
</script>

<template>
  <div class="col-12">
    <div class="card">
      <div class="card-header bg-white">
        <div class="d-md-flex align-items-center">
          <div>
            <h4 class="card-title">Active Issues</h4>
            <p class="card-subtitle">Summary of current tasks</p>
          </div>
          <div class="ms-auto mt-3 mt-md-0"></div>
        </div>
      </div>
      <div class="card-body">
        <div class="">
          <TableView
            :items="tableItems"
            :t-key="rawKeys"
            :t-header="headers"
            :items-per-page="10"
            :column-links="columnLinksConfiguration"
            :on-row-click="navigateOnClickRow"
            :enable-keyboard-navigation="true"
          >
            <template #cell(reporter_name)="{ item }">
              <div class="d-flex align-items-center">
                <img
                  :src="resolveAvatarUrl(item.reporter)"
                  class="rounded-circle"
                  width="40"
                  height="40"
                  :alt="item.reporter.name"
                  @error="handleImageError($event)"
                />
                <div class="ms-3">
                  <h6 class="mb-0 fw-medium">{{ item.reporter.name }}</h6>
                  <span class="text-muted">{{ item.reporter.title }}</span>
                </div>
              </div>
            </template>

            <template #cell(priority_text)="{ item }">
              <span :class="['badge', `bg-${item.priority.color}`]">
                {{ item.priority.text }}
              </span>
            </template>
          </TableView>
        </div>
      </div>
    </div>
  </div>
</template>
