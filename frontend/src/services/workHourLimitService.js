import api from './api'

export default {
  async getWorkHourLimits(params = {}) {
    const response = await api.get('/work-hour-limits', { params })
    return response.data
  },

  async getEmployeeLimit(employeeId) {
    const response = await api.get(`/work-hour-limits/employee/${employeeId}`)
    return response.data
  },

  async getMyLimit() {
    const response = await api.get('/work-hour-limits/my-limit')
    return response.data
  },

  async createOrUpdateLimit(data) {
    const response = await api.post('/work-hour-limits', data)
    return response.data
  },

  async bulkUpdateLimits(data) {
    const response = await api.post('/work-hour-limits/bulk-update', data)
    return response.data
  },

  async deleteLimit(id) {
    const response = await api.delete(`/work-hour-limits/${id}`)
    return response.data
  },

  async checkCurrentWeekHours(employeeId) {
    const response = await api.get(`/work-hour-limits/check-hours/${employeeId}`)
    return response.data
  },

  async validateTimesheetHours(data) {
    const response = await api.post('/work-hour-limits/validate', data)
    return response.data
  }
}
