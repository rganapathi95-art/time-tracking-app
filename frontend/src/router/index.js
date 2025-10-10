import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    // Admin routes
    {
      path: '/admin',
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: 'employees',
          name: 'Employees',
          component: () => import('../views/admin/EmployeesView.vue')
        },
        {
          path: 'projects',
          name: 'Projects',
          component: () => import('../views/admin/ProjectsView.vue')
        },
        {
          path: 'cost-centers',
          name: 'CostCenters',
          component: () => import('../views/admin/CostCentersView.vue')
        },
        {
          path: 'analytics',
          name: 'Analytics',
          component: () => import('../views/admin/AnalyticsView.vue')
        },
        {
          path: 'timesheets',
          name: 'AdminTimesheets',
          component: () => import('../views/admin/TimesheetsView.vue')
        }
      ]
    },
    // Employee routes
    {
      path: '/employee',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'timesheets',
          name: 'EmployeeTimesheets',
          component: () => import('../views/employee/TimesheetsView.vue')
        },
        {
          path: 'projects',
          name: 'EmployeeProjects',
          component: () => import('../views/employee/ProjectsView.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
