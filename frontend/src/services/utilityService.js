import api from './api';

const utilityService = {
  // Get all currencies
  async getCurrencies() {
    const response = await api.get('/utilities/currencies');
    return response.data;
  },

  // Get all countries
  async getCountries() {
    const response = await api.get('/utilities/countries');
    return response.data;
  },

  // Get currency by country
  async getCurrencyByCountry(country) {
    const response = await api.get(`/utilities/currency-by-country/${country}`);
    return response.data;
  }
};

export default utilityService;
