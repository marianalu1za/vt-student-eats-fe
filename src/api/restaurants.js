/**
 * API utility for fetching restaurant data from the backend
 */
import { getCsrfToken } from './auth.js'

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
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      if (response.status === 404) {
        throw new Error(`Menu items not found: ${errorText}`)
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
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
     
    const token = await getCsrfToken()

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
      
      if (response.status === 404) {
        throw new Error(`Restaurant not found: ${errorText}`)
      }
      
      // Try to parse error as JSON for better error messages
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await JSON.parse(errorText)
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
