import api from './api'

export default {
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  async getNotification(id) {
    const response = await api.get(`/notifications/${id}`)
    return response.data
  },

  async markAsRead(id) {
    const response = await api.put(`/notifications/${id}/read`)
    return response.data
  },

  async markAllAsRead() {
    const response = await api.put('/notifications/mark-all-read')
    return response.data
  },

  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`)
    return response.data
  },

  async clearReadNotifications() {
    const response = await api.delete('/notifications/clear-read')
    return response.data
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread/count')
    return response.data
  }
}
