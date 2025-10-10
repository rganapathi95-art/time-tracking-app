<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
      <div>
        <div class="flex justify-center">
          <Clock class="h-16 w-16 text-primary-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Time Tracking App
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
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
      
      <div class="mt-6 p-4 bg-blue-50 rounded-lg">
        <p class="text-sm font-medium text-blue-900 mb-2">Demo Accounts:</p>
        <div class="text-xs text-blue-800 space-y-1">
          <p><strong>Admin:</strong> admin@timetrack.com / Admin@123</p>
          <p><strong>Employee:</strong> john.doe@timetrack.com / Employee@123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { Clock, AlertCircle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref(null)

const handleLogin = async () => {
  loading.value = true
  error.value = null
  
  try {
    await authStore.login(form.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
