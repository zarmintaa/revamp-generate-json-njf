import { createRouter, createWebHistory } from 'vue-router'
import { useLoading } from '@/composables/useLoading'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/generate-master',
      component: () => import('@/layouts/BaseLayout.vue'),
      children: [
        {
          path: 'generate-master',
          name: 'generate-master',
          component: () => import('@/views/generate/GenerateMaster.vue'),
        },
        {
          path: 'generate-schd',
          name: 'generate-schd',
          component: () => import('@/views/generate/GenerateSchd.vue'),
        },
        {
          path: 'generate-trx-fast',
          name: 'generate-trx-fast',
          component: () => import('@/views/generate/GenerateTrxFast.vue'),
        },
          {
              path: 'generate-rc-schd',
              name: 'generate-rc-schd',
              component: () => import('@/views/generate/GenerateRcSchd.vue'),
          },
        {
          path: 'create-schedule',
          name: 'create-schedule',
          component: () => import('@/views/data/generateSchedule.vue'),
        },
        {
          path: 'create-master-ppd',
          name: 'create-master-ppd',
          component: () => import('@/views/data/generateDataMaster.vue'),
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { title: 'Dashboard' },
        },
        {
          path: 'dashboard-user',
          name: 'dashboard-user',
          component: () => import('@/views/DashboardUser.vue'),
          meta: { title: 'Dashboard User' },
        },
        {
          path: 'assigned-task',
          name: 'assigned-task',
          component: () => import('@/views/AssignedTask.vue'),
          meta: { title: 'Assigned Task' },
        },
        {
          path: 'projects',
          name: 'projects',
          component: () => import('@/views/Projects.vue'),
          meta: { title: 'Projects' },
        },
        {
          path: 'project/type',
          name: 'project-type',
          component: () => import('@/views/project/type/index.vue'),
          meta: { title: 'Project Type' },
        },
        {
          path: 'project/status',
          name: 'project-status',
          component: () => import('@/views/project/status/index.vue'),
          meta: { title: 'Project Status' },
        },
        {
          path: 'project/phase',
          name: 'project-phase',
          component: () => import('@/views/project/phase/index.vue'),
          meta: { title: 'Project Phase' },
        },
        {
          path: 'issue',
          name: 'issue',
          component: () => import('@/views/Issue.vue'),
          meta: { title: 'Issue' },
        },
        {
          path: 'sprint',
          name: 'sprint',
          component: () => import('@/views/Sprint.vue'),
          meta: { title: 'Teams' },
        },
        {
          path: 'ticket',
          name: 'ticket',
          component: () => import('@/views/ticket/index.vue'),
          meta: { title: 'Ticket' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/Profile.vue'),
          meta: { title: 'Profile' },
        },
        {
          path: 'team',
          name: 'team',
          component: () => import('@/views/team/index.vue'),
          meta: { title: 'Team' },
        },
        {
          path: 'member',
          name: 'member',
          component: () => import('@/views/member/index.vue'),
          meta: { title: 'Member' },
        },
        // NOT FOUND PAGE
        {
          path: '/:pathMatch(.*)*',
          name: 'not-found-fallback',
          component: () => import('@/views/NotFound.vue'),
          meta: { title: 'Page Not Found' },
        },
      ],
    },
  ],
})

// Setup loading indicator untuk route changes
router.beforeEach((to, from, next) => {
  // Hanya jalankan loading jika berpindah ke route yang berbeda
  if (to.path !== from.path) {
    const { start } = useLoading()
    start()
  }
  next()
})

router.afterEach((to, from) => {
  // Selesaikan loading setelah route berhasil dimuat
  if (to.path !== from.path) {
    const { finish } = useLoading()
    // Delay sedikit untuk memberikan waktu komponen untuk render
    setTimeout(() => {
      finish()
    }, 100)
  }
})

// Handle error pada route
router.onError((error) => {
  console.error('Router error:', error)
  const { finish } = useLoading()
  finish()
})

export default router
