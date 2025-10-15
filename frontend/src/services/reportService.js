import api from './api'

export default {
  async getComprehensiveReport(params = {}) {
    const response = await api.get('/reports/comprehensive', { params })
    return response.data
  },

  async getUsersReport(params = {}) {
    const response = await api.get('/reports/users', { params })
    return response.data
  },

  async getProjectsReport(params = {}) {
    const response = await api.get('/reports/projects', { params })
    return response.data
  },

  async getTimesheetsReport(params = {}) {
    const response = await api.get('/reports/timesheets', { params })
    return response.data
  },

  async downloadPDF(params = {}) {
    const response = await api.get('/reports/comprehensive', {
      params: { ...params, format: 'pdf' },
      responseType: 'blob'
    })
    return response.data
  }
}
