import api from './api'

export default {
  async getTimesheets(params = {}) {
    const response = await api.get('/timesheets', { params })
    return response.data
  },

  async getTimesheet(id) {
    const response = await api.get(`/timesheets/${id}`)
    return response.data
  },

  async createTimesheet(data) {
    const response = await api.post('/timesheets', data)
    return response.data
  },

  async updateTimesheet(id, data) {
    const response = await api.put(`/timesheets/${id}`, data)
    return response.data
  },

  async deleteTimesheet(id) {
    const response = await api.delete(`/timesheets/${id}`)
    return response.data
  },

  async bulkApprove(timesheetIds) {
    const response = await api.post('/timesheets/bulk-approve', { timesheetIds })
    return response.data
  }
}
