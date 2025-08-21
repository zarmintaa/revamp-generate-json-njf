<script setup>
import { ref, computed, watch } from 'vue'

// Debounce utility function
function debounce(func, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

const debouncedSearchQuery = ref('')

const activeTab = ref('all')
const searchQuery = ref('')
const selectedPriority = ref('all')

const assignedTasks = ref([
  {
    id: 1,
    taskName: 'Design Database Schema',
    description: 'Create comprehensive database schema for the finance module.',
    assignedTo: 'Sarah Wilson',
    assignedBy: 'John Doe',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2025-07-15',
    createdAt: '2025-07-08',
    projectId: 1,
    estimatedHours: 16,
    completedHours: 8,
    tags: ['database', 'backend', 'design'],
    avatar: 'SW',
    comments: [
      {
        id: 1,
        author: 'John Doe',
        content: 'Focus on user auth tables first.',
        createdAt: '2025-07-09',
        type: 'feedback',
      },
    ],
  },
])

const filteredTasks = computed(() => {
  let filtered = assignedTasks.value

  // Filter by active tab
  if (activeTab.value !== 'all') {
    if (activeTab.value === 'done') {
      filtered = filtered.filter((task) => task.status === 'completed')
    } else {
      filtered = filtered.filter((task) => task.status === activeTab.value)
    }
  }

  // Filter by search query
  if (debouncedSearchQuery.value) {
    filtered = filtered.filter(
      (task) =>
        task.taskName.toLowerCase().includes(debouncedSearchQuery.value.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(debouncedSearchQuery.value.toLowerCase()) ||
        task.tags.some((tag) =>
          tag.toLowerCase().includes(debouncedSearchQuery.value.toLowerCase()),
        ),
    )
  }

  // Filter by priority
  if (selectedPriority.value !== 'all') {
    filtered = filtered.filter((task) => task.priority === selectedPriority.value)
  }

  return filtered
})

const taskCounts = computed(() => ({
  all: assignedTasks.value.length,
  todo: assignedTasks.value.filter((t) => t.status === 'todo').length,
  'in-progress': assignedTasks.value.filter((t) => t.status === 'in-progress').length,
  review: assignedTasks.value.filter((t) => t.status === 'review').length,
  done: assignedTasks.value.filter((t) => t.status === 'completed').length,
}))

const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'high':
      return 'bg-danger-subtle text-danger border border-danger-subtle'
    case 'medium':
      return 'bg-warning-subtle text-warning border border-warning-subtle'
    case 'low':
      return 'bg-success-subtle text-success border border-success-subtle'
    default:
      return 'bg-secondary-subtle text-muted border border-secondary-subtle'
  }
}

const getTaskStatusBadgeClass = (status) => {
  switch (status) {
    case 'todo':
      return 'bg-secondary-subtle text-secondary border border-secondary-subtle'
    case 'in-progress':
      return 'bg-info-subtle text-info border border-info-subtle'
    case 'review':
      return 'bg-warning-subtle text-warning border border-warning-subtle'
    case 'completed':
      return 'bg-success-subtle text-success border border-success-subtle'
    default:
      return 'bg-secondary-subtle text-muted border border-secondary-subtle'
  }
}

const getTaskStatusIcon = (status) => {
  switch (status) {
    case 'todo':
      return 'ti-circle'
    case 'in-progress':
      return 'ti-loader'
    case 'review':
      return 'ti-eye'
    case 'completed':
      return 'ti-circle-check'
    default:
      return 'ti-circle'
  }
}

const getProgressBarClass = (progress) => {
  // if (progress >= 80) return "bg-success";
  // if (progress >= 60) return "bg-info";
  // if (progress >= 40) return "bg-warning";
  // return "bg-danger";
  return 'bg-primary'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0) return `${diffDays} days left`
  return `${Math.abs(diffDays)} days overdue`
}

const isOverdue = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  return date < today
}

const getProgressPercentage = (task) => {
  if (!task.completedHours) return 0
  return Math.round((task.completedHours / task.estimatedHours) * 100)
}

const getTabIcon = (tab) => {
  switch (tab) {
    case 'all':
      return 'ti-list'
    case 'todo':
      return 'ti-circle'
    case 'in-progress':
      return 'ti-loader'
    case 'review':
      return 'ti-eye'
    case 'done':
      return 'ti-circle-check'
    default:
      return 'ti-circle'
  }
}

