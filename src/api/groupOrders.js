const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Fetches all group orders from the backend API
 * Logs the response and returns it.
 * @returns {Promise<Array|Object>} Group order data (array or paginated object)
 */
export async function fetchGroupOrders() {
  const url = `${API_BASE_URL}/api/group-orders/`

  try {
    console.log('Fetching group orders from:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    // console.log('Group orders data:', data) // <-- log the result
    return data
  } catch (error) {
    console.error('Error fetching group orders:', error)

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
 * Fetches the currently logged-in user's info from the backend API.
 * @returns {Promise<Object|null>} User object, or null if not authenticated.
 */
export async function fetchCurrentUser() {
  const url = `${API_BASE_URL}/api/me/`

  try {
    console.log('Fetching current user from:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // IMPORTANT: send cookies (sessionid, csrftoken) with the request
      credentials: 'include',
    })

    // Handle "not logged in" cases cleanly
    if (response.status === 401 || response.status === 403) {
      const errorText = await response.text()
      console.warn('Not authenticated when calling /api/me/:', errorText)
      // you can either return null or throw; choose what fits your app
      return null
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response (me):', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    // console.log('Current user data:', data)
    return data
  } catch (error) {
    console.error('Error fetching current user:', error)

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

// Helper to read csrftoken from browser cookies
function getCSRFToken() {
  const name = 'csrftoken='
  const decodedCookie = decodeURIComponent(document.cookie)
  const cookies = decodedCookie.split(';')
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.startsWith(name)) {
      return cookie.substring(name.length)
    }
  }
  return null
}

/**
 * Creates a new group order via POST /api/group-orders/
 * @param {Object} data - group order payload (restaurant, pick_up_time, etc.)
 * @returns {Promise<Object>} The created group order object
 */
export async function createGroupOrder(data) {
  const url = `${API_BASE_URL}/api/group-orders/`
  const csrftoken = getCSRFToken()

  try {
    console.log('Creating group order at:', url, 'with data:', data)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        // CSRF is required for POST with session auth
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
      },
      credentials: 'include', // send session cookie
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response (create group order):', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const created = await response.json()
    return created
  } catch (error) {
    console.error('Error creating group order:', error)

    // Network / CORS / server down
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


export async function joinGroupOrder(groupOrderId) {
  const url = `${API_BASE_URL}/api/group-order-participants/`
  const csrftoken = getCSRFToken()

  try {
    console.log('Joining group order at:', url, 'with id:', groupOrderId)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ group_order: groupOrderId }),
    })

    if (!response.ok) {
      try {
        const data = await response.json()
        const message =
          data?.detail ||
          data?.non_field_errors?.[0] ||
          data?.group_order?.[0] ||
          `HTTP error! status: ${response.status}`

        console.error('API Error Response (join group order):', data)
        throw new Error(message)
      } catch (jsonErr) {
        // Fall back to raw text if JSON parsing fails
        const errorText = await response.text()
        console.error('API Error Response (join group order - text):', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }
    }

    return await response.json()
  } catch (error) {
    console.error('Error joining group order:', error)

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
 * Updates a group order via PATCH /api/group-orders/{id}/
 * @param {number|string} id - The group order ID
 * @param {Object} data - Group order update payload
 * @returns {Promise<Object>} The updated group order object
 */
export async function updateGroupOrder(id, data) {
  const url = `${API_BASE_URL}/api/group-orders/${id}/`
  const csrftoken = getCSRFToken()

  try {
    console.log('Updating group order at:', url, 'with data:', data)

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response (update group order):', errorText)

      // Try to parse as JSON for better error messages
      try {
        const errorData = JSON.parse(errorText)
        const message = errorData?.detail || errorData?.message || errorText
        throw new Error(message)
      } catch (e) {
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }
    }

    const updated = await response.json()
    return updated
  } catch (error) {
    console.error('Error updating group order:', error)

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
 * Deletes a group order via DELETE /api/group-orders/{id}/
 * @param {number|string} id - The group order ID
 * @returns {Promise<void>}
 */
export async function deleteGroupOrder(id) {
  const url = `${API_BASE_URL}/api/group-orders/${id}/`
  const csrftoken = getCSRFToken()

  try {
    console.log('Deleting group order at:', url)

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response (delete group order):', errorText)

      // Try to parse as JSON for better error messages
      try {
        const errorData = JSON.parse(errorText)
        const message = errorData?.detail || errorData?.message || errorText
        throw new Error(message)
      } catch (e) {
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }
    }

    // 204 No Content response - success, no body to return
    return
  } catch (error) {
    console.error('Error deleting group order:', error)

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
 * Cancels a group order by setting its status to "cancelled"
 * via PATCH /api/group-orders/{id}/
 * @param {number|string} id - The group order ID
 * @returns {Promise<Object>} The updated group order object (or empty object)
 */
export async function cancelGroupOrder(id) {
  const url = `${API_BASE_URL}/api/group-orders/${id}/`
  const csrftoken = getCSRFToken()

  try {
    console.log('Cancelling group order at:', url)

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ status: 'cancelled' }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response (cancel group order):', errorText)

      // Try to parse as JSON for better error messages
      try {
        const errorData = JSON.parse(errorText)
        const message =
          errorData?.detail ||
          errorData?.message ||
          errorData?.error ||
          errorText
        throw new Error(message)
      } catch (e) {
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }
    }

    // Backend may or may not return JSON on PATCH; handle both
    try {
      const updated = await response.json()
      return updated
    } catch {
      return {}
    }
  } catch (error) {
    console.error('Error cancelling group order:', error)

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
