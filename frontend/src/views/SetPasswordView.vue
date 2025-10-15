<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set Your Password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Create a secure password for your account
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="verifying" class="flex flex-col items-center justify-center py-8">
        <Loader2 class="animate-spin h-10 w-10 text-primary-600 mb-4" />
        <p class="text-gray-600">Verifying token...</p>
      </div>

      <!-- Password Already Set -->
      <div v-else-if="passwordAlreadySet" class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <div class="flex items-center">
            <CheckCircle class="h-5 w-5 mr-2" />
            <span>Password has already been set for this account</span>
          </div>
        </div>
        <p class="text-center text-sm text-gray-600">
          You can now log in with your credentials.
        </p>
        <button
          @click="router.push('/login')"
          class="w-full btn btn-primary"
        >
          Go to Login
        </button>
      </div>

      <!-- Success Message -->
      <div v-else-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
        <div class="flex items-center">
          <CheckCircle class="h-5 w-5 mr-2" />
          <span>Password set successfully! Redirecting to login...</span>
        </div>
      </div>

      <!-- Error Message -->
      <div v-else-if="error" class="space-y-4">
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>
        <button
          @click="router.push('/login')"
          class="w-full btn btn-secondary"
        >
          Go to Login
        </button>
      </div>

      <!-- Form -->
      <form v-else-if="!success && !passwordAlreadySet && !verifying" @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="password" class="label">New Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="8"
              class="input"
              placeholder="Enter your new password"
            />
            <p class="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters long
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="label">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="input"
              placeholder="Confirm your password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary flex items-center justify-center"
          >
            <Loader2 v-if="loading" class="animate-spin h-5 w-5 mr-2" />
            {{ loading ? 'Setting Password...' : 'Set Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { CheckCircle, Loader2 } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref(null);
const success = ref(false);
const token = ref('');
const verifying = ref(true);
const passwordAlreadySet = ref(false);

onMounted(async () => {
  token.value = route.query.token;
  if (!token.value) {
    error.value = 'Invalid or missing token';
    verifying.value = false;
    return;
  }

  // Verify token validity
  try {
    const response = await api.get(`/auth/verify-reset-token/${token.value}`);
    if (response.data.success) {
      verifying.value = false;
    }
  } catch (err) {
    verifying.value = false;
    if (err.response?.data?.code === 'PASSWORD_ALREADY_SET') {
      passwordAlreadySet.value = true;
    } else if (err.response?.data?.code === 'TOKEN_EXPIRED') {
      error.value = 'This link has expired. Please contact your administrator for a new link.';
    } else if (err.response?.data?.code === 'INVALID_TOKEN') {
      error.value = 'Invalid link. Please check your email for the correct link.';
    } else {
      error.value = err.response?.data?.message || 'Failed to verify token';
    }
  }
});

const handleSubmit = async () => {
  error.value = null;

  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  // Validate password length
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long';
    return;
  }

  loading.value = true;

  try {
    const response = await api.post('/auth/set-password', {
      token: token.value,
      password: password.value
    });

    if (response.data.success) {
      success.value = true;
      
      // Store the token if provided
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
      }

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  } catch (err) {
    console.error('Error setting password:', err);
    if (err.response?.data?.code === 'PASSWORD_ALREADY_SET') {
      passwordAlreadySet.value = true;
    } else {
      error.value = err.response?.data?.message || 'Failed to set password. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>