const getTabColor = (tab) => {
  switch (tab) {
    case 'all':
      return 'primary'
    case 'todo':
      return 'secondary'
    case 'in-progress':
      return 'info'
    case 'review':
      return 'warning'
    case 'done':
      return 'success'
    default:
      return 'secondary'
  }
}

/* PAGINATION */
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Computed untuk menghitung total halaman
const totalPages = computed(() => {
  return Math.ceil(filteredTasks.value.length / itemsPerPage.value)
})

// Computed untuk menampilkan tugas sesuai halaman aktif
const paginatedTasks = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  return filteredTasks.value.slice(startIndex, endIndex)
})

// Fungsi untuk mengubah halaman
const setPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Watcher untuk reset halaman ke 1 jika filter berubah
watch([activeTab, searchQuery, selectedPriority], () => {
  currentPage.value = 1
})

const resetFilters = () => {
  activeTab.value = 'all'
  searchQuery.value = ''
  selectedPriority.value = 'all'
}

// watch for debounce
watch(
  searchQuery,
  debounce((newValue) => {
    debouncedSearchQuery.value = newValue
  }, 500),
)
</script>

<template>
  <div class="row g-4">
    <div class="col-lg-12 col-sm-12">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white border-bottom-0 pb-0">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <h4 class="card-title mb-1 fw-bold">Task Assignment</h4>
              <p class="card-subtitle text-muted mb-0">Manage and track team assignments</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary btn-sm" @click="resetFilters">
                <i class="ti ti-refresh me-1"></i>Reset Filters
              </button>
              <button class="btn btn-primary btn-sm">
                <i class="ti ti-plus me-1"></i>New Task
              </button>
            </div>
          </div>

          <div
            class="d-flex flex-wrap gap-3 align-items-center justify-content-between mt-3 py-3 border-top"
          >
            <div class="d-flex flex-wrap gap-3">
              <div class="search-box position-relative">
                <i
                  class="ti ti-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                ></i>
                <input
                  type="text"
                  class="form-control form-control-md ps-5"
                  placeholder="Search tasks..."
                  v-model="searchQuery"
                />
              </div>
              <select
                class="form-select form-select-md"
                v-model="selectedPriority"
                style="width: 150px"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div class="btn-group btn-group-sm filter-pills" role="group">
              <button
                v-for="tab in ['all', 'todo', 'in-progress', 'review', 'done']"
                :key="tab"
                type="button"
                class="btn"
                :class="{ active: activeTab === tab }"
                @click="activeTab = tab"
              >
                <i :class="['ti', getTabIcon(tab)]"></i>
                <span class="ms-1 d-none d-sm-inline">{{
                  tab === 'in-progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)
                }}</span>
                <span class="badge rounded-pill ms-1">
                  {{ taskCounts[tab] }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="card-body p-0">
          <div class="task-content">
            <!-- Results Summary -->
            <div class="px-4 py-3 bg-light border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                  <i class="ti ti-filter text-muted"></i>
                  <span class="text-muted">
                    Showing {{ filteredTasks.length }} of {{ assignedTasks.length }} tasks
                  </span>
                  <span v-if="activeTab !== 'all'" class="badge bg-primary-subtle text-primary">
                    {{
                      activeTab === 'in-progress'
                        ? 'In Progress'
                        : activeTab === 'done'
                          ? 'Done'
                          : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                    }}
                  </span>
                  <span v-if="debouncedSearchQuery" class="badge bg-info-subtle text-info">
                    Search: "{{ debouncedSearchQuery }}"
                  </span>
                  <span
                    v-if="selectedPriority !== 'all'"
                    class="badge bg-warning-subtle text-warning"
                  >
                    {{ selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1) }}
                    Priority
                  </span>
                </div>
                <div class="text-muted small">
                  <i class="ti ti-clock me-1"></i>
                  Last updated: {{ new Date().toLocaleDateString() }}
                </div>
              </div>
            </div>

            <!-- Task List -->
            <div class="task-list">
              <div v-if="filteredTasks.length === 0" class="text-center py-2">
                <div class="empty-state">
                  <i class="ti ti-clipboard-off display-1 text-muted mb-3"></i>
                  <h5 class="text-muted">No tasks found</h5>
                  <p class="text-muted">Try adjusting your filters or search criteria</p>
                </div>
              </div>

              <div
                v-for="(task, index) in paginatedTasks"
                :key="task.id"
                class="task-item p-3 border-bottom position-relative"
              >
                <div class="priority-indicator" :class="`priority-${task.priority}`"></div>

                <div class="d-flex align-items-start gap-3">
                  <div class="flex-shrink-0">
                    <div class="avatar-circle d-flex align-items-center justify-content-center">
                      {{ task.avatar }}
                    </div>
                  </div>

                  <div class="flex-grow-1 min-w-0">
                    <h6
                      class="mb-1 fw-semibold text-truncate"
                      :class="{
                        'text-decoration-line-through text-muted': task.status === 'completed',
                      }"
                    >
                      {{ task.taskName }}
                    </h6>
                    <p
                      class="text-muted fs-13 mb-2 task-description"
                      :class="{
                        'text-decoration-line-through': task.status === 'completed',
                      }"
                    >
                      {{ task.description }}
                    </p>

                    <div class="d-flex flex-wrap align-items-center gap-3 text-muted fs-12 mb-2">
                      <span class="d-flex align-items-center">
                        <i class="ti ti-user me-1"></i> {{ task.assignedTo }}
                      </span>
                      <span class="d-flex align-items-center">
                        <i class="ti ti-calendar me-1"></i>
                        <span
                          :class="{
                            'text-danger fw-bold':
                              isOverdue(task.dueDate) && task.status !== 'completed',
                          }"
                        >
                          {{ formatDate(task.dueDate) }}
                        </span>
                      </span>
                      <span class="d-flex align-items-center">
                        <i class="ti ti-clock me-1"></i>
                        {{ task.completedHours || 0 }}/{{ task.estimatedHours }}h
                      </span>
                      <span
                        v-if="task.comments && task.comments.length > 0"
                        class="d-flex align-items-center"
                      >
                        <i class="ti ti-message-circle me-1"></i>
                        {{ task.comments.length }}
                      </span>
                    </div>

                    <div
                      class="mb-2"
                      v-if="task.status !== 'todo' && getProgressPercentage(task) > 0"
                    >
                      <div class="progress" style="height: 5px">
                        <div
                          class="progress-bar progress-bar-striped"
                          :class="[
                            getProgressBarClass(getProgressPercentage(task)),
                            task.status === 'in-progress' ? 'progress-bar-animated' : '',
                          ]"
                          :style="{ width: getProgressPercentage(task) + '%' }"
                        ></div>
                      </div>
                    </div>

                    <div class="d-flex flex-wrap gap-1">
                      <span
                        v-for="tag in task.tags"
                        :key="tag"
                        class="badge bg-light text-secondary-emphasis fw-medium"
                      >
                        #{{ tag }}
                      </span>
                    </div>
                  </div>

                  <div
                    class="flex-shrink-0 d-flex flex-column align-items-end gap-3"
                    style="min-width: 120px"
                  >
                    <div class="d-flex align-items-center gap-2">
                      <span :class="['badge', 'fs-11', getPriorityBadgeClass(task.priority)]">
                        {{ task.priority }}
                      </span>
                      <span :class="['badge', 'fs-11', getTaskStatusBadgeClass(task.status)]">
                        <i :class="['ti', getTaskStatusIcon(task.status), 'me-1']"></i>
                        {{ task.status.replace('-', ' ') }}
                      </span>
                    </div>
                    <div class="d-flex gap-2 flex-wrap justify-content-end">
                      <button class="btn btn-xs btn-outline-primary">
                        <i class="ti ti-eye"></i>
                      </button>
                      <button
                        class="btn btn-xs btn-outline-warning"
                        v-if="task.status !== 'completed'"
                      >
                        <i class="ti ti-edit"></i>
                      </button>
                      <button
                        class="btn btn-xs btn-outline-success"
                        v-if="task.status !== 'completed'"
                      >
                        <i class="ti ti-check"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center"
        >
          <span class="text-muted small"> Showing page {{ currentPage }} of {{ totalPages }} </span>

          <nav aria-label="Task pagination" v-if="totalPages > 1">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="setPage(currentPage - 1)">
                  <span>&laquo;</span>
                </a>
              </li>

              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <a class="page-link" href="#" @click.prevent="setPage(page)">{{ page }}</a>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="setPage(currentPage + 1)">
                  <span>&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-content {
  max-height: 700px;
  overflow-y: auto;
}

