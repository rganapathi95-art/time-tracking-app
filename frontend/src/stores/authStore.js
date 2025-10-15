import { defineStore } from 'pinia'
import authService from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isEmployee: (state) => state.user?.role === 'employee',
    currentUser: (state) => state.user
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await authService.login(credentials)
        
        // Check if OTP is required
        if (response.data?.requireOtp) {
          // Don't store token/user yet, return response for OTP flow
          return response
        }
        
        // Normal login flow
        this.user = response.data.user
        this.token = response.data.token
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('token', response.data.token)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await authService.register(userData)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentUser() {
      if (!this.token) return
      
      this.loading = true
      try {
        const response = await authService.getMe()
        this.user = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
      } catch (error) {
        this.logout()
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.user = null
        this.token = null
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }
})
