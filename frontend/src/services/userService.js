import api from './api'

export default {
  async getUsers(params = {}) {
    const response = await api.get('/users', { params })
    return response.data
  },

  async getUser(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  async assignProject(userId, projectId) {
    const response = await api.post(`/users/${userId}/assign-project`, { projectId })
    return response.data
  },

  async removeProject(userId, projectId) {
    const response = await api.delete(`/users/${userId}/remove-project/${projectId}`)
    return response.data
  }
}
