<template>
  <MainLayout>
    <div class="px-4 sm:px-0">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <!-- Admin Dashboard -->
      <div v-if="authStore.isAdmin">
        <div v-if="loading" class="flex justify-center items-center py-12">
          <Loader2 class="animate-spin h-8 w-8 text-primary-600" />
        </div>
        
        <div v-else>
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div class="card">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <Users class="h-6 w-6 text-primary-600" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                    <dd class="text-2xl font-semibold text-gray-900">{{ stats.totalEmployees || 0 }}</dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <Briefcase class="h-6 w-6 text-green-600" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                    <dd class="text-2xl font-semibold text-gray-900">{{ stats.totalProjects || 0 }}</dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <Clock class="h-6 w-6 text-yellow-600" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Pending Timesheets</dt>
                    <dd class="text-2xl font-semibold text-gray-900">{{ stats.pendingTimesheets || 0 }}</dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <TrendingUp class="h-6 w-6 text-blue-600" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Monthly Hours</dt>
                    <dd class="text-2xl font-semibold text-gray-900">{{ stats.monthlyHours || 0 }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="card mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <router-link
                to="/admin/employees"
                class="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <UserPlus class="h-6 w-6 text-primary-600 mr-3" />
                <span class="font-medium text-primary-900">Manage Employees</span>
              </router-link>
              
              <router-link
                to="/admin/projects"
                class="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FolderPlus class="h-6 w-6 text-green-600 mr-3" />
                <span class="font-medium text-green-900">Manage Projects</span>
              </router-link>
              
              <router-link
                to="/admin/timesheets"
                class="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <FileText class="h-6 w-6 text-yellow-600 mr-3" />
                <span class="font-medium text-yellow-900">Review Timesheets</span>
              </router-link>
              
              <router-link
                to="/admin/analytics"
                class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <BarChart3 class="h-6 w-6 text-blue-600 mr-3" />
                <span class="font-medium text-blue-900">View Analytics</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Employee Dashboard -->
      <div v-else>
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase class="h-6 w-6 mr-2 text-primary-600" />
              My Projects
            </h2>
            <p class="text-gray-600 mb-4">View and manage your assigned projects</p>
            <router-link to="/employee/projects" class="btn btn-primary">
              View Projects
            </router-link>
          </div>
          
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock class="h-6 w-6 mr-2 text-primary-600" />
              My Timesheets
            </h2>
            <p class="text-gray-600 mb-4">Submit and track your time entries</p>
            <router-link to="/employee/timesheets" class="btn btn-primary">
              Manage Timesheets
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import MainLayout from '../components/Layout/MainLayout.vue'
import analyticsService from '../services/analyticsService'
import {
  Clock,
  Users,
  Briefcase,
  TrendingUp,
  UserPlus,
  FolderPlus,
  FileText,
  BarChart3,
  Loader2
} from 'lucide-vue-next'

const authStore = useAuthStore()
const stats = ref({})
const loading = ref(false)

const fetchStats = async () => {
  if (!authStore.isAdmin) return
  
  loading.value = true
  try {
    const response = await analyticsService.getDashboardStats()
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>
