<template>
  <MainLayout>
    <div class="px-4 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">My Timesheets</h1>
        <button @click="showCreateModal = true" class="btn btn-primary flex items-center">
          <Plus class="h-5 w-5 mr-2" />
          Add Timesheet
        </button>
      </div>
      
      <!-- Filters -->
      <div class="card mb-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label class="label">Status</label>
            <select v-model="filters.status" class="input" @change="fetchTimesheets">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label class="label">Start Date</label>
            <input v-model="filters.startDate" type="date" class="input" @change="fetchTimesheets" />
          </div>
          <div>
            <label class="label">End Date</label>
            <input v-model="filters.endDate" type="date" class="input" @change="fetchTimesheets" />
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <Loader2 class="animate-spin h-8 w-8 text-primary-600" />
      </div>
      
      <!-- Timesheets Table -->
      <div v-else class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="bg-gray-50">
              <tr>
                <th class="table-header">Date</th>
                <th class="table-header">Project</th>
                <th class="table-header">Hours</th>
                <th class="table-header">Description</th>
                <th class="table-header">Status</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="timesheet in timesheets" :key="timesheet._id">
                <td class="table-cell">{{ formatDate(timesheet.date) }}</td>
                <td class="table-cell">
                  <div>
                    <div class="font-medium">{{ timesheet.project?.name }}</div>
                    <div class="text-xs text-gray-500">{{ timesheet.project?.code }}</div>
                  </div>
                </td>
                <td class="table-cell">{{ timesheet.hours }}h</td>
                <td class="table-cell">
                  <div class="max-w-xs truncate" :title="timesheet.description">
                    {{ timesheet.description }}
                  </div>
                </td>
                <td class="table-cell">
                  <span :class="getStatusClass(timesheet.status)" class="badge">
                    {{ timesheet.status }}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="flex space-x-2">
                    <button
                      v-if="canEdit(timesheet)"
                      @click="editTimesheet(timesheet)"
                      class="text-primary-600 hover:text-primary-900"
                      title="Edit"
                    >
                      <Edit2 class="h-5 w-5" />
                    </button>
                    <button
                      v-if="canDelete(timesheet)"
                      @click="deleteTimesheet(timesheet)"
                      class="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 class="h-5 w-5" />
                    </button>
                    <button
                      v-if="timesheet.status === 'draft'"
                      @click="submitTimesheet(timesheet)"
                      class="text-green-600 hover:text-green-900"
                      title="Submit"
                    >
                      <Send class="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="timesheets.length === 0" class="text-center py-12">
          <Clock class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No timesheets found</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding your first timesheet.</p>
        </div>
      </div>
      
      <!-- Create/Edit Modal -->
      <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">{{ showEditModal ? 'Edit Timesheet' : 'Add New Timesheet' }}</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <X class="h-6 w-6" />
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit">
            <div v-if="formError" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {{ formError }}
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="label">Project *</label>
                <select v-model="form.project" required class="input">
                  <option value="">Select Project</option>
                  <option v-for="project in projects" :key="project._id" :value="project._id">
                    {{ project.name }} ({{ project.code }})
                  </option>
                </select>
              </div>
              
              <div>
                <label class="label">Date *</label>
                <input v-model="form.date" type="date" required class="input" />
              </div>
              
              <div>
                <label class="label">Hours *</label>
                <input
                  v-model.number="form.hours"
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  required
                  class="input"
                />
                <p class="text-xs text-gray-500 mt-1">Enter hours in 0.25 increments (e.g., 1.5, 2.75)</p>
              </div>
              
              <div>
                <label class="label">Description *</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  required
                  class="input"
                  placeholder="Describe what you worked on..."
                ></textarea>
              </div>
              
              <div>
                <label class="label">Status</label>
                <select v-model="form.status" class="input">
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                </select>
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
import timesheetService from '../../services/timesheetService'
import projectService from '../../services/projectService'
import { Plus, Edit2, Trash2, Clock, X, Loader2, Send } from 'lucide-vue-next'

const timesheets = ref([])
const projects = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const formError = ref(null)

const filters = ref({
  status: '',
  startDate: '',
  endDate: ''
})

const form = ref({
  project: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  hours: 8,
  description: '',
  status: 'draft'
})

const selectedTimesheet = ref(null)

const fetchTimesheets = async () => {
  loading.value = true
  try {
    const response = await timesheetService.getTimesheets(filters.value)
    timesheets.value = response.data
  } catch (error) {
    console.error('Error fetching timesheets:', error)
  } finally {
    loading.value = false
  }
}

const fetchProjects = async () => {
  try {
    const response = await projectService.getProjects()
    projects.value = response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
  }
}

const canEdit = (timesheet) => {
  return timesheet.status === 'draft' || timesheet.status === 'rejected'
}

const canDelete = (timesheet) => {
  return timesheet.status === 'draft'
}

const editTimesheet = (timesheet) => {
  selectedTimesheet.value = timesheet
  form.value = {
    project: timesheet.project?._id || '',
    date: format(new Date(timesheet.date), 'yyyy-MM-dd'),
    hours: timesheet.hours,
    description: timesheet.description,
    status: timesheet.status
  }
  showEditModal.value = true
}

const deleteTimesheet = async (timesheet) => {
  if (!confirm('Are you sure you want to delete this timesheet?')) {
    return
  }
  
  try {
    await timesheetService.deleteTimesheet(timesheet._id)
    await fetchTimesheets()
  } catch (error) {
    alert(error.response?.data?.message || 'Error deleting timesheet')
  }
}

const submitTimesheet = async (timesheet) => {
  if (!confirm('Submit this timesheet for approval?')) {
    return
  }
  
  try {
    await timesheetService.updateTimesheet(timesheet._id, { status: 'submitted' })
    await fetchTimesheets()
  } catch (error) {
    alert(error.response?.data?.message || 'Error submitting timesheet')
  }
}

const handleSubmit = async () => {
  submitting.value = true
  formError.value = null
  
  try {
    if (showEditModal.value) {
      await timesheetService.updateTimesheet(selectedTimesheet.value._id, form.value)
    } else {
      await timesheetService.createTimesheet(form.value)
    }
    await fetchTimesheets()
    closeModal()
  } catch (error) {
    formError.value = error.response?.data?.message || 'Error saving timesheet'
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedTimesheet.value = null
  formError.value = null
  form.value = {
    project: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    hours: 8,
    description: '',
    status: 'draft'
  }
}

const getStatusClass = (status) => {
  const classes = {
    draft: 'badge-gray',
    submitted: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger'
  }
  return classes[status] || 'badge-gray'
}

const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

onMounted(() => {
  fetchTimesheets()
  fetchProjects()
})
</script>
