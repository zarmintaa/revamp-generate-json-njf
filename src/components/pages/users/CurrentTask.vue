<script setup lang="ts">
import { computed, ref } from 'vue'

// Reactive Data (Dummy data remains the same)
const myTasks = ref([
  {
    id: 1,
    taskName: 'Design Database Schema',
    assignedTo: 'Sarah Wilson',
    assignedBy: 'John Doe',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2025-07-15',
    createdAt: '2025-07-08',
    projectId: 1,
    estimatedHours: 16,
    tags: ['database'],
    avatar: 'SW',
  },
  {
    id: 2,
    taskName: 'Implement Payment Gateway',

    assignedTo: 'Mike Chen',
    assignedBy: 'Jane Smith',
    priority: 'high',
    status: 'todo',
    dueDate: '2025-07-20',
    createdAt: '2025-07-09',
    projectId: 2,
    estimatedHours: 24,
    tags: ['payment'],
    avatar: 'MC',
  },
  {
    id: 3,
    taskName: 'Mobile App UI Testing',

    assignedTo: 'Lisa Park',
    assignedBy: 'Mike Johnson',
    priority: 'medium',
    status: 'review',
    dueDate: '2025-07-12',
    createdAt: '2025-07-05',
    projectId: 3,
    estimatedHours: 12,
    tags: ['testing'],
    avatar: 'LP',
  },
  {
    id: 4,
    taskName: 'Security Audit',
    assignedTo: 'David Kim',
    assignedBy: 'Jane Smith',
    priority: 'high',
    status: 'todo',
    dueDate: '2025-07-18',
    createdAt: '2025-07-10',
    projectId: 2,
    estimatedHours: 20,
    tags: ['security'],
    avatar: 'DK',
  },
  {
    id: 5,
    taskName: 'Frontend Component Library',
    assignedTo: 'Emily Johnson',
    assignedBy: 'Mike Johnson',
    priority: 'medium',
    status: 'in-progress',
    dueDate: '2025-07-25',
    createdAt: '2025-07-11',
    projectId: 3,
    estimatedHours: 32,
    tags: ['frontend'],
    avatar: 'EJ',
  },
  {
    id: 6,
    taskName: 'Database Migration',
    assignedBy: 'John Doe',
    assignedTo: 'Robert Brown',
    priority: 'high',
    status: 'todo',
    dueDate: '2025-07-14',
    createdAt: '2025-07-12',
    projectId: 1,
    estimatedHours: 20,
    tags: ['database'],
    avatar: 'RB',
  },
  {
    id: 7,
    taskName: 'Database Migration',
    assignedBy: 'John Doe',
    assignedTo: 'Robert Brown',
    priority: 'high',
    status: 'todo',
    dueDate: '2025-07-14',
    createdAt: '2025-07-12',
    projectId: 1,
    estimatedHours: 20,
    tags: ['database'],
    avatar: 'RB',
  },
])

const projectActive = ref<Project[]>([
  {
    id: 1,
    projectName: 'Join Finance',
    projectLead: 'John Doe',
    stats: 12,
    icon: 'ti-wallet',
    status: 'active',
    progress: 75,
    teamSize: 5,
  },
  {
    id: 2,
    projectName: 'E-Commerce Platform',
    projectLead: 'Jane Smith',
    stats: 13,
    icon: 'ti-shopping-cart',
    status: 'active',
    progress: 60,
    teamSize: 8,
  },
  {
    id: 3,
    projectName: 'Mobile App Development',
    projectLead: 'Mike Johnson',
    stats: 15,
    icon: 'ti-device-mobile',
    status: 'pending',
    progress: 30,
    teamSize: 4,
  },
  {
    id: 4,
    projectName: 'Cloud Infrastructure',
    projectLead: 'Sarah Wilson',
    stats: 8,
    icon: 'ti-cloud',
    status: 'active',
    progress: 45,
    teamSize: 6,
  },
  {
    id: 5,
    projectName: 'Analytics Dashboard',
    projectLead: 'Alex Rodriguez',
    stats: 20,
    icon: 'ti-chart-line',
    status: 'completed',
    progress: 100,
    teamSize: 3,
  },
  {
    id: 6,
    projectName: 'Another Project',
    projectLead: 'Alex Rodriguez',
    stats: 20,
    icon: 'ti-briefcase',
    status: 'completed',
    progress: 100,
    teamSize: 5,
  },
])

