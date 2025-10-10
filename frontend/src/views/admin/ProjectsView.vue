<template>
  <MainLayout>
    <div class="px-4 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Projects</h1>
        <button @click="showCreateModal = true" class="btn btn-primary flex items-center">
          <FolderPlus class="h-5 w-5 mr-2" />
          Add Project
        </button>
      </div>
      
      <!-- Filters -->
      <div class="card mb-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label class="label">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search projects..."
              class="input"
              @input="fetchProjects"
            />
          </div>
          <div>
            <label class="label">Status</label>
            <select v-model="filters.status" class="input" @change="fetchProjects">
              <option value="">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
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
              <DollarSign class="h-4 w-4 mr-2" />
              <span>Budget: ${{ project.budget?.toLocaleString() || 0 }}</span>
            </div>
            <div class="flex items-center text-gray-600">
              <Users class="h-4 w-4 mr-2" />
              <span>{{ project.assignedEmployees?.length || 0 }} employees assigned</span>
            </div>
          </div>
          
          <div class="flex space-x-2 pt-4 border-t">
            <button
              @click="editProject(project)"
              class="btn btn-secondary flex-1 flex items-center justify-center"
            >
              <Edit2 class="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              @click="deleteProject(project)"
              class="btn btn-danger flex-1 flex items-center justify-center"
            >
              <Trash2 class="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="!loading && projects.length === 0" class="text-center py-12 card">
        <Briefcase class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
      </div>
      
      <!-- Create/Edit Modal -->
      <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">{{ showEditModal ? 'Edit Project' : 'Add New Project' }}</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <X class="h-6 w-6" />
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit">
            <div v-if="formError" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {{ formError }}
            </div>
            
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="label">Project Name *</label>
                <input v-model="form.name" type="text" required class="input" />
              </div>
              <div>
                <label class="label">Project Code *</label>
                <input v-model="form.code" type="text" required class="input" />
              </div>
              <div class="md:col-span-2">
                <label class="label">Description</label>
                <textarea v-model="form.description" rows="3" class="input"></textarea>
              </div>
              <div>
                <label class="label">Cost Center *</label>
                <select v-model="form.costCenter" required class="input">
                  <option value="">Select Cost Center</option>
                  <option v-for="cc in costCenters" :key="cc._id" :value="cc._id">
                    {{ cc.name }} ({{ cc.code }})
                  </option>
                </select>
              </div>
              <div>
                <label class="label">Status</label>
                <select v-model="form.status" class="input">
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label class="label">Start Date *</label>
                <input v-model="form.startDate" type="date" required class="input" />
              </div>
              <div>
                <label class="label">End Date</label>
                <input v-model="form.endDate" type="date" class="input" />
              </div>
              <div>
                <label class="label">Budget</label>
                <input v-model.number="form.budget" type="number" step="0.01" class="input" />
              </div>
              <div class="md:col-span-2">
                <label class="label">Assigned Employees</label>
                <select v-model="form.assignedEmployees" multiple class="input" size="5">
                  <option v-for="emp in employees" :key="emp._id" :value="emp._id">
                    {{ emp.firstName }} {{ emp.lastName }} ({{ emp.email }})
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="submitting" class="btn btn-primary">
                {{ submitting ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import MainLayout from '../../components/Layout/MainLayout.vue'
import projectService from '../../services/projectService'
import costCenterService from '../../services/costCenterService'
import userService from '../../services/userService'
import {
  FolderPlus,
  Edit2,
  Trash2,
  Briefcase,
  X,
  Loader2,
  Building2,
  Calendar,
  DollarSign,
  Users
} from 'lucide-vue-next'

const projects = ref([])
const costCenters = ref([])
const employees = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const formError = ref(null)

const filters = ref({
  search: '',
  status: ''
})

const form = ref({
  name: '',
  code: '',
  description: '',
  costCenter: '',
  startDate: '',
  endDate: '',
  budget: 0,
  status: 'planning',
  assignedEmployees: []
})

const selectedProject = ref(null)

const fetchProjects = async () => {
  loading.value = true
  try {
    const response = await projectService.getProjects(filters.value)
    projects.value = response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
  } finally {
    loading.value = false
  }
}

const fetchCostCenters = async () => {
  try {
    const response = await costCenterService.getCostCenters()
    costCenters.value = response.data
  } catch (error) {
    console.error('Error fetching cost centers:', error)
  }
}

const fetchEmployees = async () => {
  try {
    const response = await userService.getUsers({ role: 'employee', isActive: 'true' })
    employees.value = response.data
  } catch (error) {
    console.error('Error fetching employees:', error)
  }
}

const editProject = (project) => {
  selectedProject.value = project
  form.value = {
    name: project.name,
    code: project.code,
    description: project.description || '',
    costCenter: project.costCenter?._id || '',
    startDate: project.startDate ? format(new Date(project.startDate), 'yyyy-MM-dd') : '',
    endDate: project.endDate ? format(new Date(project.endDate), 'yyyy-MM-dd') : '',
    budget: project.budget || 0,
    status: project.status,
    assignedEmployees: project.assignedEmployees?.map(e => e._id) || []
  }
  showEditModal.value = true
}

const deleteProject = async (project) => {
  if (!confirm(`Are you sure you want to delete ${project.name}?`)) {
    return
  }
  
  try {
    await projectService.deleteProject(project._id)
    await fetchProjects()
  } catch (error) {
    alert(error.response?.data?.message || 'Error deleting project')
  }
}

const handleSubmit = async () => {
  submitting.value = true
  formError.value = null
  
  try {
    if (showEditModal.value) {
      await projectService.updateProject(selectedProject.value._id, form.value)
    } else {
      await projectService.createProject(form.value)
    }
    await fetchProjects()
    closeModal()
  } catch (error) {
    formError.value = error.response?.data?.message || 'Error saving project'
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedProject.value = null
  formError.value = null
  form.value = {
    name: '',
    code: '',
    description: '',
    costCenter: '',
    startDate: '',
    endDate: '',
    budget: 0,
    status: 'planning',
    assignedEmployees: []
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
  fetchCostCenters()
  fetchEmployees()
})
</script>
