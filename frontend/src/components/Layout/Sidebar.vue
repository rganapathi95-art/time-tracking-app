<template>
  <div>
    <!-- Mobile overlay -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'w-64'
      ]"
    >
      <!-- Logo Section -->
      <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <router-link to="/dashboard" class="flex items-center">
          <img v-if="companyLogo" :src="companyLogo" alt="Company Logo" class="h-10 max-w-[150px] object-contain" />
          <template v-else>
            <Clock class="h-8 w-8 text-primary-500" />
            <span class="ml-2 text-xl font-bold text-gray-900">TimeSheet</span>
          </template>
        </router-link>
        <button 
          @click="closeSidebar"
          class="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <!-- Admin Menu -->
        <div v-if="authStore.user?.role === 'admin'">
          <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Admin
          </p>
          <router-link
            v-for="item in adminMenuItems"
            :key="item.name"
            :to="item.path"
            :class="[
              'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              isActive(item.path)
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            <component :is="item.icon" class="h-5 w-5 mr-3" />
            {{ item.name }}
          </router-link>
        </div>

        <!-- Employee Menu -->
        <div v-if="authStore.user?.role === 'employee'" class="mt-6">
          <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Employee
          </p>
          <router-link
            v-for="item in employeeMenuItems"
            :key="item.name"
            :to="item.path"
            :class="[
              'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              isActive(item.path)
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            <component :is="item.icon" class="h-5 w-5 mr-3" />
            {{ item.name }}
          </router-link>
        </div>

        <!-- User Section -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <router-link
            to="/profile"
            :class="[
              'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              isActive('/profile')
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            <User class="h-5 w-5 mr-3" />
            Profile
          </router-link>
          <button
            @click="handleLogout"
            class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mt-1"
          >
            <LogOut class="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </nav>

      <!-- User Info at Bottom -->
      <div class="border-t border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-medium text-sm">
              {{ authStore.user?.firstName?.[0] }}{{ authStore.user?.lastName?.[0] }}
            </span>
          </div>
          <div class="ml-3 overflow-hidden">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ authStore.user?.email }}
            </p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import {
  Clock,
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  ClipboardList,
  BarChart3,
  FileText,
  Settings,
  User,
  LogOut,
  X
} from 'lucide-vue-next'
import settingsService from '../../services/settingsService'

const props = defineProps({
  isSidebarOpen: Boolean
})

const emit = defineEmits(['closeSidebar'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const companyLogo = ref(null)

onMounted(() => {
  // Load branding from API first
  settingsService.getPublic().then((data) => {
    if (data?.logo) companyLogo.value = data.logo
  }).catch(() => {
    // ignore
  })

  // Fallback to localStorage
  const savedLogo = localStorage.getItem('companyLogo')
  if (!companyLogo.value && savedLogo) {
    companyLogo.value = savedLogo
  }

  // Listen for logo changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'companyLogo') {
      companyLogo.value = e.newValue
    }
  })
})

const adminMenuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/employees', icon: Users },
  { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { name: 'Cost Centers', path: '/admin/cost-centers', icon: Building2 },
  { name: 'Timesheets', path: '/admin/timesheets', icon: ClipboardList },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Reports', path: '/admin/reports', icon: FileText },
  { name: 'Settings', path: '/admin/settings', icon: Settings }
]

const employeeMenuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Timesheets', path: '/employee/timesheets', icon: ClipboardList },
  { name: 'My Projects', path: '/employee/projects', icon: FolderKanban }
]

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const closeSidebar = () => {
  emit('closeSidebar')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
