<template>
  <nav class="bg-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/dashboard" class="flex items-center">
            <Clock class="h-8 w-8 text-primary-600" />
            <span class="ml-2 text-xl font-bold text-gray-900">TimeTrack</span>
          </router-link>
          
          <div class="hidden md:ml-10 md:flex md:space-x-8">
            <router-link
              to="/dashboard"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
            >
              Dashboard
            </router-link>
            
            <template v-if="authStore.isAdmin">
              <router-link
                to="/admin/employees"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                Employees
              </router-link>
              <router-link
                to="/admin/projects"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                Projects
              </router-link>
              <router-link
                to="/admin/cost-centers"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                Cost Centers
              </router-link>
              <router-link
                to="/admin/timesheets"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                Timesheets
              </router-link>
              <router-link
                to="/admin/analytics"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                Analytics
              </router-link>
            </template>
            
            <template v-else>
              <router-link
                to="/employee/timesheets"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                My Timesheets
              </router-link>
              <router-link
                to="/employee/projects"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                My Projects
              </router-link>
            </template>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="text-sm text-gray-700">
            <span class="font-medium">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
            <span class="ml-2 text-xs text-gray-500">({{ authStore.user?.role }})</span>
          </div>
          <button
            @click="handleLogout"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <LogOut class="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { Clock, LogOut } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
