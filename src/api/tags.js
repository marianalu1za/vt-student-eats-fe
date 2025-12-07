/**
 * API utility for restaurant tags
 */
import { getCsrfToken } from './auth.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Fetches all restaurant tags and returns just the names
 * @returns {Promise<Array>} Array of tag names
 */
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
 * Fetches all restaurant tags with their IDs
 * @returns {Promise<Array>} Array of tag objects with id and name
 */
export async function getAllRestaurantTagsWithIds() {
  const url = `${API_BASE_URL}/api/restaurant-tags/`;

  try {
    console.log("Fetching restaurant tags with IDs from:", url);

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
    return data; // Returns array of { id, name } objects
  } catch (error) {
    console.error("Error fetching restaurant tags with IDs:", error);
    throw error;
  }
}

/**
 * Creates a new restaurant tag
 * @param {string} tagName - The name of the tag to create
 * @returns {Promise<Object>} Created tag object with id and name
 */
export async function createRestaurantTag(tagName) {
  const url = `${API_BASE_URL}/api/restaurant-tags/`;

  try {
    const token = await getCsrfToken(true);
    console.log("Creating restaurant tag:", tagName);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
      body: JSON.stringify({ name: tagName }),
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
    return data; // Returns { id, name }
  } catch (error) {
    console.error("Error creating restaurant tag:", error);
    throw error;
  }
}

