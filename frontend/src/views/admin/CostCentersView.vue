<template>
  <MainLayout>
    <div class="px-4 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Cost Centers</h1>
        <button @click="showCreateModal = true" class="btn btn-primary flex items-center">
          <Plus class="h-5 w-5 mr-2" />
          Add Cost Center
        </button>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <Loader2 class="animate-spin h-8 w-8 text-primary-600" />
      </div>
      
      <!-- Cost Centers Table -->
      <div v-else class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="bg-gray-50">
              <tr>
                <th class="table-header">Name</th>
                <th class="table-header">Code</th>
                <th class="table-header">Department</th>
                <th class="table-header">Budget</th>
                <th class="table-header">Manager</th>
                <th class="table-header">Status</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="costCenter in costCenters" :key="costCenter._id">
                <td class="table-cell font-medium">{{ costCenter.name }}</td>
                <td class="table-cell">
                  <span class="badge badge-info">{{ costCenter.code }}</span>
                </td>
                <td class="table-cell">{{ costCenter.department || '-' }}</td>
                <td class="table-cell">{{ formatCurrency(costCenter.budget || 0, costCenter.currency || 'USD') }}</td>
                <td class="table-cell">
                  {{ costCenter.manager ? `${costCenter.manager.firstName} ${costCenter.manager.lastName}` : '-' }}
                </td>
                <td class="table-cell">
                  <span :class="costCenter.isActive ? 'badge-success' : 'badge-danger'" class="badge">
                    {{ costCenter.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="flex space-x-2">
                    <button
                      @click="editCostCenter(costCenter)"
                      class="text-primary-600 hover:text-primary-900"
                      title="Edit"
                    >
                      <Edit2 class="h-5 w-5" />
                    </button>
                    <button
                      @click="deleteCostCenter(costCenter)"
                      class="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 class="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="costCenters.length === 0" class="text-center py-12">
          <Building2 class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No cost centers found</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new cost center.</p>
        </div>
      </div>
      
      <!-- Create/Edit Modal -->
      <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">{{ showEditModal ? 'Edit Cost Center' : 'Add New Cost Center' }}</h3>
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
                <label class="label">Name *</label>
                <input v-model="form.name" type="text" required class="input" />
              </div>
              <div>
                <label class="label">Code *</label>
                <input v-model="form.code" type="text" required class="input" />
              </div>
              <div class="md:col-span-2">
                <label class="label">Description</label>
                <textarea v-model="form.description" rows="3" class="input"></textarea>
              </div>
              <div>
                <label class="label">Department</label>
                <input v-model="form.department" type="text" class="input" />
              </div>
              <div>
                <label class="label">Budget</label>
                <input v-model.number="form.budget" type="number" step="0.01" class="input" />
              </div>
              <div>
                <label class="label">Currency</label>
                <select v-model="form.currency" class="input">
                  <option v-for="curr in currencies" :key="curr.code" :value="curr.code">
                    {{ curr.code }} - {{ curr.name }} ({{ curr.symbol }})
                  </option>
                </select>
              </div>
              <div>
                <label class="label">Manager</label>
                <select v-model="form.manager" class="input">
                  <option value="">Select Manager</option>
                  <option v-for="user in users" :key="user._id" :value="user._id">
                    {{ user.firstName }} {{ user.lastName }}
                  </option>
                </select>
              </div>
              <div v-if="showEditModal">
                <label class="label">Status</label>
                <select v-model="form.isActive" class="input">
                  <option :value="true">Active</option>
                  <option :value="false">Inactive</option>
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
import MainLayout from '../../components/Layout/MainLayout.vue'
import costCenterService from '../../services/costCenterService'
import utilityService from '../../services/utilityService'
import userService from '../../services/userService'
import { Plus, Edit2, Trash2, Building2, X, Loader2 } from 'lucide-vue-next'

const costCenters = ref([])
const users = ref([])
const currencies = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const formError = ref(null)

const form = ref({
  name: '',
  code: '',
  description: '',
  department: '',
  budget: 0,
  currency: 'USD',
  manager: '',
  isActive: true
})

const selectedCostCenter = ref(null)

const fetchCostCenters = async () => {
  loading.value = true
  try {
    const response = await costCenterService.getCostCenters()
    costCenters.value = response.data
  } catch (error) {
    console.error('Error fetching cost centers:', error)
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const response = await userService.getUsers()
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const editCostCenter = (costCenter) => {
  selectedCostCenter.value = costCenter
  form.value = {
    name: costCenter.name,
    code: costCenter.code,
    description: costCenter.description || '',
    department: costCenter.department || '',
    budget: costCenter.budget || 0,
    currency: costCenter.currency || 'USD',
    manager: costCenter.manager?._id || '',
    isActive: costCenter.isActive
  }
  showEditModal.value = true
}

const deleteCostCenter = async (costCenter) => {
  if (!confirm(`Are you sure you want to delete ${costCenter.name}?`)) {
    return
  }
  
  try {
    await costCenterService.deleteCostCenter(costCenter._id)
    await fetchCostCenters()
  } catch (error) {
    alert(error.response?.data?.message || 'Error deleting cost center')
  }
}

const handleSubmit = async () => {
  submitting.value = true
  formError.value = null
  
  try {
    if (showEditModal.value) {
      await costCenterService.updateCostCenter(selectedCostCenter.value._id, form.value)
    } else {
      await costCenterService.createCostCenter(form.value)
    }
    await fetchCostCenters()
    closeModal()
  } catch (error) {
    formError.value = error.response?.data?.message || 'Error saving cost center'
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedCostCenter.value = null
  formError.value = null
  form.value = {
    name: '',
    code: '',
    description: '',
    department: '',
    budget: 0,
    currency: 'USD',
    manager: '',
    isActive: true
  }
}

const fetchCurrencies = async () => {
  try {
    const response = await utilityService.getCurrencies()
    currencies.value = response.data || []
  } catch (error) {
    console.error('Error fetching currencies:', error)
  }
}

const formatCurrency = (amount, currencyCode) => {
  const currency = currencies.value.find(c => c.code === currencyCode) || { symbol: '$' }
  return `${currency.symbol}${amount.toLocaleString()}`
}

onMounted(() => {
  fetchCostCenters()
  fetchUsers()
  fetchCurrencies()
})
</script>
