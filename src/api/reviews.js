/**
 * API utility for restaurant reviews
 * Handles fetching and creating reviews for restaurants
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
import { getCsrfToken, clearCsrfTokenCache } from './auth.js'

/**
 * Fetches reviews for a specific restaurant
 * @param {string|number} restaurantId - The restaurant ID
 * @returns {Promise<Array>} Array of review objects
 */
export async function getRestaurantReviews(restaurantId) {
  const url = `${API_BASE_URL}/api/restaurants/${restaurantId}/reviews/`
  
  try {
    console.log('Fetching reviews from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      if (response.status === 404) {
        throw new Error(`Reviews not found: ${errorText}`)
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching reviews:', error)
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(
        `Failed to connect to backend API at ${url}. ` +
        `Please ensure the backend server is running at http://localhost:8000. ` +
        `This might be a CORS issue or the server is not running.`
      )
    }
    
    throw error
  }
}

/**
 * Creates a new review for a restaurant
 * @param {string|number} restaurantId - The restaurant ID
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.rating - Rating from 1 to 5
 * @param {string} reviewData.comment - Optional comment text
 * @returns {Promise<Object>} Created review object
 */
export async function createRestaurantReview(restaurantId, reviewData) {
  try {
    // Get CSRF token before making POST request
    const token = await getCsrfToken(true)

    const url = `${API_BASE_URL}/api/restaurants/${restaurantId}/reviews/`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: JSON.stringify(reviewData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.detail || errorData.message || errorData.error || `Failed to create review: ${response.status}`
      
      // If CSRF token error, clear cache and retry once
      if (response.status === 403 && errorMessage.includes('CSRF')) {
        console.log('CSRF token error detected, clearing cache and retrying...')
        clearCsrfTokenCache()
        
        // Retry with a fresh token
        const freshToken = await getCsrfToken(true)
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': freshToken,
          },
          credentials: 'include',
          body: JSON.stringify(reviewData),
        })
        
        if (!retryResponse.ok) {
          const retryErrorData = await retryResponse.json().catch(() => ({}))
          const retryErrorMessage = retryErrorData.detail || retryErrorData.message || retryErrorData.error || `Failed to create review: ${retryResponse.status}`
          const error = new Error(retryErrorMessage)
          error.statusCode = retryResponse.status
          throw error
        }
        
        return await retryResponse.json()
      }
      
      // Handle field-specific validation errors
      if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
        const fieldErrors = []
        for (const [field, errors] of Object.entries(errorData)) {
          if (Array.isArray(errors) && errors.length > 0) {
            fieldErrors.push(`${errors.join(', ')}`)
          }
        }
        if (fieldErrors.length > 0) {
          throw new Error(fieldErrors.join('\n'))
        }
      }
      
      const error = new Error(errorMessage)
      error.statusCode = response.status
      throw error
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating review:', error)
    throw error
  }
}

