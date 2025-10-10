import api from './api'

export default {
  async getCostCenters(params = {}) {
    const response = await api.get('/cost-centers', { params })
    return response.data
  },

  async getCostCenter(id) {
    const response = await api.get(`/cost-centers/${id}`)
    return response.data
  },

  async createCostCenter(data) {
    const response = await api.post('/cost-centers', data)
    return response.data
  },

  async updateCostCenter(id, data) {
    const response = await api.put(`/cost-centers/${id}`, data)
    return response.data
  },

  async deleteCostCenter(id) {
    const response = await api.delete(`/cost-centers/${id}`)
    return response.data
  }
}
