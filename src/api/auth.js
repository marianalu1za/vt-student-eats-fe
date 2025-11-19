/**
 * API utility for authentication (login, create account)
 * Handles CSRF token retrieval and inclusion in POST requests
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const ACCOUNTS_API_BASE = `${API_BASE_URL}/api/accounts`

/**
 * Fetches the CSRF token from the backend
 * @returns {Promise<string>} CSRF token
 */
export async function getCsrfToken() {
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

    return data.csrfToken

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