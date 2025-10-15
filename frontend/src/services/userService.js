import api from './api'

export default {
  async getUsers(params = {}) {
    const response = await api.get('/users', { params })
    return response.data // Returns { success, count, data }
  },

  async getUser(id) {
    const response = await api.get(`/users/${id}`)
    return response.data // Returns { success, data }
  },

  async createUser(userData) {
    const response = await api.post('/users', userData)
    return response.data // Returns { success, data }
  },

  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data)
    return response.data // Returns { success, data }
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data // Returns { success, message }
  },

  async blockUser(id) {
    const response = await api.put(`/users/${id}/block`)
    return response.data // Returns { success, message, data }
  },

  async unblockUser(id) {
    const response = await api.put(`/users/${id}/unblock`)
    return response.data // Returns { success, message, data }
  },

  async toggleUserOTP(id, otpEnabled) {
    const response = await api.put(`/users/${id}/toggle-otp`, { otpEnabled })
    return response.data // Returns { success, message, data }
  },

  async assignProject(userId, projectId) {
    const response = await api.post(`/users/${userId}/assign-project`, { projectId })
    return response.data // Returns { success, data }
  },

  async removeProject(userId, projectId) {
    const response = await api.delete(`/users/${userId}/remove-project/${projectId}`)
    return response.data // Returns { success, data }
  }
}
