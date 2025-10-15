<template>
  <MainLayout>
    <div class="px-4 sm:px-0">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-gray-900">Reports</h1>
        <div class="flex flex-wrap gap-2">
          <button @click="downloadPDF" :disabled="loading" class="btn btn-primary flex items-center">
            <Download class="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      <!-- Report Type Selection -->
      <div class="card mb-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label class="label">Report Type</label>
            <select v-model="reportType" class="input" @change="fetchReport">
              <option value="comprehensive">Comprehensive</option>
              <option value="users">Users</option>
              <option value="projects">Projects</option>
              <option value="timesheets">Timesheets</option>
            </select>
          </div>
          <div>
            <label class="label">Start Date</label>
            <input v-model="filters.startDate" type="date" class="input" @change="fetchReport" />
          </div>
          <div>
            <label class="label">End Date</label>
            <input v-model="filters.endDate" type="date" class="input" @change="fetchReport" />
          </div>
          <div class="flex items-end">
            <button @click="clearFilters" class="btn btn-secondary w-full">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <Loader2 class="animate-spin h-8 w-8 text-primary-600" />
      </div>

      <!-- Report Content -->
      <div v-else-if="reportData" class="space-y-6">
        <!-- Summary Card -->
        <div v-if="reportData.summary" class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div class="text-center p-4 bg-primary-50 rounded-lg">
              <div class="text-2xl font-bold text-primary-600">{{ reportData.summary.totalUsers }}</div>
              <div class="text-sm text-gray-600">Total Users</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ reportData.summary.totalProjects }}</div>
              <div class="text-sm text-gray-600">Total Projects</div>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ reportData.summary.activeProjects }}</div>
              <div class="text-sm text-gray-600">Active Projects</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ reportData.summary.totalHours }}</div>
              <div class="text-sm text-gray-600">Total Hours</div>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ reportData.summary.totalTimesheets }}</div>
              <div class="text-sm text-gray-600">Timesheets</div>
            </div>
          </div>
        </div>

        <!-- Users Report -->
        <div v-if="reportType === 'users' || reportType === 'comprehensive'" class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Users</h2>
          <div class="overflow-x-auto">
            <table class="table">
              <thead class="bg-gray-50">
                <tr>
                  <th class="table-header">Name</th>
                  <th class="table-header">Email</th>
                  <th class="table-header">Role</th>
                  <th class="table-header">Department</th>
                  <th class="table-header">Position</th>
                  <th class="table-header">Status</th>
                  <th class="table-header">OTP</th>
                  <th class="table-header">Lock Until</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in reportData.users" :key="user._id">
                  <td class="table-cell">{{ user.firstName }} {{ user.lastName }}</td>
                  <td class="table-cell">{{ user.email }}</td>
                  <td class="table-cell capitalize">{{ user.role }}</td>
                  <td class="table-cell">{{ user.department || '-' }}</td>
                  <td class="table-cell">{{ user.position || '-' }}</td>
                  <td class="table-cell">
                    <span :class="user.isActive ? 'badge-success' : 'badge-danger'" class="badge">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="table-cell">
                    <span :class="user.otpEnabled ? 'badge-success' : 'badge-secondary'" class="badge">
                      {{ user.otpEnabled ? 'Enabled' : 'Disabled' }}
                    </span>
                  </td>
                  <td class="table-cell">
                    <span v-if="user.lockUntil && new Date(user.lockUntil) > new Date()" class="badge badge-danger">
                      {{ formatDate(user.lockUntil) }}
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Projects Report -->
        <div v-if="reportType === 'projects' || reportType === 'comprehensive'" class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Projects</h2>
          <div class="overflow-x-auto">
            <table class="table">
              <thead class="bg-gray-50">
                <tr>
                  <th class="table-header">Name</th>
                  <th class="table-header">Code</th>
                  <th class="table-header">Country</th>
                  <th class="table-header">Element #</th>
                  <th class="table-header">Status</th>
                  <th class="table-header">Budget</th>
                  <th class="table-header">Employees</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="project in reportData.projects" :key="project._id">
                  <td class="table-cell font-medium">{{ project.name }}</td>
                  <td class="table-cell">{{ project.code }}</td>
                  <td class="table-cell">{{ project.country || '-' }}</td>
                  <td class="table-cell">{{ project.elementNumber || '-' }}</td>
                  <td class="table-cell">
                    <span :class="getStatusClass(project.status)" class="badge">
                      {{ project.status }}
                    </span>
                  </td>
                  <td class="table-cell">${{ project.budget?.toLocaleString() || 0 }}</td>
                  <td class="table-cell">{{ project.assignedEmployees?.length || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Timesheets Report -->
        <div v-if="reportType === 'timesheets' || reportType === 'comprehensive'" class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Timesheets</h2>
          <div class="overflow-x-auto">
            <table class="table">
              <thead class="bg-gray-50">
                <tr>
                  <th class="table-header">Date</th>
                  <th class="table-header">User</th>
                  <th class="table-header">Project</th>
                  <th class="table-header">Hours</th>
                  <th class="table-header">Description</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="timesheet in reportData.timesheets" :key="timesheet._id">
                  <td class="table-cell">{{ formatDate(timesheet.date) }}</td>
                  <td class="table-cell">{{ timesheet.employee?.firstName }} {{ timesheet.employee?.lastName }}</td>
                  <td class="table-cell">{{ timesheet.project?.name || '-' }}</td>
                  <td class="table-cell font-medium">{{ timesheet.hours }}</td>
                  <td class="table-cell text-sm">{{ timesheet.description || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cost Centers (Comprehensive only) -->
        <div v-if="reportType === 'comprehensive' && reportData.costCenters" class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Cost Centers</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="cc in reportData.costCenters" :key="cc._id" class="p-4 border border-gray-200 rounded-lg">
              <h3 class="font-semibold text-gray-900">{{ cc.name }}</h3>
              <p class="text-sm text-gray-600">{{ cc.code }}</p>
              <p v-if="cc.description" class="text-xs text-gray-500 mt-2">{{ cc.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="text-center py-12 card">
        <FileText class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No report data</h3>
        <p class="mt-1 text-sm text-gray-500">Select a report type to view data.</p>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import MainLayout from '../../components/Layout/MainLayout.vue'
import reportService from '../../services/reportService'
import { Download, Loader2, FileText } from 'lucide-vue-next'

const reportType = ref('comprehensive')
const reportData = ref(null)
const loading = ref(false)

const filters = ref({
  startDate: '',
  endDate: ''
})

const fetchReport = async () => {
  loading.value = true
  try {
    let response
    switch (reportType.value) {
      case 'users':
        response = await reportService.getUsersReport(filters.value)
        break
      case 'projects':
        response = await reportService.getProjectsReport(filters.value)
        break
      case 'timesheets':
        response = await reportService.getTimesheetsReport(filters.value)
        break
      default:
        response = await reportService.getComprehensiveReport(filters.value)
    }
    reportData.value = response.data
  } catch (error) {
    console.error('Error fetching report:', error)
    alert('Failed to load report')
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value.startDate = ''
  filters.value.endDate = ''
  fetchReport()
}

const downloadPDF = async () => {
  try {
    loading.value = true
    const blob = await reportService.downloadPDF(filters.value)
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report-${Date.now()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
    alert('Failed to download PDF')
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
  fetchReport()
})
</script>
