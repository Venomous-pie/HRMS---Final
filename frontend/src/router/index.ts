import { createRouter, createWebHistory } from 'vue-router'
import ReceptionistPage from '../page/Receptionist.vue'
import Frontdesk from '../receptionist/pages/Frontdesk.vue'
import Reservations from '../receptionist/pages/Reservations.vue'
import Guests from '../receptionist/pages/Guests.vue'
import Housekeeping from '../receptionist/pages/Housekeeping.vue'
import Tasks from '../receptionist/pages/Tasks.vue'
import Accounting from '../receptionist/pages/Accounting.vue'
import Cashbooks from '../receptionist/pages/Cashbooks.vue'
import Reports from '../receptionist/pages/Reports.vue'
import Orders from '../receptionist/pages/Orders.vue'
import Services from '../receptionist/pages/Services.vue'
import Settings from '../receptionist/pages/Settings.vue'
import Admin from '../admin/Admin.vue'
import AdminDashboard from '../admin/AdminDashboard.vue'
import UserManagement from '../admin/UserManagement.vue'
import StaffLogin from '../auth/StaffLogin.vue'
import RoomsManagement from '../admin/RoomsManagement.vue'
import AdminReports from '../admin/Reports.vue'
import AdminSettings from '../admin/AdminSettings.vue'
import SystemLogs from '../admin/SystemLogs.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Default route - redirect to login when not authenticated
    {
      path: '/welcome',
      redirect: '/login'
    },
    {
      path: '/',
      component: ReceptionistPage,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/frontdesk' },
        { path: 'frontdesk', component: Frontdesk, meta: { requiresAuth: true } },
        { path: 'reservations', component: Reservations, meta: { requiresAuth: true } },
        { path: 'guests', component: Guests, meta: { requiresAuth: true } },
        { path: 'housekeeping', component: Housekeeping, meta: { requiresAuth: true } },
        { path: 'tasks', component: Tasks, meta: { requiresAuth: true } },
        { path: 'accounting', component: Accounting, meta: { requiresAuth: true } },
        { path: 'cashbooks', component: Cashbooks, meta: { requiresAuth: true } },
        { path: 'reports', component: Reports, meta: { requiresAuth: true } },
        { path: 'orders', component: Orders, meta: { requiresAuth: true } },
        { path: 'services', component: Services, meta: { requiresAuth: true } },
        { path: 'settings', component: Settings, meta: { requiresAuth: true } },
      ],
    },
    {
      path: '/login',
      component: StaffLogin,
      meta: { requiresGuest: true }
    },
    {
      path: '/admin',
      component: Admin,
      meta: { requiresGuest: true }
    },
    {
      path: '/admin/dashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/users',
      component: UserManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/rooms',
      component: RoomsManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/reports',
      component: AdminReports,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/settings',
      component: AdminSettings,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/logs',
      component: SystemLogs,
      meta: { requiresAuth: true }
    },
    {
      path: '/logout',
      redirect: (to) => {
        // Clear authentication data - no cap fr fr 🔥
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        return '/login'
      }
    },
  ],
})

// Route guard for authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const userData = localStorage.getItem('user_data')
  let user = null
  
  if (userData) {
    try {
      user = JSON.parse(userData)
    } catch (e) {
      localStorage.removeItem('user_data')
    }
  }
  
  const isAuthenticated = !!(token && user)
  const isAdmin = user?.role === 'admin' || user?.role === 'manager'

  // Protect routes that require authentication
  if (to.meta.requiresAuth || to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // Redirect to appropriate login page
      if (to.path.startsWith('/admin')) {
        next('/admin')
      } else {
        next('/login')
      }
      return
    }
    
    // Admin routes require admin role
    if (to.path.startsWith('/admin') && !isAdmin) {
      next('/frontdesk')
      return
    }
  }

  // Redirect authenticated users away from login pages
  if (to.meta.requiresGuest) {
    if (isAuthenticated) {
      if (isAdmin) {
        next('/admin/dashboard')
      } else if (user?.role === 'receptionist') {
        next('/frontdesk')
      } else if (user?.role === 'housekeeping') {
        next('/housekeeping')
      } else if (user?.role === 'accounting') {
        next('/accounting')
      } else {
        next('/frontdesk')
      }
      return
    }
  }

  next()
})

export default router
