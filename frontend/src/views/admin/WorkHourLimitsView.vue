<template>
  <MainLayout>
    <div class="px-4 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Work Hour Limits</h1>
        <button @click="showCreateModal = true" class="btn btn-primary flex items-center">
          <Plus class="h-5 w-5 mr-2" />
          Set Limit
        </button>
      </div>

      <!-- Bulk Update Section -->
      <div class="card mb-6">
        <h3 class="text-lg font-semibold mb-4">Bulk Update Limits</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="label">Weekly Limit (hours)</label>
            <input v-model.number="bulkForm.weeklyLimit" type="number" class="input" min="1" max="168" />
          </div>
          <div>
            <label class="label">Daily Limit (hours)</label>
            <input v-model.number="bulkForm.dailyLimit" type="number" class="input" min="1" max="24" />
          </div>
          <div>
            <label class="label">Warning Threshold (%)</label>
            <input v-model.number="bulkForm.warningThreshold" type="number" class="input" min="50" max="100" />
          </div>
          <div class="flex items-end">
            <button
              @click="bulkUpdate"
              :disabled="selectedEmployees.length === 0"
              class="btn btn-primary w-full"
            >
              Update Selected ({{ selectedEmployees.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <Loader2 class="animate-spin h-8 w-8 text-primary-600" />
      </div>

      <!-- Limits Table -->
      <div v-else class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="bg-gray-50">
              <tr>
                <th class="table-header">
                  <input
                    type="checkbox"
                    @change="toggleSelectAll"
                    :checked="selectedEmployees.length === limits.length && limits.length > 0"
                    class="rounded"
                  />
                </th>
                <th class="table-header">Employee</th>
                <th class="table-header">Weekly Limit</th>
                <th class="table-header">Daily Limit</th>
                <th class="table-header">Warning %</th>
                <th class="table-header">Enforce</th>
                <th class="table-header">Type</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="limit in limits" :key="limit._id">
                <td class="table-cell">
                  <input
                    type="checkbox"
                    :value="limit.employee._id"
                    v-model="selectedEmployees"
                    class="rounded"
                  />
                </td>
                <td class="table-cell">
                  <div>
                    <div class="font-medium">{{ limit.employee.firstName }} {{ limit.employee.lastName }}</div>
                    <div class="text-xs text-gray-500">{{ limit.employee.email }}</div>
                  </div>
                </td>
                <td class="table-cell">{{ limit.weeklyLimit }}h</td>
                <td class="table-cell">{{ limit.dailyLimit }}h</td>
                <td class="table-cell">{{ limit.warningThreshold }}%</td>
                <td class="table-cell">
                  <span :class="limit.enforceLimit ? 'badge-success' : 'badge-gray'" class="badge">
                    {{ limit.enforceLimit ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td class="table-cell">
                  <span :class="limit.isCustom ? 'badge-primary' : 'badge-gray'" class="badge">
                    {{ limit.isCustom ? 'Custom' : 'Default' }}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="flex space-x-2">
                    <button
                      @click="editLimit(limit)"
                      class="text-primary-600 hover:text-primary-900"
                      title="Edit"
                    >
                      <Edit2 class="h-5 w-5" />
                    </button>
                    <button
                      v-if="limit.isCustom"
                      @click="resetLimit(limit)"
                      class="text-red-600 hover:text-red-900"
                      title="Reset to Default"
                    >
                      <RotateCcw class="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="limits.length === 0" class="text-center py-12">
          <Clock class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No work hour limits</h3>
          <p class="mt-1 text-sm text-gray-500">Limits will be created automatically when employees log hours.</p>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">{{ showEditModal ? 'Edit' : 'Set' }} Work Hour Limit</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <X class="h-6 w-6" />
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ formError }}
            </div>

            <div v-if="!showEditModal">
              <label class="label">Employee *</label>
              <select v-model="form.employee" class="input" required>
                <option value="">Select Employee</option>
                <option v-for="emp in employees" :key="emp._id" :value="emp._id">
                  {{ emp.firstName }} {{ emp.lastName }}
                </option>
              </select>
            </div>

            <div>
              <label class="label">Weekly Limit (hours) *</label>
              <input v-model.number="form.weeklyLimit" type="number" class="input" min="1" max="168" required />
            </div>

            <div>
              <label class="label">Daily Limit (hours) *</label>
              <input v-model.number="form.dailyLimit" type="number" class="input" min="1" max="24" required />
            </div>

            <div>
              <label class="label">Warning Threshold (%) *</label>
              <input v-model.number="form.warningThreshold" type="number" class="input" min="50" max="100" required />
              <p class="text-xs text-gray-500 mt-1">Notify employee when they reach this percentage of their limit</p>
            </div>

            <div>
              <label class="flex items-center">
                <input v-model="form.enforceLimit" type="checkbox" class="rounded mr-2" />
                <span class="text-sm text-gray-700">Enforce Limit (prevent exceeding)</span>
              </label>
            </div>

            <div>
              <label class="label">Notes</label>
              <textarea v-model="form.notes" class="input" rows="3"></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="submitting" class="btn btn-primary">
                <Loader2 v-if="submitting" class="animate-spin h-4 w-4 mr-2" />
                {{ showEditModal ? 'Update' : 'Set' }} Limit
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
import MainLayout from '../../components/Layout/MainLayout.vue'
import workHourLimitService from '../../services/workHourLimitService'
import userService from '../../services/userService'
import { Plus, Edit2, X, Loader2, Clock, RotateCcw } from 'lucide-vue-next'

const limits = ref([])
const employees = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const formError = ref(null)
const selectedLimit = ref(null)
const selectedEmployees = ref([])

const form = ref({
  employee: '',
  weeklyLimit: 80,
  dailyLimit: 24,
  warningThreshold: 90,
  enforceLimit: true,
  notes: ''
})

const bulkForm = ref({
  weeklyLimit: 80,
  dailyLimit: 24,
  warningThreshold: 90,
  enforceLimit: true
})

const fetchLimits = async () => {
  loading.value = true
  try {
    const response = await workHourLimitService.getWorkHourLimits()
    limits.value = response.data
  } catch (error) {
    console.error('Error fetching limits:', error)
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

const editLimit = (limit) => {
  selectedLimit.value = limit
  form.value = {
    employee: limit.employee._id,
    weeklyLimit: limit.weeklyLimit,
    dailyLimit: limit.dailyLimit,
    warningThreshold: limit.warningThreshold,
    enforceLimit: limit.enforceLimit,
    notes: limit.notes || ''
  }
  showEditModal.value = true
}

const resetLimit = async (limit) => {
  if (!confirm(`Reset limit for ${limit.employee.firstName} ${limit.employee.lastName} to default?`)) {
    return
  }

  try {
    await workHourLimitService.deleteLimit(limit._id)
    await fetchLimits()
  } catch (error) {
    alert(error.response?.data?.message || 'Error resetting limit')
  }
}

const bulkUpdate = async () => {
  if (selectedEmployees.value.length === 0) {
    alert('Please select at least one employee')
    return
  }

  if (!confirm(`Update limits for ${selectedEmployees.value.length} employee(s)?`)) {
    return
  }

  try {
    await workHourLimitService.bulkUpdateLimits({
      employeeIds: selectedEmployees.value,
      ...bulkForm.value
    })
    await fetchLimits()
    selectedEmployees.value = []
    alert('Limits updated successfully')
  } catch (error) {
    alert(error.response?.data?.message || 'Error updating limits')
  }
}

const toggleSelectAll = () => {
  if (selectedEmployees.value.length === limits.value.length) {
    selectedEmployees.value = []
  } else {
    selectedEmployees.value = limits.value.map(l => l.employee._id)
  }
}

const handleSubmit = async () => {
  submitting.value = true
  formError.value = null

  try {
    await workHourLimitService.createOrUpdateLimit(form.value)
    await fetchLimits()
    closeModal()
  } catch (error) {
    formError.value = error.response?.data?.message || 'Error saving limit'
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedLimit.value = null
  formError.value = null
  form.value = {
    employee: '',
    weeklyLimit: 80,
    dailyLimit: 24,
    warningThreshold: 90,
    enforceLimit: true,
    notes: ''
  }
}

onMounted(() => {
  fetchLimits()
  fetchEmployees()
})
</script>
