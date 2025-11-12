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
    console.log('Group orders data:', data) // <-- log the result
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
