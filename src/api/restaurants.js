/**
 * API utility for fetching restaurant data from the backend
 */

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
