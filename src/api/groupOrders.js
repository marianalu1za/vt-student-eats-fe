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

    // Rethrow for UI to handle (e.g., show toast)
    throw error
  }
}


export async function joinGroupOrder(groupOrderId) {
  const url = `${API_BASE_URL}/api/group-order-participants/`

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include', // if you use cookie auth
      headers: {
        'Content-Type': 'application/json',
        // include CSRF header here if your other POSTs do
        // 'X-CSRFTOKEN': getCsrfTokenFromCookie(),
      },
      body: JSON.stringify({ group_order: groupOrderId }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      const message =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        data?.group_order?.[0] ||
        'Failed to join group order.'
      throw new Error(message)
    }

    return await response.json()
  } catch (err) {
    console.error('Error joining group order:', err)
    throw err
  }
}
