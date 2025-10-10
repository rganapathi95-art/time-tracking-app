<template>
  <MainLayout>
    <div class="px-4 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Timesheets Management</h1>
        <button
          v-if="selectedTimesheets.length > 0"
          @click="bulkApprove"
          class="btn btn-success flex items-center"
        >
          <CheckCircle class="h-5 w-5 mr-2" />
          Approve Selected ({{ selectedTimesheets.length }})
        </button>
      </div>
      
      <!-- Filters -->
      <div class="card mb-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label class="label">Employee</label>
            <select v-model="filters.employee" class="input" @change="fetchTimesheets">
              <option value="">All Employees</option>
              <option v-for="emp in employees" :key="emp._id" :value="emp._id">
                {{ emp.firstName }} {{ emp.lastName }}
              </option>
            </select>
          </div>
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
                <th class="table-header">
                  <input
                    type="checkbox"
                    @change="toggleSelectAll"
                    :checked="selectedTimesheets.length === submittedTimesheets.length && submittedTimesheets.length > 0"
                    class="rounded"
                  />
                </th>
                <th class="table-header">Employee</th>
                <th class="table-header">Project</th>
                <th class="table-header">Date</th>
                <th class="table-header">Hours</th>
                <th class="table-header">Description</th>
                <th class="table-header">Status</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="timesheet in timesheets" :key="timesheet._id">
                <td class="table-cell">
                  <input
                    v-if="timesheet.status === 'submitted'"
                    type="checkbox"
                    :value="timesheet._id"
                    v-model="selectedTimesheets"
                    class="rounded"
                  />
                </td>
                <td class="table-cell">
                  {{ timesheet.employee?.firstName }} {{ timesheet.employee?.lastName }}
                </td>
                <td class="table-cell">
                  <div>
                    <div class="font-medium">{{ timesheet.project?.name }}</div>
                    <div class="text-xs text-gray-500">{{ timesheet.project?.code }}</div>
                  </div>
                </td>
                <td class="table-cell">{{ formatDate(timesheet.date) }}</td>
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
                      v-if="timesheet.status === 'submitted'"
                      @click="approveTimesheet(timesheet)"
                      class="text-green-600 hover:text-green-900"
                      title="Approve"
                    >
                      <CheckCircle class="h-5 w-5" />
                    </button>
                    <button
                      v-if="timesheet.status === 'submitted'"
                      @click="rejectTimesheet(timesheet)"
                      class="text-red-600 hover:text-red-900"
                      title="Reject"
                    >
                      <XCircle class="h-5 w-5" />
                    </button>
                    <button
                      @click="viewTimesheet(timesheet)"
                      class="text-primary-600 hover:text-primary-900"
                      title="View Details"
                    >
                      <Eye class="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="timesheets.length === 0" class="text-center py-12">
          <FileText class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No timesheets found</h3>
          <p class="mt-1 text-sm text-gray-500">Timesheets will appear here once employees submit them.</p>
        </div>
      </div>
      
      <!-- View Modal -->
      <div v-if="showViewModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Timesheet Details</h3>
            <button @click="showViewModal = false" class="text-gray-400 hover:text-gray-500">
              <X class="h-6 w-6" />
            </button>
          </div>
          
          <div v-if="selectedTimesheet" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Employee</label>
                <p class="text-gray-900">
                  {{ selectedTimesheet.employee?.firstName }} {{ selectedTimesheet.employee?.lastName }}
                </p>
              </div>
              <div>
                <label class="label">Project</label>
                <p class="text-gray-900">{{ selectedTimesheet.project?.name }}</p>
              </div>
              <div>
                <label class="label">Date</label>
                <p class="text-gray-900">{{ formatDate(selectedTimesheet.date) }}</p>
              </div>
              <div>
                <label class="label">Hours</label>
                <p class="text-gray-900">{{ selectedTimesheet.hours }} hours</p>
              </div>
              <div class="col-span-2">
                <label class="label">Description</label>
                <p class="text-gray-900">{{ selectedTimesheet.description }}</p>
              </div>
              <div>
                <label class="label">Status</label>
                <span :class="getStatusClass(selectedTimesheet.status)" class="badge">
                  {{ selectedTimesheet.status }}
                </span>
              </div>
              <div v-if="selectedTimesheet.approvedBy">
                <label class="label">Approved By</label>
                <p class="text-gray-900">
                  {{ selectedTimesheet.approvedBy?.firstName }} {{ selectedTimesheet.approvedBy?.lastName }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button @click="showViewModal = false" class="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import MainLayout from '../../components/Layout/MainLayout.vue'
import timesheetService from '../../services/timesheetService'
import userService from '../../services/userService'
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  X,
  Loader2
} from 'lucide-vue-next'

const timesheets = ref([])
const employees = ref([])
const loading = ref(false)
const showViewModal = ref(false)
const selectedTimesheet = ref(null)
const selectedTimesheets = ref([])

const filters = ref({
  employee: '',
  status: '',
  startDate: '',
  endDate: ''
})

const submittedTimesheets = computed(() => {
  return timesheets.value.filter(t => t.status === 'submitted')
})

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

const fetchEmployees = async () => {
  try {
    const response = await userService.getUsers({ role: 'employee' })
    employees.value = response.data
  } catch (error) {
    console.error('Error fetching employees:', error)
  }
}

const approveTimesheet = async (timesheet) => {
  try {
    await timesheetService.updateTimesheet(timesheet._id, { status: 'approved' })
    await fetchTimesheets()
  } catch (error) {
    alert(error.response?.data?.message || 'Error approving timesheet')
  }
}

const rejectTimesheet = async (timesheet) => {
  const reason = prompt('Please provide a reason for rejection:')
  if (!reason) return
  
  try {
    await timesheetService.updateTimesheet(timesheet._id, {
      status: 'rejected',
      rejectionReason: reason
    })
    await fetchTimesheets()
  } catch (error) {
    alert(error.response?.data?.message || 'Error rejecting timesheet')
  }
}

const bulkApprove = async () => {
  if (!confirm(`Approve ${selectedTimesheets.value.length} timesheet(s)?`)) {
    return
  }
  
  try {
    await timesheetService.bulkApprove(selectedTimesheets.value)
    selectedTimesheets.value = []
    await fetchTimesheets()
  } catch (error) {
    alert(error.response?.data?.message || 'Error approving timesheets')
  }
}

const viewTimesheet = (timesheet) => {
  selectedTimesheet.value = timesheet
  showViewModal.value = true
}

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedTimesheets.value = submittedTimesheets.value.map(t => t._id)
  } else {
    selectedTimesheets.value = []
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
  fetchEmployees()
})
</script>