.task-item {
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
}

.task-item:hover {
  background-color: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-item.task-overdue {
  background: linear-gradient(90deg, rgba(220, 53, 69, 0.05) 0%, transparent 100%);
}

.task-item.task-completed {
  background: linear-gradient(90deg, rgba(25, 135, 84, 0.05) 0%, transparent 100%);
}

.priority-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}
.priority-indicator.priority-high {
  background-color: var(--bs-danger);
}
.priority-indicator.priority-medium {
  background-color: var(--bs-warning);
}
.priority-indicator.priority-low {
  background-color: var(--bs-success);
}

.avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: var(--bs-primary-bg-subtle);
  color: var(--bs-primary);
  font-weight: 600;
  font-size: 0.8rem;
}

.task-description {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.btn-xs {
  --bs-btn-padding-y: 0.1rem;
  --bs-btn-padding-x: 0.4rem;
  --bs-btn-font-size: 0.75rem;
  --bs-btn-border-radius: 0.25rem;
}

.search-box input {
  border-radius: 25px;
  border: 1px solid #e0e0e0;
  background: white;
  transition: all 0.3s ease;
}

.search-box input:focus {
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
  border-color: #0d6efd;
}

.filter-pills .btn {
  background-color: transparent;
  color: var(--bs-secondary-color);
  border: none;
  border-radius: 20px !important;
  padding: 0.3rem 0.8rem;
  transition: all 0.2s ease-in-out;
}

.filter-pills .btn .badge {
  background-color: #e9ecef;
  color: #6c757d;
  transition: all 0.2s ease-in-out;
}

.filter-pills .btn.active {
  background-color: var(--bs-primary-bg-subtle);
  color: var(--bs-primary);
  font-weight: 600;
}

.filter-pills .btn.active .badge {
  background-color: var(--bs-primary);
  color: white;
}

.search-box input {
  border-radius: 20px;
  background: var(--bs-light);
  border: 1px solid var(--bs-border-color);
}
.search-box input:focus {
  background-color: white;
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 3px rgba(var(--bs-primary-rgb), 0.15);
}

.form-select.form-select-sm {
  border-radius: 20px;
}

.btn-group .btn {
  border-radius: 0;
  border-right: 1px solid #dee2e6;
}

.btn-group .btn:first-child {
  border-radius: 6px 0 0 6px;
}

.btn-group .btn:last-child {
  border-radius: 0 6px 6px 0;
  border-right: none;
}

.badge {
  font-weight: 500;
  letter-spacing: 0.02em;
}

.progress {
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 10px;
  transition: width 0.6s ease;
}

.btn-sm {
  transition: all 0.2s ease;
  border-radius: 6px;
}

.btn-sm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.empty-state {
  padding: 2rem;
}

.fs-11 {
  font-size: 0.75rem;
}

.fs-12 {
  font-size: 0.8rem;
}

.fs-13 {
  font-size: 0.85rem;
}

.min-w-0 {
  min-width: 0;
}

.task-content::-webkit-scrollbar {
  width: 6px;
}

.task-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.task-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.task-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@keyframes progress-bar-stripes {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}

.progress-bar-animated {
  animation: progress-bar-stripes 1s linear infinite;
}

@media (max-width: 768px) {
  .filter-section .row {
    flex-direction: column;
  }

  .btn-group {
    flex-wrap: wrap;
  }

  .btn-group .btn {
    flex: 1;
    min-width: 0;
  }

  .task-item .d-flex.gap-2 {
    flex-wrap: wrap;
  }

  .task-item .btn-sm {
    flex: 1;
    min-width: 0;
  }
}

.pagination {
  --bs-pagination-focus-box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  --bs-pagination-active-bg: #0d6efd;
  --bs-pagination-active-border-color: #0d6efd;
  --bs-pagination-active-color: #fff;
}

.page-link {
  border-radius: 0.3rem;
  margin: 0 2px;
  border: none;
  font-weight: 600;
  color: #495057;
  background-color: transparent;
  transition: all 0.2s ease-in-out;
}

.page-link:hover {
  background-color: #e9ecef;
  color: #0d6efd;
}

.page-item.active .page-link {
  font-weight: 700;
  box-shadow: 0 5px 10px rgba(13, 110, 253, 0.3);
  transform: translateY(-2px);
}

.page-item.disabled .page-link {
  background-color: transparent;
  color: #ced4da;
}
</style>
