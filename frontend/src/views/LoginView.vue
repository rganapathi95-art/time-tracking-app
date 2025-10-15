<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
      <div>
        <div class="flex justify-center">
          <img v-if="companyLogo" :src="companyLogo" alt="Company Logo" class="h-16 max-w-[220px] object-contain" />
          <Clock v-else class="h-16 w-16 text-primary-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ companyName || 'Time Sheet App' }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ otpStep ? 'Enter OTP Code' : 'Sign in to your account' }}
        </p>
      </div>
      
      <!-- Login Form -->
      <form v-if="!otpStep" class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div class="flex items-center">
            <AlertCircle class="h-5 w-5 mr-2" />
            <span>{{ error }}</span>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label for="email" class="label">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label for="password" class="label">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="input"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary flex justify-center items-center"
          >
            <Loader2 v-if="loading" class="animate-spin h-5 w-5 mr-2" />
            <span>{{ loading ? 'Signing in...' : 'Sign in' }}</span>
          </button>
        </div>
      </form>

      <!-- OTP Verification Form -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleVerifyOTP">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div class="flex items-center">
            <AlertCircle class="h-5 w-5 mr-2" />
            <span>{{ error }}</span>
          </div>
        </div>

        <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div class="flex items-center">
            <Mail class="h-5 w-5 mr-2" />
            <span>{{ successMessage }}</span>
          </div>
        </div>
        
        <div>
          <label for="otp" class="label">Enter 6-digit OTP</label>
          <input
            id="otp"
            v-model="otpCode"
            type="text"
            maxlength="6"
            pattern="[0-9]{6}"
            required
            class="input text-center text-2xl tracking-widest"
            placeholder="000000"
            autocomplete="off"
          />
          <p class="mt-2 text-sm text-gray-600">
            Check your email ({{ otpEmail }}) for the verification code
          </p>
        </div>

        <div class="space-y-3">
          <button
            type="submit"
            :disabled="loading || otpCode.length !== 6"
            class="w-full btn btn-primary flex justify-center items-center"
          >
            <Loader2 v-if="loading" class="animate-spin h-5 w-5 mr-2" />
            <span>{{ loading ? 'Verifying...' : 'Verify OTP' }}</span>
          </button>

          <button
            type="button"
            @click="handleResendOTP"
            :disabled="resendLoading || resendCooldown > 0"
            class="w-full btn btn-secondary flex justify-center items-center"
          >
            <Loader2 v-if="resendLoading" class="animate-spin h-5 w-5 mr-2" />
            <span v-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
            <span v-else>{{ resendLoading ? 'Sending...' : 'Resend OTP' }}</span>
          </button>

          <button
            type="button"
            @click="cancelOTP"
            class="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to login
          </button>
        </div>
      </form>
      
      <!-- <div v-if="!otpStep" class="mt-6 p-4 bg-blue-50 rounded-lg">
        <p class="text-sm font-medium text-blue-900 mb-2">Demo Accounts:</p>
        <div class="text-xs text-blue-800 space-y-1">
          <p><strong>Admin:</strong> admin@timetrack.com / Admin@123</p>
          <p><strong>Employee:</strong> john.doe@timetrack.com / Employee@123</p>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import authService from '../services/authService'
import settingsService from '../services/settingsService'
import { Clock, AlertCircle, Loader2, Mail } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref(null)
const successMessage = ref(null)

// Branding
const companyLogo = ref(null)
const companyName = ref('')

onMounted(() => {
  // Load branding from API first
  settingsService.getPublic().then((data) => {
    if (data?.logo) companyLogo.value = data.logo
    if (data?.companyName) companyName.value = data.companyName
  }).catch(() => {
    // ignore
  })

  // Fallback to localStorage
  const savedLogo = localStorage.getItem('companyLogo')
  if (!companyLogo.value && savedLogo) companyLogo.value = savedLogo

  const savedCompanyInfo = localStorage.getItem('companyInfo')
  if (!companyName.value && savedCompanyInfo) {
    try {
      const info = JSON.parse(savedCompanyInfo)
      companyName.value = info?.name || ''
    } catch {}
  }

  // React to changes across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'companyLogo') {
      companyLogo.value = e.newValue
    }
    if (e.key === 'companyInfo') {
      try {
        const info = e.newValue ? JSON.parse(e.newValue) : null
        companyName.value = info?.name || ''
      } catch {
        companyName.value = ''
      }
    }
  })
})

// OTP state
const otpStep = ref(false)
const otpUserId = ref(null)
const otpEmail = ref('')
const otpCode = ref('')
const resendLoading = ref(false)
const resendCooldown = ref(0)
let cooldownInterval = null

const handleLogin = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await authStore.login(form.value)
    
    // Check if OTP is required
    if (response?.data?.requireOtp) {
      otpStep.value = true
      otpUserId.value = response.data.userId
      otpEmail.value = response.data.email
      successMessage.value = response.message || 'OTP sent to your email'
    } else {
      // Normal login successful
      router.push('/dashboard')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleVerifyOTP = async () => {
  loading.value = true
  error.value = null
  successMessage.value = null
  
  try {
    const response = await authService.verifyOTP(otpUserId.value, otpCode.value)
    
    // Store token and user data
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token)
      authStore.user = response.data.user
      authStore.token = response.data.token
      router.push('/dashboard')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Invalid OTP. Please try again.'
    otpCode.value = ''
  } finally {
    loading.value = false
  }
}

const handleResendOTP = async () => {
  resendLoading.value = true
  error.value = null
  successMessage.value = null
  
  try {
    await authService.resendOTP(otpUserId.value)
    successMessage.value = 'New OTP sent to your email'
    
    // Start cooldown
    resendCooldown.value = 60
    cooldownInterval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(cooldownInterval)
      }
    }, 1000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to resend OTP. Please try again.'
  } finally {
    resendLoading.value = false
  }
}

const cancelOTP = () => {
  otpStep.value = false
  otpUserId.value = null
  otpEmail.value = ''
  otpCode.value = ''
  error.value = null
  successMessage.value = null
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})
</script>
