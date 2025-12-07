/**
 * API utility for joining tags to restaurants
 */
import { getCsrfToken } from './auth.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Joins a tag to a restaurant
 * @param {number} restaurantId - The ID of the restaurant
 * @param {number} tagId - The ID of the tag
 * @returns {Promise<Object>} Created join object
 */
export async function joinTagToRestaurant(restaurantId, tagId) {
  const url = `${API_BASE_URL}/api/restaurant-tags-join/`;

  try {
    const token = await getCsrfToken(true);
    console.log("Joining tag to restaurant:", { restaurantId, tagId });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
      body: JSON.stringify({
        restaurant: restaurantId,
        tag: tagId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error joining tag to restaurant:", error);
    throw error;
  }
}

