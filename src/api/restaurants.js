/**
 * API utility for fetching restaurant data from the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

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
 * Transforms API restaurant data to match component expectations
 * @param {Array} apiRestaurants - Array of restaurants from API
 * @returns {Array} Transformed array of restaurants
 */
export function transformRestaurantData(apiRestaurants) {
  return apiRestaurants.map((restaurant) => ({
    // Keep all original API fields
    id: restaurant.id,
    name: restaurant.name,
    address: restaurant.address,
    phone_number: restaurant.phone_number,
    distance: restaurant.distance,
    // walk_minutes: restaurant.walk_minutes,
    // description: restaurant.description,
    // website_link: restaurant.website_link,
    // open_hours: restaurant.open_hours,
    // owner_id: restaurant.owner_id,
    // created_at: restaurant.created_at,
    // updated_at: restaurant.updated_at,
    // Add component-expected fields with defaults
    rating: restaurant.rating || 4.0, // Default rating if not provided
    tags: restaurant.tags || [], // Default empty tags array
    image: restaurant.image || '🍽️', // Default emoji if no image
    images: restaurant.images || [restaurant.image || '🍽️'],
    imageUrl: restaurant.image_url || null,
  }))
}

