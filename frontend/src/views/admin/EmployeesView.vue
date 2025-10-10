<template>
  <MainLayout>
    <div class="px-4 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Employees</h1>
        <button @click="showCreateModal = true" class="btn btn-primary flex items-center">
          <UserPlus class="h-5 w-5 mr-2" />
          Add Employee
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
              placeholder="Search by name or email..."
              class="input"
              @input="fetchEmployees"
            />
          </div>
          <div>
            <label class="label">Department</label>
            <select v-model="filters.department" class="input" @change="fetchEmployees">
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="QA">QA</option>
              <option value="Management">Management</option>
            </select>
          </div>
          <div>
            <label class="label">Status</label>
            <select v-model="filters.isActive" class="input" @change="fetchEmployees">
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <Loader2 class="animate-spin h-8 w-8 text-primary-600" />
      </div>
      
      <!-- Employees Table -->
      <div v-else class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="bg-gray-50">
              <tr>
                <th class="table-header">Name</th>
                <th class="table-header">Email</th>
                <th class="table-header">Department</th>
                <th class="table-header">Position</th>
                <th class="table-header">Hourly Rate</th>
                <th class="table-header">Status</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="employee in employees" :key="employee._id">
                <td class="table-cell">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span class="text-primary-600 font-medium">
                        {{ employee.firstName[0] }}{{ employee.lastName[0] }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="font-medium text-gray-900">
                        {{ employee.firstName }} {{ employee.lastName }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="table-cell">{{ employee.email }}</td>
                <td class="table-cell">{{ employee.department || '-' }}</td>
                <td class="table-cell">{{ employee.position || '-' }}</td>
                <td class="table-cell">${{ employee.hourlyRate || 0 }}/hr</td>
                <td class="table-cell">
                  <span :class="employee.isActive ? 'badge-success' : 'badge-danger'" class="badge">
                    {{ employee.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="flex space-x-2">
                    <button
                      @click="editEmployee(employee)"
                      class="text-primary-600 hover:text-primary-900"
                      title="Edit"
                    >
                      <Edit2 class="h-5 w-5" />
                    </button>
                    <button
                      @click="deleteEmployee(employee)"
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
        
        <div v-if="employees.length === 0" class="text-center py-12">
          <Users class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding a new employee.</p>
        </div>
      </div>
      
      <!-- Create/Edit Modal -->
      <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">{{ showEditModal ? 'Edit Employee' : 'Add New Employee' }}</h3>
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
                <label class="label">First Name *</label>
                <input v-model="form.firstName" type="text" required class="input" />
              </div>
              <div>
                <label class="label">Last Name *</label>
                <input v-model="form.lastName" type="text" required class="input" />
              </div>
              <div>
                <label class="label">Email *</label>
                <input v-model="form.email" type="email" required class="input" />
              </div>
              <div v-if="!showEditModal">
                <label class="label">Password *</label>
                <input v-model="form.password" type="password" required class="input" />
              </div>
              <div>
                <label class="label">Department</label>
                <input v-model="form.department" type="text" class="input" />
              </div>
              <div>
                <label class="label">Position</label>
                <input v-model="form.position" type="text" class="input" />
              </div>
              <div>
                <label class="label">Hourly Rate</label>
                <input v-model.number="form.hourlyRate" type="number" step="0.01" class="input" />
              </div>
              <div>
                <label class="label">Role</label>
                <select v-model="form.role" class="input">
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
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
import userService from '../../services/userService'
import authService from '../../services/authService'
import { UserPlus, Edit2, Trash2, Users, X, Loader2 } from 'lucide-vue-next'

const employees = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const formError = ref(null)

const filters = ref({
  search: '',
  department: '',
  isActive: ''
})

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  department: '',
  position: '',
  hourlyRate: 0,
  role: 'employee',
  isActive: true
})

const selectedEmployee = ref(null)

const fetchEmployees = async () => {
  loading.value = true
  try {
    const response = await userService.getUsers({
      role: 'employee',
      ...filters.value
    })
    employees.value = response.data
  } catch (error) {
    console.error('Error fetching employees:', error)
  } finally {
    loading.value = false
  }
}

const editEmployee = (employee) => {
  selectedEmployee.value = employee
  form.value = {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    department: employee.department || '',
    position: employee.position || '',
    hourlyRate: employee.hourlyRate || 0,
    role: employee.role,
    isActive: employee.isActive
  }
  showEditModal.value = true
}

const deleteEmployee = async (employee) => {
  if (!confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
    return
  }
  
  try {
    await userService.deleteUser(employee._id)
    await fetchEmployees()
  } catch (error) {
    alert(error.response?.data?.message || 'Error deleting employee')
  }
}

const handleSubmit = async () => {
  submitting.value = true
  formError.value = null
  
  try {
    if (showEditModal.value) {
      await userService.updateUser(selectedEmployee.value._id, form.value)
    } else {
      await authService.register(form.value)
    }
    await fetchEmployees()
    closeModal()
  } catch (error) {
    formError.value = error.response?.data?.message || 'Error saving employee'
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedEmployee.value = null
  formError.value = null
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    position: '',
    hourlyRate: 0,
    role: 'employee',
    isActive: true
  }
}

onMounted(() => {
  fetchEmployees()
})
</script>
