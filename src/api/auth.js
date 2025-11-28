/**
 * API utility for authentication (login, create account)
 * Handles CSRF token retrieval and inclusion in POST requests
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const ACCOUNTS_API_BASE = `${API_BASE_URL}/api/accounts`

let csrfTokenCache = null

/**
 * Clears the cached CSRF token
 * Useful for logout or when you want to force a fresh token
 */
export function clearCsrfTokenCache() {
  csrfTokenCache = null
}

/**
 * Fetches the CSRF token from the backend
 * Caches the token in memory to avoid fetching on every request
 * @param {boolean} forceRefresh - If true, bypasses cache and fetches fresh token
 * @returns {Promise<string>} CSRF token
 */
export async function getCsrfToken(forceRefresh = false) {
  // Return cached token if available and not forcing refresh
  if (csrfTokenCache && !forceRefresh) {
    return csrfTokenCache
  }

  try {
    console.log('Fetching CSRF token from:', `${ACCOUNTS_API_BASE}/csrf/`)

    const response = await fetch(`${ACCOUNTS_API_BASE}/csrf/`, {
      method: 'GET',
      credentials: 'include', // Include cookies for session-based CSRF
    })

    console.log('CSRF token response status:', response.status, response.statusText)

    if (!response.ok) {
      const error = new Error('Failed to fetch CSRF token.')
      error.statusCode = response.status
      throw error
    }

    const data = await response.json()

    // Cache the token
    csrfTokenCache = data.csrfToken

    return csrfTokenCache

  } catch (error) {
    console.error('Error fetching CSRF token:', error)
    // Clear cache on error
    clearCsrfTokenCache()
    throw error
  }
}

/**
 * Creates a new user account
 * @param {Object} formData - User registration data
 * @param {string} formData.firstName - User's first name
 * @param {string} formData.lastName - User's last name
 * @param {string} formData.email - User's email
 * @param {string} formData.password - User's password
 * @param {string} formData.role - User's role
 * @returns {Promise<Object>} Response data from the API
 */
