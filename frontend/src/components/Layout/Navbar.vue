<template>
  <nav class="bg-white shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and Desktop Menu -->
        <div class="flex items-center">
          <router-link to="/dashboard" class="flex items-center flex-shrink-0">
            <img v-if="companyLogo" :src="companyLogo" alt="Company Logo" class="h-10 max-w-[150px] object-contain" />
            <template v-else>
              <Clock class="h-8 w-8 text-primary-600" />
              <span class="ml-2 text-xl font-bold text-gray-900 hidden sm:block">TimeTrack</span>
            </template>
          </router-link>
          
          <!-- Desktop Navigation -->
          <div class="hidden lg:ml-10 lg:flex lg:space-x-4">
            <router-link
              to="/dashboard"
              class="nav-link"
              active-class="nav-link-active"
            >
              Dashboard
            </router-link>
            
            <template v-if="authStore.isAdmin">
              <router-link
                to="/admin/employees"
                class="nav-link"
                active-class="nav-link-active"
              >
                Users
              </router-link>
              <router-link
                to="/admin/projects"
                class="nav-link"
                active-class="nav-link-active"
              >
                Projects
              </router-link>
              <router-link
                to="/admin/cost-centers"
                class="nav-link"
                active-class="nav-link-active"
              >
                Cost Centers
              </router-link>
              <router-link
                to="/admin/timesheets"
                class="nav-link"
                active-class="nav-link-active"
              >
                Timesheets
              </router-link>
              <router-link
                to="/admin/analytics"
                class="nav-link"
                active-class="nav-link-active"
              >
                Analytics
              </router-link>
              <router-link
                to="/admin/reports"
                class="nav-link"
                active-class="nav-link-active"
              >
                Reports
              </router-link>
              <router-link
                to="/admin/settings"
                class="nav-link"
                active-class="nav-link-active"
              >
                Settings
              </router-link>
            </template>
            
            <template v-else>
              <router-link
                to="/employee/timesheets"
                class="nav-link"
                active-class="nav-link-active"
              >
                My Timesheets
              </router-link>
              <router-link
                to="/employee/projects"
                class="nav-link"
                active-class="nav-link-active"
              >
                My Projects
              </router-link>
            </template>
          </div>
        </div>
        
        <!-- Desktop Right Side -->
        <div class="hidden md:flex items-center space-x-2">
          <div class="text-sm text-gray-700 hidden lg:block">
            <span class="font-medium">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
            <span class="ml-2 text-xs text-gray-500">({{ authStore.user?.role }})</span>
          </div>
          <router-link
            to="/profile"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <User class="h-4 w-4 lg:mr-2" />
            <span class="hidden lg:inline">Profile</span>
          </router-link>
          <button
            @click="handleLogout"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <LogOut class="h-4 w-4 lg:mr-2" />
            <span class="hidden lg:inline">Logout</span>
          </button>
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <Menu v-if="!mobileMenuOpen" class="h-6 w-6" />
            <X v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-show="mobileMenuOpen" class="md:hidden border-t border-gray-200">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <router-link
          to="/dashboard"
          class="mobile-nav-link"
          active-class="mobile-nav-link-active"
          @click="mobileMenuOpen = false"
        >
          Dashboard
        </router-link>
        
        <template v-if="authStore.isAdmin">
          <router-link
            to="/admin/employees"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            Users
          </router-link>
          <router-link
            to="/admin/projects"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            Projects
          </router-link>
          <router-link
            to="/admin/cost-centers"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            Cost Centers
          </router-link>
          <router-link
            to="/admin/timesheets"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            Timesheets
          </router-link>
          <router-link
            to="/admin/analytics"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            Analytics
          </router-link>
          <router-link
            to="/admin/reports"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            Reports
          </router-link>
          <router-link
            to="/admin/settings"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            Settings
          </router-link>
        </template>
        
        <template v-else>
          <router-link
            to="/employee/timesheets"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            My Timesheets
          </router-link>
          <router-link
            to="/employee/projects"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="mobileMenuOpen = false"
          >
            My Projects
          </router-link>
        </template>

        <div class="border-t border-gray-200 pt-2 mt-2">
          <div class="px-3 py-2 text-sm text-gray-700">
            <span class="font-medium">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
            <span class="ml-2 text-xs text-gray-500">({{ authStore.user?.role }})</span>
          </div>
          <router-link
            to="/profile"
            class="mobile-nav-link"
            @click="mobileMenuOpen = false"
          >
            <User class="h-4 w-4 mr-2 inline" />
            Profile
          </router-link>
          <button
            @click="handleLogout"
            class="mobile-nav-link w-full text-left"
          >
            <LogOut class="h-4 w-4 mr-2 inline" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { Clock, LogOut, User, Menu, X } from 'lucide-vue-next'
import settingsService from '../../services/settingsService'

const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)
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
  if (!companyLogo.value && savedLogo) companyLogo.value = savedLogo

  // Listen for logo changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'companyLogo') {
      companyLogo.value = e.newValue
    }
  })
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  @apply inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors;
}

.nav-link-active {
  @apply text-primary-600 bg-primary-50;
}

.mobile-nav-link {
  @apply block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50;
}

.mobile-nav-link-active {
  @apply text-primary-600 bg-primary-50;
}
</style>
