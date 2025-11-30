/**
 * API utility for restaurant reviews
 * Handles fetching and creating reviews for restaurants
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
import { getCsrfToken, clearCsrfTokenCache } from './auth.js'

const REVIEWS_API_BASE = `${API_BASE_URL}/api/reviews`

/**
 * Fetches reviews from the backend API
 * @param {Object} params - Query parameters
 * @param {string|number} [params.restaurant_id] - Filter by restaurant ID
 * @param {string|number} [params.user_id] - Filter by user ID
 * @returns {Promise<Array>} Array of review objects
 * @throws {Error} If the request fails
 */
export async function fetchReviews(params = {}) {
  const url = new URL(`${REVIEWS_API_BASE}/`)
  
  // Add query parameters if provided
  if (params.restaurant_id !== undefined && params.restaurant_id !== null) {
    url.searchParams.append('restaurant_id', String(params.restaurant_id))
  }
  if (params.user_id !== undefined && params.user_id !== null) {
    url.searchParams.append('user_id', String(params.user_id))
  }
  
  try {
    console.log('Fetching reviews from:', url.toString())
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
        `Failed to connect to backend API at ${url.toString()}. ` +
        `Please ensure the backend server is running at ${API_BASE_URL}. ` +
        `This might be a CORS issue or the server is not running.`
      )
    }
    
    throw error
  }
}

/**
 * Fetches reviews for a specific restaurant (using /api/reviews/ endpoint)
 * @param {string|number} restaurantId - The restaurant ID
 * @returns {Promise<Array>} Array of review objects
 */
export async function fetchRestaurantReviews(restaurantId) {
  return fetchReviews({
    restaurant_id: restaurantId
  })
}

/**
 * Fetches reviews for a specific user
 * @param {string|number} userId - The user ID
 * @returns {Promise<Array>} Array of review objects
 */
export async function fetchUserReviews(userId) {
  return fetchReviews({
    user_id: userId
  })
}

/**
 * Fetches reviews for a specific restaurant (using /api/restaurants/{id}/reviews/ endpoint)
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
 * @param {number} userId - The user ID
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.rating - Rating from 1 to 5
 * @param {string} reviewData.comment - Comment text (required, minLength: 1)
 * @returns {Promise<Object>} Created review object
 */
export async function createRestaurantReview(restaurantId, userId, reviewData) {
  try {
    // Get CSRF token before making POST request
    const token = await getCsrfToken(true)

    // Construct the request body according to API spec: rating, comment, user, restaurant
    const requestBody = {
      rating: reviewData.rating,
      comment: reviewData.comment,
      user: userId,
      restaurant: restaurantId,
    }

    const url = `${API_BASE_URL}/api/reviews/`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: JSON.stringify(requestBody),
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
          body: JSON.stringify(requestBody),
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
