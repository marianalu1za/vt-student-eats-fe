/**
 * API utility for fetching discount data from the backend
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const DISCOUNTS_API_BASE = `${API_BASE_URL}/api/discounts`

/**
 * Fetches discounts from the backend API
 * @param {Object} params - Query parameters
 * @param {string|number} [params.restaurant_id] - Filter by restaurant ID
 * @param {boolean|string} [params.is_active] - Filter by active status
 * @param {string} [params.start_date] - Filter by start date
 * @param {string} [params.due_date] - Filter by due date
 * @returns {Promise<Array>} Array of discount objects
 * @throws {Error} If the request fails
 */
export async function fetchDiscounts(params = {}) {
  const url = new URL(`${DISCOUNTS_API_BASE}/`)
  
  if (params.restaurant_id !== undefined && params.restaurant_id !== null) {
    url.searchParams.append('restaurant_id', String(params.restaurant_id))
  }
  if (params.is_active !== undefined && params.is_active !== null) {
    url.searchParams.append('is_active', String(params.is_active))
  }
  if (params.start_date) {
    url.searchParams.append('start_date', params.start_date)
  }
  if (params.due_date) {
    url.searchParams.append('due_date', params.due_date)
  }
  
  try {
    console.log('Fetching discounts from:', url.toString())
    
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
        throw new Error(`Discounts not found: ${errorText}`)
      }
      
      throw new Error(`${response.status}:${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching discounts:', error)
    
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
 * Fetches active discounts for a specific restaurant
 * @param {string|number} restaurantId - The restaurant ID
 * @returns {Promise<Array>} Array of active discount objects
 */
export async function fetchActiveDiscountsForRestaurant(restaurantId) {
  return fetchDiscounts({
    restaurant_id: restaurantId,
    is_active: true
  })
}

