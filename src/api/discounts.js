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

/**
 * Updates a discount using PATCH request
 * @param {string|number} discountId - The discount ID
 * @param {Object} discountData - The discount data to update
 * @param {string} discountData.description - Discount description
 * @param {string} discountData.conditions - Discount conditions
 * @param {string} discountData.start_date - Start date (YYYY-MM-DD format)
 * @param {string} discountData.due_date - Due date (YYYY-MM-DD format)
 * @param {boolean} [discountData.is_active] - Whether discount is active
 * @param {number} discountData.restaurant - Restaurant ID
 * @returns {Promise<Object>} Updated discount object
 * @throws {Error} If the update fails
 */
export async function updateDiscount(discountId, discountData) {
  const url = `${DISCOUNTS_API_BASE}/${discountId}/`
  
  try {
    const { getCsrfToken } = await import('./auth.js')
    const token = await getCsrfToken()
    
    console.log('Updating discount at:', url)
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: JSON.stringify(discountData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      if (response.status === 404) {
        throw new Error(`Discount not found: ${errorText}`)
      }
      
      // Try to parse error as JSON for better error messages
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.message || errorData.error || errorData.detail) {
          errorMessage = errorData.message || errorData.error || errorData.detail
        } else if (typeof errorData === 'object') {
          // Handle field-specific validation errors
          const fieldErrors = []
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors) && errors.length > 0) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`)
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n')
          }
        }
      } catch {
        // If not JSON, use the text as-is
        errorMessage = errorText || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating discount:', error)
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(
        `Failed to connect to backend API at ${url}. ` +
        `Please ensure the backend server is running at ${API_BASE_URL}. ` +
        `This might be a CORS issue or the server is not running.`
      )
    }
    
    throw error
  }
}

/**
 * Creates a new discount using POST request
 * @param {Object} discountData - The discount data to create
 * @param {string} discountData.description - Discount description
 * @param {string} discountData.conditions - Discount conditions
 * @param {string} discountData.start_date - Start date (YYYY-MM-DD format)
 * @param {string} discountData.due_date - Due date (YYYY-MM-DD format)
 * @param {boolean} [discountData.is_active] - Whether discount is active
 * @param {number} discountData.restaurant - Restaurant ID
 * @returns {Promise<Object>} Created discount object
 * @throws {Error} If the creation fails
 */
export async function createDiscount(discountData) {
  const url = `${DISCOUNTS_API_BASE}/`
  
  try {
    const { getCsrfToken } = await import('./auth.js')
    const token = await getCsrfToken()
    
    console.log('Creating discount at:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: JSON.stringify(discountData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      // Try to parse error as JSON for better error messages
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.message || errorData.error || errorData.detail) {
          errorMessage = errorData.message || errorData.error || errorData.detail
        } else if (typeof errorData === 'object') {
          // Handle field-specific validation errors
          const fieldErrors = []
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors) && errors.length > 0) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`)
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n')
          }
        }
      } catch {
        // If not JSON, use the text as-is
        errorMessage = errorText || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating discount:', error)
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(
        `Failed to connect to backend API at ${url}. ` +
        `Please ensure the backend server is running at ${API_BASE_URL}. ` +
        `This might be a CORS issue or the server is not running.`
      )
    }
    
    throw error
  }
}
