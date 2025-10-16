<template>
  <MainLayout>
    <div class="px-4 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Timesheet Periods</h1>
        <button @click="showCreateModal = true" class="btn btn-primary flex items-center">
          <Plus class="h-5 w-5 mr-2" />
          Create Period
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <Loader2 class="animate-spin h-8 w-8 text-primary-600" />
      </div>

      <!-- Periods List -->
      <div v-else class="space-y-4">
        <div v-for="period in periods" :key="period._id" class="card">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h3 class="text-lg font-semibold text-gray-900">{{ period.name }}</h3>
                <span :class="getStatusClass(period.status)" class="badge">
                  {{ period.status }}
                </span>
                <span v-if="!period.isActive" class="badge badge-gray">Inactive</span>
              </div>
              <div class="mt-2 text-sm text-gray-600">
                <p><strong>Period:</strong> {{ formatDate(period.startDate) }} - {{ formatDate(period.endDate) }}</p>
                <p v-if="period.description" class="mt-1">{{ period.description }}</p>
                <p class="mt-1">
                  <strong>Access:</strong> 
                  {{ period.allowAllUsers ? 'All Employees' : `${period.restrictedUsers?.length || 0} Selected Employees` }}
                </p>
                <p v-if="period.recurringType !== 'none'" class="mt-1">
                  <strong>Recurring:</strong> {{ period.recurringType }}
                </p>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                v-if="period.status === 'active'"
                @click="sendReminders(period)"
                class="text-blue-600 hover:text-blue-900"
                title="Send Reminders"
              >
                <Bell class="h-5 w-5" />
              </button>
              <button
                @click="editPeriod(period)"
                class="text-primary-600 hover:text-primary-900"
                title="Edit"
              >
                <Edit2 class="h-5 w-5" />
              </button>
              <button
                @click="deletePeriod(period)"
                class="text-red-600 hover:text-red-900"
                title="Delete"
              >
                <Trash2 class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="periods.length === 0" class="text-center py-12 card">
          <Calendar class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No timesheet periods</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new timesheet period.</p>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">{{ showEditModal ? 'Edit' : 'Create' }} Timesheet Period</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <X class="h-6 w-6" />
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ formError }}
            </div>

            <div>
              <label class="label">Period Name *</label>
              <input v-model="form.name" type="text" class="input" required />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Start Date *</label>
                <input v-model="form.startDate" type="date" class="input" required />
              </div>
              <div>
                <label class="label">End Date *</label>
                <input v-model="form.endDate" type="date" class="input" required />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Status *</label>
                <select v-model="form.status" class="input" required>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label class="label">Recurring Type</label>
                <select v-model="form.recurringType" class="input">
                  <option value="none">None</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div>
              <label class="label">Description</label>
              <textarea v-model="form.description" class="input" rows="3"></textarea>
            </div>

            <div>
              <label class="flex items-center">
                <input v-model="form.isActive" type="checkbox" class="rounded mr-2" />
                <span class="text-sm text-gray-700">Active</span>
              </label>
            </div>

            <div>
              <label class="flex items-center">
                <input v-model="form.allowAllUsers" type="checkbox" class="rounded mr-2" />
                <span class="text-sm text-gray-700">Allow All Employees</span>
              </label>
            </div>

            <div v-if="!form.allowAllUsers">
              <label class="label">Restricted to Employees</label>
              <select v-model="form.restrictedUsers" multiple class="input" size="5">
                <option v-for="emp in employees" :key="emp._id" :value="emp._id">
                  {{ emp.firstName }} {{ emp.lastName }}
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple employees</p>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="submitting" class="btn btn-primary">
                <Loader2 v-if="submitting" class="animate-spin h-4 w-4 mr-2" />
                {{ showEditModal ? 'Update' : 'Create' }}
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
import timesheetPeriodService from '../../services/timesheetPeriodService'
import userService from '../../services/userService'
import { Plus, Edit2, Trash2, X, Loader2, Calendar, Bell } from 'lucide-vue-next'

const periods = ref([])
const employees = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const formError = ref(null)
const selectedPeriod = ref(null)

const form = ref({
  name: '',
  startDate: '',
  endDate: '',
  status: 'upcoming',
  recurringType: 'none',
  description: '',
  isActive: true,
  allowAllUsers: true,
  restrictedUsers: []
})

const fetchPeriods = async () => {
  loading.value = true
  try {
    const response = await timesheetPeriodService.getTimesheetPeriods()
    periods.value = response.data
  } catch (error) {
    console.error('Error fetching periods:', error)
  } finally {
    loading.value = false
  }
}

const fetchEmployees = async () => {
  try {
    const response = await userService.getUsers({ role: 'employee' })
    employees.value = response.data
  } catch (error) {
    console.error('Error fetching employees:', error)
  }
}

const editPeriod = (period) => {
  selectedPeriod.value = period
  form.value = {
    name: period.name,
    startDate: format(new Date(period.startDate), 'yyyy-MM-dd'),
    endDate: format(new Date(period.endDate), 'yyyy-MM-dd'),
    status: period.status,
    recurringType: period.recurringType || 'none',
    description: period.description || '',
    isActive: period.isActive,
    allowAllUsers: period.allowAllUsers,
    restrictedUsers: period.restrictedUsers?.map(u => u._id || u) || []
  }
  showEditModal.value = true
}

const deletePeriod = async (period) => {
  if (!confirm(`Are you sure you want to delete "${period.name}"?`)) {
    return
  }

  try {
    await timesheetPeriodService.deleteTimesheetPeriod(period._id)
    await fetchPeriods()
  } catch (error) {
    alert(error.response?.data?.message || 'Error deleting period')
  }
}

const sendReminders = async (period) => {
  if (!confirm(`Send reminders to all employees for "${period.name}"?`)) {
    return
  }

  try {
    await timesheetPeriodService.sendReminders(period._id)
    alert('Reminders sent successfully')
  } catch (error) {
    alert(error.response?.data?.message || 'Error sending reminders')
  }
}

const handleSubmit = async () => {
  submitting.value = true
  formError.value = null

  try {
    if (showEditModal.value) {
      await timesheetPeriodService.updateTimesheetPeriod(selectedPeriod.value._id, form.value)
    } else {
      await timesheetPeriodService.createTimesheetPeriod(form.value)
    }
    await fetchPeriods()
    closeModal()
  } catch (error) {
    formError.value = error.response?.data?.message || 'Error saving period'
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedPeriod.value = null
  formError.value = null
  form.value = {
    name: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    recurringType: 'none',
    description: '',
    isActive: true,
    allowAllUsers: true,
    restrictedUsers: []
  }
}

const getStatusClass = (status) => {
  const classes = {
    upcoming: 'badge-warning',
    active: 'badge-success',
    closed: 'badge-gray'
  }
  return classes[status] || 'badge-gray'
}

const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

onMounted(() => {
  fetchPeriods()
  fetchEmployees()
})
</script>
