import api from './api'

export default {
  // Public branding
  async getPublic() {
    const res = await api.get('/settings/public')
    return res.data?.data || {}
  },

  // Admin only
  async get() {
    const res = await api.get('/settings')
    return res.data?.data || {}
  },

  async update(payload) {
    const res = await api.put('/settings', payload)
    return res.data?.data || {}
  }
}
