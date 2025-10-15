import api from './api'

export default {
  async getProfile() {
    const response = await api.get('/profile')
    return response.data
  },

  async updateProfile(profileData) {
    const response = await api.put('/profile', profileData)
    return response.data
  },

  async updatePreferences(preferences) {
    const response = await api.put('/profile/preferences', preferences)
    return response.data
  },

  async changePassword(passwordData) {
    const response = await api.put('/profile/change-password', passwordData)
    return response.data
  }
}
