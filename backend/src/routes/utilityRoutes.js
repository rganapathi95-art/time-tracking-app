const express = require('express');
const router = express.Router();
const { getAllCurrencies, getAllCountries, getCurrencyByCountry } = require('../utils/currency');

// @desc    Get all currencies
// @route   GET /api/utilities/currencies
// @access  Public
router.get('/currencies', (req, res) => {
  try {
    const currencies = getAllCurrencies();
    res.status(200).json({
      success: true,
      count: currencies.length,
      data: currencies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching currencies'
    });
  }
});

// @desc    Get all countries
// @route   GET /api/utilities/countries
// @access  Public
router.get('/countries', (req, res) => {
  try {
    const countries = getAllCountries();
    res.status(200).json({
      success: true,
      count: countries.length,
      data: countries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching countries'
    });
  }
});

// @desc    Get currency by country
// @route   GET /api/utilities/currency-by-country/:country
// @access  Public
router.get('/currency-by-country/:country', (req, res) => {
  try {
    const currency = getCurrencyByCountry(req.params.country);
    res.status(200).json({
      success: true,
      data: currency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching currency'
    });
  }
});

module.exports = router;
