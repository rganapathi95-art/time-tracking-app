import api from './api'

export default {
  async getTimesheetPeriods(params = {}) {
    const response = await api.get('/timesheet-periods', { params })
    return response.data
  },

  async getTimesheetPeriod(id) {
    const response = await api.get(`/timesheet-periods/${id}`)
    return response.data
  },

  async createTimesheetPeriod(data) {
    const response = await api.post('/timesheet-periods', data)
    return response.data
  },

  async updateTimesheetPeriod(id, data) {
    const response = await api.put(`/timesheet-periods/${id}`, data)
    return response.data
  },

  async deleteTimesheetPeriod(id) {
    const response = await api.delete(`/timesheet-periods/${id}`)
    return response.data
  },

  async getMyActivePeriods() {
    const response = await api.get('/timesheet-periods/active/my-periods')
    return response.data
  },

  async validateDate(date) {
    const response = await api.post('/timesheet-periods/validate-date', { date })
    return response.data
  },

  async sendReminders(periodId) {
    const response = await api.post(`/timesheet-periods/${periodId}/send-reminders`)
    return response.data
  }
}
