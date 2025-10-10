import api from './api'

export default {
  async getEmployeeHours(params = {}) {
    const response = await api.get('/analytics/employee-hours', { params })
    return response.data
  },

  async getProjectAllocation(params = {}) {
    const response = await api.get('/analytics/project-allocation', { params })
    return response.data
  },

  async getCostCenterSummary(params = {}) {
    const response = await api.get('/analytics/cost-center-summary', { params })
    return response.data
  },

  async getDashboardStats() {
    const response = await api.get('/analytics/dashboard-stats')
    return response.data
  }
}
