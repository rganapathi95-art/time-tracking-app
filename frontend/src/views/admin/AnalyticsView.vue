<template>
  <MainLayout>
    <div class="px-4 sm:px-0">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Analytics & Reports</h1>
      
      <!-- Date Range Filter -->
      <div class="card mb-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label class="label">Start Date</label>
            <input v-model="dateRange.startDate" type="date" class="input" @change="fetchAnalytics" />
          </div>
          <div>
            <label class="label">End Date</label>
            <input v-model="dateRange.endDate" type="date" class="input" @change="fetchAnalytics" />
          </div>
          <div class="flex items-end">
            <button @click="resetDateRange" class="btn btn-secondary w-full">
              Reset to This Month
            </button>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <Loader2 class="animate-spin h-8 w-8 text-primary-600" />
      </div>
      
      <div v-else class="space-y-6">
        <!-- Employee Hours -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Users class="h-6 w-6 mr-2 text-primary-600" />
            Employee Hours Summary
          </h2>
          
          <div v-if="employeeHours.employees?.length > 0">
            <div class="mb-4 p-4 bg-gray-50 rounded-lg">
              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p class="text-sm text-gray-600">Total Hours</p>
                  <p class="text-2xl font-bold text-gray-900">{{ employeeHours.summary?.totalHours || 0 }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Total Cost</p>
                  <p class="text-2xl font-bold text-gray-900">${{ (employeeHours.summary?.totalCost || 0).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Employees</p>
                  <p class="text-2xl font-bold text-gray-900">{{ employeeHours.summary?.employeeCount || 0 }}</p>
                </div>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="table">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="table-header">Employee</th>
                    <th class="table-header">Department</th>
                    <th class="table-header">Total Hours</th>
                    <th class="table-header">Hourly Rate</th>
                    <th class="table-header">Total Cost</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="emp in employeeHours.employees" :key="emp._id">
                    <td class="table-cell font-medium">{{ emp.employeeName }}</td>
                    <td class="table-cell">{{ emp.department || '-' }}</td>
                    <td class="table-cell">{{ emp.totalHours }}h</td>
                    <td class="table-cell">${{ emp.hourlyRate }}/hr</td>
                    <td class="table-cell">${{ emp.totalCost.toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            No data available for the selected period
          </div>
        </div>
        
        <!-- Project Allocation -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Briefcase class="h-6 w-6 mr-2 text-primary-600" />
            Project Allocation
          </h2>
          
          <div v-if="projectAllocation.projects?.length > 0">
            <div class="mb-4 p-4 bg-gray-50 rounded-lg">
              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p class="text-sm text-gray-600">Total Hours</p>
                  <p class="text-2xl font-bold text-gray-900">{{ projectAllocation.summary?.totalHours || 0 }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Active Projects</p>
                  <p class="text-2xl font-bold text-gray-900">{{ projectAllocation.summary?.projectCount || 0 }}</p>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="project in projectAllocation.projects"
                :key="project._id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 class="font-semibold text-gray-900 mb-1">{{ project.projectName }}</h3>
                <p class="text-xs text-gray-500 mb-3">{{ project.projectCode }}</p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total Hours:</span>
                    <span class="font-medium">{{ project.totalHours }}h</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Employees:</span>
                    <span class="font-medium">{{ project.employeeCount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Status:</span>
                    <span class="badge badge-info">{{ project.projectStatus }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            No data available for the selected period
          </div>
        </div>
        
        <!-- Cost Center Summary -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 class="h-6 w-6 mr-2 text-primary-600" />
            Cost Center Summary
          </h2>
          
          <div v-if="costCenterSummary.costCenters?.length > 0">
            <div class="mb-4 p-4 bg-gray-50 rounded-lg">
              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p class="text-sm text-gray-600">Total Hours</p>
                  <p class="text-2xl font-bold text-gray-900">{{ costCenterSummary.summary?.totalHours || 0 }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Total Cost</p>
                  <p class="text-2xl font-bold text-gray-900">${{ (costCenterSummary.summary?.totalCost || 0).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Cost Centers</p>
                  <p class="text-2xl font-bold text-gray-900">{{ costCenterSummary.summary?.costCenterCount || 0 }}</p>
                </div>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="table">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="table-header">Cost Center</th>
                    <th class="table-header">Department</th>
                    <th class="table-header">Total Hours</th>
                    <th class="table-header">Total Cost</th>
                    <th class="table-header">Budget</th>
                    <th class="table-header">Utilization</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="cc in costCenterSummary.costCenters" :key="cc._id">
                    <td class="table-cell">
                      <div class="font-medium">{{ cc.costCenterName }}</div>
                      <div class="text-xs text-gray-500">{{ cc.costCenterCode }}</div>
                    </td>
                    <td class="table-cell">{{ cc.department || '-' }}</td>
                    <td class="table-cell">{{ cc.totalHours }}h</td>
                    <td class="table-cell">${{ cc.totalCost.toLocaleString() }}</td>
                    <td class="table-cell">${{{ cc.costCenterBudget.toLocaleString() }}</td>
                    <td class="table-cell">
                      <div class="flex items-center">
                        <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            class="h-2 rounded-full"
                            :class="cc.budgetUtilization > 90 ? 'bg-red-600' : cc.budgetUtilization > 70 ? 'bg-yellow-600' : 'bg-green-600'"
                            :style="{ width: Math.min(cc.budgetUtilization, 100) + '%' }"
                          ></div>
                        </div>
                        <span class="text-sm font-medium">{{ cc.budgetUtilization.toFixed(1) }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            No data available for the selected period
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import MainLayout from '../../components/Layout/MainLayout.vue'
import analyticsService from '../../services/analyticsService'
import { Users, Briefcase, Building2, Loader2 } from 'lucide-vue-next'

const loading = ref(false)
const employeeHours = ref({})
const projectAllocation = ref({})
const costCenterSummary = ref({})

const dateRange = ref({
  startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
})

const fetchAnalytics = async () => {
  loading.value = true
  try {
    const params = {
      startDate: dateRange.value.startDate,
      endDate: dateRange.value.endDate,
      status: 'approved'
    }
    
    const [empHours, projAlloc, ccSummary] = await Promise.all([
      analyticsService.getEmployeeHours(params),
      analyticsService.getProjectAllocation(params),
      analyticsService.getCostCenterSummary(params)
    ])
    
    employeeHours.value = empHours.data
    projectAllocation.value = projAlloc.data
    costCenterSummary.value = ccSummary.data
  } catch (error) {
    console.error('Error fetching analytics:', error)
  } finally {
    loading.value = false
  }
}

const resetDateRange = () => {
  dateRange.value = {
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  }
  fetchAnalytics()
}

onMounted(() => {
  fetchAnalytics()
})
</script>
