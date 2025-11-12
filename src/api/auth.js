/**
 * API utility for authentication (login, create account)
 * Handles CSRF token retrieval and inclusion in POST requests
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

let csrfToken = null

/**
 * Fetches the CSRF token from the backend
 * @returns {Promise<string>} CSRF token
 */
export async function getCsrfToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/csrf/`, {
      method: 'GET',
      credentials: 'include', // Include cookies for session-based CSRF
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`)
    }

    const data = await response.json()
    csrfToken = data.csrf_token || data.csrfToken || data.token
    return csrfToken
  } catch (error) {
    console.error('Error fetching CSRF token:', error)
    throw error
  }
}

/**
 * Creates a new user account
 * @param {Object} formData - User registration data
 * @param {string} formData.firstName - User's first name
 * @param {string} formData.lastName - User's last name
 * @param {string} formData.email - User's email (must end with @vt.edu)
 * @param {string} formData.password - User's password
 * @returns {Promise<Object>} Response data from the API
 */
export async function createAccount(formData) {
  try {
    // Get CSRF token before making POST request
    const token = await getCsrfToken()

    const response = await fetch(`${API_BASE_URL}/api/users/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `Failed to create account: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating account:', error)
    throw error
  }
}

/**
 * Logs in a user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Response data from the API (typically includes user info and tokens)
 */
export async function login(credentials) {
  try {
    // Get CSRF token before making POST request
    const token = await getCsrfToken()

    const response = await fetch(`${API_BASE_URL}/api/users/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `Login failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}

