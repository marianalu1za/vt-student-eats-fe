import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function useMenuItems(id) {
  const [menuItems, setMenuItems] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('No restaurant ID provided')
      return
    }

    const fetchMenuItems = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(`${API_BASE_URL}/api/menu-items?restaurant_id=${id}`)
        setMenuItems(response.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Menu items not found')
        } else {
          setError(err.response?.data || err.message || 'Failed to fetch menu items')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [id])

  return { menuItems, loading, error }
}