// Computed Properties
const highPriorityTasks = computed(() =>
  myTasks.value.filter((task) => task.priority === 'high' && task.status !== 'completed'),
)

const today = new Date()
today.setHours(0, 0, 0, 0) // Set to start of today

const todayTasks = computed(() =>
  myTasks.value.filter((task) => {
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0) // Normalize due date
    return dueDate.getTime() === today.getTime() && task.status !== 'completed'
  }),
)

const inProgressTasks = computed(() =>
  myTasks.value.filter((task) => task.status === 'in-progress'),
)

const recentTasks = computed(() =>
  myTasks.value
    .filter((task) => task.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5),
)

const recentProject = computed(() => projectActive.value.slice(0, 5))

console.log({ recentProject })

// Helper Functions
const getTaskStatusIcon = (status: string) => {
  const icons: { [key: string]: string } = {
    todo: 'ti-circle',
    'in-progress': 'ti-loader',
    review: 'ti-eye',
    completed: 'ti-circle-check',
  }
  return icons[status] || 'ti-circle'
}

// IMPROVEMENT #5: Combined class generator for better icon visibility
const getTaskStatusClasses = (status: string) => {
  const classes: { [key: string]: string } = {
    todo: 'bg-secondary-subtle text-secondary',
    'in-progress': 'bg-info-subtle text-info',
    review: 'bg-warning-subtle text-warning',
    completed: 'bg-success-subtle text-success',
  }
  return classes[status] || 'bg-light text-muted'
}

const getPriorityDotClass = (priority: string) => {
  const classes: { [key: string]: string } = {
    high: 'bg-danger',
    medium: 'bg-warning',
    low: 'bg-success',
  }
  return classes[priority] || 'bg-secondary'
}

const getProjectIconClass = (status: string) => {
  const classes: { [key: string]: string } = {
    active: 'bg-primary',
    completed: 'bg-success',
    pending: 'bg-warning',
  }
  return classes[status] || 'bg-secondary'
}

