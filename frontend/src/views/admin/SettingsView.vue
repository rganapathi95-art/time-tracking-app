<template>
  <MainLayout>
    <div class="px-4 sm:px-0">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <!-- Success Message -->
      <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
        <CheckCircle class="h-5 w-5 mr-2" />
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ errorMessage }}
      </div>

      <!-- Company Logo Section -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Image class="h-6 w-6 mr-2 text-primary-600" />
          Company Logo
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Current Logo Display -->
          <div>
            <label class="label">Current Logo</label>
            <div class="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center bg-gray-50">
              <div v-if="currentLogo" class="text-center">
                <img :src="currentLogo" alt="Company Logo" class="max-h-32 mx-auto" />
                <button
                  @click="removeLogo"
                  class="mt-4 text-sm text-red-600 hover:text-red-700"
                >
                  Remove Logo
                </button>
              </div>
              <div v-else class="text-center text-gray-500">
                <Image class="h-16 w-16 mx-auto mb-2 text-gray-400" />
                <p class="text-sm">No logo uploaded</p>
              </div>
            </div>
          </div>

          <!-- Upload New Logo -->
          <div>
            <label class="label">Upload New Logo</label>
            <div class="mt-2">
              <!-- File Input -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
                <div @click="$refs.fileInput.click()">
                  <Upload class="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p class="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p class="text-xs text-gray-500">
                    PNG, JPG, SVG up to 2MB
                  </p>
                </div>
              </div>

              <!-- Preview Selected File -->
              <div v-if="selectedFile" class="mt-4">
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center">
                    <FileImage class="h-5 w-5 text-gray-400 mr-2" />
                    <span class="text-sm text-gray-700">{{ selectedFile.name }}</span>
                  </div>
                  <button
                    @click="clearSelection"
                    class="text-red-600 hover:text-red-700"
                  >
                    <X class="h-5 w-5" />
                  </button>
                </div>

                <!-- Preview Image -->
                <div v-if="previewUrl" class="mt-4 border rounded-lg p-4 bg-white">
                  <p class="text-sm text-gray-600 mb-2">Preview:</p>
                  <img :src="previewUrl" alt="Preview" class="max-h-32 mx-auto" />
                </div>

                <!-- Upload Button -->
                <button
                  @click="uploadLogo"
                  :disabled="uploading"
                  class="mt-4 w-full btn btn-primary flex items-center justify-center"
                >
                  <Loader2 v-if="uploading" class="animate-spin h-5 w-5 mr-2" />
                  <Upload v-else class="h-5 w-5 mr-2" />
                  {{ uploading ? 'Uploading...' : 'Upload Logo' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            <strong>Note:</strong> The logo will be displayed in the navigation bar and login page. 
            Recommended size: 200x60 pixels (transparent background preferred).
          </p>
        </div>
      </div>

      <!-- Company Information Section -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Building class="h-6 w-6 mr-2 text-primary-600" />
          Company Information
        </h2>
        
        <form @submit.prevent="saveCompanyInfo" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Company Name</label>
              <input
                v-model="companyInfo.name"
                type="text"
                class="input"
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <label class="label">Email</label>
              <input
                v-model="companyInfo.email"
                type="email"
                class="input"
                placeholder="company@example.com"
              />
            </div>
            
            <div>
              <label class="label">Phone</label>
              <input
                v-model="companyInfo.phone"
                type="tel"
                class="input"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <label class="label">Website</label>
              <input
                v-model="companyInfo.website"
                type="url"
                class="input"
                placeholder="https://example.com"
              />
            </div>
          </div>
          
          <div>
            <label class="label">Address</label>
            <textarea
              v-model="companyInfo.address"
              rows="3"
              class="input"
              placeholder="Enter company address"
            ></textarea>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="savingInfo"
              class="btn btn-primary flex items-center"
            >
              <Loader2 v-if="savingInfo" class="animate-spin h-5 w-5 mr-2" />
              <Save v-else class="h-5 w-5 mr-2" />
              {{ savingInfo ? 'Saving...' : 'Save Information' }}
            </button>
          </div>
        </form>
      </div>

      <!-- System Settings Section -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Settings class="h-6 w-6 mr-2 text-primary-600" />
          System Settings
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 class="font-medium text-gray-900">Default Currency</h3>
              <p class="text-sm text-gray-600">Set the default currency for the system</p>
            </div>
            <select v-model="systemSettings.defaultCurrency" class="input w-32">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 class="font-medium text-gray-900">Date Format</h3>
              <p class="text-sm text-gray-600">Choose how dates are displayed</p>
            </div>
            <select v-model="systemSettings.dateFormat" class="input w-40">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 class="font-medium text-gray-900">Timesheet Auto-Approval</h3>
              <p class="text-sm text-gray-600">Automatically approve timesheets after submission</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="systemSettings.autoApprove"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div class="flex justify-end pt-4">
            <button
              @click="saveSystemSettings"
              :disabled="savingSettings"
              class="btn btn-primary flex items-center"
            >
              <Loader2 v-if="savingSettings" class="animate-spin h-5 w-5 mr-2" />
              <Save v-else class="h-5 w-5 mr-2" />
              {{ savingSettings ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import settingsService from '../../services/settingsService'
import {
  Image,
  Upload,
  FileImage,
  X,
  CheckCircle,
  Loader2,
  Building,
  Settings,
  Save
} from 'lucide-vue-next'

const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)
const currentLogo = ref(null)
const uploading = ref(false)
const savingInfo = ref(false)
const savingSettings = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const companyInfo = ref({
  name: '',
  email: '',
  phone: '',
  website: '',
  address: ''
})

const systemSettings = ref({
  defaultCurrency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  autoApprove: false
})

onMounted(() => {
  loadSettings()
})

const loadSettings = async () => {
  try {
    const data = await settingsService.get()
    if (data) {
      companyInfo.value = {
        name: data.companyName || '',
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || '',
        address: data.address || ''
      }
      currentLogo.value = data.logo || null
      systemSettings.value = {
        defaultCurrency: data.system?.defaultCurrency || 'USD',
        dateFormat: data.system?.dateFormat || 'MM/DD/YYYY',
        autoApprove: !!data.system?.autoApprove
      }
    }
  } catch (e) {
    console.error('Failed to load settings from API', e)
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please select an image file'
    return
  }

  // Validate file size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = 'File size must be less than 2MB'
    return
  }

  selectedFile.value = file
  errorMessage.value = ''

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const clearSelection = () => {
  selectedFile.value = null
  previewUrl.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadLogo = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  errorMessage.value = ''

  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target.result
      try {
        const updated = await settingsService.update({ logo: dataUrl })
        currentLogo.value = updated.logo || dataUrl
        // Emit change for live UI update in other components (temporary broadcast)
        localStorage.setItem('companyLogo', currentLogo.value || '')
        successMessage.value = 'Logo uploaded successfully!'
      } catch (apiErr) {
        console.error('API error uploading logo:', apiErr)
        errorMessage.value = 'Failed to upload logo. Please try again.'
      } finally {
        clearSelection()
        uploading.value = false
        setTimeout(() => { successMessage.value = '' }, 3000)
      }
    }
    reader.readAsDataURL(selectedFile.value)
  } catch (error) {
    console.error('Error uploading logo:', error)
    errorMessage.value = 'Failed to upload logo. Please try again.'
    uploading.value = false
  }
}

const removeLogo = async () => {
  if (confirm('Are you sure you want to remove the logo?')) {
    try {
      const updated = await settingsService.update({ logo: '' })
      currentLogo.value = updated.logo || ''
      localStorage.setItem('companyLogo', '')
      successMessage.value = 'Logo removed successfully!'
      setTimeout(() => { successMessage.value = '' }, 3000)
    } catch (e) {
      console.error('Error removing logo:', e)
      errorMessage.value = 'Failed to remove logo'
    }
  }
}

const saveCompanyInfo = async () => {
  savingInfo.value = true
  errorMessage.value = ''
  try {
    const payload = {
      companyName: companyInfo.value.name,
      email: companyInfo.value.email,
      phone: companyInfo.value.phone,
      website: companyInfo.value.website,
      address: companyInfo.value.address
    }
    const updated = await settingsService.update(payload)
    // Broadcast for UI updates
    localStorage.setItem('companyInfo', JSON.stringify({
      name: updated.companyName || payload.companyName,
      email: updated.email || payload.email,
      phone: updated.phone || payload.phone,
      website: updated.website || payload.website,
      address: updated.address || payload.address
    }))
    successMessage.value = 'Company information saved successfully!'
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (error) {
    console.error('Error saving company info:', error)
    errorMessage.value = 'Failed to save company information'
  } finally {
    savingInfo.value = false
  }
}

const saveSystemSettings = async () => {
  savingSettings.value = true
  errorMessage.value = ''
  try {
    const updated = await settingsService.update({ system: systemSettings.value })
    // Broadcast for any listeners (optional)
    localStorage.setItem('systemSettings', JSON.stringify(updated.system || systemSettings.value))
    successMessage.value = 'System settings saved successfully!'
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (error) {
    console.error('Error saving system settings:', error)
    errorMessage.value = 'Failed to save system settings'
  } finally {
    savingSettings.value = false
  }
}
</script>
