const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Fetches group order participants from the backend API
 * @param {Object} params - Optional query parameters
 * @param {string|number} params.user - Filter by user ID
 * @param {string|number} params.group_order - Filter by group order ID
 * @returns {Promise<Array>} Array of participant objects
 */
export async function fetchGroupOrderParticipants(params = {}) {
  const url = new URL(`${API_BASE_URL}/api/group-order-participants/`)
  
  // Add query parameters if provided
  if (params.user !== undefined && params.user !== null) {
    url.searchParams.append('user', params.user.toString())
  }
  if (params.group_order !== undefined && params.group_order !== null) {
    url.searchParams.append('group_order', params.group_order.toString())
  }

  try {
    console.log('Fetching group order participants from:', url.toString())

    const response = await fetch(url.toString(), {
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
    return data
  } catch (error) {
    console.error('Error fetching group order participants:', error)

    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(
        `Failed to connect to backend API at ${url.toString()}. ` +
        `Please ensure the backend server is running at http://localhost:8000. ` +
        `This might be a CORS issue or the server is not running.`
      )
    }

    throw error
  }
}

