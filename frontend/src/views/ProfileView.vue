<template>
  <MainLayout>
    <div class="space-y-6 px-4 sm:px-0">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Profile & Settings</h1>
      </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
      <div class="flex items-center">
        <CheckCircle class="h-5 w-5 mr-2" />
        <span>{{ successMessage }}</span>
      </div>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <div class="flex items-center">
        <AlertCircle class="h-5 w-5 mr-2" />
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Profile Information Card -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Profile Information</h2>
        <button
          v-if="!editingProfile"
          @click="editingProfile = true"
          class="btn btn-secondary"
        >
          <Edit2 class="h-4 w-4 mr-2" />
          Edit Profile
        </button>
      </div>

      <form v-if="editingProfile" @submit.prevent="handleUpdateProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">First Name</label>
            <input
              v-model="profileForm.firstName"
              type="text"
              required
              class="input"
            />
          </div>

          <div>
            <label class="label">Last Name</label>
            <input
              v-model="profileForm.lastName"
              type="text"
              required
              class="input"
            />
          </div>

          <div>
            <label class="label">Email</label>
            <input
              v-model="profileForm.email"
              type="email"
              disabled
              class="input bg-gray-100"
            />
            <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label class="label">Department</label>
            <input
              v-model="profileForm.department"
              type="text"
              class="input"
            />
          </div>

          <div>
            <label class="label">Position</label>
            <input
              v-model="profileForm.position"
              type="text"
              class="input"
            />
          </div>

          <div>
            <label class="label">Role</label>
            <input
              v-model="profileForm.role"
              type="text"
              disabled
              class="input bg-gray-100 capitalize"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary"
          >
            <Loader2 v-if="loading" class="animate-spin h-4 w-4 mr-2" />
            Save Changes
          </button>
          <button
            type="button"
            @click="cancelEditProfile"
            class="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>

      <div v-else class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Name</p>
            <p class="font-medium">{{ profile?.firstName }} {{ profile?.lastName }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Email</p>
            <p class="font-medium">{{ profile?.email }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Department</p>
            <p class="font-medium">{{ profile?.department || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Position</p>
            <p class="font-medium">{{ profile?.position || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Role</p>
            <p class="font-medium capitalize">{{ profile?.role }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Status</p>
            <span :class="profile?.isActive ? 'badge-success' : 'badge-danger'">
              {{ profile?.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Security Settings Card -->
    <div class="card">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

      <!-- OTP Toggle -->
      <div class="mb-6 p-4 border border-gray-200 rounded-lg">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <Shield class="h-5 w-5 text-primary-600" />
              <h3 class="font-semibold text-gray-900">Email OTP Login</h3>
            </div>
            <p class="text-sm text-gray-600">
              Enable two-factor authentication via email. You'll receive a one-time password to your email each time you log in.
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              v-model="otpEnabled"
              @change="handleToggleOTP"
              :disabled="loading"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>

      <!-- Change Password -->
      <div class="border-t border-gray-200 pt-6">
        <button
          v-if="!changingPassword"
          @click="changingPassword = true"
          class="btn btn-secondary"
        >
          <Key class="h-4 w-4 mr-2" />
          Change Password
        </button>

        <form v-else @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label class="label">Current Password</label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              required
              class="input"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label class="label">New Password</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              required
              minlength="8"
              class="input"
              placeholder="Enter new password"
            />
            <p class="text-xs text-gray-500 mt-1">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          <div>
            <label class="label">Confirm New Password</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              required
              class="input"
              placeholder="Confirm new password"
            />
          </div>

          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="loading"
              class="btn btn-primary"
            >
              <Loader2 v-if="loading" class="animate-spin h-4 w-4 mr-2" />
              Update Password
            </button>
            <button
              type="button"
              @click="cancelChangePassword"
              class="btn btn-secondary"
            >
              Cancel
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
import { useAuthStore } from '../stores/authStore'
import profileService from '../services/profileService'
import MainLayout from '../components/Layout/MainLayout.vue'
import { Edit2, CheckCircle, AlertCircle, Loader2, Shield, Key } from 'lucide-vue-next'

const authStore = useAuthStore()

const profile = ref(null)
const loading = ref(false)
const error = ref(null)
const successMessage = ref(null)

// Profile editing
const editingProfile = ref(false)
const profileForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  department: '',
  position: '',
  role: ''
})

// OTP toggle
const otpEnabled = ref(false)

// Password change
const changingPassword = ref(false)
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const fetchProfile = async () => {
  try {
    const response = await profileService.getProfile()
    profile.value = response.data
    otpEnabled.value = response.data.otpEnabled || false
    
    // Populate form
    profileForm.value = {
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      department: response.data.department || '',
      position: response.data.position || '',
      role: response.data.role
    }
  } catch (err) {
    error.value = 'Failed to load profile'
  }
}

const handleUpdateProfile = async () => {
  loading.value = true
  error.value = null
  successMessage.value = null

  try {
    const response = await profileService.updateProfile({
      firstName: profileForm.value.firstName,
      lastName: profileForm.value.lastName,
      department: profileForm.value.department,
      position: profileForm.value.position
    })
    
    profile.value = response.data
    editingProfile.value = false
    successMessage.value = 'Profile updated successfully'
    
    // Update auth store
    await authStore.fetchCurrentUser()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

const cancelEditProfile = () => {
  editingProfile.value = false
  // Reset form to current profile data
  profileForm.value = {
    firstName: profile.value.firstName,
    lastName: profile.value.lastName,
    email: profile.value.email,
    department: profile.value.department || '',
    position: profile.value.position || '',
    role: profile.value.role
  }
}

const handleToggleOTP = async () => {
  loading.value = true
  error.value = null
  successMessage.value = null

  try {
    const response = await profileService.updatePreferences({
      otpEnabled: otpEnabled.value
    })
    
    successMessage.value = response.message
  } catch (err) {
    // Revert toggle on error
    otpEnabled.value = !otpEnabled.value
    error.value = err.response?.data?.message || 'Failed to update OTP preference'
  } finally {
    loading.value = false
  }
}

const handleChangePassword = async () => {
  error.value = null
  successMessage.value = null

  // Validate passwords match
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    error.value = 'New passwords do not match'
    return
  }

  loading.value = true

  try {
    const response = await profileService.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    successMessage.value = response.message
    cancelChangePassword()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to change password'
  } finally {
    loading.value = false
  }
}

const cancelChangePassword = () => {
  changingPassword.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

onMounted(() => {
  fetchProfile()
})
</script>