export async function createAccount(formData) {
  try {
    // Get CSRF token before making POST request
    const token = await getCsrfToken()

    // Transform form data to match API schema (snake_case)
    // Map role values: vt_staff_students -> "User", restaurant_manager -> "Restaurant Manager"
    const roleMap = {
      'vt_staff_students': 'User',
      'restaurant_manager': 'Restaurant Manager'
    }

    const apiPayload = {
      email: formData.email,
      password: formData.password,
      role: roleMap[formData.role] || formData.role,
      first_name: formData.firstName,
      last_name: formData.lastName,
    }


    const response = await fetch(`${ACCOUNTS_API_BASE}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: JSON.stringify(apiPayload),
    })

    if (!response.ok) {
      // Try to extract error message from response
      let errorMessage = 'Failed to create account.'
      try {
        const errorData = await response.json()

        console.log('Error Data:', errorData)

        // Handle field-specific validation errors (e.g., {"email": ["error"], "role": ["error"]})
        if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
          const fieldErrors = []
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors) && errors.length > 0) {
              // Capitalize field name and join multiple errors
              // const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')
              fieldErrors.push(`${errors.join(', ')}`)
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n')
          } else {
            errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage
          }
        } else {
          errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage
        }
      } catch {
        // If response is not JSON, use default message
      }
      // console.log('Error Message:', errorMessage)

      // Format error message with status code for ErrorPopup display
      const error = new Error(`${errorMessage}`)
      error.statusCode = response.status
      throw error
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

    const response = await fetch(`${ACCOUNTS_API_BASE}/login/`, {
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
      const errorMessage = errorData.detail || errorData.message || errorData.error || `Login failed: ${response.status}`

      // If CSRF token error, clear cache
      if (response.status === 403 && errorMessage.includes('CSRF')) {
        console.log('CSRF token error detected, clearing cache...')
        clearCsrfTokenCache()
      }

      const error = new Error(errorMessage)
      error.statusCode = response.status
      throw error
    }

    return await response.json()
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}

/**
 * Fetches the current authenticated user's information from the API
 * @returns {Promise<Object>} Current user data
 */
export async function getCurrentUser() {
  try {
    const response = await fetch(`${ACCOUNTS_API_BASE}/me/`, {
      method: 'GET',
      credentials: 'include', // Include cookies for session-based auth
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.detail || errorData.message || errorData.error || `Failed to fetch user data: ${response.status}`
      const error = new Error(errorMessage)
      error.statusCode = response.status
      throw error
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching current user:', error)
    throw error
  }
}

/**
 * Updates the current authenticated user's profile information
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.first_name - User's first name
 * @param {string} profileData.last_name - User's last name
 * @returns {Promise<Object>} Updated user data
 */
export async function updateUserProfile(profileData) {
  try {
    // Force refresh CSRF token to ensure we have a valid one
    const token = await getCsrfToken(true)

    const response = await fetch(`${ACCOUNTS_API_BASE}/me/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include', // Include cookies for session-based auth
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.detail || errorData.message || errorData.error || `Failed to update profile: ${response.status}`

      // If CSRF token error, clear cache and retry once
      if (response.status === 403 && errorMessage.includes('CSRF')) {
        console.log('CSRF token error detected, clearing cache and retrying...')
        clearCsrfTokenCache()

        // Retry with a fresh token
        const freshToken = await getCsrfToken(true)
        const retryResponse = await fetch(`${ACCOUNTS_API_BASE}/me/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': freshToken,
          },
          credentials: 'include',
          body: JSON.stringify(profileData),
        })

        if (!retryResponse.ok) {
          const retryErrorData = await retryResponse.json().catch(() => ({}))
          const retryErrorMessage = retryErrorData.detail || retryErrorData.message || retryErrorData.error || `Failed to update profile: ${retryResponse.status}`
          const error = new Error(retryErrorMessage)
          error.statusCode = retryResponse.status
          throw error
        }

        return await retryResponse.json()
      }

      // Handle field-specific validation errors
      if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
        const fieldErrors = []
        for (const [field, errors] of Object.entries(errorData)) {
          if (Array.isArray(errors) && errors.length > 0) {
            fieldErrors.push(`${errors.join(', ')}`)
          }
        }
        if (fieldErrors.length > 0) {
          throw new Error(fieldErrors.join('\n'))
        }
      }

      const error = new Error(errorMessage)
      error.statusCode = response.status
      throw error
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

/**
 * Gets the stored user data from localStorage
 * @returns {Object|null} User data if available, null otherwise
 */
// export function getStoredUser() {
//   try {
//     const userStr = localStorage.getItem('user')
//     return userStr ? JSON.parse(userStr) : null
//   } catch (error) {
//     console.error('Error parsing stored user data:', error)
//     return null
//   }
// }
export function getStoredUser() {
  try {
    // Prefer localStorage (remember me), fall back to sessionStorage
    const userStr =
      localStorage.getItem('user') || sessionStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error parsing stored user data:', error)
    return null
  }
}


/**
 * Removes the stored user data from localStorage
 * Useful for logout
 */
// export function clearStoredUser() {
//   localStorage.removeItem('user')
// }
export function clearStoredUser() {
  localStorage.removeItem('user')
  sessionStorage.removeItem('user')
}


/**
 * Logs out the current user
 * Calls the logout API endpoint, clears stored user data, and clears CSRF token cache
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    // Force refresh CSRF token to ensure we have a valid one
    const token = await getCsrfToken(true)

    const response = await fetch(`${ACCOUNTS_API_BASE}/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include', // Include cookies for session-based auth
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.detail || errorData.message || errorData.error || `Logout failed: ${response.status}`
      const error = new Error(errorMessage)
      error.statusCode = response.status
      throw error
    }

    // Clear stored user data and CSRF token cache after successful logout
    clearStoredUser()
    clearCsrfTokenCache()

    return await response.json()
  } catch (error) {
    console.error('Error logging out:', error)
    // Even if logout API call fails, clear local data
    clearStoredUser()
    clearCsrfTokenCache()
    throw error
  }
}

/**
 * Fetches all users from the backend API
 * @returns {Promise<Array>} Array of user objects
 * @throws {Error} If the request fails
 */
export async function getAllUsers() {
  const url = `${ACCOUNTS_API_BASE}/users/`

  try {
    console.log('Fetching all users from:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.detail ||
        errorData.message ||
        errorData.error ||
        `Failed to fetch users: ${response.status}`

      const error = new Error(errorMessage)
      error.statusCode = response.status
      throw error
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching all users:', error)
    throw error
  }
}

/**
 * Starts a password reset for the given email.
 * Backend handles sending the email and further steps.
 * @param {string} email - User's email
 * @returns {Promise<Object>} Response data from the API
 */
export async function requestPasswordReset(email) {
  try {
    const token = await getCsrfToken()

    const response = await fetch(`${ACCOUNTS_API_BASE}/password-recovery/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      let errorMessage = 'Failed to start password reset.'
      let errorData = {}

      try {
        errorData = await response.json()
        console.log('Password reset error data:', errorData)

        if (
          errorData.email &&
          Array.isArray(errorData.email) &&
          errorData.email.length > 0
        ) {
          errorMessage = errorData.email.join(', ')
        } else {
          errorMessage =
            errorData.message ||
            errorData.error ||
            errorData.detail ||
            errorMessage
        }
      } catch {
        // ignore JSON parse errors
      }

      const error = new Error(errorMessage)
      error.statusCode = response.status
      throw error
    }

    try {
      return await response.json()
    } catch {
      return {}
    }
  } catch (error) {
    console.error('Error requesting password reset:', error)
    throw error
  }
}
