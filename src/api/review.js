/**
 * API utility for fetching review data from the backend
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
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
 * Fetches reviews for a specific restaurant
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

