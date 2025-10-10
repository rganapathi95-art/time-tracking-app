<template>
  <MainLayout>
    <div class="px-4 sm:px-0">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">My Projects</h1>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <Loader2 class="animate-spin h-8 w-8 text-primary-600" />
      </div>
      
      <!-- Projects Grid -->
      <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div v-for="project in projects" :key="project._id" class="card hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ project.name }}</h3>
              <p class="text-sm text-gray-500">{{ project.code }}</p>
            </div>
            <span :class="getStatusClass(project.status)" class="badge">
              {{ project.status }}
            </span>
          </div>
          
          <p class="text-gray-600 text-sm mb-4">{{ project.description || 'No description' }}</p>
          
          <div class="space-y-2 text-sm mb-4">
            <div class="flex items-center text-gray-600">
              <Building2 class="h-4 w-4 mr-2" />
              <span>{{ project.costCenter?.name }}</span>
            </div>
            <div class="flex items-center text-gray-600">
              <Calendar class="h-4 w-4 mr-2" />
              <span>{{ formatDate(project.startDate) }} - {{ project.endDate ? formatDate(project.endDate) : 'Ongoing' }}</span>
            </div>
            <div class="flex items-center text-gray-600">
              <Users class="h-4 w-4 mr-2" />
              <span>{{ project.assignedEmployees?.length || 0 }} team members</span>
            </div>
          </div>
          
          <div class="pt-4 border-t">
            <router-link
              to="/employee/timesheets"
              class="btn btn-primary w-full flex items-center justify-center"
            >
              <Clock class="h-4 w-4 mr-2" />
              Log Time
            </router-link>
          </div>
        </div>
      </div>
      
      <div v-if="!loading && projects.length === 0" class="text-center py-12 card">
        <Briefcase class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No projects assigned</h3>
        <p class="mt-1 text-sm text-gray-500">You don't have any projects assigned yet. Contact your administrator.</p>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import MainLayout from '../../components/Layout/MainLayout.vue'
import projectService from '../../services/projectService'
import {
  Briefcase,
  Building2,
  Calendar,
  Users,
  Clock,
  Loader2
} from 'lucide-vue-next'

const projects = ref([])
const loading = ref(false)

const fetchProjects = async () => {
  loading.value = true
  try {
    const response = await projectService.getProjects()
    projects.value = response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    planning: 'badge-info',
    active: 'badge-success',
    'on-hold': 'badge-warning',
    completed: 'badge-gray',
    cancelled: 'badge-danger'
  }
  return classes[status] || 'badge-gray'
}

const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

onMounted(() => {
  fetchProjects()
})
</script>
