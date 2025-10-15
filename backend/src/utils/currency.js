// Currency utility with country-currency mapping

const countryCurrencyMap = {
  // Americas
  'United States': { code: 'USD', symbol: '$', name: 'US Dollar' },
  'Canada': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  'Mexico': { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  'Brazil': { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  'Argentina': { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  'Chile': { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  'Colombia': { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  'Peru': { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  
  // Europe
  'United Kingdom': { code: 'GBP', symbol: '£', name: 'British Pound' },
  'Germany': { code: 'EUR', symbol: '€', name: 'Euro' },
  'France': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Italy': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Spain': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Netherlands': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Belgium': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Austria': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Portugal': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Greece': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Ireland': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Switzerland': { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  'Norway': { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  'Sweden': { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  'Denmark': { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  'Poland': { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  'Czech Republic': { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  'Hungary': { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  'Romania': { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  'Russia': { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  'Turkey': { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  
  // Asia
  'India': { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  'China': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  'Japan': { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  'South Korea': { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  'Singapore': { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  'Hong Kong': { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  'Taiwan': { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
  'Malaysia': { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  'Thailand': { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  'Indonesia': { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  'Philippines': { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  'Vietnam': { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  'Pakistan': { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  'Bangladesh': { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  'Sri Lanka': { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  'United Arab Emirates': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  'Saudi Arabia': { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  'Israel': { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  
  // Oceania
  'Australia': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  'New Zealand': { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  
  // Africa
  'South Africa': { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  'Nigeria': { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  'Kenya': { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  'Egypt': { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  'Morocco': { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  'Ghana': { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' }
};

// Get all unique currencies
const getAllCurrencies = () => {
  const currenciesMap = new Map();
  
  Object.values(countryCurrencyMap).forEach(currency => {
    if (!currenciesMap.has(currency.code)) {
      currenciesMap.set(currency.code, currency);
    }
  });
  
  return Array.from(currenciesMap.values()).sort((a, b) => 
    a.code.localeCompare(b.code)
  );
};

// Get currency by country
const getCurrencyByCountry = (country) => {
  return countryCurrencyMap[country] || { code: 'USD', symbol: '$', name: 'US Dollar' };
};

// Get currency details by code
const getCurrencyByCode = (code) => {
  const currencies = getAllCurrencies();
  return currencies.find(c => c.code === code) || { code: 'USD', symbol: '$', name: 'US Dollar' };
};

// Format amount with currency
const formatCurrency = (amount, currencyCode = 'USD') => {
  const currency = getCurrencyByCode(currencyCode);
  
  // Format number with commas
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return `${currency.symbol}${formattedAmount}`;
};

// Get all countries
const getAllCountries = () => {
  return Object.keys(countryCurrencyMap).sort();
};

module.exports = {
  countryCurrencyMap,
  getAllCurrencies,
  getCurrencyByCountry,
  getCurrencyByCode,
  formatCurrency,
  getAllCountries
};
