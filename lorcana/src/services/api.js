/**
 * API Service Layer
 * 
 * This service centralizes all API calls to the backend server.
 * It provides functions for interacting with cards, pricing settings,
 * and other backend resources.
 */

// API base URL - can be changed based on environment
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Handles API responses and provides consistent error handling
 * 
 * @param {Response} response - The fetch API response object
 * @returns {Promise<Object>} - JSON response data
 * @throws {Error} - If the response is not ok
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to get error message from response
    const errorData = await response.json().catch(() => ({
      error: `HTTP error! Status: ${response.status}`
    }));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
};

/**
 * Card-related API calls
 * Provides functions for fetching, searching, and updating cards
 */
export const cardsApi = {
  /**
   * Get all cards from the database
   * 
   * @returns {Promise<Array>} Array of card objects
   */
  getAllCards: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cards`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  },

  /**
   * Get a specific card by ID
   * 
   * @param {string} cardId - The MongoDB ID of the card
   * @returns {Promise<Object>} Card object
   */
  getCardById: async (cardId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cards/${cardId}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching card ${cardId}:`, error);
      throw error;
    }
  },

  /**
   * Search for cards by name, set, or rarity
   * 
   * @param {string} query - The search query
   * @returns {Promise<Array>} Array of matching card objects
   */
  searchCards: async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cards/search?q=${encodeURIComponent(query)}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error searching cards:', error);
      throw error;
    }
  },

  /**
   * Update the price of a specific card
   * 
   * @param {string} cardId - The MongoDB ID of the card
   * @param {number} price - The new price for the card
   * @returns {Promise<Object>} Response data
   */
  updateCardPrice: async (cardId, price) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cards/${cardId}/price`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price })
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating price for card ${cardId}:`, error);
      throw error;
    }
  }
};

/**
 * Admin pricing-related API calls
 * Provides functions for managing pricing settings
 */
export const pricingApi = {
  /**
   * Get current pricing settings
   * 
   * @returns {Promise<Object>} Pricing settings object with premiumPackPrice, shippingPrices, and rarityPrices
   */
  getPricingSettings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/pricing`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching pricing settings:', error);
      throw error;
    }
  },

  /**
   * Update pricing settings
   * 
   * @param {Object} settings - Object containing premiumPackPrice, shippingPrices, and rarityPrices
   * @returns {Promise<Object>} Response data
   */
  updatePricingSettings: async (settings) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating pricing settings:', error);
      throw error;
    }
  },

  /**
   * Apply rarity-based pricing to all cards
   * 
   * @param {Object} rarityPrices - Object mapping rarity names to prices
   * @returns {Promise<Object>} Response data
   */
  applyRarityPricing: async (rarityPrices) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/apply-rarity-pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rarityPrices })
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error applying rarity pricing:', error);
      throw error;
    }
  }
};

// Export all API services
export default {
  cards: cardsApi,
  pricing: pricingApi
};