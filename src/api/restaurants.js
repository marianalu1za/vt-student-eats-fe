/**
 * API utility for fetching restaurant data from the backend
 */
import { getCsrfToken, clearCsrfTokenCache } from './auth.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Fetches all restaurants from the backend API
 * @returns {Promise<Array>} Array of restaurant objects
 */
export async function fetchRestaurants() {
  const url = `${API_BASE_URL}/api/restaurants/`
  
  try {
    console.log('Fetching restaurants from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    
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
 * Fetches a single restaurant by ID from the backend API
 * @param {string|number} id - The restaurant ID
 * @returns {Promise<Object>} Restaurant object
 * @throws {Error} If the restaurant is not found (404) or other HTTP errors occur
 */
export async function fetchRestaurant(id) {
  const url = `${API_BASE_URL}/api/restaurants/${id}/`
  
  try {
    console.log('Fetching restaurant from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      if (response.status === 404) {
        throw new Error(`Restaurant not found: ${errorText}`)
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    
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
 * Fetches menu items for a specific restaurant from the backend API
 * @param {string|number} restaurantId - The restaurant ID to fetch menu items for
 * @returns {Promise<Array>} Array of menu item objects
 * @throws {Error} If menu items are not found (404) or other HTTP errors occur
 */
export async function fetchMenuItems(restaurantId) {
  const url = `${API_BASE_URL}/api/menu-items?restaurant_id=${restaurantId}`
  
  try {
    console.log('Fetching menu items from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      let errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      // Check if response is HTML (Django error page)
      if (contentType && contentType.includes('text/html')) {
        // Extract a meaningful error message from HTML if possible
        const titleMatch = errorText.match(/<title>(.*?)<\/title>/i)
        const errorTitle = titleMatch ? titleMatch[1] : 'Server Error'
        
        // Check for common Django errors
        if (errorText.includes('no such column') || errorText.includes('column') && errorText.includes('does not exist')) {
          throw new Error('Database schema error. Please run database migrations.')
        } else if (errorText.includes('OperationalError') || errorText.includes('DatabaseError')) {
          throw new Error('Database error occurred. Please check the backend logs.')
        } else {
          throw new Error(`Server error: ${errorTitle}. Please check the backend logs for details.`)
        }
      }
      
      // Try to parse as JSON
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.detail || errorData.message || errorData.error) {
          throw new Error(errorData.detail || errorData.message || errorData.error)
        }
      } catch {
        // Not JSON, use text as-is but limit length
        const shortError = errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText
        if (response.status === 404) {
          throw new Error(`Menu items not found`)
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching menu items:', error)
    
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
 * Transforms API restaurant data to match component expectations
 * @param {Array} apiRestaurants - Array of restaurants from API
 * @returns {Array} Transformed array of restaurants
 */
export function transformRestaurantData(apiRestaurants) {
  return apiRestaurants.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    address: restaurant.address,
    phoneNumber: restaurant.phone_number,
    distance: restaurant.distance,
    walkMinutes: restaurant.walk_minutes,
    description: restaurant.description,
    websiteLink: restaurant.website_link,
    openHours: restaurant.open_hours,
    ownerId: restaurant.owner,
    createdAt: restaurant.created_at,
    updatedAt: restaurant.updated_at,
    xCoordinate: restaurant.x_coordinate ?? restaurant.longitude ?? null,
    yCoordinate: restaurant.y_coordinate ?? restaurant.latitude ?? null,
    ratings: restaurant.ratings,
    tags: restaurant.tags ? restaurant.tags.map(tag => tag.name) : [],
    images: restaurant.images
      ? restaurant.images
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(img => img.image_url)
      : [],
    priceLevel: restaurant.price_level,
  }));
}

export async function getRestaurantTags() {
  const url = `${API_BASE_URL}/api/restaurant-tags/`;

  try {
    console.log("Fetching restaurant tags from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.map((tag) => tag.name);
  } catch (error) {
    console.error("Error fetching restaurant tags:", error);
    throw error;
  }
}

/**
 * Creates a new restaurant using POST request
 * @param {Object} restaurantData - The restaurant data to create
 * @param {string} restaurantData.name - Restaurant name (required)
 * @param {string} [restaurantData.address] - Restaurant address
 * @param {string} [restaurantData.phone_number] - Restaurant phone number
 * @param {string} [restaurantData.website_link] - Restaurant website link
 * @param {Object} [restaurantData.open_hours] - Restaurant opening hours
 * @param {number} [restaurantData.owner] - Restaurant owner ID (if not provided, will use current user)
 * @param {Array} [restaurantData.tags] - Array of tag names
 * @returns {Promise<Object>} Created restaurant object
 * @throws {Error} If creation fails or validation errors occur
 */
export async function createRestaurant(restaurantData) {
  const url = `${API_BASE_URL}/api/restaurants/`
  
  try {
    console.log('Creating restaurant at:', url)
     
    // Force refresh CSRF token to ensure we have a valid one
    const token = await getCsrfToken(true)

    const apiPayload = {}
    
    // Required fields
    if (restaurantData.name) {
      apiPayload.name = restaurantData.name
    }
    
    // Optional fields
    if (restaurantData.address !== undefined && restaurantData.address !== null && restaurantData.address !== '') {
      apiPayload.address = restaurantData.address
    }
    if (restaurantData.phone_number !== undefined && restaurantData.phone_number !== null && restaurantData.phone_number !== '') {
      apiPayload.phone_number = restaurantData.phone_number
    }
    if (restaurantData.website_link !== undefined && restaurantData.website_link !== null && restaurantData.website_link !== '') {
      apiPayload.website_link = restaurantData.website_link
    }
    if (restaurantData.open_hours !== undefined && restaurantData.open_hours !== null) {
      apiPayload.open_hours = restaurantData.open_hours
    }
    if (restaurantData.owner !== undefined && restaurantData.owner !== null) {
      apiPayload.owner = parseInt(restaurantData.owner, 10)
    }
    console.log('apiPayload:', apiPayload)
    // Set is_active to false as per requirement
    apiPayload.is_active = false
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: JSON.stringify(apiPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      // Try to parse error as JSON for better error messages
      let errorData = {}
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage
      } catch {
        // If not JSON, use the text as-is
        errorMessage = errorText || errorMessage
      }

      // If CSRF token error, clear cache and retry once
      if (response.status === 403 && (errorMessage.includes('CSRF') || errorMessage.includes('csrf'))) {
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
          body: JSON.stringify(apiPayload),
        })

        if (!retryResponse.ok) {
          const retryErrorText = await retryResponse.text()
          let retryErrorMessage = `HTTP error! status: ${retryResponse.status}`
          try {
            const retryErrorData = JSON.parse(retryErrorText)
            retryErrorMessage = retryErrorData.message || retryErrorData.error || retryErrorData.detail || retryErrorMessage
          } catch {
            retryErrorMessage = retryErrorText || retryErrorMessage
          }
          throw new Error(retryErrorMessage)
        }

        const createdRestaurant = await retryResponse.json()
        
        // Handle tags if provided
        if (restaurantData.tags && restaurantData.tags.length > 0) {
          // Tags will be handled separately if needed - for now just log
          console.log('Tags to be associated:', restaurantData.tags)
        }
        
        return createdRestaurant
      }
      
      // Handle field-specific validation errors
      if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
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
      
      throw new Error(errorMessage)
    }

    const createdRestaurant = await response.json()
    
    // Handle tags if provided (tags might need to be handled separately via another API)
    if (restaurantData.tags && restaurantData.tags.length > 0) {
      console.log('Tags to be associated:', restaurantData.tags)
      // TODO: If tags need to be added via separate API call, handle it here
    }
    
    return createdRestaurant
  } catch (error) {
    console.error('Error creating restaurant:', error)
    
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
 * Updates a restaurant by ID using PATCH request
 * @param {string|number} id - The restaurant ID to update
 * @param {Object} restaurantData - The restaurant data to update
 * @param {string} [restaurantData.name] - Restaurant name
 * @param {string} [restaurantData.address] - Restaurant address
 * @param {string} [restaurantData.phone_number] - Restaurant phone number
 * @param {string|number} [restaurantData.owner_id] - Restaurant owner ID (will be mapped to 'owner')
 * @param {string} [restaurantData.website_link] - Restaurant website link
 * @returns {Promise<Object>} Updated restaurant object
 * @throws {Error} If the restaurant is not found (404) or other HTTP errors occur
 */
export async function updateRestaurant(id, restaurantData) {
  const url = `${API_BASE_URL}/api/restaurants/${id}/`
  
  try {
    console.log('Updating restaurant at:', url)
     
    // Force refresh CSRF token to ensure we have a valid one
    const token = await getCsrfToken(true)

    const apiPayload = {}
    
    if (restaurantData.name !== undefined) {
      apiPayload.name = restaurantData.name
    }
    if (restaurantData.address !== undefined) {
      apiPayload.address = restaurantData.address
    }
    if (restaurantData.phone_number !== undefined) {
      apiPayload.phone_number = restaurantData.phone_number
    }
    if (restaurantData.owner_id !== undefined && restaurantData.owner_id !== '') {
      apiPayload.owner = parseInt(restaurantData.owner_id, 10)
    }
    if (restaurantData.website_link !== undefined) {
      apiPayload.website_link = restaurantData.website_link
    }
    if (restaurantData.is_active !== undefined) {
      apiPayload.is_active = restaurantData.is_active
    }
    if (restaurantData.open_hours !== undefined) {
      apiPayload.open_hours = restaurantData.open_hours
    }
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: JSON.stringify(apiPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      // Try to parse error as JSON for better error messages
      let errorData = {}
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        errorData = await JSON.parse(errorText)
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage
      } catch {
        // If not JSON, use the text as-is
        errorMessage = errorText || errorMessage
      }

      // If CSRF token error, clear cache and retry once
      if (response.status === 403 && (errorMessage.includes('CSRF') || errorMessage.includes('csrf'))) {
        console.log('CSRF token error detected, clearing cache and retrying...')
        clearCsrfTokenCache()

        // Retry with a fresh token
        const freshToken = await getCsrfToken(true)
        const retryResponse = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': freshToken,
          },
          credentials: 'include',
          body: JSON.stringify(apiPayload),
        })

        if (!retryResponse.ok) {
          const retryErrorText = await retryResponse.text()
          let retryErrorMessage = `HTTP error! status: ${retryResponse.status}`
          try {
            const retryErrorData = await JSON.parse(retryErrorText)
            retryErrorMessage = retryErrorData.message || retryErrorData.error || retryErrorData.detail || retryErrorMessage
          } catch {
            retryErrorMessage = retryErrorText || retryErrorMessage
          }
          throw new Error(retryErrorMessage)
        }

        return await retryResponse.json()
      }
      
      if (response.status === 404) {
        throw new Error(`Restaurant not found: ${errorMessage}`)
      }
      
      // Handle field-specific validation errors
      if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
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
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating restaurant:', error)
    
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
 * Fetches menu items for the authenticated restaurant owner's restaurant
 * @param {string|number} restaurantId - The restaurant ID to fetch menu items for
 * @returns {Promise<Array>} Array of menu item objects
 * @throws {Error} If menu items are not found (404) or other HTTP errors occur
 */
export async function fetchMyMenuItems(restaurantId) {
  return fetchMenuItems(restaurantId)
}

/**
 * Creates a new menu item for a restaurant
 * @param {Object} menuItemData - The menu item data
 * @param {string|number} menuItemData.restaurant_id - Restaurant ID
 * @param {string} menuItemData.name - Menu item name (required)
 * @param {number|string} menuItemData.price - Menu item price (required, must be > 0)
 * @param {string} [menuItemData.tags] - Comma-separated tags
 * @returns {Promise<Object>} Created menu item object
 * @throws {Error} If creation fails or validation errors occur
 */
export async function createMenuItem(menuItemData) {
  const url = `${API_BASE_URL}/api/menu-items/`
  
  try {
    console.log('Creating menu item at:', url)
    
    // Force refresh CSRF token to ensure we have a valid one
    const token = await getCsrfToken(true)

    const apiPayload = {
      restaurant: menuItemData.restaurant_id,
      name: menuItemData.name,
      price: parseFloat(menuItemData.price),
    }
    
    if (menuItemData.tags !== undefined && menuItemData.tags !== null) {
      apiPayload.tags = menuItemData.tags
    }
    if (menuItemData.is_popular !== undefined) {
      apiPayload.is_popular = menuItemData.is_popular
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: JSON.stringify(apiPayload),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      let errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      // Try to parse error as JSON for better error messages
      let errorData = {}
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        errorData = await JSON.parse(errorText)
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage
      } catch {
        // If not JSON, use the text as-is
        errorMessage = errorText || errorMessage
      }

      // If CSRF token error, clear cache and retry once
      if (response.status === 403 && (errorMessage.includes('CSRF') || errorMessage.includes('csrf'))) {
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
          body: JSON.stringify(apiPayload),
        })

        if (!retryResponse.ok) {
          const retryErrorText = await retryResponse.text()
          let retryErrorMessage = `HTTP error! status: ${retryResponse.status}`
          try {
            const retryErrorData = await JSON.parse(retryErrorText)
            retryErrorMessage = retryErrorData.message || retryErrorData.error || retryErrorData.detail || retryErrorMessage
          } catch {
            retryErrorMessage = retryErrorText || retryErrorMessage
          }
          throw new Error(retryErrorMessage)
        }

        return await retryResponse.json()
      }
      
      // Check if response is HTML (Django error page)
      if (contentType && contentType.includes('text/html')) {
        // Extract a meaningful error message from HTML if possible
        const titleMatch = errorText.match(/<title>(.*?)<\/title>/i)
        const errorTitle = titleMatch ? titleMatch[1] : 'Server Error'
        
        // Check for common Django errors
        if (errorText.includes('no such column') || errorText.includes('column') && errorText.includes('does not exist')) {
          throw new Error('Database schema error. Please run database migrations.')
        } else if (errorText.includes('OperationalError') || errorText.includes('DatabaseError')) {
          throw new Error('Database error occurred. Please check the backend logs.')
        } else {
          throw new Error(`Server error: ${errorTitle}. Please check the backend logs for details.`)
        }
      }
      
      // Handle field-specific validation errors
      if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
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
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating menu item:', error)
    
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
 * Updates a menu item by ID using PATCH request
 * @param {string|number} id - The menu item ID to update
 * @param {Object} menuItemData - The menu item data to update
 * @param {string} [menuItemData.name] - Menu item name
 * @param {number|string} [menuItemData.price] - Menu item price (must be > 0)
 * @param {string} [menuItemData.tags] - Comma-separated tags
 * @returns {Promise<Object>} Updated menu item object
 * @throws {Error} If the menu item is not found (404) or other HTTP errors occur
 */
export async function updateMenuItem(id, menuItemData) {
  const url = `${API_BASE_URL}/api/menu-items/${id}/`
  
  try {
    console.log('Updating menu item at:', url)
    
    // Force refresh CSRF token to ensure we have a valid one
    const token = await getCsrfToken(true)

    const apiPayload = {}
    
    if (menuItemData.name !== undefined) {
      apiPayload.name = menuItemData.name
    }
    if (menuItemData.price !== undefined) {
      apiPayload.price = parseFloat(menuItemData.price)
    }
    if (menuItemData.tags !== undefined) {
      apiPayload.tags = menuItemData.tags
    }
    if (menuItemData.is_popular !== undefined) {
      apiPayload.is_popular = Boolean(menuItemData.is_popular)
    }
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: JSON.stringify(apiPayload),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      let errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      // Try to parse error as JSON for better error messages
      let errorData = {}
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        errorData = await JSON.parse(errorText)
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage
      } catch {
        // If not JSON, use the text as-is
        errorMessage = errorText || errorMessage
      }

      // If CSRF token error, clear cache and retry once
      if (response.status === 403 && (errorMessage.includes('CSRF') || errorMessage.includes('csrf'))) {
        console.log('CSRF token error detected, clearing cache and retrying...')
        clearCsrfTokenCache()

        // Retry with a fresh token
        const freshToken = await getCsrfToken(true)
        const retryResponse = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': freshToken,
          },
          credentials: 'include',
          body: JSON.stringify(apiPayload),
        })

        if (!retryResponse.ok) {
          const retryErrorText = await retryResponse.text()
          let retryErrorMessage = `HTTP error! status: ${retryResponse.status}`
          try {
            const retryErrorData = await JSON.parse(retryErrorText)
            retryErrorMessage = retryErrorData.message || retryErrorData.error || retryErrorData.detail || retryErrorMessage
          } catch {
            retryErrorMessage = retryErrorText || retryErrorMessage
          }
          throw new Error(retryErrorMessage)
        }

        return await retryResponse.json()
      }
      
      // Check if response is HTML (Django error page)
      if (contentType && contentType.includes('text/html')) {
        // Extract a meaningful error message from HTML if possible
        const titleMatch = errorText.match(/<title>(.*?)<\/title>/i)
        const errorTitle = titleMatch ? titleMatch[1] : 'Server Error'
        
        // Check for common Django errors
        if (errorText.includes('no such column') || errorText.includes('column') && errorText.includes('does not exist')) {
          throw new Error('Database schema error. Please run database migrations.')
        } else if (errorText.includes('OperationalError') || errorText.includes('DatabaseError')) {
          throw new Error('Database error occurred. Please check the backend logs.')
        } else {
          throw new Error(`Server error: ${errorTitle}. Please check the backend logs for details.`)
        }
      }
      
      if (response.status === 404) {
        throw new Error(`Menu item not found`)
      }
      
      // Handle field-specific validation errors
      if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
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
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating menu item:', error)
    
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
 * Deletes a menu item by ID
 * @param {string|number} id - The menu item ID to delete
 * @returns {Promise<void>}
 * @throws {Error} If the menu item is not found (404) or other HTTP errors occur
 */
export async function deleteMenuItem(id) {
  const url = `${API_BASE_URL}/api/menu-items/${id}/`
  
  try {
    console.log('Deleting menu item at:', url)
    
    // Force refresh CSRF token to ensure we have a valid one
    const token = await getCsrfToken(true)
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      let errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      // Try to parse error as JSON for better error messages
      let errorData = {}
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        errorData = await JSON.parse(errorText)
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage
      } catch {
        // If not JSON, use the text as-is
        errorMessage = errorText || errorMessage
      }

      // If CSRF token error, clear cache and retry once
      if (response.status === 403 && (errorMessage.includes('CSRF') || errorMessage.includes('csrf'))) {
        console.log('CSRF token error detected, clearing cache and retrying...')
        clearCsrfTokenCache()

        // Retry with a fresh token
        const freshToken = await getCsrfToken(true)
        const retryResponse = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': freshToken,
          },
          credentials: 'include',
        })

        if (!retryResponse.ok) {
          const retryErrorText = await retryResponse.text()
          let retryErrorMessage = `HTTP error! status: ${retryResponse.status}`
          try {
            const retryErrorData = await JSON.parse(retryErrorText)
            retryErrorMessage = retryErrorData.message || retryErrorData.error || retryErrorData.detail || retryErrorMessage
          } catch {
            retryErrorMessage = retryErrorText || retryErrorMessage
          }
          throw new Error(retryErrorMessage)
        }

        return
      }
      
      // Check if response is HTML (Django error page)
      if (contentType && contentType.includes('text/html')) {
        // Extract a meaningful error message from HTML if possible
        const titleMatch = errorText.match(/<title>(.*?)<\/title>/i)
        const errorTitle = titleMatch ? titleMatch[1] : 'Server Error'
        
        // Check for common Django errors
        if (errorText.includes('no such column') || errorText.includes('column') && errorText.includes('does not exist')) {
          throw new Error('Database schema error. Please run database migrations.')
        } else if (errorText.includes('OperationalError') || errorText.includes('DatabaseError')) {
          throw new Error('Database error occurred. Please check the backend logs.')
        } else {
          throw new Error(`Server error: ${errorTitle}. Please check the backend logs for details.`)
        }
      }
      
      if (response.status === 404) {
        throw new Error(`Menu item not found`)
      }
      
      throw new Error(errorMessage)
    }

    // DELETE requests may not return a body
    if (response.status === 204 || response.status === 200) {
      return
    }
  } catch (error) {
    console.error('Error deleting menu item:', error)
    
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