const getStatusBadgeClass = (status: string) => {
  const classes: { [key: string]: string } = {
    active: 'bg-success-subtle text-success',
    completed: 'bg-primary-subtle text-primary',
    pending: 'bg-warning-subtle text-warning',
  }
  return classes[status] || 'bg-secondary-subtle text-muted'
}

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Compare dates only
  date.setHours(0, 0, 0, 0)

  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`
  return `${diffDays}d left`
}

const isOverdue = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return date < now
}

const getStatusLabel = (status: string) =>
  status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())

// Navigation Functions (unchanged)
const navigateToAssignTask = () => console.log('Navigate to assign task page')
const navigateToTasks = () => console.log('Navigate to tasks page')
const navigateToProjects = () => console.log('Navigate to projects page')
const navigateToTaskDetail = (taskId: number) => console.log(`Maps to task detail: ${taskId}`)
const navigateToProjectDetail = (projectId: number) =>
  console.log(`Maps to project detail: ${projectId}`)
</script>

<template>
  <div class="row g-4 d-flex align-items-stretch mb-4">
    <div class="col-lg-6 col-12">
      <div class="card border-0 shadow-sm h-100 d-flex flex-column">
        <div class="card-header bg-white border-bottom">
          <div class="d-md-flex align-items-center">
            <div>
              <h4 class="card-title mb-1 fw-semibold">Activities</h4>
              <p class="card-subtitle text-muted mb-0">Recent tasks assigned to you</p>
            </div>
            <div class="ms-auto mt-3 mt-md-0 d-flex gap-2">
              <button class="btn btn-outline-primary btn-sm" @click="navigateToTasks">
                <i class="ti ti-eye me-1"></i>
                View All
              </button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 d-flex flex-column">
          <div class="task-list flex-grow-1">
            <div
              v-if="recentTasks.length > 0"
              class="list-item"
              v-for="task in recentTasks"
              :key="task.id"
              role="button"
              tabindex="0"
              @click="navigateToTaskDetail(task.id)"
            >
              <div class="item-content d-flex align-items-center">
                <div class="flex-shrink-0 me-3">
                  <div
                    class="icon-container d-flex align-items-center justify-content-center"
                    :class="getTaskStatusClasses(task.status)"
                    :title="getStatusLabel(task.status)"
                  >
                    <i :class="['ti', getTaskStatusIcon(task.status)]"></i>
                  </div>
                </div>

                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex align-items-center justify-content-between">
                    <h6 class="mb-0 fw-semibold text-truncate me-3">
                      {{ task.taskName }}
                    </h6>
                    <div class="d-flex align-items-center gap-2 flex-shrink-0">
                      <span
                        class="priority-dot"
                        :class="getPriorityDotClass(task.priority)"
                        :title="`${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority`"
                      ></span>
                      <span
                        class="text-muted fs-12 fw-medium"
                        :class="{ 'text-danger': isOverdue(task.dueDate) }"
                      >
                        {{ formatDateShort(task.dueDate) }}
                      </span>
                    </div>
                  </div>
                  <div class="d-flex align-items-center justify-content-between mt-1">
                    <p class="text-muted fs-12 mb-0">By {{ task.assignedBy }}</p>
                    <span class="badge bg-light text-muted fs-11">
                      {{ getStatusLabel(task.status) }}
                    </span>
                  </div>
                </div>
                <div class="ms-2 text-muted hover-arrow">
                  <i class="ti ti-chevron-right"></i>
                </div>
              </div>
            </div>

            <div v-if="recentTasks.length === 0" class="empty-state">
              <i class="ti ti-clipboard-check empty-state-icon"></i>
              <h6 class="fw-semibold mt-3">All clear!</h6>
              <p class="text-muted fs-13">You have no pending tasks.</p>
            </div>
          </div>

          <div class="card-footer bg-light border-top-0 mt-auto">
            <div class="d-flex align-items-center justify-content-between">
              <span class="text-muted fs-13">
                Showing {{ recentTasks.length }} of {{ myTasks.length }} tasks
              </span>
              <button class="btn btn-sm btn-outline-primary" @click="navigateToTasks">
                Manage Tasks
                <i class="ti ti-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-lg-6 col-12">
      <div class="card border-0 shadow-sm h-100 d-flex flex-column">
        <div class="card-header bg-white border-bottom">
          <div class="d-md-flex align-items-center">
            <div>
              <h4 class="card-title mb-1 fw-semibold">Projects</h4>
              <p class="card-subtitle text-muted mb-0">Active projects overview</p>
            </div>
            <div class="ms-auto mt-3 mt-md-0">
              <button class="btn btn-outline-primary btn-sm" @click="navigateToProjects">
                <i class="ti ti-eye me-1"></i>
                View All
              </button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 d-flex flex-column">
          <div class="project-list flex-grow-1">
            <div
              v-if="recentProject.length > 0"
              class="list-item"
              v-for="project in recentProject"
              :key="project.id"
              role="button"
              tabindex="0"
              @click="navigateToProjectDetail(project.id)"
            >
              <div class="item-content d-flex align-items-center">
                <div class="flex-shrink-0 me-3">
                  <span
                    class="icon-container d-flex align-items-center justify-content-center"
                    :class="getProjectIconClass(project.status)"
                  >
                    <i :class="['ti', project.icon]"></i>
                  </span>
                </div>

                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <h6 class="mb-0 fw-semibold text-truncate">
                      {{ project.projectName }}
                    </h6>
                    <span class="badge bg-light-success text-success fs-11 fw-medium"
                      >{{ project.progress }}%</span
                    >
                  </div>
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-muted fs-12"
                      ><i class="ti ti-users me-1"></i>{{ project.teamSize }} members</span
                    >
                    <span class="status-badge" :class="getStatusBadgeClass(project.status)">
                      {{ getStatusLabel(project.status) }}
                    </span>
                  </div>
                </div>
                <div class="ms-2 text-muted hover-arrow">
                  <i class="ti ti-chevron-right"></i>
                </div>
              </div>
            </div>
            <div v-if="projectActive.length === 0" class="empty-state">
              <i class="ti ti-folder-off empty-state-icon"></i>
              <h6 class="fw-semibold mt-3">No Active Projects</h6>
              <p class="text-muted fs-13">Your active projects will appear here.</p>
            </div>
          </div>

          <div class="card-footer bg-light border-top-0 mt-auto">
            <div class="d-flex align-items-center justify-content-between">
              <span class="text-muted fs-13"
                >Showing {{ projectActive.length }} of {{ recentProject.length }} active
                projects</span
              >
              <button class="btn btn-sm btn-outline-primary" @click="navigateToProjects">
                Manage Projects
                <i class="ti ti-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* GENERAL CARD STYLES */
.card {
  transition: box-shadow 0.3s ease;
}

.card-footer {
  padding: 0.75rem 1.25rem;
}

/* IMPROVEMENT #1: TASK STATS STYLES */
.task-stats-container {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #fcfcfd;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.375rem;
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-left-width: 4px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

/* LIST CONTAINER STYLES */
.task-list,
.project-list {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 450px;
}

/* UNIFIED LIST ITEM STYLES - SAME HEIGHT FOR BOTH */
.list-item {
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
  border-bottom: 1px solid #e9ecef;
  /* Fixed height for consistent layout */
  min-height: 78px;
}

.item-content {
  padding: 0.85rem 1.25rem;
  transition: all 0.2s ease;
  /* Ensure content takes full height */
  min-height: 78px;
  display: flex;
  align-items: center;
}

.task-list > .list-item:last-child,
.project-list > .list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background-color: #f8f9fa;
}

.list-item:hover .item-content {
  transform: translateX(4px);
}

.hover-arrow {
  transition: all 0.2s ease;
  opacity: 0;
}

.list-item:hover .hover-arrow {
  transform: translateX(5px);
  opacity: 1;
  color: var(--bs-primary);
}

/* UNIFIED ICON STYLES - SAME SIZE FOR BOTH */
.icon-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  /* For project icons */
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Override for task status icons to match project icon styling */
.task-list .icon-container {
  color: inherit; /* Use the color from status classes */
}

.priority-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.status-badge {
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

/* EMPTY STATE */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  height: 100%;
}
.empty-state-icon {
  font-size: 3rem;
  color: #adb5bd;
}

/* UTILITIES */
.min-w-0 {
  min-width: 0;
}
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fs-11 {
  font-size: 0.75rem !important;
}
.fs-12 {
  font-size: 0.8rem !important;
}
.fs-13 {
  font-size: 0.85rem !important;
}

/* Custom Colors */
.bg-light-success {
  background-color: rgba(25, 135, 84, 0.1);
}
.text-success {
  color: #198754 !important;
}

/* Scrollbar styling */
.task-list::-webkit-scrollbar,
.project-list::-webkit-scrollbar {
  width: 5px;
}
.task-list::-webkit-scrollbar-track,
.project-list::-webkit-scrollbar-track {
  background: transparent;
}
.task-list::-webkit-scrollbar-thumb,
.project-list::-webkit-scrollbar-thumb {
  background: #d6d8db;
  border-radius: 10px;
}
.task-list::-webkit-scrollbar-thumb:hover,
.project-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Accessibility */
.list-item:focus-visible {
  outline: 2px solid var(--bs-primary);
  outline-offset: -2px;
  background-color: #f8f9fa;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
}
</style>
